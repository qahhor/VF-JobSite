package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "fraud_alert")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FraudAlert extends BaseEntity {

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "fraud_type", nullable = false)
    private String fraudType;

    @Column(name = "score", precision = 3, scale = 2)
    private BigDecimal score;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "flags", columnDefinition = "jsonb")
    private String flags;

    @Column(name = "reviewed")
    @Builder.Default
    private Boolean reviewed = false;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;
}
