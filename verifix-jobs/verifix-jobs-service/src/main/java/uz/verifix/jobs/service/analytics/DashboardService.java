package uz.verifix.jobs.service.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public OverviewStats getOverview(UUID employerId) {
        long activeVacancies = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE);
        long draftVacancies = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.DRAFT);
        long pausedVacancies = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.PAUSED);
        long closedVacancies = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.CLOSED);

        long totalApplications = applicationRepository.countByVacancy_EmployerId(employerId);
        long newApplications = applicationRepository.countByVacancy_EmployerIdAndStatus(employerId, ApplicationStatus.NEW);
        long hiredCount = applicationRepository.countByVacancy_EmployerIdAndStatus(employerId, ApplicationStatus.HIRED);

        return new OverviewStats(activeVacancies, draftVacancies, pausedVacancies, closedVacancies,
                totalApplications, newApplications, hiredCount);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getFunnel(UUID employerId) {
        Map<String, Long> funnel = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = applicationRepository.countByVacancy_EmployerIdAndStatus(employerId, status);
            funnel.put(status.name(), count);
        }
        return funnel;
    }

    public record OverviewStats(
            long activeVacancies,
            long draftVacancies,
            long pausedVacancies,
            long closedVacancies,
            long totalApplications,
            long newApplications,
            long hiredCount
    ) {}
}
