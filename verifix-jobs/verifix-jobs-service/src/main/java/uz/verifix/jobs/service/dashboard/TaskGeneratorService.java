package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.EmployerTask;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.EmployerTaskRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.notification.DomainEvent;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

/**
 * Auto-generates actionable tasks for employers based on domain events.
 * Tasks appear in the employer's Task Inbox with priority and due dates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskGeneratorService {

    private final EmployerTaskRepository taskRepository;

    @Async
    @EventListener
    public void onDomainEvent(DomainEvent event) {
        switch (event.getType()) {
            case DomainEvent.APPLICATION_NEW -> generateNewApplicationTask(event);
            case DomainEvent.VACANCY_EXPIRED -> generateExpiredVacancyTask(event);
            case DomainEvent.EMPLOYER_VERIFIED -> generateSetupTask(event);
            case DomainEvent.FRAUD_DETECTED -> generateFraudReviewTask(event);
        }
    }

    private void generateNewApplicationTask(DomainEvent event) {
        Map<String, Object> p = event.getPayload();
        UUID employerId = getUuid(p, "employerId");
        if (employerId == null) return;

        createTask(employerId, "REVIEW_APPLICATION", "HIGH",
                "Yangi ariza: " + getStr(p, "candidateName") + " → " + getStr(p, "vacancyTitle"),
                "Nomzod arizasini ko'rib chiqing va qaror qabul qiling.",
                "APPLICATION", getUuid(p, "applicationId"),
                Instant.now().plus(2, ChronoUnit.DAYS));
    }

    private void generateExpiredVacancyTask(DomainEvent event) {
        Map<String, Object> p = event.getPayload();
        UUID employerId = getUuid(p, "employerId");
        if (employerId == null) return;

        createTask(employerId, "RENEW_VACANCY", "MEDIUM",
                "Vakansiya muddati tugadi: " + getStr(p, "vacancyTitle"),
                "Vakansiyani yangilang yoki yoping.",
                "VACANCY", getUuid(p, "vacancyId"),
                Instant.now().plus(3, ChronoUnit.DAYS));
    }

    private void generateSetupTask(DomainEvent event) {
        Map<String, Object> p = event.getPayload();
        UUID employerId = getUuid(p, "employerId");
        if (employerId == null) return;

        createTask(employerId, "COMPLETE_PROFILE", "HIGH",
                "Kompaniya profilini to'ldiring",
                "Logo, tavsif va aloqa ma'lumotlarini qo'shing. Bu vakansiyalaringizni yanada jozibador qiladi.",
                "EMPLOYER", employerId,
                Instant.now().plus(7, ChronoUnit.DAYS));

        createTask(employerId, "CREATE_FIRST_VACANCY", "HIGH",
                "Birinchi vakansiyangizni yarating",
                "Yangi vakansiya yaratib, nomzodlarni jalb qilishni boshlang.",
                "VACANCY", null,
                Instant.now().plus(3, ChronoUnit.DAYS));
    }

    private void generateFraudReviewTask(DomainEvent event) {
        Map<String, Object> p = event.getPayload();
        UUID employerId = getUuid(p, "employerId");

        createTask(employerId, "REVIEW_FRAUD", "URGENT",
                "Shubhali faoliyat aniqlandi",
                "Fraud detection tizimi shubhali arizani aniqladi. Tekshirib chiqing.",
                "FRAUD_ALERT", getUuid(p, "alertId"),
                Instant.now().plus(1, ChronoUnit.DAYS));
    }

    private void createTask(UUID employerId, String type, String priority, String title,
                            String description, String entityType, UUID entityId, Instant dueAt) {
        taskRepository.save(EmployerTask.builder()
                .employerId(employerId)
                .taskType(type)
                .priority(priority)
                .title(title)
                .description(description)
                .entityType(entityType)
                .entityId(entityId)
                .dueAt(dueAt)
                .build());
        log.debug("Generated task '{}' for employer {}", type, employerId);
    }

    private UUID getUuid(Map<String, Object> map, String key) {
        Object val = map != null ? map.get(key) : null;
        if (val == null) return null;
        try { return UUID.fromString(val.toString()); } catch (Exception e) { return null; }
    }

    private String getStr(Map<String, Object> map, String key) {
        Object val = map != null ? map.get(key) : null;
        return val != null ? val.toString() : "";
    }
}
