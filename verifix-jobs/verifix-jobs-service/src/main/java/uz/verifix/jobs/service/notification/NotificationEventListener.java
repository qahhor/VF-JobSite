package uz.verifix.jobs.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.enums.NotificationChannel;
import uz.verifix.jobs.domain.enums.UserType;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final NotificationTemplates templates;
    private final uz.verifix.jobs.service.gov.HrmBridgeService hrmBridgeService;

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
            log.error("Error handling event {}: {}", event.getType(), e.getMessage());
        }
    }

    private void handleNewApplication(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID employerId = (UUID) payload.get("employerId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String candidateName = (String) payload.get("candidateName");

        String message = templates.newApplication(vacancyTitle, candidateName);
        notificationService.createAndSend(UserType.EMPLOYER, employerId,
                NotificationChannel.TELEGRAM, DomainEvent.APPLICATION_NEW, message);
    }

    private void handleStatusChanged(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID candidateId = (UUID) payload.get("candidateId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String newStatus = (String) payload.get("newStatus");

        String message = templates.applicationStatusChanged(vacancyTitle, newStatus);
        notificationService.createAndSend(UserType.CANDIDATE, candidateId,
                NotificationChannel.TELEGRAM, DomainEvent.APPLICATION_STATUS_CHANGED, message);
    }

    private void handleHired(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID candidateId = (UUID) payload.get("candidateId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String employerName = (String) payload.get("employerName");

        String message = templates.hired(vacancyTitle, employerName);
        notificationService.createAndSend(UserType.CANDIDATE, candidateId,
                NotificationChannel.TELEGRAM, DomainEvent.APPLICATION_HIRED, message);

        // Trigger HRM bridge: create employee in Verifix HRM + report to ENST
        if (payload.containsKey("applicationId")) {
            try {
                UUID applicationId = (UUID) payload.get("applicationId");
                uz.verifix.jobs.domain.entity.Application application =
                        notificationService.getApplicationById(applicationId);
                if (application != null) {
                    hrmBridgeService.onApplicationHired(application);
                }
            } catch (Exception e) {
                log.error("HRM bridge failed for hired event: {}", e.getMessage());
            }
        }
    }

    private void handleRejected(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID candidateId = (UUID) payload.get("candidateId");
        String vacancyTitle = (String) payload.get("vacancyTitle");

        String message = templates.rejected(vacancyTitle);
        notificationService.createAndSend(UserType.CANDIDATE, candidateId,
                NotificationChannel.TELEGRAM, DomainEvent.APPLICATION_REJECTED, message);
    }

    private void handleVacancyApproved(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID employerId = (UUID) payload.get("employerId");
        String vacancyTitle = (String) payload.get("vacancyTitle");

        String message = templates.vacancyApproved(vacancyTitle);
        notificationService.createAndSend(UserType.EMPLOYER, employerId,
                NotificationChannel.TELEGRAM, DomainEvent.VACANCY_APPROVED, message);
    }

    private void handleVacancyRejected(DomainEvent event) {
        Map<String, Object> payload = event.getPayload();
        UUID employerId = (UUID) payload.get("employerId");
        String vacancyTitle = (String) payload.get("vacancyTitle");
        String reason = (String) payload.get("reason");

        String message = templates.vacancyRejected(vacancyTitle, reason);
        notificationService.createAndSend(UserType.EMPLOYER, employerId,
                NotificationChannel.TELEGRAM, DomainEvent.VACANCY_REJECTED, message);
    }

    private void handleEmployerVerified(DomainEvent event) {
        UUID employerId = event.getEntityId();
        String message = templates.employerVerified();
        notificationService.createAndSend(UserType.EMPLOYER, employerId,
                NotificationChannel.TELEGRAM, DomainEvent.EMPLOYER_VERIFIED, message);
    }
}
