package uz.verifix.jobs.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.response.MatchScoreResponse;
import uz.verifix.jobs.domain.entity.MlCandidateScore;
import uz.verifix.jobs.service.ml.CandidateMatchingService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final CandidateMatchingService matchingService;
    private final ObjectMapper objectMapper;

    @GetMapping("/candidates")
    public ResponseEntity<List<MatchScoreResponse>> getTopCandidates(
            @RequestParam UUID vacancyId,
            @RequestParam(defaultValue = "20") int limit) {
        List<MlCandidateScore> scores = matchingService.getTopCandidates(vacancyId, limit);
        return ResponseEntity.ok(scores.stream().map(this::toResponse).toList());
    }

    @GetMapping("/vacancies")
    public ResponseEntity<List<MatchScoreResponse>> getTopVacancies(
            @RequestParam UUID candidateId,
            @RequestParam(defaultValue = "10") int limit) {
        List<MlCandidateScore> scores = matchingService.getTopVacancies(candidateId, limit);
        return ResponseEntity.ok(scores.stream().map(this::toResponse).toList());
    }

    @PostMapping("/score")
    public ResponseEntity<Map<String, String>> triggerScoring(@RequestParam UUID vacancyId) {
        matchingService.batchScore(vacancyId);
        return ResponseEntity.ok(Map.of("status", "scoring_triggered", "vacancyId", vacancyId.toString()));
    }

    private MatchScoreResponse toResponse(MlCandidateScore s) {
        Map<String, Object> factors;
        try {
            factors = s.getFactorsJson() != null ? objectMapper.readValue(s.getFactorsJson(), Map.class) : Map.of();
        } catch (Exception e) {
            factors = Map.of();
        }
        return MatchScoreResponse.builder()
                .candidateId(s.getCandidate().getId())
                .vacancyId(s.getVacancy().getId())
                .matchScore(s.getMatchScore())
                .factors(factors)
                .candidateName((s.getCandidate().getFirstName() != null ? s.getCandidate().getFirstName() : "") +
                        " " + (s.getCandidate().getLastName() != null ? s.getCandidate().getLastName() : ""))
                .candidateCity(s.getCandidate().getCity())
                .vacancyTitle(s.getVacancy().getTitle())
                .scoredAt(s.getScoredAt())
                .build();
    }
}
