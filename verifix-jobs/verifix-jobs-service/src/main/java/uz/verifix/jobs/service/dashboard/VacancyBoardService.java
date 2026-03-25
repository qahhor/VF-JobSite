package uz.verifix.jobs.service.dashboard;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyBoardService {

    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final VacancyHealthService healthService;

    public record BoardItem(UUID id, String title, String city, String category, String status,
                             int views, int applies, int inProgress, int hired,
                             Integer positionsCount, Integer positionsFilled,
                             String expiresAt, int healthScore, String healthGrade) {}

    @Transactional(readOnly = true)
    public List<BoardItem> getBoard(UUID employerId, String statusFilter) {
        List<Vacancy> vacancies;
        if (statusFilter != null) {
            vacancies = vacancyRepository.findByEmployerIdAndStatus(employerId, VacancyStatus.valueOf(statusFilter));
        } else {
            vacancies = vacancyRepository.findByEmployerId(employerId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        }

        return vacancies.stream().map(v -> {
            VacancyHealthService.VacancyHealth health = healthService.diagnose(v.getId());
            long inProgress = applicationRepository.countByVacancyIdAndStatusIn(v.getId(),
                    List.of(uz.verifix.jobs.domain.enums.ApplicationStatus.SHORTLIST,
                            uz.verifix.jobs.domain.enums.ApplicationStatus.INVITED,
                            uz.verifix.jobs.domain.enums.ApplicationStatus.INTERVIEW,
                            uz.verifix.jobs.domain.enums.ApplicationStatus.OFFER));
            long hired = applicationRepository.countByVacancyIdAndStatus(v.getId(),
                    uz.verifix.jobs.domain.enums.ApplicationStatus.HIRED);

            return new BoardItem(v.getId(), v.getTitle(), v.getCity(), v.getCategory(), v.getStatus().name(),
                    v.getViewCount() != null ? v.getViewCount() : 0,
                    v.getApplyCount() != null ? v.getApplyCount() : 0,
                    (int) inProgress, (int) hired,
                    v.getPositionsCount(), v.getPositionsFilled(),
                    v.getExpiresAt() != null ? v.getExpiresAt().toString() : null,
                    health != null ? health.healthScore() : 0,
                    health != null ? health.healthGrade() : "?");
        }).toList();
    }
}
