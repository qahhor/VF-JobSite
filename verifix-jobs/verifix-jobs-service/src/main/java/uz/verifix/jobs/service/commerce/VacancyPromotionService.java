package uz.verifix.jobs.service.commerce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.UUID;

/**
 * Vacancy promotion — featured/promoted vacancies appear first in search.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyPromotionService {

    private final VacancyRepository vacancyRepository;
    private final EntitlementService entitlementService;

    @Transactional
    public boolean promoteVacancy(UUID vacancyId, UUID employerId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null || !vacancy.getEmployer().getId().equals(employerId)) return false;

        if (!entitlementService.useCredit(employerId, "VACANCY_PROMOTION")) {
            log.warn("No promotion credits for employer {}", employerId);
            return false;
        }

        vacancy.setIsBranded(true);
        vacancyRepository.save(vacancy);
        log.info("Promoted vacancy {} for employer {}", vacancyId, employerId);
        return true;
    }
}
