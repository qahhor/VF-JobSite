package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.ActivityEvent;
import uz.verifix.jobs.domain.repository.ActivityEventRepository;
import uz.verifix.jobs.service.notification.DomainEvent;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Employer activity feed — records all significant events for real-time display.
 * Used by SSE endpoint for live dashboard updates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityFeedService {

    private final ActivityEventRepository eventRepository;

    @Transactional(readOnly = true)
    public Page<ActivityEvent> getFeed(UUID employerId, Pageable pageable) {
        return eventRepository.findByEmployerIdOrderByCreatedAtDesc(employerId, pageable);
    }

    @Transactional(readOnly = true)
    public List<ActivityEvent> getRecentFeed(UUID employerId, int hours) {
        return eventRepository.findByEmployerIdAndCreatedAtAfterOrderByCreatedAtDesc(
                employerId, Instant.now().minus(hours, ChronoUnit.HOURS));
    }

    @Async
    @EventListener
    public void onDomainEvent(DomainEvent event) {
        Map<String, Object> p = event.getPayload();
        UUID employerId = getUuid(p, "employerId");
        if (employerId == null) return;

        ActivityEvent.ActivityEventBuilder builder = ActivityEvent.builder()
                .employerId(employerId)
                .eventType(event.getType())
                .metadata(p);

        switch (event.getType()) {
            case DomainEvent.APPLICATION_NEW -> builder
                    .title("Yangi ariza")
                    .description(getStr(p, "candidateName") + " " + getStr(p, "vacancyTitle") + " ga ariza topshirdi")
                    .actorType("CANDIDATE").actorName(getStr(p, "candidateName"))
                    .entityType("APPLICATION").entityId(getUuid(p, "applicationId"));

            case DomainEvent.APPLICATION_HIRED -> builder
                    .title("Nomzod yollandi!")
                    .description(getStr(p, "candidateName") + " " + getStr(p, "vacancyTitle") + " bo'yicha ishga qabul qilindi")
                    .actorType("SYSTEM")
                    .entityType("APPLICATION").entityId(getUuid(p, "applicationId"));

            case DomainEvent.APPLICATION_REJECTED -> builder
                    .title("Ariza rad etildi")
                    .description(getStr(p, "candidateName") + " arizasi rad etildi")
                    .entityType("APPLICATION").entityId(getUuid(p, "applicationId"));

            case DomainEvent.VACANCY_APPROVED -> builder
                    .title("Vakansiya tasdiqlandi")
                    .description(getStr(p, "vacancyTitle") + " moderatsiyadan o'tdi va faol holatda")
                    .entityType("VACANCY").entityId(getUuid(p, "vacancyId"));

            case DomainEvent.VACANCY_EXPIRED -> builder
                    .title("Vakansiya muddati tugadi")
                    .description(getStr(p, "vacancyTitle") + " muddati tugadi")
                    .entityType("VACANCY").entityId(getUuid(p, "vacancyId"));

            case DomainEvent.REFERRAL_HIRED -> builder
                    .title("Referal yollandi")
                    .description("Referal orqali kelgan nomzod ishga qabul qilindi")
                    .entityType("REFERRAL");

            default -> builder.title(event.getType()).description("Event: " + event.getType());
        }

        eventRepository.save(builder.build());
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

    private @interface Transactional {
        boolean readOnly() default false;
    }
}
