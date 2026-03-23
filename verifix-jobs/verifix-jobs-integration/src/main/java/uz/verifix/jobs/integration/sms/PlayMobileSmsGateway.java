package uz.verifix.jobs.integration.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
public class PlayMobileSmsGateway implements SmsGateway {

    private final WebClient webClient;
    private final String login;
    private final String password;

    public PlayMobileSmsGateway(
            @Value("${app.sms.playmobile.base-url:https://send.playmobile.uz}") String baseUrl,
            @Value("${app.sms.playmobile.login:}") String login,
            @Value("${app.sms.playmobile.password:}") String password,
            WebClient.Builder webClientBuilder
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.login = login;
        this.password = password;
    }

    @Override
    public SmsResult send(String phone, String message) {
        try {
            Map<String, Object> payload = Map.of(
                    "messages", new Object[]{
                            Map.of(
                                    "recipient", phone.replace("+", ""),
                                    "message-id", java.util.UUID.randomUUID().toString(),
                                    "sms", Map.of(
                                            "originator", "3700",
                                            "content", Map.of("text", message)
                                    )
                            )
                    }
            );

            Map<String, Object> response = webClient.post()
                    .uri("/broker-api/send")
                    .header("Authorization", "Basic " +
                            java.util.Base64.getEncoder().encodeToString((login + ":" + password).getBytes()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(10));

            if (response != null) {
                String messageId = response.containsKey("message-id") ? response.get("message-id").toString() : null;
                log.info("PlayMobile SMS sent to {}: id={}", maskPhone(phone), messageId);
                return SmsResult.ok(messageId);
            }
            return SmsResult.fail("null response");
        } catch (Exception e) {
            log.error("PlayMobile SMS exception to {}: {}", maskPhone(phone), e.getMessage());
            return SmsResult.fail(e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "PLAYMOBILE";
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 5) return "***";
        return phone.substring(0, phone.length() - 4) + "****";
    }
}
