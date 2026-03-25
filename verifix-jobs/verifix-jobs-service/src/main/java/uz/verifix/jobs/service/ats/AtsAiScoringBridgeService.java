package uz.verifix.jobs.service.ats;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.MlCandidateScore;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.MlCandidateScoreRepository;
import uz.verifix.jobs.integration.ats.AtsAiScoringRequest;
import uz.verifix.jobs.integration.ats.AtsTelegramClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

/**
 * Bridges AI candidate scoring between ATS Telegram bot and Jobs portal.
 *
 * Outbound: requests AI scoring from ATS for new applications.
 * Inbound: receives scoring results from ATS webhook and stores in MlCandidateScore.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AtsAiScoringBridgeService {

    private final Optional<AtsTelegramClient> atsClient;
    private final MlCandidateScoreRepository scoreRepository;
    private final ApplicationRepository applicationRepository;
    private final uz.verifix.jobs.domain.repository.CandidateRepository candidateRepository;
    private final uz.verifix.jobs.domain.repository.VacancyRepository vacancyRepository;

    /**
     * Request AI scoring from ATS for an application.
     */
    public void requestScoring(Application application, String companyCode) {
        if (atsClient.isEmpty()) return;

        Vacancy vacancy = application.getVacancy();
        Candidate candidate = application.getCandidate();

        AtsAiScoringRequest request = AtsAiScoringRequest.builder()
                .companyCode(companyCode)
                .vacancyId(vacancy.getId().toString())
                .candidateId(candidate.getId().toString())
                .vacancyTitle(vacancy.getTitle())
                .vacancyDescription(vacancy.getDescription())
                .vacancyRequirements(vacancy.getBenefits() != null ? Arrays.asList(vacancy.getBenefits()) : List.of())
                .salaryFrom(vacancy.getSalaryFrom())
                .salaryTo(vacancy.getSalaryTo())
                .candidateName((candidate.getFirstName() != null ? candidate.getFirstName() : "") + " " +
                        (candidate.getLastName() != null ? candidate.getLastName() : ""))
                .candidatePhone(candidate.getPhone())
                .candidateCity(candidate.getCity())
                .candidateSkills(candidate.getSkills() != null ? Arrays.asList(candidate.getSkills()) : List.of())
                .candidateEducation(candidate.getEducationLevel() != null ? candidate.getEducationLevel().name() : null)
                .build();

        atsClient.get().requestAiScoring(request);
        log.info("Requested AI scoring from ATS for application {}", application.getId());
    }

    /**
     * Inbound: receive AI scoring result from ATS webhook.
     * Stores the result in MlCandidateScore entity.
     */
    @Transactional
    public void receiveScore(UUID candidateId, UUID vacancyId, int score, List<String> pros, List<String> cons) {
        BigDecimal matchScore = BigDecimal.valueOf(score).divide(BigDecimal.valueOf(100), 4, BigDecimal.ROUND_HALF_UP);

        Map<String, Object> factors = new LinkedHashMap<>();
        factors.put("source", "ATS_AI");
        factors.put("score_raw", score);
        factors.put("pros", pros);
        factors.put("cons", cons);

        // Check if score already exists
        MlCandidateScore existing = scoreRepository
                .findByCandidateIdAndVacancyIdAndModelVersion(candidateId, vacancyId, "ats-ai-v1")
                .orElse(null);

        if (existing != null) {
            existing.setMatchScore(matchScore);
            existing.setFactorsJson(factors.toString());
            existing.setScoredAt(Instant.now());
            scoreRepository.save(existing);
            log.info("Updated AI score for candidate {} vacancy {}: {}%", candidateId, vacancyId, score);
        } else {
            MlCandidateScore mlScore = MlCandidateScore.builder()
                    .candidate(candidateRepository.findById(candidateId).orElse(null))
                    .vacancy(vacancyRepository.findById(vacancyId).orElse(null))
                    .matchScore(matchScore)
                    .factorsJson(factors.toString())
                    .modelVersion("ats-ai-v1")
                    .scoredAt(Instant.now())
                    .build();
            scoreRepository.save(mlScore);
            log.info("Saved AI score for candidate {} vacancy {}: {}%", candidateId, vacancyId, score);
        }
    }
}
