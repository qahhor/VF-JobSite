package uz.verifix.jobs.service.compliance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.*;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.*;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;
import uz.verifix.jobs.service.consent.ConsentService;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataExportService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final WorkHistoryRepository workHistoryRepository;
    private final ConsentLogRepository consentLogRepository;
    private final EmployerRepository employerRepository;
    private final VacancyRepository vacancyRepository;
    private final ManagerRepository managerRepository;
    private final EmployerBrandingRepository brandingRepository;
    private final ConsentService consentService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .enable(SerializationFeature.INDENT_OUTPUT);

    @Transactional(readOnly = true)
    public byte[] exportCandidateData(UUID candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId.toString()));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("exportDate", java.time.Instant.now().toString());
        data.put("dataType", "candidate_personal_data");

        // Profile
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", candidate.getId());
        profile.put("phone", candidate.getPhone());
        profile.put("firstName", candidate.getFirstName());
        profile.put("lastName", candidate.getLastName());
        profile.put("birthDate", candidate.getBirthDate());
        profile.put("city", candidate.getCity());
        profile.put("region", candidate.getRegion());
        profile.put("gender", candidate.getGender());
        profile.put("educationLevel", candidate.getEducationLevel());
        profile.put("skills", candidate.getSkills());
        profile.put("preferredCategories", candidate.getPreferredCategories());
        profile.put("preferredSalary", candidate.getPreferredSalary());
        profile.put("myidStatus", candidate.getMyidStatus());
        profile.put("registeredAt", candidate.getCreatedAt());
        data.put("profile", profile);

        // Applications
        List<Application> apps = applicationRepository.findByCandidateId(candidateId);
        data.put("applications", apps.stream().map(a -> Map.of(
                "vacancyTitle", a.getVacancy().getTitle(),
                "employerName", a.getVacancy().getEmployer().getName(),
                "status", a.getStatus().name(),
                "appliedAt", a.getAppliedAt() != null ? a.getAppliedAt().toString() : "",
                "source", a.getSource() != null ? a.getSource().name() : ""
        )).toList());

        // Work history
        List<WorkHistory> history = workHistoryRepository.findByCandidateIdOrderByStartDateDesc(candidateId);
        data.put("workHistory", history.stream().map(wh -> Map.of(
                "jobTitle", wh.getJobTitle() != null ? wh.getJobTitle() : "",
                "companyName", wh.getCompanyName() != null ? wh.getCompanyName() : "",
                "startDate", wh.getStartDate() != null ? wh.getStartDate().toString() : "",
                "endDate", wh.getEndDate() != null ? wh.getEndDate().toString() : ""
        )).toList());

        // Consents
        var consents = consentLogRepository.findByUserTypeAndUserId(
                uz.verifix.jobs.domain.enums.UserType.CANDIDATE, candidateId);
        data.put("consents", consents.stream().map(c -> Map.of(
                "type", c.getConsentType().name(),
                "givenAt", c.getGivenAt().toString(),
                "withdrawnAt", c.getWithdrawnAt() != null ? c.getWithdrawnAt().toString() : ""
        )).toList());

        try {
            return objectMapper.writeValueAsBytes(data);
        } catch (Exception e) {
            log.error("Failed to serialize candidate data: {}", e.getMessage());
            return "{}".getBytes(StandardCharsets.UTF_8);
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportEmployerData(UUID employerId) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("exportDate", java.time.Instant.now().toString());
        data.put("dataType", "employer_data");

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", employer.getId());
        profile.put("name", employer.getName());
        profile.put("inn", employer.getInn());
        profile.put("legalName", employer.getLegalName());
        profile.put("industry", employer.getIndustry());
        profile.put("city", employer.getCity());
        profile.put("status", employer.getStatus());
        profile.put("subscriptionPlan", employer.getSubscriptionPlan());
        profile.put("registeredAt", employer.getCreatedAt());
        data.put("profile", profile);

        // Managers
        List<Manager> managers = managerRepository.findByEmployerId(employerId);
        data.put("managers", managers.stream().map(m -> Map.of(
                "email", m.getEmail(),
                "phone", m.getPhone() != null ? m.getPhone() : "",
                "role", m.getRole().name()
        )).toList());

        // Vacancy count
        long totalVacancies = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE)
                + vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.DRAFT);
        data.put("totalVacancies", totalVacancies);

        // Application stats
        long totalApps = applicationRepository.countByVacancy_EmployerId(employerId);
        data.put("totalApplications", totalApps);

        try {
            return objectMapper.writeValueAsBytes(data);
        } catch (Exception e) {
            log.error("Failed to serialize employer data: {}", e.getMessage());
            return "{}".getBytes(StandardCharsets.UTF_8);
        }
    }

    @Transactional
    public void deleteCandidate(UUID candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", candidateId.toString()));

        // Anonymize personal data
        String anonId = "deleted_" + candidateId.toString().substring(0, 8);
        candidate.setPhone(anonId);
        candidate.setFirstName(null);
        candidate.setLastName(null);
        candidate.setBirthDate(null);
        candidate.setPassportSeries(null);
        candidate.setAvatarUrl(null);
        candidate.setSkills(null);
        candidate.setPreferredCategories(null);
        candidate.setWorkExperienceText(null);
        candidate.setTelegramId(null);
        candidate.setReferralCode(null);
        candidate.softDelete();

        candidateRepository.save(candidate);
        log.info("Candidate {} data anonymized and soft-deleted", candidateId);
    }

    @Transactional
    public void deleteEmployer(UUID employerId) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));

        // Unpublish branding
        brandingRepository.findByEmployerId(employerId).ifPresent(b -> {
            b.setIsPublished(false);
            brandingRepository.save(b);
        });

        // Soft delete all vacancies
        employer.getVacancies().forEach(Vacancy::softDelete);

        employer.softDelete();
        employerRepository.save(employer);
        log.info("Employer {} soft-deleted with cascading effects", employerId);
    }
}
