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
import uz.verifix.jobs.domain.enums.ConsentType;
import uz.verifix.jobs.domain.enums.UserType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "consent_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentLog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false)
    private ConsentType consentType;

    @Column(name = "version")
    private String version;

    @Column(name = "given_at", nullable = false)
    private Instant givenAt;

    @Column(name = "withdrawn_at")
    private Instant withdrawnAt;

    @Column(name = "ip_address")
    private String ipAddress;
}
