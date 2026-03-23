package uz.verifix.jobs.service.ml;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.MlCandidateScore;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.MyIdStatus;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.MlCandidateScoreRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateMatchingService {

    private static final String MODEL_VERSION = "rules-v1";
    private final MlCandidateScoreRepository scoreRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public MlCandidateScore scoreCandidate(UUID candidateId, UUID vacancyId) {
        // Check if already scored
        Optional<MlCandidateScore> existing = scoreRepository
                .findByCandidateIdAndVacancyIdAndModelVersion(candidateId, vacancyId, MODEL_VERSION);
        if (existing.isPresent()) return existing.get();

        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (candidate == null || vacancy == null) return null;

        Map<String, Double> factors = calculateFactors(candidate, vacancy);
        double totalScore = factors.values().stream().mapToDouble(Double::doubleValue).sum();
        totalScore = Math.min(totalScore, 1.0);

        String factorsJson;
        try {
            factorsJson = objectMapper.writeValueAsString(factors);
        } catch (Exception e) {
            factorsJson = "{}";
        }

        MlCandidateScore score = MlCandidateScore.builder()
                .candidate(candidate)
                .vacancy(vacancy)
                .matchScore(BigDecimal.valueOf(totalScore).setScale(4, RoundingMode.HALF_UP))
                .factorsJson(factorsJson)
                .modelVersion(MODEL_VERSION)
                .scoredAt(Instant.now())
                .build();

        return scoreRepository.save(score);
    }

    @Transactional(readOnly = true)
    public List<MlCandidateScore> getTopCandidates(UUID vacancyId, int limit) {
        List<MlCandidateScore> all = scoreRepository.findByVacancyIdOrderByMatchScoreDesc(vacancyId);
        return all.stream().limit(limit).toList();
    }

    @Transactional(readOnly = true)
    public List<MlCandidateScore> getTopVacancies(UUID candidateId, int limit) {
        return scoreRepository.findByCandidateIdOrderByMatchScoreDesc(candidateId)
                .stream().limit(limit).toList();
    }

    @Async
    @Transactional
    public void batchScore(UUID vacancyId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null) return;

        // Get candidates in same city or with matching categories
        List<Candidate> candidates;
        if (vacancy.getCity() != null) {
            candidates = candidateRepository.findAll(
                    uz.verifix.jobs.domain.specification.CandidateSpecification.withFilters(
                            vacancy.getCity(), null, vacancy.getCategory(),
                            null, null, null, null, null),
                    org.springframework.data.domain.PageRequest.of(0, 200)
            ).getContent();
        } else {
            candidates = candidateRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 200)).getContent();
        }

        int scored = 0;
        for (Candidate candidate : candidates) {
            try {
                scoreCandidate(candidate.getId(), vacancyId);
                scored++;
            } catch (Exception e) {
                log.debug("Failed to score candidate {} for vacancy {}: {}", candidate.getId(), vacancyId, e.getMessage());
            }
        }
        log.info("Batch scoring complete: {} candidates scored for vacancy {}", scored, vacancyId);
    }

    private Map<String, Double> calculateFactors(Candidate candidate, Vacancy vacancy) {
        Map<String, Double> factors = new LinkedHashMap<>();

        // City match (0.2)
        if (candidate.getCity() != null && vacancy.getCity() != null
                && candidate.getCity().equalsIgnoreCase(vacancy.getCity())) {
            factors.put("city_match", 0.2);
        }

        // Category match (0.2)
        if (candidate.getPreferredCategories() != null && vacancy.getCategory() != null) {
            boolean categoryMatch = Arrays.stream(candidate.getPreferredCategories())
                    .anyMatch(c -> c.equalsIgnoreCase(vacancy.getCategory()));
            if (categoryMatch) factors.put("category_match", 0.2);
        }

        // Salary overlap (0.2)
        if (candidate.getPreferredSalary() != null && vacancy.getSalaryFrom() != null) {
            BigDecimal pref = candidate.getPreferredSalary();
            BigDecimal from = vacancy.getSalaryFrom();
            BigDecimal to = vacancy.getSalaryTo() != null ? vacancy.getSalaryTo() : from.multiply(BigDecimal.valueOf(1.5));
            if (pref.compareTo(from) >= 0 && pref.compareTo(to) <= 0) {
                factors.put("salary_match", 0.2);
            } else if (pref.compareTo(from) >= 0) {
                factors.put("salary_match", 0.1); // partial match
            }
        }

        // Skills overlap (0.2)
        if (candidate.getSkills() != null && vacancy.getBenefits() != null) {
            Set<String> candidateSkills = new HashSet<>(Arrays.asList(candidate.getSkills()));
            Set<String> vacancyKeywords = new HashSet<>(Arrays.asList(vacancy.getBenefits()));
            long overlap = candidateSkills.stream().filter(vacancyKeywords::contains).count();
            if (overlap > 0) {
                double skillScore = Math.min(overlap * 0.05, 0.2);
                factors.put("skills_overlap", skillScore);
            }
        }

        // Education fit (0.1)
        if (candidate.getEducationLevel() != null) {
            factors.put("education_bonus", 0.1);
        }

        // MyID verified (0.1)
        if (candidate.getMyidStatus() == MyIdStatus.VERIFIED) {
            factors.put("myid_verified", 0.1);
        }

        return factors;
    }
}
