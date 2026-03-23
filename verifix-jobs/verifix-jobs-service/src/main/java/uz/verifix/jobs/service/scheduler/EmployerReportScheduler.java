package uz.verifix.jobs.service.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.service.employer.EmployerNotificationService;
import uz.verifix.jobs.service.notification.NotificationService;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmployerReportScheduler {

    private final EmployerRepository employerRepository;
    private final ManagerRepository managerRepository;
    private final EmployerNotificationService employerNotificationService;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 9 * * MON")
    public void sendWeeklyReports() {
        log.info("Starting weekly employer reports...");

        List<Employer> employers = employerRepository.findAll();
        int sent = 0;

        for (Employer employer : employers) {
            try {
                String report = employerNotificationService.generateWeeklyReport(employer.getId());
                List<Manager> managers = managerRepository.findByEmployerId(employer.getId());

                for (Manager manager : managers) {
                    if (manager.getTelegramChatId() != null) {
                        notificationService.sendTelegramMessage(manager.getTelegramChatId(), report);
                        sent++;
                    }
                }
            } catch (Exception e) {
                log.error("Failed to send weekly report for employer {}: {}", employer.getId(), e.getMessage());
            }
        }

        log.info("Weekly employer reports sent: {}", sent);
    }
}
