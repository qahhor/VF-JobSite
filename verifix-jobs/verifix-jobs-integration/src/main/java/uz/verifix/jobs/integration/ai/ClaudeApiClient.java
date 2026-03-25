package uz.verifix.jobs.integration.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.ai.claude.api-key")
public class ClaudeApiClient {

    private final WebClient webClient;
    private final String model;
    private final int maxTokens;
    private final ObjectMapper objectMapper;

    public ClaudeApiClient(
            @Value("${app.ai.claude.api-key:}") String apiKey,
            @Value("${app.ai.claude.model:claude-sonnet-4-20250514}") String model,
            @Value("${app.ai.claude.max-tokens:1024}") int maxTokens,
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.anthropic.com")
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.model = model;
        this.maxTokens = maxTokens;
        this.objectMapper = objectMapper;
    }

    public record ChatMessage(String role, String content) {}

    public record ChatResponse(String text, int inputTokens, int outputTokens) {}

    public ChatResponse chat(String systemPrompt, List<ChatMessage> messages) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("system", systemPrompt);

            ArrayNode messagesArray = requestBody.putArray("messages");
            for (ChatMessage msg : messages) {
                ObjectNode msgNode = messagesArray.addObject();
                msgNode.put("role", msg.role());
                msgNode.put("content", msg.content());
            }

            String responseJson = webClient.post()
                    .uri("/v1/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            JsonNode response = objectMapper.readTree(responseJson);

            String text = "";
            JsonNode contentArray = response.get("content");
            if (contentArray != null && contentArray.isArray()) {
                for (JsonNode block : contentArray) {
                    if ("text".equals(block.path("type").asText())) {
                        text = block.path("text").asText();
                        break;
                    }
                }
            }

            int inputTokens = response.path("usage").path("input_tokens").asInt(0);
            int outputTokens = response.path("usage").path("output_tokens").asInt(0);

            log.debug("Claude API response: {} input tokens, {} output tokens", inputTokens, outputTokens);
            return new ChatResponse(text, inputTokens, outputTokens);

        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            throw new RuntimeException("Claude API call failed", e);
        }
    }

    public ChatResponse chat(String systemPrompt, String userMessage) {
        return chat(systemPrompt, List.of(new ChatMessage("user", userMessage)));
    }
}
