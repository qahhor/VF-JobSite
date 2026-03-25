package uz.verifix.jobs.service.employer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.notification.NotificationService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployerNotificationService {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public void notifyNewApplication(UUID employerId, Application application) {
        String message = String.format(
                "Yangi ariza.%n%nVakansiya: %s%nNomzod: %s %s%nShahar: %s%n%nArizani dashboard orqali koring.",
                application.getVacancy().getTitle(),
                application.getCandidate().getFirstName() != null ? application.getCandidate().getFirstName() : "",
                application.getCandidate().getLastName() != null ? application.getCandidate().getLastName() : "",
                application.getCandidate().getCity() != null ? application.getCandidate().getCity() : ""
        );

        NotificationService.DispatchResult result = notificationService.dispatch(
                UserType.EMPLOYER,
                employerId,
                "employer.application.new",
                message
        );
        log.debug("Employer {} notified about new application via {} attempts / {} delivered",
                employerId, result.attempts(), result.delivered());
    }

    @Transactional(readOnly = true)
    public void notifyApplicationMilestone(UUID employerId, long applicationCount) {
        if (applicationCount != 10 && applicationCount != 50 && applicationCount != 100
                && applicationCount != 500 && applicationCount != 1000) {
            return;
        }

        String message = String.format(
                "Tabriklaymiz. Sizning kompaniyangizga %d ta ariza keldi.",
                applicationCount
        );
        notificationService.dispatch(UserType.EMPLOYER, employerId, "employer.application.milestone", message);
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
                "Haftalik hisobot%n%n" +
                        "Faol vakansiyalar: %d%n" +
                        "Yangi arizalar (7 kun): %d%n" +
                        "Jami arizalar: %d%n" +
                        "Ishga qabul qilingan: %d%n%n" +
                        "Batafsil malumot dashboardda.",
                activeVacancies, newApps, totalApps, hiredCount
        );
    }
}
