package uz.verifix.jobs.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PushNotificationService {

    public boolean send(String pushSubscriptionJson, String message) {
        if (pushSubscriptionJson == null || pushSubscriptionJson.isBlank()) {
            return false;
        }

        log.info("Push notification accepted for subscription payload length={}", pushSubscriptionJson.length());
        log.debug("Push notification body: {}", message);
        return true;
    }
}
