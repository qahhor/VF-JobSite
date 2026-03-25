package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.EmployerTask;

import java.util.UUID;

@Repository
public interface EmployerTaskRepository extends JpaRepository<EmployerTask, UUID> {
    Page<EmployerTask> findByEmployerIdAndStatusOrderByCreatedAtDesc(UUID employerId, String status, Pageable pageable);
    Page<EmployerTask> findByEmployerIdOrderByCreatedAtDesc(UUID employerId, Pageable pageable);
    long countByEmployerIdAndStatus(UUID employerId, String status);
}
