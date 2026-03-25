package uz.verifix.jobs.service.verification;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.util.HashUtils;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.VerificationLog;
import uz.verifix.jobs.domain.enums.*;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.VerificationLogRepository;
import uz.verifix.jobs.integration.myid.MyIdClient;
import uz.verifix.jobs.integration.myid.MyIdUserInfo;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final MyIdClient myIdClient;
    private final VerificationLogRepository verificationLogRepository;
    private final CandidateRepository candidateRepository;
    private final EmployerRepository employerRepository;
    private final EventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Transactional
    public String initiateVerification(UserType entityType, UUID entityId) {
        // Create pending verification log
        VerificationLog log = VerificationLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .method(VerificationMethod.MYID)
                .status(VerificationStatus.PENDING)
                .build();
        verificationLogRepository.save(log);

        // Generate state = verificationLogId
        String authUrl = myIdClient.getAuthUrl(log.getId().toString());
        VerificationService.log.info("MyID verification initiated: {} {} → {}", entityType, entityId, log.getId());
        return authUrl;
    }

    @Transactional
    public boolean completeVerification(String state, String code) {
        UUID logId;
        try {
            logId = UUID.fromString(state);
        } catch (IllegalArgumentException e) {
            VerificationService.log.warn("Invalid verification state: {}", state);
            return false;
        }

        VerificationLog verLog = verificationLogRepository.findById(logId).orElse(null);
        if (verLog == null || verLog.getStatus() != VerificationStatus.PENDING) {
            VerificationService.log.warn("Verification log not found or not pending: {}", logId);
            return false;
        }

        // Exchange code for token
        MyIdClient.TokenResponse tokenResponse = myIdClient.exchangeCode(code);
        if (!tokenResponse.success()) {
            verLog.setStatus(VerificationStatus.REJECTED);
            verLog.setResponseJson("{\"error\":\"" + tokenResponse.error() + "\"}");
            verificationLogRepository.save(verLog);
            return false;
        }

        // Get user info
        MyIdUserInfo userInfo = myIdClient.getUserInfo(tokenResponse.accessToken());
        if (userInfo == null || !userInfo.isVerified()) {
            verLog.setStatus(VerificationStatus.REJECTED);
            verificationLogRepository.save(verLog);
            return false;
        }

        // Save a minimal audit-safe response
        try {
            verLog.setResponseJson(objectMapper.writeValueAsString(Map.of(
                    "verified", true,
                    "provider", "MYID",
                    "documentHash", userInfo.getPassportSeries() != null ? HashUtils.sha256Hex(userInfo.getPassportSeries()) : null
            )));
        } catch (Exception ignored) {}

        verLog.setStatus(VerificationStatus.VERIFIED);
        verLog.setVerifiedAt(Instant.now());
        verificationLogRepository.save(verLog);

        // Update entity
        updateEntityVerification(verLog.getEntityType(), verLog.getEntityId(), userInfo);

        VerificationService.log.info("MyID verification completed: {} {}", verLog.getEntityType(), verLog.getEntityId());
        return true;
    }

    @Transactional(readOnly = true)
    public VerificationLog getLatestVerification(UserType entityType, UUID entityId) {
        return verificationLogRepository
                .findTopByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .orElse(null);
    }

    private void updateEntityVerification(UserType entityType, UUID entityId, MyIdUserInfo userInfo) {
        if (entityType == UserType.CANDIDATE) {
            candidateRepository.findById(entityId).ifPresent(c -> {
                c.setMyidStatus(MyIdStatus.VERIFIED);
                c.setMyidVerifiedAt(Instant.now());
                if (c.getFirstName() == null) c.setFirstName(userInfo.getFirstName());
                if (c.getLastName() == null) c.setLastName(userInfo.getLastName());
                candidateRepository.save(c);
            });
        } else if (entityType == UserType.EMPLOYER) {
            employerRepository.findById(entityId).ifPresent(e -> {
                e.setIsVerified(true);
                e.setMyidVerifiedAt(Instant.now());
                employerRepository.save(e);
                eventPublisher.publish(DomainEvent.EMPLOYER_VERIFIED, entityId, "Employer");
            });
        }
    }
}
