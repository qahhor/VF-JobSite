package uz.verifix.jobs.service.consent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.ConsentLog;
import uz.verifix.jobs.domain.enums.ConsentType;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.repository.ConsentLogRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsentService {

    private final ConsentLogRepository consentLogRepository;

    @Transactional
    public ConsentLog giveConsent(UserType userType, UUID userId, ConsentType consentType,
                                   String version, String ipAddress) {
        // Withdraw any existing consent of same type first
        consentLogRepository.findByUserTypeAndUserIdAndConsentTypeAndWithdrawnAtIsNull(
                userType, userId, consentType).ifPresent(existing -> {
            existing.setWithdrawnAt(Instant.now());
            consentLogRepository.save(existing);
        });

        ConsentLog consent = ConsentLog.builder()
                .userType(userType)
                .userId(userId)
                .consentType(consentType)
                .version(version)
                .givenAt(Instant.now())
                .ipAddress(ipAddress)
                .build();

        consent = consentLogRepository.save(consent);
        log.info("Consent given: {} {} → {}", userType, userId, consentType);
        return consent;
    }

    @Transactional
    public void withdrawConsent(UserType userType, UUID userId, ConsentType consentType) {
        consentLogRepository.findByUserTypeAndUserIdAndConsentTypeAndWithdrawnAtIsNull(
                userType, userId, consentType).ifPresent(consent -> {
            consent.setWithdrawnAt(Instant.now());
            consentLogRepository.save(consent);
            log.info("Consent withdrawn: {} {} → {}", userType, userId, consentType);
        });
    }

    @Transactional(readOnly = true)
    public boolean hasActiveConsent(UserType userType, UUID userId, ConsentType consentType) {
        return consentLogRepository.findByUserTypeAndUserIdAndConsentTypeAndWithdrawnAtIsNull(
                userType, userId, consentType).isPresent();
    }

    @Transactional(readOnly = true)
    public List<ConsentLog> getActiveConsents(UserType userType, UUID userId) {
        return consentLogRepository.findByUserTypeAndUserIdAndWithdrawnAtIsNull(userType, userId);
    }
}
