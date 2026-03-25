package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.service.employer.EmployerNotificationService;
import uz.verifix.jobs.service.notification.NotificationService;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmployerReportScheduler {

    private final EmployerRepository employerRepository;
    private final EmployerNotificationService employerNotificationService;
    private final NotificationService notificationService;

    private static final int BATCH_SIZE = 500;

    @Scheduled(cron = "0 0 9 * * MON")
    @SchedulerLock(name = "sendWeeklyReports", lockAtLeastFor = "30m", lockAtMostFor = "2h")
    public void sendWeeklyReports() {
        log.info("Starting weekly employer reports...");
        int sent = 0;
        int page = 0;

        while (true) {
            Page<Employer> employers = employerRepository.findAll(PageRequest.of(page, BATCH_SIZE));
            for (Employer employer : employers) {
                try {
                    String report = employerNotificationService.generateWeeklyReport(employer.getId());
                    NotificationService.DispatchResult result = notificationService.dispatch(
                            UserType.EMPLOYER,
                            employer.getId(),
                            "employer.report.weekly",
                            report
                    );
                    sent += result.delivered();
                } catch (Exception e) {
                    log.error("Failed to send weekly report for employer {}: {}", employer.getId(), e.getMessage());
                }
            }
            if (!employers.hasNext()) {
                break;
            }
            page++;
        }

        log.info("Weekly employer reports sent: {}", sent);
    }
}
