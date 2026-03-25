package uz.verifix.jobs.service.notification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
public class TelegramNotificationService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String botToken;
    private final String apiBaseUrl;

    @Autowired
    public TelegramNotificationService(
            ObjectMapper objectMapper,
            @Value("${app.telegram.bot.token:}") String botToken,
            @Value("${app.telegram.bot.api-base-url:https://api.telegram.org}") String apiBaseUrl) {
        this(
                HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(5))
                        .build(),
                objectMapper,
                botToken,
                apiBaseUrl
        );
    }

    TelegramNotificationService(HttpClient httpClient, ObjectMapper objectMapper, String botToken, String apiBaseUrl) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.botToken = botToken;
        this.apiBaseUrl = apiBaseUrl;
    }

    public boolean send(Long chatId, String message) {
        if (chatId == null || message == null || message.isBlank()) {
            return false;
        }
        if (botToken == null || botToken.isBlank()) {
            log.warn("Telegram notification skipped because bot token is not configured");
            return false;
        }

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "chat_id", chatId.toString(),
                    "text", message,
                    "parse_mode", "HTML",
                    "disable_web_page_preview", true
            ));

            HttpRequest request = HttpRequest.newBuilder(URI.create(buildSendMessageUrl()))
                    .header("Content-Type", "application/json; charset=UTF-8")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() / 100 != 2) {
                log.warn("Telegram API returned non-success status {} for chatId={}", response.statusCode(), chatId);
                return false;
            }

            JsonNode payload = objectMapper.readTree(response.body());
            boolean ok = payload.path("ok").asBoolean(false);
            if (!ok) {
                log.warn("Telegram API rejected message for chatId={}: {}",
                        chatId,
                        payload.path("description").asText("unknown error"));
            }
            return ok;
        } catch (Exception e) {
            log.warn("Telegram notification failed for chatId={}: {}", chatId, e.getMessage());
            return false;
        }
    }

    private String buildSendMessageUrl() {
        String normalizedBaseUrl = apiBaseUrl.endsWith("/")
                ? apiBaseUrl.substring(0, apiBaseUrl.length() - 1)
                : apiBaseUrl;
        return normalizedBaseUrl + "/bot" + botToken + "/sendMessage";
    }
}
