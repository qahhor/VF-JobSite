package uz.verifix.jobs.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Notification;
import uz.verifix.jobs.domain.enums.NotificationChannel;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.repository.NotificationRepository;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createAndSend(UserType userType, UUID userId, NotificationChannel channel,
                                       String type, String payload) {
        Notification notification = Notification.builder()
                .userType(userType)
                .userId(userId)
                .channel(channel)
                .type(type)
                .payload(payload)
                .sentAt(Instant.now())
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created: type={}, channel={}, userId={}", type, channel, userId);
        return notification;
    }

    @Transactional
    public void markDelivered(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setDeliveredAt(Instant.now());
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setReadAt(Instant.now());
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markFailed(UUID notificationId, String errorMessage) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRetryCount(n.getRetryCount() + 1);
            n.setErrorMessage(errorMessage);
            notificationRepository.save(n);
        });
    }
}
