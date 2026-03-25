package uz.verifix.jobs.integration.ml;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * REST client for the Python ML microservice.
 * Falls back gracefully when the ML service is unavailable.
 * gRPC transport will replace REST once proto generation is integrated into the Java build.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.ml.enabled", havingValue = "true")
public class MlServiceClient {

    private final WebClient webClient;

    public MlServiceClient(
            @Value("${app.ml.base-url:http://localhost:8000}") String baseUrl,
            WebClient.Builder webClientBuilder
    ) {
        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .build();
    }

    public record MatchResult(double score, Map<String, Double> factors, String modelVersion) {}
    public record SalaryResult(double p25, double median, double p75, long sampleSize, double confidence) {}
    public record FraudResult(double score, List<String> flags, boolean isFraud) {}
    public record ChurnResult(double score, List<String> riskFactors, String riskLevel, String action) {}

    public boolean isHealthy() {
        try {
            String response = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
            return response != null && response.contains("ok");
        } catch (Exception e) {
            log.debug("ML service health check failed: {}", e.getMessage());
            return false;
        }
    }
}
