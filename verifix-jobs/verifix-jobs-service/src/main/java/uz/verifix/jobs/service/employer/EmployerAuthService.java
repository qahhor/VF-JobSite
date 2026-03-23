package uz.verifix.jobs.service.employer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.DuplicateResourceException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.common.exception.UnauthorizedException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.service.auth.JwtService;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployerAuthService {

    private final EmployerRepository employerRepository;
    private final ManagerRepository managerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public RegistrationResult register(String companyName, String inn, String email,
                                        String password, String phone, String city, String industry) {
        if (employerRepository.existsByInn(inn)) {
            throw new DuplicateResourceException("Employer with INN " + inn + " already exists");
        }
        if (managerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email " + email + " is already registered");
        }

        Employer employer = Employer.builder()
                .name(companyName)
                .inn(inn)
                .city(city)
                .industry(industry)
                .status(EmployerStatus.PENDING)
                .build();
        employer = employerRepository.save(employer);

        Manager manager = Manager.builder()
                .employer(employer)
                .email(email)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(password))
                .role(ManagerRole.ADMIN)
                .build();
        manager = managerRepository.save(manager);

        log.info("Employer registered: {} (INN: {}), admin: {}", companyName, inn, email);

        String accessToken = jwtService.generateAccessToken(manager.getId(), email, ManagerRole.ADMIN.name());
        String refreshToken = jwtService.generateRefreshToken(manager.getId());

        return new RegistrationResult(employer.getId(), manager.getId(), accessToken, refreshToken);
    }

    public LoginResult login(String email, String password) {
        Manager manager = managerRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(password, manager.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(manager.getId(), email, manager.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(manager.getId());

        log.info("Manager logged in: {}", email);
        return new LoginResult(manager.getId(), manager.getEmployer().getId(), manager.getRole().name(),
                accessToken, refreshToken);
    }

    public TokenPair refreshToken(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String userId = jwtService.getSubject(refreshToken);
        Manager manager = managerRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Manager", userId));

        String newAccessToken = jwtService.generateAccessToken(manager.getId(), manager.getEmail(), manager.getRole().name());
        String newRefreshToken = jwtService.generateRefreshToken(manager.getId());

        return new TokenPair(newAccessToken, newRefreshToken);
    }

    public record RegistrationResult(UUID employerId, UUID managerId, String accessToken, String refreshToken) {}
    public record LoginResult(UUID managerId, UUID employerId, String role, String accessToken, String refreshToken) {}
    public record TokenPair(String accessToken, String refreshToken) {}
}
