package uz.verifix.jobs.service.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.*;
import uz.verifix.jobs.domain.repository.*;
import uz.verifix.jobs.integration.ai.ClaudeApiClient;

import java.util.*;

/**
 * AI Sourcing Agent — builds candidate shortlists from the candidate pool.
 * Justifies ranking with pros/cons. Supports employer approval.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiSourcingAgent {

    private final Optional<ClaudeApiClient> claudeClient;
    private final AiAgentRunRepository agentRunRepo;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final MlCandidateScoreRepository scoreRepo;

    public record SourcingResult(List<SourcingCandidate> candidates, String summary) {}
    public record SourcingCandidate(UUID candidateId, String name, String city, double matchScore, String justification) {}

    @Async
    public SourcingResult buildShortlist(UUID vacancyId, UUID employerId, int maxCandidates) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null) return new SourcingResult(List.of(), "Vakansiya topilmadi");

        // Get top scored candidates for this vacancy
        var scores = scoreRepo.findByVacancyIdOrderByMatchScoreDesc(vacancyId);

        List<SourcingCandidate> shortlist = new ArrayList<>();
        for (var score : scores) {
            if (shortlist.size() >= maxCandidates) break;
            candidateRepository.findById(score.getCandidate().getId()).ifPresent(c -> {
                String name = (c.getFirstName() != null ? c.getFirstName() : "") + " " +
                        (c.getLastName() != null ? c.getLastName() : "");
                String justification = buildJustification(score);
                shortlist.add(new SourcingCandidate(c.getId(), name.trim(),
                        c.getCity(), score.getMatchScore().doubleValue(), justification));
            });
        }

        // Log agent run
        AiAgentRun run = AiAgentRun.builder()
                .employerId(employerId).agentType("SOURCING")
                .inputData(Map.of("vacancyId", vacancyId.toString(), "maxCandidates", maxCandidates))
                .build();
        run.complete(Map.of("candidateCount", shortlist.size()), 0, 0);
        agentRunRepo.save(run);

        String summary = shortlist.size() + " ta nomzod topildi. " +
                (shortlist.isEmpty() ? "Qo'shimcha nomzodlarni jalb qilish kerak." :
                        "Eng yaxshi nomzod: " + shortlist.get(0).name() + " (" +
                                Math.round(shortlist.get(0).matchScore() * 100) + "% mos).");

        log.info("Sourcing completed for vacancy {}: {} candidates", vacancyId, shortlist.size());
        return new SourcingResult(shortlist, summary);
    }

    @SuppressWarnings("unchecked")
    private String buildJustification(MlCandidateScore score) {
        String factorsStr = score.getFactorsJson(); Map<String, Object> factors = null; try { factors = factorsStr != null ? new com.fasterxml.jackson.databind.ObjectMapper().readValue(factorsStr, Map.class) : null; } catch (Exception ignored) {}
        if (factors == null) return "ML scoring asosida tanlangan";

        List<String> reasons = new ArrayList<>();
        if (factors.containsKey("city_match") && ((Number) factors.get("city_match")).doubleValue() > 0)
            reasons.add("shahar mos");
        if (factors.containsKey("category_match") && ((Number) factors.get("category_match")).doubleValue() > 0)
            reasons.add("kasb mos");
        if (factors.containsKey("salary_match") && ((Number) factors.get("salary_match")).doubleValue() > 0)
            reasons.add("maosh kutilmasi mos");
        if (factors.containsKey("myid_verified") && ((Number) factors.get("myid_verified")).doubleValue() > 0)
            reasons.add("MyID tasdiqlangan");

        return reasons.isEmpty() ? "Umumiy moslik" : String.join(", ", reasons);
    }
}
