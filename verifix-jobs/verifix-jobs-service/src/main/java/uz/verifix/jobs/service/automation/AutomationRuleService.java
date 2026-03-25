package uz.verifix.jobs.service.automation;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.NotificationService;

import java.util.*;

/**
 * Automation rules engine — if/then rules for employers.
 * Trigger events: application.new, application.status_changed, vacancy.expired
 * Actions: auto-reject, auto-invite, auto-message, auto-screen
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AutomationRuleService {

    @PersistenceContext
    private EntityManager em;
    private final ApplicationRepository applicationRepo;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public Map<String, Object> createRule(UUID employerId, String name, String triggerEvent,
                                           Map<String, Object> conditions, String actionType,
                                           Map<String, Object> actionConfig) {
        UUID id = UUID.randomUUID();
        String condJson = toJson(conditions);
        String actJson = toJson(actionConfig);
        em.createNativeQuery("INSERT INTO automation_rule (id, employer_id, name, trigger_event, conditions, action_type, action_config) VALUES (?1,?2,?3,?4,?5::jsonb,?6,?7::jsonb)")
                .setParameter(1, id).setParameter(2, employerId).setParameter(3, name)
                .setParameter(4, triggerEvent).setParameter(5, condJson).setParameter(6, actionType)
                .setParameter(7, actJson).executeUpdate();
        return Map.of("id", id.toString(), "name", name, "triggerEvent", triggerEvent, "actionType", actionType);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getRules(UUID employerId) {
        List<Object[]> rows = em.createNativeQuery("SELECT id, name, trigger_event, action_type, is_active, execution_count, created_at FROM automation_rule WHERE employer_id = ?1 ORDER BY created_at DESC")
                .setParameter(1, employerId).getResultList();
        return rows.stream().map(r -> Map.<String, Object>of(
                "id", r[0].toString(), "name", r[1], "triggerEvent", r[2],
                "actionType", r[3], "isActive", r[4], "executionCount", r[5]
        )).toList();
    }

    @Transactional
    public void toggleRule(UUID ruleId, boolean active) {
        em.createNativeQuery("UPDATE automation_rule SET is_active = ?1, updated_at = now() WHERE id = ?2")
                .setParameter(1, active).setParameter(2, ruleId).executeUpdate();
    }

    @Async
    @EventListener
    @SuppressWarnings("unchecked")
    public void onDomainEvent(DomainEvent event) {
        String eventType = event.getType();
        UUID employerId = getUuid(event.getPayload(), "employerId");
        if (employerId == null) return;

        List<Object[]> rules = em.createNativeQuery("SELECT id, conditions, action_type, action_config FROM automation_rule WHERE employer_id = ?1 AND trigger_event = ?2 AND is_active = true")
                .setParameter(1, employerId).setParameter(2, eventType).getResultList();

        for (Object[] rule : rules) {
            UUID ruleId = (UUID) rule[0];
            String actionType = (String) rule[2];

            try {
                executeAction(actionType, event.getPayload(), ruleId);
                logExecution(ruleId, getUuid(event.getPayload(), "applicationId"), "SUCCESS", null);
                em.createNativeQuery("UPDATE automation_rule SET execution_count = execution_count + 1 WHERE id = ?1")
                        .setParameter(1, ruleId).executeUpdate();
            } catch (Exception e) {
                logExecution(ruleId, getUuid(event.getPayload(), "applicationId"), "FAILED", e.getMessage());
                log.warn("Automation rule {} failed: {}", ruleId, e.getMessage());
            }
        }
    }

    private void executeAction(String actionType, Map<String, Object> payload, UUID ruleId) {
        switch (actionType) {
            case "AUTO_REJECT" -> {
                UUID appId = getUuid(payload, "applicationId");
                if (appId != null) {
                    applicationRepo.findById(appId).ifPresent(app -> {
                        app.setStatus(ApplicationStatus.REJECTED);
                        app.setRecruiterNotes("Avtomatik rad etildi (rule: " + ruleId + ")");
                        applicationRepo.save(app);
                    });
                }
            }
            case "AUTO_MESSAGE" -> {
                UUID candidateId = getUuid(payload, "candidateId");
                if (candidateId != null) {
                    notificationService.dispatch(uz.verifix.jobs.domain.enums.UserType.CANDIDATE,
                            candidateId, "automation.message", "Arizangiz qabul qilindi. Tez orada aloqaga chiqamiz.");
                }
            }
            case "AUTO_VIEW" -> {
                UUID appId = getUuid(payload, "applicationId");
                if (appId != null) {
                    applicationRepo.findById(appId).ifPresent(app -> {
                        if (app.getStatus() == ApplicationStatus.NEW) {
                            app.setStatus(ApplicationStatus.VIEWED);
                            app.setViewedAt(java.time.Instant.now());
                            applicationRepo.save(app);
                        }
                    });
                }
            }
        }
    }

    private void logExecution(UUID ruleId, UUID entityId, String result, String details) {
        UUID id = UUID.randomUUID();
        em.createNativeQuery("INSERT INTO automation_execution_log (id, rule_id, trigger_entity_id, result, details) VALUES (?1,?2,?3,?4,?5::jsonb)")
                .setParameter(1, id).setParameter(2, ruleId).setParameter(3, entityId)
                .setParameter(4, result).setParameter(5, details != null ? "{\"error\":\"" + details + "\"}" : null)
                .executeUpdate();
    }

    private String toJson(Map<String, Object> map) {
        try { return map != null ? objectMapper.writeValueAsString(map) : null; } catch (Exception e) { return null; }
    }

    private UUID getUuid(Map<String, Object> map, String key) {
        Object val = map != null ? map.get(key) : null;
        if (val == null) return null;
        try { return UUID.fromString(val.toString()); } catch (Exception e) { return null; }
    }
}
