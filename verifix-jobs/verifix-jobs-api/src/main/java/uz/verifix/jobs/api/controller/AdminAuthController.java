package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import uz.verifix.jobs.api.dto.request.AdminChangePasswordRequest;
import uz.verifix.jobs.api.dto.request.AdminLoginRequest;
import uz.verifix.jobs.api.dto.response.AdminProfileResponse;
import uz.verifix.jobs.api.dto.response.AuthResponse;
import uz.verifix.jobs.api.dto.response.TotpSetupResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.AdminUser;
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
                .userId(result.adminId())
                .role(result.role().name())
                .mustChangePassword(result.mustChangePassword())
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<AdminProfileResponse> me(Authentication auth) {
        AdminUser admin = adminAuthService.getById(SecurityUtils.extractAdminId(auth));
        return ResponseEntity.ok(toProfile(admin));
    }

    @PostMapping("/change-password")
    public ResponseEntity<AdminProfileResponse> changePassword(
            @Valid @RequestBody AdminChangePasswordRequest request,
            Authentication auth) {
        AdminUser admin = adminAuthService.changePassword(
                SecurityUtils.extractAdminId(auth),
                request.getCurrentPassword(),
                request.getNewPassword());
        return ResponseEntity.ok(toProfile(admin));
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<TotpSetupResponse> setupTwoFactor(Authentication auth) {
        AdminAuthService.TwoFactorSetup setup = adminAuthService.setupTwoFactor(SecurityUtils.extractAdminId(auth));
        return ResponseEntity.ok(TotpSetupResponse.builder()
                .secret(setup.secret())
                .otpAuthUri(setup.otpAuthUri())
                .build());
    }

    private AdminProfileResponse toProfile(AdminUser admin) {
        return AdminProfileResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .role(admin.getRole() != null ? admin.getRole().name() : null)
                .totpEnabled(admin.getTotpSecret() != null && !admin.getTotpSecret().isBlank())
                .mustChangePassword(admin.isMustChangePassword())
                .createdAt(admin.getCreatedAt())
                .lastLoginAt(admin.getLastLoginAt())
                .passwordChangedAt(admin.getPasswordChangedAt())
                .inviteSentAt(admin.getInviteSentAt())
                .build();
    }
}
