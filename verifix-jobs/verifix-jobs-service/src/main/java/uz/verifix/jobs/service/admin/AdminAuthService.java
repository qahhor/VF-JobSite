package uz.verifix.jobs.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.DuplicateResourceException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.common.exception.UnauthorizedException;
import uz.verifix.jobs.domain.entity.AdminUser;
import uz.verifix.jobs.domain.enums.AdminRole;
import uz.verifix.jobs.domain.repository.AdminUserRepository;
import uz.verifix.jobs.service.auth.JwtService;
import uz.verifix.jobs.service.auth.RefreshTokenService;
import uz.verifix.jobs.service.auth.TotpService;
import uz.verifix.jobs.service.notification.EmailNotificationService;

import java.time.Instant;
import java.util.Locale;
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
    private final ObjectProvider<EmailNotificationService> emailNotificationServiceProvider;

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    public LoginResult login(String email, String password, String totpCode) {
        String normalizedEmail = normalizeEmail(email);
        AdminUser admin = adminUserRepository.findByEmailIgnoreCase(normalizedEmail)
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

        admin.setLastLoginAt(Instant.now());
        adminUserRepository.save(admin);

        String role = admin.getRole().name();
        String accessToken = jwtService.generateAccessToken(admin.getId(), admin.getEmail(), role, null);
        String refreshToken = jwtService.generateRefreshToken(admin.getId(), role, null);
        refreshTokenService.store(admin.getId(), refreshToken);

        log.info("Admin logged in: {} (role: {})", admin.getEmail(), admin.getRole());
        return new LoginResult(admin.getId(), admin.getRole(), accessToken, refreshToken, admin.isMustChangePassword());
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
        validatePasswordStrength(password, null);
        AdminUser admin = createAdminRecord(email, password, role, true, null);
        log.info("Admin created: {} (role: {})", admin.getEmail(), role);
        return admin;
    }

    @Transactional
    public InviteResult inviteAdmin(String email, AdminRole role, UUID invitedBy) {
        String temporaryPassword = generateStrongPassword();
        AdminUser admin = createAdminRecord(email, temporaryPassword, role, true, invitedBy);

        boolean emailSent = false;
        EmailNotificationService emailNotificationService = emailNotificationServiceProvider.getIfAvailable();
        if (emailNotificationService != null) {
            emailSent = emailNotificationService.sendAdminInvite(
                    admin.getEmail(),
                    admin.getRole(),
                    temporaryPassword,
                    buildAdminLoginUrl());
            if (emailSent) {
                admin.setInviteSentAt(Instant.now());
                admin = adminUserRepository.save(admin);
            }
        }

        log.info("Admin invited: {} (role: {}, emailSent: {})", admin.getEmail(), admin.getRole(), emailSent);
        return new InviteResult(admin, temporaryPassword, emailSent);
    }

    @Transactional(readOnly = true)
    public AdminUser getById(UUID adminId) {
        return adminUserRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("AdminUser", adminId.toString()));
    }

    @Transactional
    public AdminUser changePassword(UUID adminId, String currentPassword, String newPassword) {
        AdminUser admin = getById(adminId);
        if (!passwordEncoder.matches(currentPassword, admin.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        validatePasswordStrength(newPassword, admin);
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        admin.setMustChangePassword(false);
        admin.setPasswordChangedAt(Instant.now());
        refreshTokenService.revoke(adminId);
        return adminUserRepository.save(admin);
    }

    @Transactional
    public AdminUser resetPassword(UUID targetAdminId, String newPassword) {
        AdminUser admin = getById(targetAdminId);
        validatePasswordStrength(newPassword, admin);
        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        admin.setMustChangePassword(true);
        admin.setPasswordChangedAt(Instant.now());
        refreshTokenService.revoke(targetAdminId);
        return adminUserRepository.save(admin);
    }

    @Transactional
    public AdminUser updateRole(UUID targetAdminId, AdminRole role) {
        AdminUser admin = getById(targetAdminId);
        admin.setRole(role);
        return adminUserRepository.save(admin);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private AdminUser createAdminRecord(String email, String password, AdminRole role, boolean mustChangePassword, UUID invitedBy) {
        String normalizedEmail = normalizeEmail(email);
        if (adminUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("Admin with email " + email + " already exists");
        }

        AdminUser admin = AdminUser.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .mustChangePassword(mustChangePassword)
                .invitedBy(invitedBy)
                .build();

        return adminUserRepository.save(admin);
    }

    private void validatePasswordStrength(String password, AdminUser admin) {
        if (password == null || password.length() < 8) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters");
        }
        if (!password.chars().anyMatch(Character::isUpperCase)
                || !password.chars().anyMatch(Character::isLowerCase)
                || !password.chars().anyMatch(Character::isDigit)) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST,
                    "Password must include upper and lower case letters plus a digit");
        }
        if (admin != null && passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST,
                    "New password must be different from the current password");
        }
    }

    private String generateStrongPassword() {
        final String lower = "abcdefghijkmnopqrstuvwxyz";
        final String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        final String digits = "23456789";
        final String symbols = "!@#$%&*?";
        final String all = lower + upper + digits + symbols;
        char[] chars = new char[14];

        chars[0] = lower.charAt((int) (Math.random() * lower.length()));
        chars[1] = upper.charAt((int) (Math.random() * upper.length()));
        chars[2] = digits.charAt((int) (Math.random() * digits.length()));
        chars[3] = symbols.charAt((int) (Math.random() * symbols.length()));
        for (int i = 4; i < chars.length; i++) {
            chars[i] = all.charAt((int) (Math.random() * all.length()));
        }
        for (int i = chars.length - 1; i > 0; i--) {
            int j = (int) (Math.random() * (i + 1));
            char tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
        }
        return new String(chars);
    }

    private String buildAdminLoginUrl() {
        return appBaseUrl.endsWith("/") ? appBaseUrl + "admin/login" : appBaseUrl + "/admin/login";
    }

    public record TwoFactorSetup(String secret, String otpAuthUri) {}
    public record LoginResult(UUID adminId, AdminRole role, String accessToken, String refreshToken, boolean mustChangePassword) {}
    public record InviteResult(AdminUser admin, String temporaryPassword, boolean emailSent) {}
}
