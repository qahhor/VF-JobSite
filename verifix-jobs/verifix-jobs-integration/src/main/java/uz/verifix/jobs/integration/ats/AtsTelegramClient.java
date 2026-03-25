package uz.verifix.jobs.integration.ats;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Client for the ATS Telegram Bot webhook API.
 * Sends vacancy updates, application events, broadcast requests, and AI scoring triggers.
 * All webhook calls are signed with HMAC-SHA256 for verification.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.ats.telegram.enabled", havingValue = "true")
public class AtsTelegramClient {

    private final WebClient webClient;
    private final String hmacSecret;
    private static final Duration TIMEOUT = Duration.ofSeconds(15);

    public AtsTelegramClient(
            @Value("${app.ats.telegram.webhook-url}") String webhookUrl,
            @Value("${app.ats.telegram.hmac-secret:}") String hmacSecret) {
        this.webClient = WebClient.builder()
                .baseUrl(webhookUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.hmacSecret = hmacSecret;
    }

    // ==================== Vacancy Feed ====================

    /**
     * Push vacancy to ATS Telegram bot for display to subscribers.
     */
    public void pushVacancy(AtsVacancyPayload vacancy) {
        sendWebhook("vacancy.publish", vacancy);
    }

    /**
     * Notify ATS that a vacancy was updated.
     */
    public void updateVacancy(AtsVacancyPayload vacancy) {
        sendWebhook("vacancy.update", vacancy);
    }

    /**
     * Notify ATS that a vacancy was closed/expired.
     */
    public void closeVacancy(UUID vacancyId) {
        sendWebhook("vacancy.close", Map.of("vacancy_id", vacancyId.toString()));
    }

    // ==================== Application Events ====================

    /**
     * Notify candidate about application status change via Telegram.
     */
    public void notifyApplicationStatus(AtsApplicationEvent event) {
        sendWebhook("application.status", event);
    }

    // ==================== Broadcast ====================

    /**
     * Broadcast a message to all bot users.
     */
    public void broadcastAll(AtsBroadcastRequest request) {
        sendWebhook("broadcast.all", request);
    }

    /**
     * Broadcast to specific users (by chat_id list).
     */
    public void broadcastTo(AtsBroadcastToRequest request) {
        sendWebhook("broadcast.to", request);
    }

    // ==================== AI Scoring ====================

    /**
     * Request AI candidate scoring from ATS.
     */
    public void requestAiScoring(AtsAiScoringRequest request) {
        sendWebhook("ai.candidate.score", request);
    }

    // ==================== Deeplink ====================

    /**
     * Get deeplink URL for a vacancy.
     */
    public String getDeeplinkUrl(String companyCode, Long vacancyId) {
        try {
            Map response = webClient.get()
                    .uri("/api/deeplink/{companyCode}/{vacancyId}", companyCode, vacancyId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(TIMEOUT)
                    .block();
            return response != null ? (String) response.get("url") : null;
        } catch (Exception e) {
            log.warn("Failed to get deeplink: {}", e.getMessage());
            return null;
        }
    }

    // ==================== Internal ====================

    private void sendWebhook(String type, Object payload) {
        try {
            String webhookId = UUID.randomUUID().toString();
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String signature = computeSignature(webhookId, timestamp, payload.toString());

            Map<String, Object> body = Map.of("type", type, "data", payload);

            webClient.post()
                    .uri("/api/webhook/")
                    .header("Webhook-Id", webhookId)
                    .header("Webhook-Timestamp", timestamp)
                    .header("Webhook-Signature", "v1," + signature)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .timeout(TIMEOUT)
                    .subscribe(
                            unused -> log.debug("ATS webhook '{}' sent successfully", type),
                            error -> log.warn("ATS webhook '{}' failed: {}", type, error.getMessage())
                    );
        } catch (Exception e) {
            log.error("Failed to send ATS webhook '{}': {}", type, e.getMessage());
        }
    }

    private String computeSignature(String webhookId, String timestamp, String payload) {
        try {
            String message = webhookId + "." + timestamp + "." + payload;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(hmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(message.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("HMAC computation failed: {}", e.getMessage());
            return "";
        }
    }
}
