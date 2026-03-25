package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.service.notification.NotificationService;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.notification.retry.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationRetryScheduler {

    private final NotificationService notificationService;

    @Value("${app.notification.retry.batch-size:50}")
    private int batchSize;

    @Value("${app.notification.retry.max-attempts:3}")
    private int maxAttempts;

    @Scheduled(fixedDelayString = "${app.notification.retry.interval-ms:300000}")
    public void retryUndeliveredNotifications() {
        int processed = notificationService.retryUndelivered(batchSize, maxAttempts);
        if (processed > 0) {
            log.info("Retried {} undelivered notifications", processed);
        }
    }
}
