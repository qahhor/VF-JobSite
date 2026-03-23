package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.domain.entity.FraudAlert;
import uz.verifix.jobs.service.ml.FraudDetectionService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/fraud")
@RequiredArgsConstructor
public class FraudController {

    private final FraudDetectionService fraudService;

    @GetMapping("/alerts")
    public ResponseEntity<Page<FraudAlert>> getAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(fraudService.getUnreviewedAlerts(PageRequest.of(page, size)));
    }

    @PatchMapping("/alerts/{id}/review")
    public ResponseEntity<Map<String, String>> reviewAlert(
            @PathVariable UUID id,
            @RequestParam UUID reviewedBy) {
        fraudService.reviewAlert(id, reviewedBy);
        return ResponseEntity.ok(Map.of("status", "reviewed"));
    }
}
