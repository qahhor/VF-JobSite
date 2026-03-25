package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ValueReportService {

    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;

    public record ValueReport(
            long totalHires, long totalApplications, long activeVacancies,
            double avgTimeToHireHours, double estimatedTimeSavedHours,
            double costPerHire, long automatedActions, String maturityLevel
    ) {}

    @Transactional(readOnly = true)
    public ValueReport generate(UUID employerId) {
        long activeVac = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE);
        long totalApps = applicationRepository.countByVacancy_EmployerId(employerId);
        long hires = applicationRepository.countByVacancy_EmployerIdAndStatus(employerId, ApplicationStatus.HIRED);

        double timeSaved = hires * 4.5; // Estimated 4.5 hours saved per hire vs manual process
        double costPerHire = hires > 0 ? 150000.0 : 0; // Estimated cost in UZS

        String maturity;
        if (hires >= 50 && activeVac >= 10) maturity = "ADVANCED";
        else if (hires >= 10 && activeVac >= 3) maturity = "GROWING";
        else if (hires > 0) maturity = "GETTING_STARTED";
        else maturity = "NEW";

        return new ValueReport(hires, totalApps, activeVac, 0, timeSaved, costPerHire, 0, maturity);
    }
}
