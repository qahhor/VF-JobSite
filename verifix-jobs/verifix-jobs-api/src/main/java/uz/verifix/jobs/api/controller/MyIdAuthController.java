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
@RequestMapping("/api/v1/auth/myid")
@RequiredArgsConstructor
public class MyIdAuthController {

    private final VerificationService verificationService;

    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> start(@Valid @RequestBody VerificationInitRequest request) {
        String authUrl = verificationService.initiateVerification(request.getEntityType(), request.getEntityId());
        return ResponseEntity.ok(Map.of("redirectUrl", authUrl));
    }

    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> callback(
            @RequestParam String state,
            @RequestParam String code) {
        boolean success = verificationService.completeVerification(state, code);
        return ResponseEntity.ok(Map.of("verified", success));
    }

    @PostMapping("/callback")
    public ResponseEntity<Map<String, Object>> callbackPost(
            @RequestParam String state,
            @RequestParam String code) {
        return callback(state, code);
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
