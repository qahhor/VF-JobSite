package uz.verifix.jobs.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.DuplicateResourceException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.common.exception.UnauthorizedException;
import uz.verifix.jobs.domain.entity.AdminUser;
import uz.verifix.jobs.domain.enums.AdminRole;
import uz.verifix.jobs.domain.repository.AdminUserRepository;
import uz.verifix.jobs.service.auth.JwtService;
import uz.verifix.jobs.service.auth.RefreshTokenService;
import uz.verifix.jobs.service.auth.TotpService;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final TotpService totpService;

    public LoginResult login(String email, String password, String totpCode) {
        AdminUser admin = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (admin.getTotpSecret() != null && !admin.getTotpSecret().isBlank()) {
            if (totpCode == null || totpCode.isBlank()) {
                throw new UnauthorizedException("TOTP code is required");
            }
            if (!totpService.verify(admin.getTotpSecret(), totpCode)) {
                throw new UnauthorizedException("Invalid TOTP code");
            }
        }

        String role = admin.getRole().name();
        String accessToken = jwtService.generateAccessToken(admin.getId(), email, role, null);
        String refreshToken = jwtService.generateRefreshToken(admin.getId(), role, null);
        refreshTokenService.store(admin.getId(), refreshToken);

        log.info("Admin logged in: {} (role: {})", email, admin.getRole());
        return new LoginResult(admin.getId(), admin.getRole(), accessToken, refreshToken);
    }

    public TwoFactorSetup setupTwoFactor(UUID adminId) {
        AdminUser admin = getById(adminId);
        String secret = totpService.generateSecret();
        admin.setTotpSecret(secret);
        adminUserRepository.save(admin);

        String otpAuthUri = totpService.buildOtpAuthUri("VerifixJobs", admin.getEmail(), secret);
        return new TwoFactorSetup(secret, otpAuthUri);
    }

    @Transactional
    public AdminUser createAdmin(String email, String password, AdminRole role) {
        if (adminUserRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Admin with email " + email + " already exists");
        }

        AdminUser admin = AdminUser.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .build();

        admin = adminUserRepository.save(admin);
        log.info("Admin created: {} (role: {})", email, role);
        return admin;
    }

    @Transactional(readOnly = true)
    public AdminUser getById(UUID adminId) {
        return adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("AdminUser", adminId.toString()));
    }

    public record TwoFactorSetup(String secret, String otpAuthUri) {}
    public record LoginResult(UUID adminId, AdminRole role, String accessToken, String refreshToken) {}
}
