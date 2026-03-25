package uz.verifix.jobs.service.ats;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.integration.ats.AtsTelegramClient;
import uz.verifix.jobs.integration.ats.AtsVacancyPayload;
import uz.verifix.jobs.service.notification.DomainEvent;

import java.util.Map;
import java.util.Optional;

/**
 * Pushes vacancy lifecycle events to ATS Telegram bot.
 * Listens to DomainEvents for vacancy.approved, vacancy.created, vacancy.expired.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AtsVacancyFeedService {

    private final Optional<AtsTelegramClient> atsClient;

    @Async
    @EventListener
    public void onDomainEvent(DomainEvent event) {
        if (atsClient.isEmpty()) return;

        switch (event.getType()) {
            case DomainEvent.VACANCY_APPROVED -> handleVacancyApproved(event);
            case DomainEvent.VACANCY_EXPIRED -> handleVacancyExpired(event);
        }
    }

    public void pushVacancy(Vacancy vacancy) {
        if (atsClient.isEmpty()) return;

        AtsVacancyPayload payload = mapToPayload(vacancy);
        atsClient.get().pushVacancy(payload);
        log.info("Pushed vacancy {} to ATS Telegram", vacancy.getId());
    }

    public void updateVacancy(Vacancy vacancy) {
        if (atsClient.isEmpty()) return;

        AtsVacancyPayload payload = mapToPayload(vacancy);
        atsClient.get().updateVacancy(payload);
        log.debug("Updated vacancy {} in ATS Telegram", vacancy.getId());
    }

    public void closeVacancy(Vacancy vacancy) {
        if (atsClient.isEmpty()) return;

        atsClient.get().closeVacancy(vacancy.getId());
        log.info("Closed vacancy {} in ATS Telegram", vacancy.getId());
    }

    /**
     * Generate Telegram deeplink for a vacancy.
     */
    public String generateDeeplink(Vacancy vacancy, String companyCode) {
        if (atsClient.isEmpty()) return null;
        // Use vacancy numeric ID or extract from Jobs ID
        return atsClient.get().getDeeplinkUrl(companyCode, vacancy.getId().getMostSignificantBits());
    }

    private void handleVacancyApproved(DomainEvent event) {
        log.info("Vacancy approved — pushing to ATS Telegram");
        // Build minimal payload from event data
        Map<String, Object> p = event.getPayload();
        AtsVacancyPayload payload = AtsVacancyPayload.builder()
                .vacancyId(getStr(p, "vacancyId"))
                .title(getStr(p, "vacancyTitle"))
                .employerName(getStr(p, "employerName"))
                .build();
        atsClient.get().pushVacancy(payload);
    }

    private void handleVacancyExpired(DomainEvent event) {
        String vacancyId = getStr(event.getPayload(), "vacancyId");
        if (vacancyId != null) {
            atsClient.get().closeVacancy(java.util.UUID.fromString(vacancyId));
            log.info("Vacancy expired — notified ATS Telegram: {}", vacancyId);
        }
    }

    private AtsVacancyPayload mapToPayload(Vacancy v) {
        return AtsVacancyPayload.builder()
                .vacancyId(v.getId().toString())
                .title(v.getTitle())
                .description(v.getDescription())
                .category(v.getCategory())
                .city(v.getCity())
                .region(v.getRegion())
                .salaryFrom(v.getSalaryFrom())
                .salaryTo(v.getSalaryTo())
                .currency(v.getCurrency())
                .employmentType(v.getEmploymentType() != null ? v.getEmploymentType().name() : null)
                .shiftSchedule(v.getShiftSchedule() != null ? v.getShiftSchedule().name() : null)
                .benefits(v.getBenefits() != null ? java.util.Arrays.asList(v.getBenefits()) : null)
                .positionsCount(v.getPositionsCount() != null ? v.getPositionsCount() : 1)
                .massHiring(Boolean.TRUE.equals(v.getIsMassHiring()))
                .employerName(v.getEmployer() != null ? v.getEmployer().getName() : null)
                .employerLogoUrl(v.getEmployer() != null ? v.getEmployer().getLogoUrl() : null)
                .expiresAt(v.getExpiresAt() != null ? v.getExpiresAt().toString() : null)
                .build();
    }

    private String getStr(Map<String, Object> map, String key) {
        Object val = map != null ? map.get(key) : null;
        return val != null ? val.toString() : null;
    }
}
