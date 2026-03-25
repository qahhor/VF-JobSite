package uz.verifix.jobs.service.ml;

import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.enums.DigestPreference;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.service.notification.NotificationService;
import uz.verifix.jobs.service.notification.NotificationTemplates;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class ChurnPredictionService {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final NotificationTemplates templates;
    private final int inactiveDaysHigh;
    private final int inactiveDaysMedium;
    private final double notificationThreshold;
    private final int batchSize;

    public ChurnPredictionService(
            CandidateRepository candidateRepository,
            ApplicationRepository applicationRepository,
            NotificationService notificationService,
            NotificationTemplates templates,
            @Value("${app.churn.inactive-days-high:60}") int inactiveDaysHigh,
            @Value("${app.churn.inactive-days-medium:30}") int inactiveDaysMedium,
            @Value("${app.churn.notification-threshold:0.7}") double notificationThreshold,
            @Value("${app.churn.batch-size:500}") int batchSize) {
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.templates = templates;
        this.inactiveDaysHigh = inactiveDaysHigh;
        this.inactiveDaysMedium = inactiveDaysMedium;
        this.notificationThreshold = notificationThreshold;
        this.batchSize = batchSize;
    }

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
                if (daysSinceLastApp > inactiveDaysHigh) {
                    score += 0.5;
                    factors.add("INACTIVE_" + inactiveDaysHigh + "_DAYS");
                } else if (daysSinceLastApp > inactiveDaysMedium) {
                    score += 0.3;
                    factors.add("INACTIVE_" + inactiveDaysMedium + "_DAYS");
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
        if (candidate.getDigestPref() == DigestPreference.OFF) {
            score += 0.2;
            factors.add("NOTIFICATIONS_DISABLED");
        }

        return new ChurnRisk(Math.min(score, 1.0), factors);
    }

    @Transactional(readOnly = true)
    public List<ChurnRisk> getAtRiskCandidates(double threshold, int limit) {
        List<ChurnRisk> results = new ArrayList<>();
        int page = 0;
        while (results.size() < limit) {
            Page<Candidate> candidates = candidateRepository.findAll(PageRequest.of(page, batchSize));
            if (candidates.isEmpty()) break;
            for (Candidate c : candidates) {
                ChurnRisk risk = predictChurn(c.getId());
                if (risk.score() > threshold) {
                    results.add(risk);
                    if (results.size() >= limit) break;
                }
            }
            if (!candidates.hasNext()) break;
            page++;
        }
        return results;
    }

    @Scheduled(cron = "0 0 6 * * *")
    @SchedulerLock(name = "dailyChurnCheck", lockAtLeastFor = "30m", lockAtMostFor = "2h")
    @Transactional
    public void dailyChurnCheck() {
        log.info("Starting daily churn prediction check");
        int notified = 0;
        int page = 0;

        while (true) {
            Page<Candidate> candidates = candidateRepository.findAll(PageRequest.of(page, batchSize));
            for (Candidate candidate : candidates) {
                try {
                    ChurnRisk risk = predictChurn(candidate.getId());
                    if (risk.score() > notificationThreshold && candidate.getDigestPref() != DigestPreference.OFF) {
                        String message = templates.reEngagement();
                        notificationService.dispatch(
                                UserType.CANDIDATE, candidate.getId(),
                                "churn.re_engagement", message);
                        notified++;
                    }
                } catch (Exception e) {
                    log.error("Churn check failed for candidate {}: {}", candidate.getId(), e.getMessage());
                }
            }
            if (!candidates.hasNext()) break;
            page++;
        }

        log.info("Daily churn check complete: {} re-engagement notifications sent", notified);
    }
}
