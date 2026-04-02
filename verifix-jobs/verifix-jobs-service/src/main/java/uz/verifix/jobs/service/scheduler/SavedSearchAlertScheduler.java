package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.service.marketplace.PublicVacancyService;
import uz.verifix.jobs.service.marketplace.SavedSearchService;
import uz.verifix.jobs.service.notification.NotificationService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedSearchAlertScheduler {

    private final SavedSearchService savedSearchService;
    private final PublicVacancyService publicVacancyService;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Tashkent")
    @SchedulerLock(name = "savedSearchAlerts", lockAtLeastFor = "1m", lockAtMostFor = "20m")
    @Transactional
    public void sendAlerts() {
        Instant now = Instant.now();
        int delivered = 0;

        for (SavedSearchService.AlertableSavedSearch search : savedSearchService.getAlertableSearches()) {
            List<String> benefits = search.benefits() != null ? new ArrayList<>(search.benefits()) : List.of();
            List<Vacancy> vacancies = publicVacancyService.listActiveVacancies(
                            emptyToNull(search.city()),
                            emptyToNull(search.category()),
                            search.minSalary(),
                            search.maxSalary(),
                            emptyToNull(search.employmentType()),
                            emptyToNull(search.shiftSchedule()),
                            benefits,
                            search.verifiedOnly(),
                            emptyToNull(search.query()),
                            "date_desc",
                            null,
                            PageRequest.of(0, 5)
                    )
                    .getContent()
                    .stream()
                    .filter(v -> v.getCreatedAt() != null && v.getCreatedAt().isAfter(search.baseline()))
                    .toList();

            if (vacancies.isEmpty()) {
                continue;
            }

            String title = search.name() != null && !search.name().isBlank() ? search.name() : "saqlangan qidiruv";
            notificationService.dispatch(
                    UserType.CANDIDATE,
                    search.candidateId(),
                    "saved-search.alert",
                    buildMessage(title, vacancies)
            );
            savedSearchService.markNotified(search.id(), now);
            delivered++;
        }

        log.info("Saved search alerts delivered for {} searches", delivered);
    }

    private String buildMessage(String title, List<Vacancy> vacancies) {
        StringBuilder builder = new StringBuilder();
        builder.append("🔔 <b>").append(title).append("</b> uchun yangi vakansiyalar:\n\n");

        int index = 1;
        for (Vacancy vacancy : vacancies) {
            builder.append(index++)
                    .append(". <b>").append(vacancy.getTitle()).append("</b>");
            if (vacancy.getEmployer() != null) {
                builder.append(" — ").append(vacancy.getEmployer().getName());
            }
            if (vacancy.getCity() != null) {
                builder.append(" (").append(vacancy.getCity()).append(")");
            }
            if (vacancy.getSalaryFrom() != null) {
                builder.append(" 💰").append(vacancy.getSalaryFrom().toPlainString());
            }
            builder.append("\n");
        }

        builder.append("\n/search orqali davom eting");
        return builder.toString();
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
