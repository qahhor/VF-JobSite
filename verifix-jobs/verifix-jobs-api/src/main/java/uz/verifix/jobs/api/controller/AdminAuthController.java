package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.LoginRequest;
import uz.verifix.jobs.api.dto.response.AuthResponse;
import uz.verifix.jobs.service.admin.AdminAuthService;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AdminAuthService.LoginResult result = adminAuthService.login(request.getEmail(), request.getPassword());

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(result.accessToken())
                .refreshToken(result.refreshToken())
                .role(result.role().name())
                .build());
    }
}
