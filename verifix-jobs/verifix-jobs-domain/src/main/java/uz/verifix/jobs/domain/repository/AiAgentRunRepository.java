package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.AiAgentRun;

import java.util.UUID;

@Repository
public interface AiAgentRunRepository extends JpaRepository<AiAgentRun, UUID> {
    Page<AiAgentRun> findByEmployerIdOrderByCreatedAtDesc(UUID employerId, Pageable pageable);
    long countByEmployerIdAndAgentType(UUID employerId, String agentType);
}
