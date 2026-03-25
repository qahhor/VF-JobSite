package uz.verifix.jobs.integration.verifix;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class VerifixHrmClient {

    private final WebClient webClient;
    private static final Duration TIMEOUT = Duration.ofSeconds(30);
    private static final Duration TIMEOUT_SHORT = Duration.ofSeconds(15);

    public VerifixHrmClient(
            @Value("${app.verifix.hrm.base-url:https://hrm.verifix.uz/api}") String baseUrl,
            @Value("${app.verifix.hrm.api-key:}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ==================== Employee Operations ====================

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
                    .timeout(TIMEOUT)
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
                    .timeout(TIMEOUT_SHORT)
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
                    .timeout(TIMEOUT)
                    .collectList()
                    .block();

            if (response == null) return List.of();

            return response.stream().map(e -> EmployeeInfo.builder()
                    .id(UUID.fromString(e.get("id").toString()))
                    .name((String) e.getOrDefault("full_name", ""))
                    .position((String) e.getOrDefault("position", ""))
                    .photoUrl((String) e.get("photo_url"))
                    .department((String) e.get("department"))
                    .phone((String) e.get("phone"))
                    .build()).toList();
        } catch (Exception e) {
            log.error("HRM get employees by company failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ==================== Org Structure ====================

    public List<HrmDivision> getDivisions(UUID companyId) {
        try {
            return webClient.get()
                    .uri("/v1/companies/{id}/divisions", companyId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<HrmDivision>>() {})
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception e) {
            log.error("HRM get divisions failed: {}", e.getMessage());
            return List.of();
        }
    }

    public List<HrmJob> getJobs(UUID companyId) {
        try {
            return webClient.get()
                    .uri("/v1/companies/{id}/jobs", companyId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<HrmJob>>() {})
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception e) {
            log.error("HRM get jobs failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ==================== Vacancy Sync ====================

    public List<HrmVacancy> getOpenVacancies(UUID companyId, Long sinceModifiedId) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/companies/{id}/vacancies")
                            .queryParam("status", "O")
                            .queryParam("scope", "A,N")
                            .queryParamIfPresent("modified_id", java.util.Optional.ofNullable(sinceModifiedId))
                            .build(companyId))
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<HrmVacancy>>() {})
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception e) {
            log.error("HRM get vacancies failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ==================== Candidate Sync (Jobs → HRM) ====================

    public HrmCandidateResult createCandidate(UUID companyId, HrmCandidateRequest candidate) {
        try {
            Map response = webClient.post()
                    .uri("/v1/companies/{id}/candidates", companyId)
                    .bodyValue(candidate)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(TIMEOUT)
                    .block();

            if (response != null && response.containsKey("candidate_id")) {
                return HrmCandidateResult.ok(response.get("candidate_id").toString());
            }
            return HrmCandidateResult.fail("No candidate_id in response");
        } catch (Exception e) {
            log.error("HRM create candidate failed: {}", e.getMessage());
            return HrmCandidateResult.fail(e.getMessage());
        }
    }

    public void updateCandidateStage(UUID companyId, String candidateId, String vacancyId, String stageCode) {
        try {
            webClient.put()
                    .uri("/v1/companies/{companyId}/candidates/{candidateId}/stage", companyId, candidateId)
                    .bodyValue(Map.of("vacancy_id", vacancyId, "stage_code", stageCode))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .timeout(TIMEOUT_SHORT)
                    .block();
        } catch (Exception e) {
            log.warn("HRM update candidate stage failed: {}", e.getMessage());
        }
    }

    // ==================== Salary Data ====================

    public List<HrmSalaryStats> getSalaryStats(UUID companyId) {
        try {
            return webClient.get()
                    .uri("/v1/companies/{id}/salary-stats", companyId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<HrmSalaryStats>>() {})
                    .timeout(TIMEOUT)
                    .block();
        } catch (Exception e) {
            log.error("HRM get salary stats failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ==================== SSO / OAuth2 ====================

    public HrmTokenResponse exchangeAuthCode(String authCode, String clientId, String clientSecret, String redirectUri) {
        try {
            Map<String, String> body = Map.of(
                    "grant_type", "authorization_code",
                    "code", authCode,
                    "client_id", clientId,
                    "client_secret", clientSecret,
                    "redirect_uri", redirectUri
            );

            return webClient.post()
                    .uri("/security/oauth/token")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(HrmTokenResponse.class)
                    .timeout(TIMEOUT_SHORT)
                    .block();
        } catch (Exception e) {
            log.error("HRM OAuth2 token exchange failed: {}", e.getMessage());
            return null;
        }
    }

    public HrmUserInfo getUserInfo(String accessToken) {
        try {
            return webClient.get()
                    .uri("/v1/userinfo")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(HrmUserInfo.class)
                    .timeout(TIMEOUT_SHORT)
                    .block();
        } catch (Exception e) {
            log.error("HRM get user info failed: {}", e.getMessage());
            return null;
        }
    }

    // ==================== Health ====================

    public boolean isHealthy() {
        try {
            webClient.get().uri("/health").retrieve().bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5)).block();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
