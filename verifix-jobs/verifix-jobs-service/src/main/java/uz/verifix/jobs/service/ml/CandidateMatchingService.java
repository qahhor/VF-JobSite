package uz.verifix.jobs.service.ml;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
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
public class CandidateMatchingService {

    private final MlCandidateScoreRepository scoreRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final ObjectMapper objectMapper;
    private final String modelVersion;
    private final int batchSize;
    private final double weightCity;
    private final double weightCategory;
    private final double weightSalary;
    private final double weightSalaryPartial;
    private final double weightSkillsFactor;
    private final double weightSkillsMax;
    private final double weightEducation;
    private final double weightMyid;

    public CandidateMatchingService(
            MlCandidateScoreRepository scoreRepository,
            CandidateRepository candidateRepository,
            VacancyRepository vacancyRepository,
            ObjectMapper objectMapper,
            @Value("${app.matching.model-version:rules-v1}") String modelVersion,
            @Value("${app.matching.batch-size:200}") int batchSize,
            @Value("${app.matching.weight-city:0.2}") double weightCity,
            @Value("${app.matching.weight-category:0.2}") double weightCategory,
            @Value("${app.matching.weight-salary:0.2}") double weightSalary,
            @Value("${app.matching.weight-salary-partial:0.1}") double weightSalaryPartial,
            @Value("${app.matching.weight-skills-factor:0.05}") double weightSkillsFactor,
            @Value("${app.matching.weight-skills-max:0.2}") double weightSkillsMax,
            @Value("${app.matching.weight-education:0.1}") double weightEducation,
            @Value("${app.matching.weight-myid:0.1}") double weightMyid) {
        this.scoreRepository = scoreRepository;
        this.candidateRepository = candidateRepository;
        this.vacancyRepository = vacancyRepository;
        this.objectMapper = objectMapper;
        this.modelVersion = modelVersion;
        this.batchSize = batchSize;
        this.weightCity = weightCity;
        this.weightCategory = weightCategory;
        this.weightSalary = weightSalary;
        this.weightSalaryPartial = weightSalaryPartial;
        this.weightSkillsFactor = weightSkillsFactor;
        this.weightSkillsMax = weightSkillsMax;
        this.weightEducation = weightEducation;
        this.weightMyid = weightMyid;
    }

    @Transactional
    public MlCandidateScore scoreCandidate(UUID candidateId, UUID vacancyId) {
        // Check if already scored
        Optional<MlCandidateScore> existing = scoreRepository
                .findByCandidateIdAndVacancyIdAndModelVersion(candidateId, vacancyId, modelVersion);
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
                .modelVersion(modelVersion)
                .scoredAt(Instant.now())
                .build();

        return scoreRepository.save(score);
    }

    @Transactional(readOnly = true)
    public List<MlCandidateScore> getTopCandidates(UUID vacancyId, int limit) {
        ensureVacancyExists(vacancyId);
        List<MlCandidateScore> all = scoreRepository.findByVacancyIdOrderByMatchScoreDesc(vacancyId);
        return all.stream().limit(limit).toList();
    }

    @Transactional(readOnly = true)
    public List<MlCandidateScore> getTopCandidatesForEmployer(UUID vacancyId, UUID employerId, int limit) {
        Vacancy vacancy = ensureVacancyExists(vacancyId);
        if (!vacancy.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("Vacancy does not belong to this employer");
        }
        return getTopCandidates(vacancyId, limit);
    }

    @Transactional(readOnly = true)
    public List<MlCandidateScore> getTopVacancies(UUID candidateId, int limit) {
        return scoreRepository.findByCandidateIdOrderByMatchScoreDesc(candidateId)
                .stream().limit(limit).toList();
    }

    @Async
    @Transactional
    public void batchScore(UUID vacancyId) {
        Vacancy vacancy = ensureVacancyExists(vacancyId);

        // Get candidates in same city or with matching categories
        List<Candidate> candidates;
        if (vacancy.getCity() != null) {
            candidates = candidateRepository.findAll(
                    uz.verifix.jobs.domain.specification.CandidateSpecification.withFilters(
                            vacancy.getCity(), null, vacancy.getCategory(),
                            null, null, null, null, null),
                    org.springframework.data.domain.PageRequest.of(0, batchSize)
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

    @Transactional
    public void batchScoreForEmployer(UUID vacancyId, UUID employerId) {
        Vacancy vacancy = ensureVacancyExists(vacancyId);
        if (!vacancy.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("Vacancy does not belong to this employer");
        }
        batchScore(vacancyId);
    }

    private Vacancy ensureVacancyExists(UUID vacancyId) {
        return vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy", vacancyId.toString()));
    }

    private Map<String, Double> calculateFactors(Candidate candidate, Vacancy vacancy) {
        Map<String, Double> factors = new LinkedHashMap<>();

        // City match
        if (candidate.getCity() != null && vacancy.getCity() != null
                && candidate.getCity().equalsIgnoreCase(vacancy.getCity())) {
            factors.put("city_match", weightCity);
        }

        // Category match
        if (candidate.getPreferredCategories() != null && vacancy.getCategory() != null) {
            boolean categoryMatch = Arrays.stream(candidate.getPreferredCategories())
                    .anyMatch(c -> c.equalsIgnoreCase(vacancy.getCategory()));
            if (categoryMatch) factors.put("category_match", weightCategory);
        }

        // Salary overlap
        if (candidate.getPreferredSalary() != null && vacancy.getSalaryFrom() != null) {
            BigDecimal pref = candidate.getPreferredSalary();
            BigDecimal from = vacancy.getSalaryFrom();
            BigDecimal to = vacancy.getSalaryTo() != null ? vacancy.getSalaryTo() : from.multiply(BigDecimal.valueOf(1.5));
            if (pref.compareTo(from) >= 0 && pref.compareTo(to) <= 0) {
                factors.put("salary_match", weightSalary);
            } else if (pref.compareTo(from) >= 0) {
                factors.put("salary_match", weightSalaryPartial);
            }
        }

        // Skills overlap
        if (candidate.getSkills() != null && vacancy.getBenefits() != null) {
            Set<String> candidateSkills = new HashSet<>(Arrays.asList(candidate.getSkills()));
            Set<String> vacancyKeywords = new HashSet<>(Arrays.asList(vacancy.getBenefits()));
            long overlap = candidateSkills.stream().filter(vacancyKeywords::contains).count();
            if (overlap > 0) {
                double skillScore = Math.min(overlap * weightSkillsFactor, weightSkillsMax);
                factors.put("skills_overlap", skillScore);
            }
        }

        // Education fit
        if (candidate.getEducationLevel() != null) {
            factors.put("education_bonus", weightEducation);
        }

        // MyID verified
        if (candidate.getMyidStatus() == MyIdStatus.VERIFIED) {
            factors.put("myid_verified", weightMyid);
        }

        return factors;
    }
}
