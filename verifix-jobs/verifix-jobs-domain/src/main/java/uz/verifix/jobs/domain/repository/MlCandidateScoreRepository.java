package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.MlCandidateScore;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MlCandidateScoreRepository extends JpaRepository<MlCandidateScore, UUID> {

    Optional<MlCandidateScore> findByCandidateIdAndVacancyIdAndModelVersion(UUID candidateId, UUID vacancyId, String modelVersion);

    List<MlCandidateScore> findByVacancyIdOrderByMatchScoreDesc(UUID vacancyId);

    List<MlCandidateScore> findByCandidateIdOrderByMatchScoreDesc(UUID candidateId);
}
