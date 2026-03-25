package uz.verifix.jobs.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.service.gov.HrmBridgeService;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final NotificationTemplates templates;
    private final HrmBridgeService hrmBridgeService;

    @Async
    @EventListener
    public void handleDomainEvent(DomainEvent event) {
        try {
            switch (event.getType()) {
                case DomainEvent.APPLICATION_NEW -> handleNewApplication(event);
                case DomainEvent.APPLICATION_STATUS_CHANGED -> handleStatusChanged(event);
                case DomainEvent.APPLICATION_HIRED -> handleHired(event);
                case DomainEvent.APPLICATION_REJECTED -> handleRejected(event);
                case DomainEvent.VACANCY_APPROVED -> handleVacancyApproved(event);
                case DomainEvent.VACANCY_REJECTED -> handleVacancyRejected(event);
                case DomainEvent.EMPLOYER_VERIFIED -> handleEmployerVerified(event);
                default -> log.debug("Unhandled event type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Error handling event {}: {}", event.getType(), e.getMessage(), e);
        }
    }

    private void handleNewApplication(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID employerId = (UUID) payload.get("employerId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String candidateName = (String) payload.get("candidateName");

        if (employerId == null) {
            return;
        }

        String message = templates.newApplication(vacancyTitle, candidateName);
        notificationService.dispatch(UserType.EMPLOYER, employerId, DomainEvent.APPLICATION_NEW, message);
    }

    private void handleStatusChanged(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID candidateId = (UUID) payload.get("candidateId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String newStatus = (String) payload.get("newStatus");

        if (candidateId == null) {
            return;
        }

        String message = templates.applicationStatusChanged(vacancyTitle, newStatus);
        notificationService.dispatch(UserType.CANDIDATE, candidateId, DomainEvent.APPLICATION_STATUS_CHANGED, message);
    }

    private void handleHired(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID candidateId = (UUID) payload.get("candidateId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String employerName = (String) payload.get("employerName");

        if (candidateId != null) {
            String message = templates.hired(vacancyTitle, employerName);
            notificationService.dispatch(UserType.CANDIDATE, candidateId, DomainEvent.APPLICATION_HIRED, message);
        }

        if (payload.containsKey("applicationId")) {
            try {
                UUID applicationId = (UUID) payload.get("applicationId");
                var application = notificationService.getApplicationById(applicationId);
                if (application != null) {
                    hrmBridgeService.onApplicationHired(application);
                }
            } catch (Exception e) {
                log.error("HRM bridge failed for hired event: {}", e.getMessage(), e);
            }
        }
    }

    private void handleRejected(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID candidateId = (UUID) payload.get("candidateId");
        String vacancyTitle = (String) payload.get("vacancyTitle");

        if (candidateId == null) {
            return;
        }

        String message = templates.rejected(vacancyTitle);
        notificationService.dispatch(UserType.CANDIDATE, candidateId, DomainEvent.APPLICATION_REJECTED, message);
    }

    private void handleVacancyApproved(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID employerId = (UUID) payload.get("employerId");
        String vacancyTitle = (String) payload.get("vacancyTitle");

        if (employerId == null) {
            return;
        }

        String message = templates.vacancyApproved(vacancyTitle);
        notificationService.dispatch(UserType.EMPLOYER, employerId, DomainEvent.VACANCY_APPROVED, message);
    }

    private void handleVacancyRejected(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID employerId = (UUID) payload.get("employerId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String reason = (String) payload.get("reason");

        if (employerId == null) {
            return;
        }

        String message = templates.vacancyRejected(vacancyTitle, reason);
        notificationService.dispatch(UserType.EMPLOYER, employerId, DomainEvent.VACANCY_REJECTED, message);
    }

    private void handleEmployerVerified(DomainEvent event) {
        UUID employerId = event.getEntityId();
        if (employerId == null) {
            return;
        }

        String message = templates.employerVerified();
        notificationService.dispatch(UserType.EMPLOYER, employerId, DomainEvent.EMPLOYER_VERIFIED, message);
    }
}
