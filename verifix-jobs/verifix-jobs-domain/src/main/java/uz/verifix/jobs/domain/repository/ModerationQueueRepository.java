package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.ModerationQueue;
import uz.verifix.jobs.domain.enums.ModerationStatus;

import java.util.UUID;

@Repository
public interface ModerationQueueRepository extends JpaRepository<ModerationQueue, UUID> {

    Page<ModerationQueue> findByStatusOrderByCreatedAtAsc(ModerationStatus status, Pageable pageable);
}
