package uz.verifix.jobs.service.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.entity.Notification;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.enums.NotificationChannel;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.domain.repository.NotificationRepository;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final ManagerRepository managerRepository;
    private final SmsService smsService;
    private final PushNotificationService pushNotificationService;
    private final TelegramNotificationService telegramNotificationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public DispatchResult dispatch(UserType userType, UUID userId, String type, String message) {
        return switch (userType) {
            case CANDIDATE -> dispatchCandidate(userId, type, message);
            case EMPLOYER -> dispatchEmployer(userId, type, message);
        };
    }

    @Transactional
    public int retryUndelivered(int batchSize, int maxAttempts) {
        return notificationRepository
                .findByDeliveredAtIsNullAndRetryCountLessThanOrderByCreatedAtAsc(
                        maxAttempts,
                        PageRequest.of(0, batchSize)
                )
                .stream()
                .map(this::retry)
                .toList()
                .size();
    }

    @Transactional
    public Notification createAndSend(UserType userType, UUID userId, NotificationChannel channel, String type, String message) {
        if (userId == null) {
            log.warn("Skipping notification {} via {} because userId is null", type, channel);
            return null;
        }

        return switch (channel) {
            case TELEGRAM -> sendPreferredTelegram(userType, userId, type, message);
            case PUSH -> sendPreferredPush(userType, userId, type, message);
            case SMS -> sendPreferredSms(userType, userId, type, message);
            case EMAIL -> createFailedRecord(
                    userType,
                    userId,
                    NotificationChannel.EMAIL,
                    type,
                    Map.of("message", message),
                    "EMAIL channel is not implemented"
            );
        };
    }

    @Transactional
    public Notification sendTelegramMessage(UserType userType, UUID userId, Long chatId, String type, String message) {
        return attempt(
                userType,
                userId,
                NotificationChannel.TELEGRAM,
                type,
                Map.of("chatId", chatId, "message", message),
                () -> {
                    if (chatId == null) {
                        return false;
                    }
                    boolean delivered = telegramNotificationService.send(chatId, message);
                    if (delivered) {
                        log.info("Telegram notification delivered: type={}, userId={}, chatId={}", type, userId, chatId);
                    }
                    return delivered;
                }
        );
    }

    @Transactional
    public Notification sendPush(UserType userType, UUID userId, String pushSubscriptionJson, String type, String message) {
        return attempt(
                userType,
                userId,
                NotificationChannel.PUSH,
                type,
                Map.of(
                        "subscriptionPresent", pushSubscriptionJson != null && !pushSubscriptionJson.isBlank(),
                        "message", message
                ),
                () -> pushNotificationService.send(pushSubscriptionJson, message)
        );
    }

    @Transactional
    public Notification sendSms(UserType userType, UUID userId, String phone, String type, String message) {
        return attempt(
                userType,
                userId,
                NotificationChannel.SMS,
                type,
                Map.of("phone", phone, "message", message),
                () -> phone != null && !phone.isBlank() && smsService.send(phone, message)
        );
    }

    public void sendTelegramMessage(Long chatId, String message) {
        if (chatId == null) {
            return;
        }
        telegramNotificationService.send(chatId, message);
    }

    public void sendSms(String phone, String message) {
        if (phone == null || phone.isBlank()) {
            return;
        }
        smsService.send(phone, message);
    }

    @Transactional
    public void markDelivered(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            Instant now = Instant.now();
            notification.setSentAt(now);
            notification.setDeliveredAt(now);
            notification.setErrorMessage(null);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markFailed(UUID notificationId, String errorMessage) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRetryCount(notification.getRetryCount() + 1);
            notification.setErrorMessage(errorMessage);
            notificationRepository.save(notification);
        });
    }

    @Transactional(readOnly = true)
    public Application getApplicationById(UUID applicationId) {
        return applicationRepository.findById(applicationId).orElse(null);
    }

    @Transactional
    public Notification retry(Notification notification) {
        String message = payloadText(notification, "message");
        if (message == null || message.isBlank()) {
            notification.setRetryCount(safeRetryCount(notification) + 1);
            notification.setErrorMessage("Retry skipped because message payload is missing");
            return notificationRepository.save(notification);
        }

        try {
            boolean delivered = switch (notification.getChannel()) {
                case TELEGRAM -> retryTelegram(notification, message);
                case PUSH -> retryPush(notification, message);
                case SMS -> retrySms(notification, message);
                case EMAIL -> false;
            };

            if (delivered) {
                Instant now = Instant.now();
                notification.setSentAt(now);
                notification.setDeliveredAt(now);
                notification.setErrorMessage(null);
            } else {
                notification.setRetryCount(safeRetryCount(notification) + 1);
                notification.setErrorMessage("Retry delivery was rejected");
            }
            return notificationRepository.save(notification);
        } catch (Exception e) {
            notification.setRetryCount(safeRetryCount(notification) + 1);
            notification.setErrorMessage(e.getMessage());
            return notificationRepository.save(notification);
        }
    }

    private DispatchResult dispatchCandidate(UUID candidateId, String type, String message) {
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate == null) {
            log.warn("Candidate {} not found for notification {}", candidateId, type);
            return new DispatchResult(0, 0);
        }

        int attempts = 0;
        int delivered = 0;

        if (candidate.getTelegramId() != null) {
            attempts++;
            if (isDelivered(sendTelegramMessage(UserType.CANDIDATE, candidateId, candidate.getTelegramId(), type, message))) {
                return new DispatchResult(attempts, 1);
            }
        }

        if (candidate.getPushSubscriptionJson() != null && !candidate.getPushSubscriptionJson().isBlank()) {
            attempts++;
            if (isDelivered(sendPush(UserType.CANDIDATE, candidateId, candidate.getPushSubscriptionJson(), type, message))) {
                return new DispatchResult(attempts, 1);
            }
        }

        if (candidate.getPhone() != null && !candidate.getPhone().isBlank()) {
            attempts++;
            if (isDelivered(sendSms(UserType.CANDIDATE, candidateId, candidate.getPhone(), type, message))) {
                delivered++;
            }
        }

        if (delivered == 0) {
            log.warn("No delivery channel succeeded for candidate {} and notification {}", candidateId, type);
        }
        return new DispatchResult(attempts, delivered);
    }

    private DispatchResult dispatchEmployer(UUID employerId, String type, String message) {
        List<Manager> managers = managerRepository.findByEmployerId(employerId).stream()
                .sorted(Comparator.comparing((Manager manager) -> manager.getRole() != ManagerRole.ADMIN))
                .toList();

        int attempts = 0;
        int delivered = 0;

        for (Manager manager : managers) {
            int managerAttempts = 0;
            Notification notification = null;
            if (manager.getTelegramChatId() != null) {
                attempts++;
                managerAttempts++;
                notification = sendTelegramMessage(UserType.EMPLOYER, employerId, manager.getTelegramChatId(), type, message);
                if (isDelivered(notification)) {
                    delivered++;
                    continue;
                }
            }

            if (manager.getPushSubscriptionJson() != null && !manager.getPushSubscriptionJson().isBlank()) {
                attempts++;
                managerAttempts++;
                notification = sendPush(UserType.EMPLOYER, employerId, manager.getPushSubscriptionJson(), type, message);
                if (isDelivered(notification)) {
                    delivered++;
                    continue;
                }
            }

            if (manager.getPhone() != null && !manager.getPhone().isBlank()) {
                attempts++;
                managerAttempts++;
                notification = sendSms(UserType.EMPLOYER, employerId, manager.getPhone(), type, message);
            }

            if (isDelivered(notification)) {
                delivered++;
            } else if (managerAttempts == 0) {
                log.debug("Manager {} has no delivery channels for notification {}", manager.getId(), type);
            }
        }

        if (attempts == 0) {
            log.warn("Employer {} has no notification channels for {}", employerId, type);
        } else if (delivered == 0) {
            log.warn("Employer {} notification {} failed on all channels", employerId, type);
        }

        return new DispatchResult(attempts, delivered);
    }

    private Notification sendPreferredTelegram(UserType userType, UUID userId, String type, String message) {
        if (userType == UserType.CANDIDATE) {
            Candidate candidate = candidateRepository.findById(userId).orElse(null);
            if (candidate != null && candidate.getTelegramId() != null) {
                return sendTelegramMessage(userType, userId, candidate.getTelegramId(), type, message);
            }
        } else {
            for (Manager manager : managerRepository.findByEmployerId(userId)) {
                if (manager.getTelegramChatId() != null) {
                    return sendTelegramMessage(userType, userId, manager.getTelegramChatId(), type, message);
                }
            }
        }

        return createFailedRecord(
                userType,
                userId,
                NotificationChannel.TELEGRAM,
                type,
                Map.of("message", message),
                "Telegram channel is not available"
        );
    }

    private Notification sendPreferredPush(UserType userType, UUID userId, String type, String message) {
        if (userType == UserType.CANDIDATE) {
            Candidate candidate = candidateRepository.findById(userId).orElse(null);
            if (candidate != null && candidate.getPushSubscriptionJson() != null && !candidate.getPushSubscriptionJson().isBlank()) {
                return sendPush(userType, userId, candidate.getPushSubscriptionJson(), type, message);
            }
        } else {
            for (Manager manager : managerRepository.findByEmployerId(userId)) {
                if (manager.getPushSubscriptionJson() != null && !manager.getPushSubscriptionJson().isBlank()) {
                    return sendPush(userType, userId, manager.getPushSubscriptionJson(), type, message);
                }
            }
        }

        return createFailedRecord(
                userType,
                userId,
                NotificationChannel.PUSH,
                type,
                Map.of("message", message),
                "Push channel is not available"
        );
    }

    private Notification sendPreferredSms(UserType userType, UUID userId, String type, String message) {
        if (userType == UserType.CANDIDATE) {
            Candidate candidate = candidateRepository.findById(userId).orElse(null);
            if (candidate != null && candidate.getPhone() != null && !candidate.getPhone().isBlank()) {
                return sendSms(userType, userId, candidate.getPhone(), type, message);
            }
        } else {
            for (Manager manager : managerRepository.findByEmployerId(userId)) {
                if (manager.getPhone() != null && !manager.getPhone().isBlank()) {
                    return sendSms(userType, userId, manager.getPhone(), type, message);
                }
            }
        }

        return createFailedRecord(
                userType,
                userId,
                NotificationChannel.SMS,
                type,
                Map.of("message", message),
                "SMS channel is not available"
        );
    }

    private Notification attempt(UserType userType, UUID userId, NotificationChannel channel, String type,
                                 Map<String, Object> payload, DeliveryOperation operation) {
        Notification notification = createRecord(userType, userId, channel, type, payload);
        try {
            if (operation.execute()) {
                Instant now = Instant.now();
                notification.setSentAt(now);
                notification.setDeliveredAt(now);
                notification.setErrorMessage(null);
                return notificationRepository.save(notification);
            }

            notification.setRetryCount(safeRetryCount(notification) + 1);
            notification.setErrorMessage(channel + " delivery was rejected");
            return notificationRepository.save(notification);
        } catch (Exception e) {
            notification.setRetryCount(safeRetryCount(notification) + 1);
            notification.setErrorMessage(e.getMessage());
            return notificationRepository.save(notification);
        }
    }

    private Notification createFailedRecord(UserType userType, UUID userId, NotificationChannel channel, String type,
                                            Map<String, Object> payload, String errorMessage) {
        Notification notification = createRecord(userType, userId, channel, type, payload);
        notification.setRetryCount(safeRetryCount(notification) + 1);
        notification.setErrorMessage(errorMessage);
        return notificationRepository.save(notification);
    }

    private Notification createRecord(UserType userType, UUID userId, NotificationChannel channel, String type,
                                      Map<String, Object> payload) {
        Notification notification = Notification.builder()
                .userType(userType)
                .userId(userId)
                .channel(channel)
                .type(type)
                .payload(serializePayload(payload))
                .build();
        return notificationRepository.save(notification);
    }

    private boolean isDelivered(Notification notification) {
        return notification != null && notification.getDeliveredAt() != null;
    }

    private boolean retryTelegram(Notification notification, String message) {
        Long chatId = payloadLong(notification, "chatId");
        if (chatId == null && notification.getUserType() == UserType.CANDIDATE) {
            Candidate candidate = candidateRepository.findById(notification.getUserId()).orElse(null);
            chatId = candidate != null ? candidate.getTelegramId() : null;
        }

        if (chatId == null) {
            return false;
        }

        boolean delivered = telegramNotificationService.send(chatId, message);
        if (delivered) {
            log.info("Telegram notification retry delivered: type={}, userId={}, chatId={}",
                    notification.getType(), notification.getUserId(), chatId);
        }
        return delivered;
    }

    private boolean retryPush(Notification notification, String message) {
        String pushSubscriptionJson = resolvePushSubscription(notification.getUserType(), notification.getUserId());
        return pushNotificationService.send(pushSubscriptionJson, message);
    }

    private boolean retrySms(Notification notification, String message) {
        String phone = payloadText(notification, "phone");
        if (phone == null || phone.isBlank()) {
            phone = resolveSmsPhone(notification.getUserType(), notification.getUserId());
        }

        return phone != null && !phone.isBlank() && smsService.send(phone, message);
    }

    private String resolvePushSubscription(UserType userType, UUID userId) {
        if (userType == UserType.CANDIDATE) {
            Candidate candidate = candidateRepository.findById(userId).orElse(null);
            return candidate != null ? candidate.getPushSubscriptionJson() : null;
        }

        return managerRepository.findByEmployerId(userId).stream()
                .sorted(Comparator.comparing((Manager manager) -> manager.getRole() != ManagerRole.ADMIN))
                .map(Manager::getPushSubscriptionJson)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }

    private String resolveSmsPhone(UserType userType, UUID userId) {
        if (userType == UserType.CANDIDATE) {
            Candidate candidate = candidateRepository.findById(userId).orElse(null);
            return candidate != null ? candidate.getPhone() : null;
        }

        return managerRepository.findByEmployerId(userId).stream()
                .sorted(Comparator.comparing((Manager manager) -> manager.getRole() != ManagerRole.ADMIN))
                .map(Manager::getPhone)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }

    private String payloadText(Notification notification, String field) {
        JsonNode node = readPayload(notification);
        if (node == null || !node.hasNonNull(field)) {
            return null;
        }
        String value = node.get(field).asText();
        return value == null || value.isBlank() ? null : value;
    }

    private Long payloadLong(Notification notification, String field) {
        JsonNode node = readPayload(notification);
        if (node == null || !node.hasNonNull(field)) {
            return null;
        }
        return node.get(field).asLong();
    }

    private JsonNode readPayload(Notification notification) {
        if (notification.getPayload() == null || notification.getPayload().isBlank()) {
            return null;
        }

        try {
            return objectMapper.readTree(notification.getPayload());
        } catch (Exception e) {
            log.warn("Failed to parse notification payload for {}: {}", notification.getId(), e.getMessage());
            return null;
        }
    }

    private int safeRetryCount(Notification notification) {
        return notification.getRetryCount() != null ? notification.getRetryCount() : 0;
    }

    private String serializePayload(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Failed to serialize notification payload: {}", e.getMessage());
            return "{}";
        }
    }

    @FunctionalInterface
    private interface DeliveryOperation {
        boolean execute();
    }

    public record DispatchResult(int attempts, int delivered) {
    }
}
