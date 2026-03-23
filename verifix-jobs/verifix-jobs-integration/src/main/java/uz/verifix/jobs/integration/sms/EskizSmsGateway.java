package uz.verifix.jobs.integration.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
public class EskizSmsGateway implements SmsGateway {

    private final WebClient webClient;
    private final String email;
    private final String password;

    private volatile String cachedToken;
    private volatile Instant tokenExpiresAt;
    private final Object tokenLock = new Object();

    public EskizSmsGateway(
            @Value("${app.sms.eskiz.base-url:https://notify.eskiz.uz}") String baseUrl,
            @Value("${app.sms.eskiz.email:}") String email,
            @Value("${app.sms.eskiz.password:}") String password,
            WebClient.Builder webClientBuilder
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.email = email;
        this.password = password;
    }

    @Override
    public SmsResult send(String phone, String message) {
        try {
            String token = getToken();
            Map<String, Object> response = webClient.post()
                    .uri("/api/message/sms/send")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue("mobile_phone=" + phone.replace("+", "")
                            + "&message=" + message
                            + "&from=4546")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(10));

            if (response != null && "success".equals(response.get("status"))) {
                String messageId = response.containsKey("id") ? response.get("id").toString() : null;
                log.info("Eskiz SMS sent to {}: id={}", maskPhone(phone), messageId);
                return SmsResult.ok(messageId);
            }
            String error = response != null ? response.toString() : "null response";
            log.warn("Eskiz SMS failed to {}: {}", maskPhone(phone), error);
            return SmsResult.fail(error);
        } catch (Exception e) {
            log.error("Eskiz SMS exception to {}: {}", maskPhone(phone), e.getMessage());
            return SmsResult.fail(e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "ESKIZ";
    }

    private String getToken() {
        // Double-checked locking: avoid synchronizing on every call
        if (cachedToken != null && tokenExpiresAt != null && Instant.now().isBefore(tokenExpiresAt)) {
            return cachedToken;
        }
        synchronized (tokenLock) {
            // Re-check after acquiring lock (another thread may have refreshed)
            if (cachedToken != null && tokenExpiresAt != null && Instant.now().isBefore(tokenExpiresAt)) {
                return cachedToken;
            }
            Map<String, Object> response = webClient.post()
                    .uri("/api/auth/login")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue("email=" + email + "&password=" + password)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(10));

            if (response != null && response.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                cachedToken = (String) data.get("token");
                tokenExpiresAt = Instant.now().plus(Duration.ofDays(29));
                log.info("Eskiz token refreshed, expires at {}", tokenExpiresAt);
            }
            return cachedToken;
        }
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 5) return "***";
        return phone.substring(0, phone.length() - 4) + "****";
    }
}
