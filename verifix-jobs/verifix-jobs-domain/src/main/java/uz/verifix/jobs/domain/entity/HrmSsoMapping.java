package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hrm_sso_mapping")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrmSsoMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hrm_company_id", nullable = false)
    private Long hrmCompanyId;

    @Column(name = "hrm_user_id", nullable = false)
    private Long hrmUserId;

    @Column(name = "jobs_employer_id")
    private UUID jobsEmployerId;

    @Column(name = "jobs_manager_id")
    private UUID jobsManagerId;

    @Column(name = "hrm_username", length = 200)
    private String hrmUsername;

    @Column(name = "hrm_full_name", length = 300)
    private String hrmFullName;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
