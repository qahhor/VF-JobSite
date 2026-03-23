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
import uz.verifix.jobs.domain.enums.UserType;
import uz.verifix.jobs.domain.enums.VerificationMethod;
import uz.verifix.jobs.domain.enums.VerificationStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private UserType entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false)
    private VerificationMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "response_json", columnDefinition = "jsonb")
    private String responseJson;

    @Column(name = "verified_at")
    private Instant verifiedAt;
}
