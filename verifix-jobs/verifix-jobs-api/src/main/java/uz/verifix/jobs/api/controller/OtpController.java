package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.request.OtpRequest;
import uz.verifix.jobs.api.dto.request.OtpVerifyRequest;
import uz.verifix.jobs.api.dto.response.CandidateAuthResponse;
import uz.verifix.jobs.service.candidate.CandidateAuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/otp")
@RequiredArgsConstructor
public class OtpController {

    private final CandidateAuthService candidateAuthService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody OtpRequest request) {
        candidateAuthService.sendOtp(request.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify")
    public ResponseEntity<CandidateAuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        var result = candidateAuthService.verifyOtp(request.getPhone(), request.getCode());

        return ResponseEntity.ok(CandidateAuthResponse.builder()
                .accessToken(result.accessToken())
                .refreshToken(result.refreshToken())
                .tokenType("Bearer")
                .candidateId(result.candidateId())
                .newUser(result.newUser())
                .build());
    }
}
