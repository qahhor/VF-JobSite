package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.service.ats.AtsAiScoringBridgeService;
import uz.verifix.jobs.service.ats.AtsApplicationBridgeService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Receives webhooks from ATS Telegram bot.
 * Handles: application creation from Telegram, AI scoring results, survey data.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks/ats")
@RequiredArgsConstructor
public class AtsWebhookController {

    private final AtsApplicationBridgeService applicationBridge;
    private final AtsAiScoringBridgeService aiScoringBridge;

    /**
     * Receive application from ATS Telegram bot.
     * Called when a candidate applies via Telegram Mini App.
     */
    @PostMapping("/application")
    public ResponseEntity<Map<String, Object>> receiveApplication(@RequestBody Map<String, Object> body) {
        try {
            UUID vacancyId = UUID.fromString((String) body.get("vacancy_id"));
            Long telegramId = ((Number) body.get("telegram_id")).longValue();
            String candidateName = (String) body.get("candidate_name");
            String phone = (String) body.get("phone");
            @SuppressWarnings("unchecked")
            Map<String, Object> surveyData = (Map<String, Object>) body.get("survey_data");

            Application app = applicationBridge.createFromTelegram(vacancyId, telegramId, candidateName, phone, surveyData);

            if (app != null) {
                return ResponseEntity.ok(Map.of(
                        "status", "created",
                        "application_id", app.getId().toString(),
                        "candidate_id", app.getCandidate().getId().toString()
                ));
            }
            return ResponseEntity.badRequest().body(Map.of("status", "failed", "reason", "vacancy_not_found"));
        } catch (Exception e) {
            log.error("ATS webhook application error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    /**
     * Receive AI scoring result from ATS.
     * Called after ATS Telegram bot completes AI candidate evaluation.
     */
    @PostMapping("/ai-score")
    public ResponseEntity<Map<String, String>> receiveAiScore(@RequestBody Map<String, Object> body) {
        try {
            UUID candidateId = UUID.fromString((String) body.get("candidate_id"));
            UUID vacancyId = UUID.fromString((String) body.get("vacancy_id"));
            int score = ((Number) body.get("score")).intValue();
            @SuppressWarnings("unchecked")
            List<String> pros = (List<String>) body.getOrDefault("pros", List.of());
            @SuppressWarnings("unchecked")
            List<String> cons = (List<String>) body.getOrDefault("cons", List.of());

            aiScoringBridge.receiveScore(candidateId, vacancyId, score, pros, cons);

            return ResponseEntity.ok(Map.of("status", "saved"));
        } catch (Exception e) {
            log.error("ATS webhook AI score error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    /**
     * Health check for ATS webhook connectivity.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "verifix-jobs-ats-webhook"));
    }
}
