package uz.verifix.jobs.integration.gov;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class ArgosClient implements GovSyncClient {

    private final WebClient webClient;

    public ArgosClient(
            @Value("${app.gov.argos.base-url:https://api.argos.uz}") String baseUrl,
            @Value("${app.gov.argos.api-key:}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public GovSyncResult exportVacancy(Map<String, Object> vacancyData) {
        try {
            Map response = webClient.post()
                    .uri("/api/v1/vacancies")
                    .bodyValue(vacancyData)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response != null && response.containsKey("id")) {
                log.info("ARGOS: vacancy exported successfully, externalId={}", response.get("id"));
                return GovSyncResult.ok(response.get("id").toString());
            }
            return GovSyncResult.fail("Empty response from ARGOS");
        } catch (Exception e) {
            log.error("ARGOS vacancy export failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public GovSyncResult exportEmployer(Map<String, Object> employerData) {
        try {
            Map response = webClient.post()
                    .uri("/api/v1/employers")
                    .bodyValue(employerData)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response != null && response.containsKey("id")) {
                return GovSyncResult.ok(response.get("id").toString());
            }
            return GovSyncResult.fail("Empty response from ARGOS");
        } catch (Exception e) {
            log.error("ARGOS employer export failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public GovSyncResult reportHiring(Map<String, Object> hiringData) {
        try {
            webClient.post()
                    .uri("/api/v1/employment/report")
                    .bodyValue(hiringData)
                    .retrieve()
                    .toBodilesseMono()
                    .timeout(Duration.ofSeconds(30))
                    .block();
            log.info("ARGOS: hiring reported successfully");
            return GovSyncResult.ok(null);
        } catch (Exception e) {
            log.error("ARGOS hiring report failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public List<GovVacancyData> importVacancies() {
        try {
            List<Map> response = webClient.get()
                    .uri("/api/v1/vacancies/active")
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .timeout(Duration.ofSeconds(60))
                    .collectList()
                    .block();

            if (response == null) return List.of();

            return response.stream().map(v -> GovVacancyData.builder()
                    .externalId(String.valueOf(v.get("id")))
                    .title((String) v.getOrDefault("title", ""))
                    .description((String) v.getOrDefault("description", ""))
                    .category((String) v.getOrDefault("category", ""))
                    .city((String) v.getOrDefault("city", ""))
                    .employerName((String) v.getOrDefault("employer_name", ""))
                    .employerInn((String) v.getOrDefault("employer_inn", ""))
                    .positionsCount(v.containsKey("positions") ? ((Number) v.get("positions")).intValue() : 1)
                    .build()).toList();
        } catch (Exception e) {
            log.error("ARGOS vacancy import failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public String getProviderName() {
        return "ARGOS";
    }
}
