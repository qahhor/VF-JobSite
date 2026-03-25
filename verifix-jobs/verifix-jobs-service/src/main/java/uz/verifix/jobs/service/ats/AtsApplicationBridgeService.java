package uz.verifix.jobs.service.ats;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationSource;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.integration.ats.AtsApplicationEvent;
import uz.verifix.jobs.integration.ats.AtsTelegramClient;
import uz.verifix.jobs.service.notification.DomainEvent;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Bridges applications between ATS Telegram bot and Jobs portal.
 *
 * Inbound (Telegram → Jobs): receives webhook when candidate applies via bot.
 * Outbound (Jobs → Telegram): notifies candidate of status changes via Telegram.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AtsApplicationBridgeService {

    private final Optional<AtsTelegramClient> atsClient;
    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;

    /**
     * Inbound: Create application from ATS Telegram bot webhook.
     */
    @Transactional
    public Application createFromTelegram(UUID vacancyId, Long telegramId, String candidateName,
                                           String phone, Map<String, Object> surveyData) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null) {
            log.warn("ATS application: vacancy {} not found", vacancyId);
            return null;
        }

        // Find or create candidate by telegram ID
        Candidate candidate = candidateRepository.findByTelegramId(telegramId)
                .orElseGet(() -> {
                    String[] nameParts = candidateName != null ? candidateName.split(" ", 2) : new String[]{"", ""};
                    Candidate c = Candidate.builder()
                            .telegramId(telegramId)
                            .phone(phone)
                            .firstName(nameParts[0])
                            .lastName(nameParts.length > 1 ? nameParts[1] : null)
                            .build();
                    return candidateRepository.save(c);
                });

        // Prevent duplicate
        if (applicationRepository.existsByVacancyIdAndCandidateId(vacancyId, candidate.getId())) {
            log.info("ATS application: duplicate for vacancy {} candidate {}", vacancyId, candidate.getId());
            return applicationRepository.findByVacancyIdAndCandidateId(vacancyId, candidate.getId()).orElse(null);
        }

        Application application = Application.builder()
                .vacancy(vacancy)
                .candidate(candidate)
                .status(ApplicationStatus.NEW)
                .source(ApplicationSource.TELEGRAM)
                .appliedAt(Instant.now())
                .build();

        if (surveyData != null) {
            application.setRecruiterNotes("Survey data from Telegram Mini App: " + surveyData);
        }

        application = applicationRepository.save(application);
        log.info("Created application {} from ATS Telegram (candidate={}, vacancy={})",
                application.getId(), candidate.getId(), vacancyId);
        return application;
    }

    /**
     * Outbound: Notify candidate of status change via Telegram.
     * Listens to APPLICATION_STATUS_CHANGED domain event.
     */
    @Async
    @EventListener
    public void onStatusChanged(DomainEvent event) {
        if (!DomainEvent.APPLICATION_STATUS_CHANGED.equals(event.getType())) return;
        if (atsClient.isEmpty()) return;

        Map<String, Object> p = event.getPayload();
        String applicationId = getStr(p, "applicationId");
        if (applicationId == null) return;

        applicationRepository.findById(UUID.fromString(applicationId)).ifPresent(app -> {
            Candidate candidate = app.getCandidate();
            if (candidate.getTelegramId() == null) return;

            String oldStatus = getStr(p, "oldStatus");
            String newStatus = getStr(p, "newStatus");

            AtsApplicationEvent atsEvent = AtsApplicationEvent.builder()
                    .applicationId(applicationId)
                    .candidateTelegramId(candidate.getTelegramId())
                    .candidateName(candidate.getFirstName())
                    .vacancyId(app.getVacancy().getId().toString())
                    .vacancyTitle(app.getVacancy().getTitle())
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .employerName(app.getVacancy().getEmployer().getName())
                    .messageI18n(buildStatusMessage(newStatus, app.getVacancy().getTitle()))
                    .build();

            atsClient.get().notifyApplicationStatus(atsEvent);
            log.debug("Sent status notification to ATS Telegram for application {}", applicationId);
        });
    }

    private Map<String, String> buildStatusMessage(String status, String vacancyTitle) {
        return switch (status) {
            case "VIEWED" -> Map.of(
                    "uz", "📋 Arizangiz ko'rildi: " + vacancyTitle,
                    "ru", "📋 Ваша заявка просмотрена: " + vacancyTitle);
            case "SHORTLIST" -> Map.of(
                    "uz", "⭐ Siz tanlandingiz: " + vacancyTitle,
                    "ru", "⭐ Вы в шорт-листе: " + vacancyTitle);
            case "INVITED" -> Map.of(
                    "uz", "✉️ Suhbatga taklif: " + vacancyTitle,
                    "ru", "✉️ Приглашение на собеседование: " + vacancyTitle);
            case "HIRED" -> Map.of(
                    "uz", "🎉 Tabriklaymiz! Siz ishga qabul qilindingiz: " + vacancyTitle,
                    "ru", "🎉 Поздравляем! Вы приняты: " + vacancyTitle);
            case "REJECTED" -> Map.of(
                    "uz", "😔 Afsuski, ariza rad etildi: " + vacancyTitle,
                    "ru", "😔 К сожалению, заявка отклонена: " + vacancyTitle);
            default -> Map.of(
                    "uz", "📌 Ariza holati yangilandi: " + vacancyTitle,
                    "ru", "📌 Статус заявки обновлён: " + vacancyTitle);
        };
    }

    private String getStr(Map<String, Object> map, String key) {
        Object val = map != null ? map.get(key) : null;
        return val != null ? val.toString() : null;
    }
}
