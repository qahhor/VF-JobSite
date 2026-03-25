package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.service.application.ApplicationStatusMachine;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;
import uz.verifix.jobs.service.notification.NotificationService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Response Inbox — mass-hiring triage workflow for employers.
 * Groups applications by vacancy, tracks SLA aging, supports bulk actions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResponseInboxService {

    private final ApplicationRepository applicationRepository;
    private final EventPublisher eventPublisher;

    public record InboxGroup(UUID vacancyId, String vacancyTitle, int newCount, int totalCount,
                              long oldestUnansweredHours, List<InboxItem> items) {}

    public record InboxItem(UUID applicationId, String candidateName, String phone,
                             String status, String source, Instant appliedAt,
                             long agingHours, boolean isUrgent) {}

    @Transactional(readOnly = true)
    public List<InboxGroup> getInbox(UUID employerId) {
        List<Application> applications = applicationRepository.findByVacancy_EmployerIdAndStatusIn(
                employerId, List.of(ApplicationStatus.NEW, ApplicationStatus.VIEWED, ApplicationStatus.SHORTLIST));

        Map<UUID, List<Application>> grouped = new LinkedHashMap<>();
        for (Application app : applications) {
            grouped.computeIfAbsent(app.getVacancy().getId(), k -> new ArrayList<>()).add(app);
        }

        return grouped.entrySet().stream().map(entry -> {
            UUID vacancyId = entry.getKey();
            List<Application> apps = entry.getValue();
            String title = apps.isEmpty() ? "" : apps.get(0).getVacancy().getTitle();

            int newCount = (int) apps.stream().filter(a -> a.getStatus() == ApplicationStatus.NEW).count();

            long oldestHours = apps.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.NEW)
                    .map(a -> ChronoUnit.HOURS.between(a.getAppliedAt(), Instant.now()))
                    .max(Long::compareTo).orElse(0L);

            List<InboxItem> items = apps.stream()
                    .sorted(Comparator.comparing(Application::getAppliedAt).reversed())
                    .map(a -> {
                        long hours = ChronoUnit.HOURS.between(a.getAppliedAt(), Instant.now());
                        return new InboxItem(a.getId(),
                                (a.getCandidate().getFirstName() != null ? a.getCandidate().getFirstName() : "") + " " +
                                        (a.getCandidate().getLastName() != null ? a.getCandidate().getLastName() : ""),
                                a.getCandidate().getPhone(), a.getStatus().name(),
                                a.getSource() != null ? a.getSource().name() : "UNKNOWN",
                                a.getAppliedAt(), hours, hours > 48);
                    }).toList();

            return new InboxGroup(vacancyId, title, newCount, apps.size(), oldestHours, items);
        }).sorted(Comparator.comparingInt(InboxGroup::newCount).reversed()).toList();
    }

    @Transactional
    public int bulkAction(UUID employerId, List<UUID> applicationIds, ApplicationStatus newStatus, String note) {
        int count = 0;
        for (UUID appId : applicationIds) {
            Application app = applicationRepository.findById(appId).orElse(null);
            if (app == null || !app.getVacancy().getEmployer().getId().equals(employerId)) continue;

            if (ApplicationStatusMachine.canTransition(app.getStatus(), newStatus)) {
                app.setStatus(newStatus);
                if (note != null) app.setRecruiterNotes(
                        (app.getRecruiterNotes() != null ? app.getRecruiterNotes() + "\n" : "") + note);
                applicationRepository.save(app);
                count++;
            }
        }
        log.info("Bulk action: {} applications moved to {} by employer {}", count, newStatus, employerId);
        return count;
    }
}
