package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.HrmSyncLog;

import java.util.List;
import java.util.UUID;

@Repository
public interface HrmSyncLogRepository extends JpaRepository<HrmSyncLog, UUID> {
    Page<HrmSyncLog> findBySyncStatusOrderByCreatedAtDesc(String syncStatus, Pageable pageable);
    List<HrmSyncLog> findBySyncTypeAndSyncStatusIn(String syncType, List<String> statuses);
    long countBySyncStatus(String syncStatus);
}
