package uz.verifix.jobs.service.hrm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.*;
import uz.verifix.jobs.domain.repository.*;
import uz.verifix.jobs.integration.verifix.*;

import java.util.UUID;

/**
 * Syncs candidates from Jobs → HRM when they apply.
 * Maps Jobs Candidate to HRM hrec_candidates via the HRM API.
 * Also syncs application status changes back to HRM funnel stages.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HrmCandidateSyncService {

    private final VerifixHrmClient hrmClient;
    private final CandidateRepository candidateRepository;
    private final EmployerRepository employerRepository;
    private final HrmCandidateMappingRepository candidateMappingRepository;
    private final HrmVacancyMappingRepository vacancyMappingRepository;
    private final HrmSyncLogRepository syncLogRepository;

    /**
     * Sync a candidate to HRM when they apply to a vacancy that has an HRM link.
     * Called asynchronously after application creation.
     */
    @Async
    @Transactional
    public void syncCandidateOnApply(Application application) {
        Vacancy vacancy = application.getVacancy();
        Employer employer = vacancy.getEmployer();

        if (employer.getHrmCompanyId() == null || !Boolean.TRUE.equals(employer.getHrmSyncEnabled())) {
            return;
        }

        Candidate candidate = application.getCandidate();
        String hrmCompanyId = employer.getHrmCompanyId();

        // Check if already synced
        if (candidateMappingRepository.existsByJobsCandidateIdAndHrmCompanyId(candidate.getId(), hrmCompanyId)) {
            log.debug("Candidate {} already synced to HRM company {}", candidate.getId(), hrmCompanyId);
            syncStatusToHrm(application, hrmCompanyId);
            return;
        }

        try {
            // Get HRM vacancy ID if available
            Long hrmVacancyId = vacancyMappingRepository.findByJobsVacancyId(vacancy.getId())
                    .map(HrmVacancyMapping::getHrmVacancyId)
                    .orElse(null);

            HrmCandidateRequest request = HrmCandidateRequest.builder()
                    .firstName(candidate.getFirstName())
                    .lastName(candidate.getLastName())
                    .mainPhone(candidate.getPhone())
                    .gender(candidate.getGender() != null ? candidate.getGender().name().substring(0, 1) : null)
                    .address(candidate.getCity())
                    .wageExpectation(candidate.getPreferredSalary())
                    .skills(candidate.getSkills() != null ? String.join(", ", candidate.getSkills()) : null)
                    .channelPcode("VERIFIX_JOBS")
                    .vacancyId(hrmVacancyId)
                    .note("Applied via Verifix Jobs portal. Application ID: " + application.getId())
                    .source("VERIFIX_JOBS")
                    .build();

            HrmCandidateResult result = hrmClient.createCandidate(
                    UUID.fromString(hrmCompanyId), request);

            if (result.isSuccess()) {
                HrmCandidateMapping mapping = HrmCandidateMapping.builder()
                        .jobsCandidateId(candidate.getId())
                        .hrmCompanyId(hrmCompanyId)
                        .hrmCandidateId(result.getCandidateId())
                        .build();
                candidateMappingRepository.save(mapping);

                logSync("CANDIDATE_EXPORT", "EXPORT", "CANDIDATE",
                        candidate.getId(), result.getCandidateId(), "SYNCED", null);

                log.info("Synced candidate {} to HRM as {}", candidate.getId(), result.getCandidateId());
            } else {
                logSync("CANDIDATE_EXPORT", "EXPORT", "CANDIDATE",
                        candidate.getId(), null, "FAILED", result.getErrorMessage());
                log.warn("Failed to sync candidate {} to HRM: {}", candidate.getId(), result.getErrorMessage());
            }
        } catch (Exception e) {
            logSync("CANDIDATE_EXPORT", "EXPORT", "CANDIDATE",
                    candidate.getId(), null, "FAILED", e.getMessage());
            log.error("Candidate sync to HRM failed: {}", e.getMessage());
        }
    }

    /**
     * Sync application status change to HRM funnel stage.
     */
    @Async
    public void syncStatusToHrm(Application application, String hrmCompanyId) {
        try {
            String hrmCandidateId = candidateMappingRepository
                    .findByJobsCandidateIdAndHrmCompanyId(application.getCandidate().getId(), hrmCompanyId)
                    .map(HrmCandidateMapping::getHrmCandidateId)
                    .orElse(null);

            if (hrmCandidateId == null) return;

            String hrmVacancyId = vacancyMappingRepository
                    .findByJobsVacancyId(application.getVacancy().getId())
                    .map(m -> m.getHrmVacancyId().toString())
                    .orElse(null);

            if (hrmVacancyId == null) return;

            String stageCode = mapStatusToHrmStage(application.getStatus().name());
            if (stageCode != null) {
                hrmClient.updateCandidateStage(
                        UUID.fromString(hrmCompanyId), hrmCandidateId, hrmVacancyId, stageCode);
                log.debug("Synced status {} to HRM for candidate {}", application.getStatus(), hrmCandidateId);
            }
        } catch (Exception e) {
            log.warn("Status sync to HRM failed: {}", e.getMessage());
        }
    }

    private String mapStatusToHrmStage(String jobsStatus) {
        return switch (jobsStatus) {
            case "NEW" -> "SCREENING";
            case "VIEWED" -> "SCREENING";
            case "SHORTLIST" -> "SHORTLIST";
            case "INVITED" -> "INTERVIEW";
            case "INTERVIEW" -> "INTERVIEW";
            case "OFFER" -> "OFFER";
            case "HIRED" -> "HIRED";
            case "REJECTED" -> "REJECTED";
            default -> null;
        };
    }

    private void logSync(String syncType, String direction, String entityType,
                         UUID jobsEntityId, String hrmEntityId, String status, String error) {
        syncLogRepository.save(HrmSyncLog.builder()
                .syncType(syncType).direction(direction).entityType(entityType)
                .jobsEntityId(jobsEntityId).hrmEntityId(hrmEntityId)
                .syncStatus(status).errorMessage(error).build());
    }
}
