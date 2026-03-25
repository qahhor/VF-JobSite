package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.VerificationInitRequest;
import uz.verifix.jobs.api.dto.response.VerificationStatusResponse;
import uz.verifix.jobs.domain.entity.VerificationLog;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.service.verification.VerificationService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/verification")
@RequiredArgsConstructor
@Deprecated(forRemoval = false)
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, String>> initiate(@Valid @RequestBody VerificationInitRequest request) {
        String authUrl = verificationService.initiateVerification(request.getEntityType(), request.getEntityId());
        return ResponseEntity.ok(Map.of("authUrl", authUrl));
    }

    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> callback(
            @RequestParam String state,
            @RequestParam String code) {
        boolean success = verificationService.completeVerification(state, code);
        return ResponseEntity.ok(Map.of("verified", success));
    }

    @GetMapping("/status")
    public ResponseEntity<VerificationStatusResponse> getStatus(
            @RequestParam UserType entityType,
            @RequestParam UUID entityId) {

        VerificationLog log = verificationService.getLatestVerification(entityType, entityId);
        if (log == null) {
            return ResponseEntity.ok(VerificationStatusResponse.builder()
                    .status("NONE")
                    .build());
        }

        return ResponseEntity.ok(VerificationStatusResponse.builder()
                .status(log.getStatus().name())
                .method(log.getMethod().name())
                .verifiedAt(log.getVerifiedAt())
                .createdAt(log.getCreatedAt())
                .build());
    }
}
