package uz.verifix.jobs.service.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;

import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.enums.ManagerRole;
import uz.verifix.jobs.domain.repository.ManagerRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkOperationService {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final CandidateRepository candidateRepository;
    private final ManagerRepository managerRepository;
    private final ApplicationStatusMachine statusMachine;
    private final EventPublisher eventPublisher;

    /**
     * Validates that the manager has ADMIN role for bulk operations.
     */
    public void validateBulkPermission(UUID managerId) {
        Manager manager = managerRepository.findById(managerId).orElse(null);
        if (manager == null || manager.getRole() != ManagerRole.ADMIN) {
            throw new uz.verifix.jobs.common.exception.ForbiddenException("Only managers with ADMIN role can perform bulk operations");
        }
    }

    @Transactional
    public BulkResult bulkUpdateStatus(UUID employerId, List<UUID> applicationIds, ApplicationStatus newStatus) {
        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID appId : applicationIds) {
            try {
                Application app = applicationRepository.findById(appId).orElse(null);
                if (app == null) {
                    errors.add(appId + ": not found");
                    continue;
                }
                if (!app.getVacancy().getEmployer().getId().equals(employerId)) {
                    errors.add(appId + ": not your application");
                    continue;
                }
                if (!statusMachine.canTransition(app.getStatus(), newStatus)) {
                    errors.add(appId + ": invalid transition " + app.getStatus() + " → " + newStatus);
                    continue;
                }

                app.setStatus(newStatus);
                updateTimestamps(app, newStatus);
                applicationRepository.save(app);

                if (newStatus == ApplicationStatus.HIRED) {
                    Map<String, Object> payload = Map.of(
                            "candidateId", app.getCandidate().getId(),
                            "vacancyTitle", app.getVacancy().getTitle(),
                            "employerName", app.getVacancy().getEmployer().getName(),
                            "applicationId", app.getId(),
                            "newStatus", newStatus.name()
                    );
                    eventPublisher.publish(DomainEvent.APPLICATION_HIRED, app.getId(), "Application", null, payload);
                } else {
                    eventPublisher.publish(DomainEvent.APPLICATION_STATUS_CHANGED, app.getId(), "Application");
                }
                success++;
            } catch (Exception e) {
                errors.add(appId + ": " + e.getMessage());
            }
        }

        log.info("Bulk status update: {} success, {} errors", success, errors.size());
        return new BulkResult(success, errors.size(), errors);
    }

    @Transactional
    public BulkResult bulkInvite(UUID employerId, List<UUID> candidateIds, UUID vacancyId, String message) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null || !vacancy.getEmployer().getId().equals(employerId)) {
            return new BulkResult(0, candidateIds.size(), List.of("Vacancy not found or not owned"));
        }

        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID candidateId : candidateIds) {
            try {
                Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
                if (candidate == null) {
                    errors.add(candidateId + ": candidate not found");
                    continue;
                }
                if (applicationRepository.existsByVacancyIdAndCandidateId(vacancyId, candidateId)) {
                    errors.add(candidateId + ": already applied");
                    continue;
                }

                Application app = Application.builder()
                        .vacancy(vacancy)
                        .candidate(candidate)
                        .status(ApplicationStatus.INVITED)
                        .source(ApplicationSource.EMPLOYER)
                        .appliedAt(Instant.now())
                        .invitedAt(Instant.now())
                        .recruiterNotes(message)
                        .build();
                applicationRepository.save(app);
                eventPublisher.publish(DomainEvent.APPLICATION_NEW, app.getId(), "Application");
                success++;
            } catch (Exception e) {
                errors.add(candidateId + ": " + e.getMessage());
            }
        }

        log.info("Bulk invite: {} success, {} errors for vacancy {}", success, errors.size(), vacancyId);
        return new BulkResult(success, errors.size(), errors);
    }

    @Transactional
    public BulkResult bulkReject(UUID employerId, List<UUID> applicationIds, String reason) {
        int success = 0;
        List<String> errors = new ArrayList<>();

        for (UUID appId : applicationIds) {
            try {
                Application app = applicationRepository.findById(appId).orElse(null);
                if (app == null) {
                    errors.add(appId + ": not found");
                    continue;
                }
                if (!app.getVacancy().getEmployer().getId().equals(employerId)) {
                    errors.add(appId + ": not your application");
                    continue;
                }

                app.setStatus(ApplicationStatus.REJECTED);
                app.setRejectedAt(Instant.now());
                app.setRejectionReason(reason);
                applicationRepository.save(app);
                eventPublisher.publish(DomainEvent.APPLICATION_REJECTED, app.getId(), "Application");
                success++;
            } catch (Exception e) {
                errors.add(appId + ": " + e.getMessage());
            }
        }

        log.info("Bulk reject: {} success, {} errors", success, errors.size());
        return new BulkResult(success, errors.size(), errors);
    }

    private void updateTimestamps(Application app, ApplicationStatus status) {
        switch (status) {
            case VIEWED -> app.setViewedAt(Instant.now());
            case INVITED -> app.setInvitedAt(Instant.now());
            case HIRED -> app.setHiredAt(Instant.now());
            case REJECTED -> app.setRejectedAt(Instant.now());
            default -> {}
        }
    }

    public record BulkResult(int successCount, int failedCount, List<String> errors) {}
}
