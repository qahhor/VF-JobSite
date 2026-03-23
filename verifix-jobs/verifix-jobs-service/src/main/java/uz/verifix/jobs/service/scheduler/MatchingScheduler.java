package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.ml.CandidateMatchingService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchingScheduler {

    private final CandidateMatchingService matchingService;
    private final VacancyRepository vacancyRepository;

    @Scheduled(cron = "0 0 5 * * *")
    @SchedulerLock(name = "dailyBatchScoring", lockAtLeastFor = "30m", lockAtMostFor = "2h")
    public void dailyBatchScoring() {
        log.info("Starting daily ML batch scoring...");

        Instant since = Instant.now().minus(1, ChronoUnit.DAYS);
        List<Vacancy> recentVacancies = vacancyRepository.findRecentlyApproved(since);

        for (Vacancy vacancy : recentVacancies) {
            try {
                matchingService.batchScore(vacancy.getId());
            } catch (Exception e) {
                log.error("Batch scoring failed for vacancy {}: {}", vacancy.getId(), e.getMessage());
            }
        }

        log.info("Daily batch scoring complete for {} vacancies", recentVacancies.size());
    }
}
