package uz.verifix.jobs.service.ml;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.enums.DigestPreference;
import uz.verifix.jobs.domain.enums.NotificationChannel;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.service.notification.NotificationService;
import uz.verifix.jobs.service.notification.NotificationTemplates;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChurnPredictionService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final NotificationTemplates templates;

    public record ChurnRisk(double score, List<String> factors) {}

    @Transactional(readOnly = true)
    public ChurnRisk predictChurn(UUID candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate == null) {
            return new ChurnRisk(0.0, List.of());
        }

        double score = 0.0;
        List<String> factors = new ArrayList<>();

        // Factor 1: No applications
        List<Application> applications = applicationRepository.findByCandidateId(candidateId);
        if (applications.isEmpty()) {
            score += 0.3;
            factors.add("NO_APPLICATIONS");
        } else {
            // Factor 2: Days since last application
            Optional<Application> lastApp = applicationRepository.findTopByCandidateIdOrderByAppliedAtDesc(candidateId);
            if (lastApp.isPresent() && lastApp.get().getAppliedAt() != null) {
                long daysSinceLastApp = ChronoUnit.DAYS.between(lastApp.get().getAppliedAt(), Instant.now());
                if (daysSinceLastApp > 60) {
                    score += 0.5;
                    factors.add("INACTIVE_60_DAYS");
                } else if (daysSinceLastApp > 30) {
                    score += 0.3;
                    factors.add("INACTIVE_30_DAYS");
                }
            }
        }

        // Factor 3: Incomplete profile
        boolean incomplete = candidate.getCity() == null
                || candidate.getPreferredCategories() == null || candidate.getPreferredCategories().length == 0
                || candidate.getSkills() == null || candidate.getSkills().length == 0;
        if (incomplete) {
            score += 0.2;
            factors.add("INCOMPLETE_PROFILE");
        }

        // Factor 4: Digest preference OFF
        if (candidate.getDigestPref() == DigestPreference.NONE) {
            score += 0.2;
            factors.add("NOTIFICATIONS_DISABLED");
        }

        return new ChurnRisk(Math.min(score, 1.0), factors);
    }

    @Transactional(readOnly = true)
    public List<ChurnRisk> getAtRiskCandidates(double threshold, int limit) {
        return candidateRepository.findAll().stream()
                .map(c -> {
                    ChurnRisk risk = predictChurn(c.getId());
                    return new Object[]{c.getId(), risk};
                })
                .filter(pair -> ((ChurnRisk) pair[1]).score() > threshold)
                .sorted(Comparator.comparingDouble(pair -> -((ChurnRisk) pair[1]).score()))
                .limit(limit)
                .map(pair -> (ChurnRisk) pair[1])
                .toList();
    }

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void dailyChurnCheck() {
        log.info("Starting daily churn prediction check");
        int notified = 0;

        List<Candidate> candidates = candidateRepository.findAll();
        for (Candidate candidate : candidates) {
            try {
                ChurnRisk risk = predictChurn(candidate.getId());
                if (risk.score() > 0.7 && candidate.getDigestPref() != DigestPreference.NONE) {
                    String message = templates.reEngagement();
                    notificationService.createAndSend(
                            UserType.CANDIDATE, candidate.getId(),
                            NotificationChannel.TELEGRAM, "churn.re_engagement", message);
                    notified++;
                }
            } catch (Exception e) {
                log.error("Churn check failed for candidate {}: {}", candidate.getId(), e.getMessage());
            }
        }

        log.info("Daily churn check complete: {} re-engagement notifications sent", notified);
    }
}
