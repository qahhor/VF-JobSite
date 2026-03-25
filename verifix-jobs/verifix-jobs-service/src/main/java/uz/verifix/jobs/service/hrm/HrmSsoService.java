package uz.verifix.jobs.service.hrm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.*;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.repository.*;
import uz.verifix.jobs.integration.verifix.*;
import uz.verifix.jobs.service.auth.JwtService;

import java.time.Instant;
import java.util.UUID;

/**
 * SSO service: allows HRM users to log in to Jobs portal via Biruni OAuth2.
 * Authorization code flow: redirect to Biruni → callback → exchange code → create/link user.
 */
@Slf4j
@Service
public class HrmSsoService {

    private final VerifixHrmClient hrmClient;
    private final HrmSsoMappingRepository ssoMappingRepository;
    private final EmployerRepository employerRepository;
    private final ManagerRepository managerRepository;
    private final JwtService jwtService;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String hrmBaseUrl;

    public HrmSsoService(
            VerifixHrmClient hrmClient,
            HrmSsoMappingRepository ssoMappingRepository,
            EmployerRepository employerRepository,
            ManagerRepository managerRepository,
            JwtService jwtService,
            @Value("${app.verifix.hrm.sso.client-id:}") String clientId,
            @Value("${app.verifix.hrm.sso.client-secret:}") String clientSecret,
            @Value("${app.verifix.hrm.sso.redirect-uri:}") String redirectUri,
            @Value("${app.verifix.hrm.base-url:https://hrm.verifix.uz/api}") String hrmBaseUrl
    ) {
        this.hrmClient = hrmClient;
        this.ssoMappingRepository = ssoMappingRepository;
        this.employerRepository = employerRepository;
        this.managerRepository = managerRepository;
        this.jwtService = jwtService;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.hrmBaseUrl = hrmBaseUrl;
    }

    public record SsoLoginResult(String accessToken, String refreshToken, UUID employerId, UUID managerId, String companyName) {}

    /**
     * Returns the Biruni OAuth2 authorization URL for SSO redirect.
     */
    public String getAuthorizationUrl(String state) {
        return hrmBaseUrl.replace("/api", "") +
                "/security/oauth/code?response_type=code&client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&state=" + state;
    }

    /**
     * Handles the OAuth2 callback: exchanges auth code for tokens,
     * retrieves user info, creates or links the employer/manager.
     */
    @Transactional
    public SsoLoginResult handleCallback(String authCode) {
        // Exchange auth code for HRM tokens
        HrmTokenResponse tokenResponse = hrmClient.exchangeAuthCode(authCode, clientId, clientSecret, redirectUri);
        if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
            throw new RuntimeException("Failed to exchange auth code with HRM");
        }

        // Get user info from HRM
        HrmUserInfo userInfo = hrmClient.getUserInfo(tokenResponse.getAccessToken());
        if (userInfo == null) {
            throw new RuntimeException("Failed to get user info from HRM");
        }

        // Find or create SSO mapping
        HrmSsoMapping ssoMapping = ssoMappingRepository
                .findByHrmCompanyIdAndHrmUserId(userInfo.getCompanyId(), userInfo.getUserId())
                .orElse(null);

        Employer employer;
        Manager manager;

        if (ssoMapping != null && ssoMapping.getJobsEmployerId() != null) {
            // Existing mapping — update last login
            employer = employerRepository.findById(ssoMapping.getJobsEmployerId()).orElse(null);
            manager = ssoMapping.getJobsManagerId() != null
                    ? managerRepository.findById(ssoMapping.getJobsManagerId()).orElse(null)
                    : null;

            if (employer == null) {
                // Employer was deleted — recreate
                employer = createEmployerFromHrm(userInfo);
                manager = createManagerFromHrm(employer, userInfo);
                ssoMapping.setJobsEmployerId(employer.getId());
                ssoMapping.setJobsManagerId(manager.getId());
            }

            ssoMapping.setLastLoginAt(Instant.now());
            ssoMappingRepository.save(ssoMapping);
        } else {
            // New SSO user — find employer by company name or create new
            employer = employerRepository.findByHrmCompanyId(userInfo.getCompanyId().toString())
                    .orElseGet(() -> createEmployerFromHrm(userInfo));

            final Employer emp = employer;
            manager = managerRepository.findByEmail(userInfo.getEmail())
                    .orElseGet(() -> createManagerFromHrm(emp, userInfo));

            HrmSsoMapping newMapping = HrmSsoMapping.builder()
                    .hrmCompanyId(userInfo.getCompanyId())
                    .hrmUserId(userInfo.getUserId())
                    .jobsEmployerId(employer.getId())
                    .jobsManagerId(manager.getId())
                    .hrmUsername(userInfo.getUsername())
                    .hrmFullName(userInfo.getFullName())
                    .lastLoginAt(Instant.now())
                    .build();
            ssoMappingRepository.save(newMapping);
        }

        // Generate Jobs JWT tokens
        String accessToken = jwtService.generateAccessToken(
                manager.getId(), manager.getEmail(), "EMPLOYER", employer.getId());
        String refreshToken = jwtService.generateRefreshToken(
                manager.getId(), "EMPLOYER", employer.getId());

        log.info("SSO login successful: HRM user {}/{} → Jobs employer {}",
                userInfo.getCompanyId(), userInfo.getUserId(), employer.getId());

        return new SsoLoginResult(accessToken, refreshToken, employer.getId(), manager.getId(),
                userInfo.getCompanyName());
    }

    private Employer createEmployerFromHrm(HrmUserInfo userInfo) {
        Employer employer = Employer.builder()
                .name(userInfo.getCompanyName() != null ? userInfo.getCompanyName() : "HRM Company")
                .legalName(userInfo.getCompanyName())
                .status(EmployerStatus.ACTIVE)
                .isVerified(true)
                .hrmCompanyId(userInfo.getCompanyId().toString())
                .hrmSyncEnabled(true)
                .build();
        return employerRepository.save(employer);
    }

    private Manager createManagerFromHrm(Employer employer, HrmUserInfo userInfo) {
        Manager manager = Manager.builder()
                .employer(employer)
                .email(userInfo.getEmail() != null ? userInfo.getEmail() : userInfo.getUsername() + "@hrm.verifix.uz")
                .role(ManagerRole.ADMIN)
                .build();
        return managerRepository.save(manager);
    }
}
