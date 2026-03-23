package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.GovSyncSource;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.gov.GovSyncService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.gov.sync.enabled", havingValue = "true")
public class GovSyncScheduler {

    private final GovSyncService govSyncService;
    private final VacancyRepository vacancyRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @SchedulerLock(name = "govDailyExport", lockAtLeastFor = "30m", lockAtMostFor = "2h")
    public void dailyExport() {
        log.info("Starting daily gov vacancy export...");

        Instant since = Instant.now().minus(1, ChronoUnit.DAYS);
        List<Vacancy> recentApproved = vacancyRepository.findRecentlyApproved(since);

        int argosCount = 0, mehnatCount = 0;
        for (Vacancy vacancy : recentApproved) {
            try {
                govSyncService.exportVacancy(vacancy, GovSyncSource.ARGOS);
                argosCount++;
            } catch (Exception e) {
                log.error("ARGOS export failed for vacancy {}: {}", vacancy.getId(), e.getMessage());
            }

            try {
                govSyncService.exportVacancy(vacancy, GovSyncSource.ISH_MEHNAT);
                mehnatCount++;
            } catch (Exception e) {
                log.error("ish.mehnat.uz export failed for vacancy {}: {}", vacancy.getId(), e.getMessage());
            }
        }

        log.info("Daily export complete: {} to ARGOS, {} to ish.mehnat.uz", argosCount, mehnatCount);
    }

    @Scheduled(cron = "0 0 4 * * *")
    @SchedulerLock(name = "govDailyImport", lockAtLeastFor = "30m", lockAtMostFor = "2h")
    public void dailyImport() {
        log.info("Starting daily gov vacancy import...");

        int argos = govSyncService.importVacancies(GovSyncSource.ARGOS);
        int mehnat = govSyncService.importVacancies(GovSyncSource.ISH_MEHNAT);

        log.info("Daily import complete: {} from ARGOS, {} from ish.mehnat.uz", argos, mehnat);
    }

    @Scheduled(fixedDelay = 3600000)
    @SchedulerLock(name = "govRetryFailed", lockAtLeastFor = "5m", lockAtMostFor = "30m")
    public void retryFailed() {
        int retried = govSyncService.retryFailed();
        if (retried > 0) {
            log.info("Retried {} failed gov sync operations", retried);
        }
    }
}
