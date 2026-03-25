package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.common.dto.PageResponse;
import uz.verifix.jobs.domain.entity.AiAgentRun;
import uz.verifix.jobs.domain.entity.AiScreeningResult;
import uz.verifix.jobs.domain.repository.AiAgentRunRepository;
import uz.verifix.jobs.domain.repository.AiScreeningResultRepository;
import uz.verifix.jobs.service.ai.AiIntakeAgent;
import uz.verifix.jobs.service.ai.AiScreeningAgent;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AI Agent endpoints — screening, intake, sourcing.
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAgentController {

    private final AiScreeningAgent screeningAgent;
    private final AiIntakeAgent intakeAgent;
    private final AiScreeningResultRepository screeningResultRepo;
    private final AiAgentRunRepository agentRunRepo;

    @PostMapping("/screening/{applicationId}")
    public ResponseEntity<Map<String, String>> screenApplication(@PathVariable UUID applicationId) {
        if (!screeningAgent.isAvailable()) {
            return ResponseEntity.badRequest().body(Map.of("error", "AI service not configured"));
        }
        screeningAgent.screenApplication(applicationId);
        return ResponseEntity.accepted().body(Map.of("status", "screening_started"));
    }

    @PostMapping("/screening/batch")
    public ResponseEntity<Map<String, String>> batchScreen(@RequestBody Map<String, List<String>> body) {
        List<UUID> ids = body.getOrDefault("application_ids", List.of()).stream()
                .map(UUID::fromString).toList();
        screeningAgent.batchScreen(ids);
        return ResponseEntity.accepted().body(Map.of("status", "batch_screening_started", "count", String.valueOf(ids.size())));
    }

    @GetMapping("/screening/{applicationId}/result")
    public ResponseEntity<AiScreeningResult> getScreeningResult(@PathVariable UUID applicationId) {
        return screeningResultRepo.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/intake/generate")
    public ResponseEntity<?> generateVacancy(Authentication auth, @RequestBody Map<String, String> body) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        String description = body.get("description");
        String city = body.get("city");

        AiIntakeAgent.IntakeResult result = intakeAgent.generateVacancy(employerId, description, city);
        if (result == null) return ResponseEntity.badRequest().body(Map.of("error", "AI service not available"));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/runs")
    public ResponseEntity<PageResponse<AiAgentRun>> getRuns(
            Authentication auth, @PageableDefault(size = 20) Pageable pageable) {
        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(PageResponse.of(agentRunRepo.findByEmployerIdOrderByCreatedAtDesc(employerId, pageable)));
    }
}
