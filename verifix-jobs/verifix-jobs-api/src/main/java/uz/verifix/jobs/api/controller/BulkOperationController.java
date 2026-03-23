package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.BulkInviteRequest;
import uz.verifix.jobs.api.dto.request.BulkStatusRequest;
import uz.verifix.jobs.api.dto.response.BulkOperationResponse;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.service.application.BulkOperationService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bulk")
@RequiredArgsConstructor
public class BulkOperationController {

    private final BulkOperationService bulkService;

    @PostMapping("/status")
    public ResponseEntity<BulkOperationResponse> bulkStatus(@Valid @RequestBody BulkStatusRequest request) {
        var result = bulkService.bulkUpdateStatus(
                request.getEmployerId(), request.getApplicationIds(), request.getNewStatus());
        return ResponseEntity.ok(toResponse(result));
    }

    @PostMapping("/invite")
    public ResponseEntity<BulkOperationResponse> bulkInvite(@Valid @RequestBody BulkInviteRequest request) {
        var result = bulkService.bulkInvite(
                request.getEmployerId(), request.getCandidateIds(), request.getVacancyId(), request.getMessage());
        return ResponseEntity.ok(toResponse(result));
    }

    @PostMapping("/reject")
    public ResponseEntity<BulkOperationResponse> bulkReject(
            @RequestParam UUID employerId,
            @RequestBody Map<String, Object> body) {
        List<String> ids = ((List<?>) body.get("applicationIds")).stream().map(Object::toString).toList();
        List<UUID> appIds = ids.stream().map(UUID::fromString).toList();
        String reason = (String) body.getOrDefault("reason", "");
        var result = bulkService.bulkReject(employerId, appIds, reason);
        return ResponseEntity.ok(toResponse(result));
    }

    private BulkOperationResponse toResponse(BulkOperationService.BulkResult r) {
        return BulkOperationResponse.builder()
                .successCount(r.successCount())
                .failedCount(r.failedCount())
                .errors(r.errors())
                .build();
    }
}
