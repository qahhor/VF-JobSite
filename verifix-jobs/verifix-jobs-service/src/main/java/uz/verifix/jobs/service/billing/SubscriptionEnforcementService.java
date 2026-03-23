package uz.verifix.jobs.service.billing;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.PricingPlan;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.PricingPlanRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionEnforcementService {

    private final EmployerRepository employerRepository;
    private final PricingPlanRepository planRepository;
    private final VacancyRepository vacancyRepository;

    private static final int FREE_PLAN_MAX_VACANCIES = 3;

    @Transactional(readOnly = true)
    public boolean canCreateVacancy(UUID employerId) {
        int maxVacancies = getMaxVacancies(employerId);
        long activeCount = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE);
        return activeCount < maxVacancies;
    }

    @Transactional(readOnly = true)
    public void enforceVacancyLimit(UUID employerId) {
        if (!canCreateVacancy(employerId)) {
            int max = getMaxVacancies(employerId);
            throw new BusinessException(ErrorCode.VACANCY_INVALID_STATUS, HttpStatus.FORBIDDEN,
                    "Vacancy limit reached (" + max + "). Upgrade your subscription plan.");
        }
    }

    @Transactional(readOnly = true)
    public UsageInfo getUsage(UUID employerId) {
        int maxVacancies = getMaxVacancies(employerId);
        long activeVacancies = vacancyRepository.countByEmployerIdAndStatus(employerId, VacancyStatus.ACTIVE);
        PricingPlan plan = getCurrentPlan(employerId);

        return new UsageInfo(
                plan != null ? plan.getCode() : "FREE",
                plan != null ? plan.getName() : "Bepul",
                activeVacancies,
                maxVacancies,
                plan != null && plan.getHasAts(),
                plan != null && plan.getHasAnalytics(),
                plan != null && plan.getHasApi(),
                plan != null && plan.getHasBranding()
        );
    }

    private int getMaxVacancies(UUID employerId) {
        PricingPlan plan = getCurrentPlan(employerId);
        if (plan == null || plan.getMaxVacancies() == null) return FREE_PLAN_MAX_VACANCIES;
        return plan.getMaxVacancies();
    }

    private PricingPlan getCurrentPlan(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null || employer.getSubscriptionPlan() == null) return null;
        return planRepository.findByCode(employer.getSubscriptionPlan()).orElse(null);
    }

    public record UsageInfo(
            String planCode, String planName,
            long activeVacancies, int maxVacancies,
            boolean hasAts, boolean hasAnalytics, boolean hasApi, boolean hasBranding
    ) {}
}
