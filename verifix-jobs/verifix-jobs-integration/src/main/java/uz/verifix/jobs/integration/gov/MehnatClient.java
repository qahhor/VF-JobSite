package uz.verifix.jobs.integration.gov;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class MehnatClient implements GovSyncClient {

    private final WebClient webClient;

    public MehnatClient(
            @Value("${app.gov.mehnat.base-url:https://api.ish.mehnat.uz}") String baseUrl,
            @Value("${app.gov.mehnat.api-key:}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "ApiKey " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public GovSyncResult exportVacancy(Map<String, Object> vacancyData) {
        try {
            Map response = webClient.post()
                    .uri("/api/vacancies/publish")
                    .bodyValue(vacancyData)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            String id = response != null ? String.valueOf(response.getOrDefault("vacancy_id", "")) : null;
            return id != null && !id.isBlank() ? GovSyncResult.ok(id) : GovSyncResult.fail("No vacancy_id");
        } catch (Exception e) {
            log.error("ish.mehnat.uz vacancy export failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public GovSyncResult exportEmployer(Map<String, Object> employerData) {
        // ish.mehnat.uz doesn't have separate employer registration
        return GovSyncResult.ok(null);
    }

    @Override
    public GovSyncResult reportHiring(Map<String, Object> hiringData) {
        try {
            webClient.post()
                    .uri("/api/employment/report")
                    .bodyValue(hiringData)
                    .retrieve()
                    .toBodilesseMono()
                    .timeout(Duration.ofSeconds(30))
                    .block();
            return GovSyncResult.ok(null);
        } catch (Exception e) {
            log.error("ish.mehnat.uz hiring report failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public List<GovVacancyData> importVacancies() {
        try {
            List<Map> response = webClient.get()
                    .uri("/api/vacancies?status=active&limit=100")
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .timeout(Duration.ofSeconds(60))
                    .collectList()
                    .block();

            if (response == null) return List.of();

            return response.stream().map(v -> GovVacancyData.builder()
                    .externalId(String.valueOf(v.getOrDefault("id", "")))
                    .title((String) v.getOrDefault("title", ""))
                    .description((String) v.getOrDefault("description", ""))
                    .category((String) v.getOrDefault("profession", ""))
                    .city((String) v.getOrDefault("region", ""))
                    .region((String) v.getOrDefault("district", ""))
                    .employerName((String) v.getOrDefault("organization", ""))
                    .employerInn((String) v.getOrDefault("inn", ""))
                    .salaryFrom(v.containsKey("salary_from") ? new BigDecimal(v.get("salary_from").toString()) : null)
                    .salaryTo(v.containsKey("salary_to") ? new BigDecimal(v.get("salary_to").toString()) : null)
                    .positionsCount(v.containsKey("vacancies_count") ? ((Number) v.get("vacancies_count")).intValue() : 1)
                    .build()).toList();
        } catch (Exception e) {
            log.error("ish.mehnat.uz vacancy import failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public String getProviderName() {
        return "ISH_MEHNAT";
    }
}
