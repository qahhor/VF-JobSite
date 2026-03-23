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
public class EnstClient implements GovSyncClient {

    private final WebClient webClient;

    public EnstClient(
            @Value("${app.gov.enst.base-url:https://api.enst.uz}") String baseUrl,
            @Value("${app.gov.enst.api-key:}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Api-Key", apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public GovSyncResult exportVacancy(Map<String, Object> vacancyData) {
        try {
            Map response = webClient.post()
                    .uri("/v1/registry/vacancies")
                    .bodyValue(vacancyData)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            String id = response != null && response.containsKey("registry_id")
                    ? response.get("registry_id").toString() : null;
            return id != null ? GovSyncResult.ok(id) : GovSyncResult.fail("No registry_id in response");
        } catch (Exception e) {
            log.error("ENST vacancy export failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public GovSyncResult exportEmployer(Map<String, Object> employerData) {
        try {
            webClient.post()
                    .uri("/v1/registry/employers")
                    .bodyValue(employerData)
                    .retrieve()
                    .toBodilesseMono()
                    .timeout(Duration.ofSeconds(30))
                    .block();
            return GovSyncResult.ok(null);
        } catch (Exception e) {
            log.error("ENST employer export failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public GovSyncResult reportHiring(Map<String, Object> hiringData) {
        try {
            Map response = webClient.post()
                    .uri("/v1/employment/register")
                    .bodyValue(hiringData)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            log.info("ENST: employment registered");
            return GovSyncResult.ok(response != null ? String.valueOf(response.get("record_id")) : null);
        } catch (Exception e) {
            log.error("ENST hiring report failed: {}", e.getMessage());
            return GovSyncResult.fail(e.getMessage());
        }
    }

    @Override
    public List<GovVacancyData> importVacancies() {
        // ENST is primarily an employment registry, not a vacancy portal
        return List.of();
    }

    @Override
    public String getProviderName() {
        return "ENST";
    }
}
