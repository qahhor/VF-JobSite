package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uz.verifix.jobs.domain.enums.GovSyncSource;
import uz.verifix.jobs.domain.enums.SyncDirection;
import uz.verifix.jobs.domain.enums.SyncStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "gov_sync_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GovSyncLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private GovSyncSource source;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false)
    private SyncDirection direction;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_status", nullable = false)
    @Builder.Default
    private SyncStatus syncStatus = SyncStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @Column(name = "synced_at")
    private Instant syncedAt;
}
