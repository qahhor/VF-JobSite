package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import uz.verifix.jobs.api.dto.request.AdminLoginRequest;
import uz.verifix.jobs.api.dto.response.AuthResponse;
import uz.verifix.jobs.api.dto.response.TotpSetupResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.admin.AdminAuthService;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        AdminAuthService.LoginResult result = adminAuthService.login(
                request.getEmail(), request.getPassword(), request.getTotpCode());

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(result.accessToken())
                .refreshToken(result.refreshToken())
                .role(result.role().name())
                .build());
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<TotpSetupResponse> setupTwoFactor(Authentication auth) {
        AdminAuthService.TwoFactorSetup setup = adminAuthService.setupTwoFactor(SecurityUtils.extractUserId(auth));
        return ResponseEntity.ok(TotpSetupResponse.builder()
                .secret(setup.secret())
                .otpAuthUri(setup.otpAuthUri())
                .build());
    }
}
