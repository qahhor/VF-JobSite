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

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResult login(String email, String password) {
        AdminUser admin = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(admin.getId(), email, "ADMIN_" + admin.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(admin.getId());

        log.info("Admin logged in: {} (role: {})", email, admin.getRole());
        return new LoginResult(admin.getId(), admin.getRole(), accessToken, refreshToken);
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

    public record LoginResult(UUID adminId, AdminRole role, String accessToken, String refreshToken) {}
}
