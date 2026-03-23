package uz.verifix.jobs.service.employer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Manager;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.ManagerRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.notification.NotificationService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployerNotificationService {

    private final ManagerRepository managerRepository;
    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public void notifyNewApplication(UUID employerId, Application application) {
        List<Manager> managers = managerRepository.findByEmployerId(employerId);

        String message = String.format(
                "📨 Yangi ariza!\n\n💼 %s\n👤 %s %s\n📍 %s\n\nAriza ko'rish uchun dashboardga kiring.",
                application.getVacancy().getTitle(),
                application.getCandidate().getFirstName() != null ? application.getCandidate().getFirstName() : "",
                application.getCandidate().getLastName() != null ? application.getCandidate().getLastName() : "",
                application.getCandidate().getCity() != null ? application.getCandidate().getCity() : ""
        );

        for (Manager manager : managers) {
            if (manager.getTelegramChatId() != null) {
                notificationService.sendTelegramMessage(manager.getTelegramChatId(), message);
                log.debug("Notified manager {} about new application", manager.getEmail());
            }
        }
    }

    @Transactional(readOnly = true)
    public void notifyApplicationMilestone(UUID employerId, long applicationCount) {
        if (applicationCount != 10 && applicationCount != 50 && applicationCount != 100
                && applicationCount != 500 && applicationCount != 1000) {
            return;
        }

        List<Manager> managers = managerRepository.findByEmployerId(employerId);
        String message = String.format("🎉 Tabriklaymiz! Sizning kompaniyangizga %d ta ariza keldi!", applicationCount);

        for (Manager manager : managers) {
            if (manager.getTelegramChatId() != null) {
                notificationService.sendTelegramMessage(manager.getTelegramChatId(), message);
            }
        }
    }

    @Transactional(readOnly = true)
    public String generateWeeklyReport(UUID employerId) {
        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        long totalApps = applicationRepository.countByVacancy_EmployerId(employerId);
        long newApps = applicationRepository.countByVacancy_EmployerIdAndStatusAndCreatedAtAfter(
                employerId, ApplicationStatus.NEW, weekAgo);
        long hiredCount = applicationRepository.countByVacancy_EmployerIdAndStatus(employerId, ApplicationStatus.HIRED);
        long activeVacancies = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE);

        return String.format(
                "📊 Haftalik hisobot\n\n" +
                "📋 Faol vakansiyalar: %d\n" +
                "📨 Yangi arizalar (7 kun): %d\n" +
                "📊 Jami arizalar: %d\n" +
                "✅ Ishga qabul qilingan: %d\n\n" +
                "Batafsil: dashboard orqali ko'ring.",
                activeVacancies, newApps, totalApps, hiredCount
        );
    }
}
