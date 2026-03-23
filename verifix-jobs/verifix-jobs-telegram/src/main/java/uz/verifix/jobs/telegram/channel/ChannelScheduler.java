package uz.verifix.jobs.telegram.channel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.telegram.channel.enabled", havingValue = "true")
public class ChannelScheduler {

    private final VacancyRepository vacancyRepository;
    private final ChannelPostingService channelPostingService;

    /**
     * Every hour: post newly approved vacancies that haven't been posted yet.
     */
    @Scheduled(fixedDelayString = "${app.telegram.channel.post-interval-ms:3600000}")
    public void postNewVacancies() {
        Instant since = Instant.now().minus(1, ChronoUnit.HOURS);
        List<Vacancy> newVacancies = vacancyRepository.findRecentlyApproved(since);

        for (Vacancy v : newVacancies) {
            channelPostingService.postVacancy(v);
        }

        if (!newVacancies.isEmpty()) {
            log.info("Posted {} new vacancies to channel", newVacancies.size());
        }
    }

    /**
     * Daily at 09:00 Tashkent time: post digest.
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Tashkent")
    public void postDailyDigest() {
        Instant yesterday = Instant.now().minus(1, ChronoUnit.DAYS);
        List<Vacancy> vacancies = vacancyRepository.findRecentlyApproved(yesterday);

        channelPostingService.postDailyDigest(vacancies);
    }
}
