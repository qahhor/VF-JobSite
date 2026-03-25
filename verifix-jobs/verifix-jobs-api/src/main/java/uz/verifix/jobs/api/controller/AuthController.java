package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.request.EmployerRegisterRequest;
import uz.verifix.jobs.api.dto.request.LoginRequest;
import uz.verifix.jobs.api.dto.request.RefreshTokenRequest;
import uz.verifix.jobs.api.dto.response.AuthResponse;
import uz.verifix.jobs.service.employer.EmployerAuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Deprecated(forRemoval = false)
public class AuthController {

    private final EmployerAuthService employerAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody EmployerRegisterRequest request) {
        var result = employerAuthService.register(
                request.getCompanyName(), request.getInn(), request.getEmail(),
                request.getPassword(), request.getPhone(), request.getCity(), request.getIndustry());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                AuthResponse.of(result.accessToken(), result.refreshToken(),
                        result.managerId(), result.employerId(), "EMPLOYER_ADMIN"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        var result = employerAuthService.login(request.getEmail(), request.getPassword());

        return ResponseEntity.ok(
                AuthResponse.of(result.accessToken(), result.refreshToken(),
                        result.managerId(), result.employerId(), result.role()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        var result = employerAuthService.refreshToken(request.getRefreshToken());

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(result.accessToken())
                .refreshToken(result.refreshToken())
                .tokenType("Bearer")
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        employerAuthService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }
}
