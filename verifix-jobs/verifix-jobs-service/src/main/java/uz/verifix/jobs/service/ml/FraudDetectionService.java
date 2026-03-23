package uz.verifix.jobs.service.ml;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.FraudAlert;
import uz.verifix.jobs.domain.entity.Referral;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.FraudAlertRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final FraudAlertRepository fraudAlertRepository;
    private final ApplicationRepository applicationRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public FraudCheckResult checkApplicationFraud(Application application) {
        List<String> flags = new ArrayList<>();
        double score = 0.0;

        // Check rapid-fire applications (>10 in last hour from same candidate)
        Instant hourAgo = Instant.now().minus(1, ChronoUnit.HOURS);
        Page<Application> recentApps = applicationRepository.findByCandidateId(
                application.getCandidate().getId(),
                org.springframework.data.domain.PageRequest.of(0, 20));
        long recentCount = recentApps.getContent().stream()
                .filter(a -> a.getAppliedAt() != null && a.getAppliedAt().isAfter(hourAgo))
                .count();
        if (recentCount > 10) {
            flags.add("RAPID_FIRE_APPLICATIONS");
            score += 0.4;
        } else if (recentCount > 5) {
            flags.add("HIGH_APPLICATION_RATE");
            score += 0.2;
        }

        // Check if candidate has no profile info (bot indicator)
        if (application.getCandidate().getFirstName() == null
                && application.getCandidate().getLastName() == null) {
            flags.add("INCOMPLETE_PROFILE");
            score += 0.2;
        }

        // Check for duplicate applications to same employer
        boolean duplicateEmployer = applicationRepository.existsByCandidateIdAndVacancy_EmployerId(
                application.getCandidate().getId(), application.getVacancy().getEmployer().getId());
        if (duplicateEmployer) {
            flags.add("DUPLICATE_EMPLOYER_APPLICATION");
            score += 0.1;
        }

        score = Math.min(score, 1.0);

        if (score >= 0.3) {
            saveFraudAlert("APPLICATION", application.getId(), "APPLICATION_FRAUD", score, flags);
        }

        return new FraudCheckResult(BigDecimal.valueOf(score), flags);
    }

    @Transactional
    public FraudCheckResult checkReferralFraud(UUID referrerId, UUID referredId) {
        List<String> flags = new ArrayList<>();
        double score = 0.0;

        // Self-referral check
        if (referrerId.equals(referredId)) {
            flags.add("SELF_REFERRAL");
            score += 0.8;
        }

        // Circular referral check would need referral chain analysis
        // For now, just flag if same phone prefix pattern (basic heuristic)

        score = Math.min(score, 1.0);

        if (score >= 0.3) {
            saveFraudAlert("REFERRAL", referrerId, "REFERRAL_FRAUD", score, flags);
        }

        return new FraudCheckResult(BigDecimal.valueOf(score), flags);
    }

    @Transactional(readOnly = true)
    public Page<FraudAlert> getUnreviewedAlerts(Pageable pageable) {
        return fraudAlertRepository.findByReviewedFalseOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public void reviewAlert(UUID alertId, UUID reviewedBy) {
        fraudAlertRepository.findById(alertId).ifPresent(alert -> {
            alert.setReviewed(true);
            alert.setReviewedBy(reviewedBy);
            fraudAlertRepository.save(alert);
        });
    }

    private void saveFraudAlert(String entityType, UUID entityId, String fraudType,
                                 double score, List<String> flags) {
        String flagsJson;
        try {
            flagsJson = objectMapper.writeValueAsString(flags);
        } catch (Exception e) {
            flagsJson = "[]";
        }

        FraudAlert alert = FraudAlert.builder()
                .entityType(entityType)
                .entityId(entityId)
                .fraudType(fraudType)
                .score(BigDecimal.valueOf(score))
                .flags(flagsJson)
                .build();
        fraudAlertRepository.save(alert);
        log.warn("Fraud alert created: {} {} score={}", entityType, entityId, score);
    }

    public record FraudCheckResult(BigDecimal score, List<String> flags) {}
}
