package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.ActivityEvent;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityEventRepository extends JpaRepository<ActivityEvent, UUID> {
    Page<ActivityEvent> findByEmployerIdOrderByCreatedAtDesc(UUID employerId, Pageable pageable);
    List<ActivityEvent> findByEmployerIdAndCreatedAtAfterOrderByCreatedAtDesc(UUID employerId, Instant after);
}
