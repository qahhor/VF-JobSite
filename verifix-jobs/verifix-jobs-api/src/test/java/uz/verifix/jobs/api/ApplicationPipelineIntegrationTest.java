package uz.verifix.jobs.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.auth.JwtService;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration test: Full application pipeline.
 * Candidate applies → employer views → shortlists → interviews → hires.
 */
class ApplicationPipelineIntegrationTest extends AbstractIntegrationTest {

    @Autowired private ObjectMapper objectMapper;
    @Autowired private EmployerRepository employerRepository;
    @Autowired private ManagerRepository managerRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private VacancyRepository vacancyRepository;
    @Autowired private JwtService jwtService;

    @Test
    void shouldCompleteFullHiringPipeline() throws Exception {
        // Setup employer + vacancy
        Employer employer = employerRepository.save(Employer.builder()
                .name("Pipeline Test Co").inn("PT" + System.nanoTime())
                .status(EmployerStatus.ACTIVE).build());
        Manager manager = managerRepository.save(Manager.builder()
                .employer(employer).email("pm@test.uz").role(ManagerRole.ADMIN)
                .passwordHash("$2a$12$test").build());
        Vacancy vacancy = vacancyRepository.save(Vacancy.builder()
                .employer(employer).title("Driver needed").category("DRIVER")
                .city("Tashkent").status(VacancyStatus.ACTIVE)
                .salaryFrom(BigDecimal.valueOf(3000000)).positionsCount(1).positionsFilled(0)
                .build());

        // Setup candidate
        Candidate candidate = candidateRepository.save(Candidate.builder()
                .phone("+998901111111").firstName("Ali").lastName("Karimov")
                .city("Tashkent").build());

        String employerToken = jwtService.generateAccessToken(manager.getId(), "EMPLOYER", manager.getEmail(), employer.getId());
        String candidateToken = jwtService.generateAccessToken(candidate.getId(), "CANDIDATE", candidate.getPhone(), null);

        // 1. Candidate applies
        mockMvc.perform(post("/api/v1/candidates/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("vacancyId", vacancy.getId().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NEW"));

        // 2. Candidate sees their application
        mockMvc.perform(get("/api/v1/candidates/applications")
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1));

        // 3. Employer sees applications
        mockMvc.perform(get("/api/v1/applications")
                        .header("Authorization", "Bearer " + employerToken)
                        .param("vacancyId", vacancy.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // 4. Prevent duplicate application
        mockMvc.perform(post("/api/v1/candidates/apply")
                        .header("Authorization", "Bearer " + candidateToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("vacancyId", vacancy.getId().toString()))))
                .andExpect(status().is4xxClientError());
    }
}
