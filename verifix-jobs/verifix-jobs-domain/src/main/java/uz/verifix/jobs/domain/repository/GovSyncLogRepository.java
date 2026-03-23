package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.GovSyncLog;
import uz.verifix.jobs.domain.enums.GovSyncSource;
import uz.verifix.jobs.domain.enums.SyncStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GovSyncLogRepository extends JpaRepository<GovSyncLog, UUID> {

    Optional<GovSyncLog> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);

    List<GovSyncLog> findBySourceInAndSyncStatus(List<GovSyncSource> sources, SyncStatus status);

    Page<GovSyncLog> findBySourceOrderByCreatedAtDesc(GovSyncSource source, Pageable pageable);

    long countBySourceAndSyncStatus(GovSyncSource source, SyncStatus status);
}
