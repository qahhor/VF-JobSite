package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancySchedulerService {

    private final VacancyRepository vacancyRepository;
    private final EventPublisher eventPublisher;

    /**
     * Every hour: expire vacancies past their expiresAt date.
     */
    @Scheduled(fixedDelayString = "${app.scheduler.expire-interval-ms:3600000}")
    @SchedulerLock(name = "expireVacancies", lockAtLeastFor = "5m", lockAtMostFor = "30m")
    @Transactional
    public void expireVacancies() {
        List<Vacancy> expired = vacancyRepository.findByStatusAndExpiresAtBefore(VacancyStatus.ACTIVE, Instant.now());

        for (Vacancy v : expired) {
            v.setStatus(VacancyStatus.CLOSED);
            vacancyRepository.save(v);

            eventPublisher.publish(DomainEvent.VACANCY_EXPIRED, v.getId(), "Vacancy", null,
                    Map.of("employerId", v.getEmployer().getId(), "vacancyTitle", v.getTitle()));

            log.info("Vacancy {} expired and closed", v.getId());
        }

        if (!expired.isEmpty()) {
            log.info("Expired {} vacancies", expired.size());
        }
    }

    /**
     * Every 30 minutes: auto-close vacancies where all positions are filled.
     */
    @Scheduled(fixedDelayString = "${app.scheduler.autoclose-interval-ms:1800000}")
    @SchedulerLock(name = "autoCloseFilledVacancies", lockAtLeastFor = "5m", lockAtMostFor = "15m")
    @Transactional
    public void autoCloseFilledVacancies() {
        List<Vacancy> filled = vacancyRepository.findFilledVacancies();

        for (Vacancy v : filled) {
            v.setStatus(VacancyStatus.CLOSED);
            vacancyRepository.save(v);
            log.info("Vacancy {} auto-closed: all positions filled ({}/{})",
                    v.getId(), v.getPositionsFilled(), v.getPositionsCount());
        }
    }
}
