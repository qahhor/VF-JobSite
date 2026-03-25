package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.AiScreeningResult;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiScreeningResultRepository extends JpaRepository<AiScreeningResult, UUID> {
    Optional<AiScreeningResult> findByApplicationId(UUID applicationId);
    boolean existsByApplicationId(UUID applicationId);
}
