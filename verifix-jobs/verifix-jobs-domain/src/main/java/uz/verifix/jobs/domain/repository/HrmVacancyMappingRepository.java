package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.HrmVacancyMapping;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HrmVacancyMappingRepository extends JpaRepository<HrmVacancyMapping, UUID> {
    Optional<HrmVacancyMapping> findByHrmCompanyIdAndHrmVacancyId(String hrmCompanyId, Long hrmVacancyId);
    Optional<HrmVacancyMapping> findByJobsVacancyId(UUID jobsVacancyId);
    boolean existsByHrmCompanyIdAndHrmVacancyId(String hrmCompanyId, Long hrmVacancyId);
}
