package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.HrmSsoMapping;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HrmSsoMappingRepository extends JpaRepository<HrmSsoMapping, UUID> {
    Optional<HrmSsoMapping> findByHrmCompanyIdAndHrmUserId(Long hrmCompanyId, Long hrmUserId);
    Optional<HrmSsoMapping> findByJobsManagerId(UUID jobsManagerId);
}
