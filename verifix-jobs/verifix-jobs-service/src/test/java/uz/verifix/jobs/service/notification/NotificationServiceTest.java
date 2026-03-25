package uz.verifix.jobs.service.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private CandidateRepository candidateRepository;
    @Mock
    private ManagerRepository managerRepository;
    @Mock
    private SmsService smsService;
    @Mock
    private PushNotificationService pushNotificationService;
    @Mock
    private TelegramNotificationService telegramNotificationService;

    private NotificationService notificationService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        objectMapper = new ObjectMapper();

        notificationService = new NotificationService(
                notificationRepository,
                applicationRepository,
                candidateRepository,
                managerRepository,
                smsService,
                pushNotificationService,
                telegramNotificationService,
                objectMapper
        );
    }

    @Test
    void shouldPreferTelegramForCandidateNotification() {
        UUID candidateId = UUID.randomUUID();
        Candidate candidate = Candidate.builder()
                .telegramId(123456789L)
                .phone("+998901112233")
                .build();
        candidate.setId(candidateId);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(telegramNotificationService.send(candidate.getTelegramId(), "Test message")).thenReturn(true);

        NotificationService.DispatchResult result = notificationService.dispatch(
                UserType.CANDIDATE,
                candidateId,
                "candidate.status",
                "Test message"
        );

        assertEquals(1, result.attempts());
        assertEquals(1, result.delivered());
        verify(smsService, never()).send(any(), any());
    }

    @Test
    void shouldFallbackToSmsWhenCandidateHasNoTelegram() {
        UUID candidateId = UUID.randomUUID();
        Candidate candidate = Candidate.builder()
                .phone("+998901112233")
                .build();
        candidate.setId(candidateId);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(smsService.send(candidate.getPhone(), "Test message")).thenReturn(true);

        NotificationService.DispatchResult result = notificationService.dispatch(
                UserType.CANDIDATE,
                candidateId,
                "candidate.status",
                "Test message"
        );

        assertEquals(1, result.attempts());
        assertEquals(1, result.delivered());
        verify(smsService).send(candidate.getPhone(), "Test message");
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void shouldFallbackToPushBeforeSmsForCandidate() {
        UUID candidateId = UUID.randomUUID();
        Candidate candidate = Candidate.builder()
                .telegramId(123456789L)
                .pushSubscriptionJson("{\"endpoint\":\"push\"}")
                .phone("+998901112233")
                .build();
        candidate.setId(candidateId);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(telegramNotificationService.send(candidate.getTelegramId(), "Test message")).thenReturn(false);
        when(pushNotificationService.send(candidate.getPushSubscriptionJson(), "Test message")).thenReturn(true);

        NotificationService.DispatchResult result = notificationService.dispatch(
                UserType.CANDIDATE,
                candidateId,
                "candidate.status",
                "Test message"
        );

        assertEquals(2, result.attempts());
        assertEquals(1, result.delivered());
        verify(smsService, never()).send(any(), any());
    }

    @Test
    void shouldFallbackToSmsForEmployerWhenPushIsRejected() {
        UUID employerId = UUID.randomUUID();
        Manager manager = Manager.builder()
                .role(ManagerRole.ADMIN)
                .telegramChatId(99887766L)
                .phone("+998901112233")
                .pushSubscriptionJson("{\"endpoint\":\"push\"}")
                .build();
        manager.setId(UUID.randomUUID());

        when(managerRepository.findByEmployerId(employerId)).thenReturn(List.of(manager));
        when(telegramNotificationService.send(manager.getTelegramChatId(), "Test message")).thenReturn(false);
        when(pushNotificationService.send(manager.getPushSubscriptionJson(), "Test message")).thenReturn(false);
        when(smsService.send(manager.getPhone(), "Test message")).thenReturn(true);

        NotificationService.DispatchResult result = notificationService.dispatch(
                UserType.EMPLOYER,
                employerId,
                "employer.status",
                "Test message"
        );

        assertEquals(3, result.attempts());
        assertEquals(1, result.delivered());
        verify(smsService).send(manager.getPhone(), "Test message");
    }

    @Test
    void shouldCreateDeliveredTelegramRecord() {
        UUID candidateId = UUID.randomUUID();
        when(telegramNotificationService.send(123456789L, "Test message")).thenReturn(true);

        Notification notification = notificationService.sendTelegramMessage(
                UserType.CANDIDATE,
                candidateId,
                123456789L,
                "candidate.status",
                "Test message"
        );

        assertNotNull(notification);
        assertNotNull(notification.getSentAt());
        assertNotNull(notification.getDeliveredAt());
        assertEquals(UserType.CANDIDATE, notification.getUserType());
    }

    @Test
    void shouldRetryFailedSmsNotification() {
        UUID candidateId = UUID.randomUUID();
        Notification notification = Notification.builder()
                .userType(UserType.CANDIDATE)
                .userId(candidateId)
                .channel(NotificationChannel.SMS)
                .type("candidate.status")
                .payload("{\"phone\":\"+998901112233\",\"message\":\"Retry message\"}")
                .retryCount(1)
                .build();

        when(smsService.send("+998901112233", "Retry message")).thenReturn(true);

        Notification retried = notificationService.retry(notification);

        assertNotNull(retried.getDeliveredAt());
        assertEquals(1, retried.getRetryCount());
    }

    @Test
    void shouldRetryFailedTelegramNotification() {
        UUID candidateId = UUID.randomUUID();
        Notification notification = Notification.builder()
                .userType(UserType.CANDIDATE)
                .userId(candidateId)
                .channel(NotificationChannel.TELEGRAM)
                .type("candidate.status")
                .payload("{\"chatId\":123456789,\"message\":\"Retry message\"}")
                .retryCount(1)
                .build();

        when(telegramNotificationService.send(123456789L, "Retry message")).thenReturn(true);

        Notification retried = notificationService.retry(notification);

        assertNotNull(retried.getDeliveredAt());
        assertEquals(1, retried.getRetryCount());
    }
}
