package uz.verifix.jobs.integration.verifix;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class VerifixHrmClient {

    private final WebClient webClient;

    public VerifixHrmClient(
            @Value("${app.verifix.hrm.base-url:https://hrm.verifix.uz/api}") String baseUrl,
            @Value("${app.verifix.hrm.api-key:}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public EmployeeResult createEmployee(UUID employerId, String candidateName, String phone,
                                          String position, Instant hiredAt) {
        try {
            Map<String, Object> body = Map.of(
                    "company_id", employerId.toString(),
                    "full_name", candidateName,
                    "phone", phone,
                    "position", position,
                    "hired_at", hiredAt.toString(),
                    "source", "VERIFIX_JOBS"
            );

            Map response = webClient.post()
                    .uri("/v1/employees")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response != null && response.containsKey("employee_id")) {
                UUID employeeId = UUID.fromString(response.get("employee_id").toString());
                log.info("HRM: employee created successfully, id={}", employeeId);
                return EmployeeResult.ok(employeeId);
            }
            return EmployeeResult.fail("No employee_id in HRM response");
        } catch (Exception e) {
            log.error("HRM employee creation failed: {}", e.getMessage());
            return EmployeeResult.fail(e.getMessage());
        }
    }

    public EmployeeInfo getEmployee(UUID employeeId) {
        try {
            Map response = webClient.get()
                    .uri("/v1/employees/{id}", employeeId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response == null) return null;

            return EmployeeInfo.builder()
                    .id(UUID.fromString(response.get("id").toString()))
                    .name((String) response.getOrDefault("full_name", ""))
                    .position((String) response.getOrDefault("position", ""))
                    .photoUrl((String) response.get("photo_url"))
                    .department((String) response.get("department"))
                    .phone((String) response.get("phone"))
                    .build();
        } catch (Exception e) {
            log.error("HRM get employee failed: {}", e.getMessage());
            return null;
        }
    }

    public List<EmployeeInfo> getEmployeesByCompany(UUID companyId) {
        try {
            List<Map> response = webClient.get()
                    .uri("/v1/companies/{id}/employees", companyId)
                    .retrieve()
                    .bodyToFlux(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .collectList()
                    .block();

            if (response == null) return List.of();

            return response.stream().map(e -> EmployeeInfo.builder()
                    .id(UUID.fromString(e.get("id").toString()))
                    .name((String) e.getOrDefault("full_name", ""))
                    .position((String) e.getOrDefault("position", ""))
                    .photoUrl((String) e.get("photo_url"))
                    .department((String) e.get("department"))
                    .build()).toList();
        } catch (Exception e) {
            log.error("HRM get employees by company failed: {}", e.getMessage());
            return List.of();
        }
    }
}
