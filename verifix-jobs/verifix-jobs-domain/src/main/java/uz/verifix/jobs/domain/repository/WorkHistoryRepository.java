package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.WorkHistory;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkHistoryRepository extends JpaRepository<WorkHistory, UUID> {

    List<WorkHistory> findByCandidateIdOrderByStartDateDesc(UUID candidateId);
}
