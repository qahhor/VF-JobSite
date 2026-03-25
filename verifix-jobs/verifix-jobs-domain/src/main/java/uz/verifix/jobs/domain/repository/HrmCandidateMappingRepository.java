package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.HrmCandidateMapping;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HrmCandidateMappingRepository extends JpaRepository<HrmCandidateMapping, UUID> {
    Optional<HrmCandidateMapping> findByJobsCandidateIdAndHrmCompanyId(UUID jobsCandidateId, String hrmCompanyId);
    boolean existsByJobsCandidateIdAndHrmCompanyId(UUID jobsCandidateId, String hrmCompanyId);
}
