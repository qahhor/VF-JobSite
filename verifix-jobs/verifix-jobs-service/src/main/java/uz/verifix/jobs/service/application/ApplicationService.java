package uz.verifix.jobs.service.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final EventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public Page<Application> getByVacancy(UUID vacancyId, UUID employerId, ApplicationStatus status, Pageable pageable) {
        validateVacancyOwnership(vacancyId, employerId);

        if (status != null) {
            return applicationRepository.findByVacancyIdAndStatus(vacancyId, status, pageable);
        }
        return applicationRepository.findByVacancyId(vacancyId, pageable);
    }

    @Transactional(readOnly = true)
    public Application getDetail(UUID applicationId, UUID employerId) {
        Application application = getApplicationById(applicationId);
        validateApplicationOwnership(application, employerId);
        return application;
    }

    @Transactional
    public Application changeStatus(UUID applicationId, UUID employerId, ApplicationStatus newStatus) {
        Application application = getApplicationById(applicationId);
        validateApplicationOwnership(application, employerId);

        ApplicationStatusMachine.validateTransition(application.getStatus(), newStatus);
        application.setStatus(newStatus);
        setTimestamp(application, newStatus);

        log.info("Application {} status changed to {} by employer {}", applicationId, newStatus, employerId);
        Application saved = applicationRepository.save(application);
        publishStatusEvent(saved, newStatus);
        return saved;
    }

    @Transactional
    public Application addNote(UUID applicationId, UUID employerId, String note) {
        Application application = getApplicationById(applicationId);
        validateApplicationOwnership(application, employerId);

        String existing = application.getRecruiterNotes();
        application.setRecruiterNotes(existing != null ? existing + "\n---\n" + note : note);
        return applicationRepository.save(application);
    }

    @Transactional
    public Application reject(UUID applicationId, UUID employerId, String reason) {
        Application application = getApplicationById(applicationId);
        validateApplicationOwnership(application, employerId);

        ApplicationStatusMachine.validateTransition(application.getStatus(), ApplicationStatus.REJECTED);
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectedAt(Instant.now());
        application.setRejectionReason(reason);

        log.info("Application {} rejected by employer {}", applicationId, employerId);
        Application saved = applicationRepository.save(application);
        publishStatusEvent(saved, ApplicationStatus.REJECTED);
        return saved;
    }

    @Transactional
    public List<Application> bulkChangeStatus(List<UUID> applicationIds, UUID employerId, ApplicationStatus newStatus) {
        List<Application> applications = applicationRepository.findAllById(applicationIds);

        for (Application app : applications) {
            validateApplicationOwnership(app, employerId);
            ApplicationStatusMachine.validateTransition(app.getStatus(), newStatus);
            app.setStatus(newStatus);
            setTimestamp(app, newStatus);
        }

        log.info("Bulk status change to {} for {} applications by employer {}", newStatus, applications.size(), employerId);
        List<Application> saved = applicationRepository.saveAll(applications);
        saved.forEach(app -> publishStatusEvent(app, newStatus));
        return saved;
    }

    @Transactional(readOnly = true)
    public Map<ApplicationStatus, Long> getStats(UUID vacancyId, UUID employerId) {
        validateVacancyOwnership(vacancyId, employerId);

        Map<ApplicationStatus, Long> stats = new java.util.EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = applicationRepository.countByVacancyIdAndStatus(vacancyId, status);
            if (count > 0) {
                stats.put(status, count);
            }
        }
        stats.put(null, applicationRepository.countByVacancyId(vacancyId)); // total under null key won't work in EnumMap
        return stats;
    }

    @Transactional(readOnly = true)
    public long getTotalCount(UUID vacancyId) {
        return applicationRepository.countByVacancyId(vacancyId);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStatsMap(UUID vacancyId, UUID employerId) {
        validateVacancyOwnership(vacancyId, employerId);

        Map<String, Long> stats = new java.util.LinkedHashMap<>();
        long total = 0;
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = applicationRepository.countByVacancyIdAndStatus(vacancyId, status);
            stats.put(status.name(), count);
            total += count;
        }
        stats.put("TOTAL", total);
        return stats;
    }

    private Application getApplicationById(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId.toString()));
    }

    private void validateVacancyOwnership(UUID vacancyId, UUID employerId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy", vacancyId.toString()));
        if (!vacancy.getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("You do not have access to this vacancy");
        }
    }

    private void validateApplicationOwnership(Application application, UUID employerId) {
        if (!application.getVacancy().getEmployer().getId().equals(employerId)) {
            throw new ForbiddenException("You do not have access to this application");
        }
    }

    private void publishStatusEvent(Application app, ApplicationStatus status) {
        Map<String, Object> payload = Map.of(
                "candidateId", app.getCandidate().getId(),
                "vacancyTitle", app.getVacancy().getTitle(),
                "employerName", app.getVacancy().getEmployer().getCompanyName(),
                "applicationId", app.getId()
        );

        String eventType = switch (status) {
            case HIRED -> DomainEvent.APPLICATION_HIRED;
            case REJECTED -> DomainEvent.APPLICATION_REJECTED;
            default -> DomainEvent.APPLICATION_STATUS_CHANGED;
        };

        Map<String, Object> fullPayload = new java.util.HashMap<>(payload);
        fullPayload.put("newStatus", status.name());
        eventPublisher.publish(eventType, app.getId(), "Application", null, fullPayload);
    }

    private void setTimestamp(Application app, ApplicationStatus status) {
        Instant now = Instant.now();
        switch (status) {
            case VIEWED -> app.setViewedAt(now);
            case INVITED -> app.setInvitedAt(now);
            case REJECTED -> app.setRejectedAt(now);
            case HIRED -> app.setHiredAt(now);
            default -> {}
        }
    }
}
