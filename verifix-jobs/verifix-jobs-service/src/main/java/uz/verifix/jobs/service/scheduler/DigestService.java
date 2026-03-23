package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.DigestPreference;
import uz.verifix.jobs.domain.enums.NotificationChannel;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.notification.NotificationService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DigestService {

    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final NotificationService notificationService;

    /**
     * Daily at 10:00 Tashkent: send digest to candidates with DAILY preference.
     */
    @Scheduled(cron = "0 0 10 * * *", zone = "Asia/Tashkent")
    @SchedulerLock(name = "sendDailyDigest", lockAtLeastFor = "30m", lockAtMostFor = "2h")
    @Transactional(readOnly = true)
    public void sendDailyDigest() {
        sendDigest(DigestPreference.DAILY, 1);
    }

    /**
     * Every Monday at 10:00 Tashkent: send weekly digest.
     */
    @Scheduled(cron = "0 0 10 * * MON", zone = "Asia/Tashkent")
    @SchedulerLock(name = "sendWeeklyDigest", lockAtLeastFor = "30m", lockAtMostFor = "2h")
    @Transactional(readOnly = true)
    public void sendWeeklyDigest() {
        sendDigest(DigestPreference.WEEKLY, 7);
    }

    private void sendDigest(DigestPreference pref, int daysBack) {
        List<Candidate> candidates = candidateRepository.findByDigestPref(pref);
        Instant since = Instant.now().minus(daysBack, ChronoUnit.DAYS);

        int sent = 0;
        for (Candidate candidate : candidates) {
            String city = candidate.getCity();
            List<Vacancy> vacancies;

            if (city != null) {
                vacancies = vacancyRepository.findRecentByCity(city, since);
            } else {
                vacancies = vacancyRepository.findRecentlyApproved(since);
            }

            if (vacancies.isEmpty()) continue;

            String message = buildDigestMessage(vacancies, pref == DigestPreference.WEEKLY);
            notificationService.createAndSend(UserType.CANDIDATE, candidate.getId(),
                    NotificationChannel.TELEGRAM, "digest." + pref.name().toLowerCase(), message);
            sent++;
        }

        log.info("{} digest sent to {} candidates", pref, sent);
    }

    private String buildDigestMessage(List<Vacancy> vacancies, boolean isWeekly) {
        StringBuilder sb = new StringBuilder();
        sb.append(isWeekly ? "📋 <b>Haftalik yangi vakansiyalar:</b>\n\n" : "📋 <b>Bugungi yangi vakansiyalar:</b>\n\n");

        int i = 1;
        for (Vacancy v : vacancies.stream().limit(5).toList()) {
            sb.append(i).append(". <b>").append(v.getTitle()).append("</b>");
            sb.append(" — ").append(v.getEmployer().getName());
            if (v.getCity() != null) sb.append(" (").append(v.getCity()).append(")");
            if (v.getSalaryFrom() != null) sb.append(" 💰").append(v.getSalaryFrom());
            sb.append("\n");
            i++;
        }

        if (vacancies.size() > 5) {
            sb.append("\n... va yana ").append(vacancies.size() - 5).append(" ta vakansiya");
        }

        sb.append("\n\n🔍 /search — Batafsil qidirish");
        return sb.toString();
    }
}
