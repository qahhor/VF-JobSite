package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "hrm_sync_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrmSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sync_type", nullable = false, length = 50)
    private String syncType;

    @Column(name = "direction", nullable = false, length = 10)
    private String direction;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "jobs_entity_id")
    private UUID jobsEntityId;

    @Column(name = "hrm_entity_id", length = 100)
    private String hrmEntityId;

    @Builder.Default
    @Column(name = "sync_status", nullable = false, length = 20)
    private String syncStatus = "PENDING";

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private Map<String, Object> payload;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "synced_at")
    private Instant syncedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
