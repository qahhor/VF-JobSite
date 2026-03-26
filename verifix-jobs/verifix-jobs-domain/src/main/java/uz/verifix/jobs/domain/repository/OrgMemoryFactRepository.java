package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.OrgMemoryFact;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrgMemoryFactRepository extends JpaRepository<OrgMemoryFact, UUID> {
    List<OrgMemoryFact> findByEmployerIdOrderByCreatedAtDesc(UUID employerId);
}
