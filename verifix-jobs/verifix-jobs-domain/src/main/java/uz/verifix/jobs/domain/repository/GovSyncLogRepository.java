package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.GovSyncLog;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GovSyncLogRepository extends JpaRepository<GovSyncLog, UUID> {

    Optional<GovSyncLog> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);
}
