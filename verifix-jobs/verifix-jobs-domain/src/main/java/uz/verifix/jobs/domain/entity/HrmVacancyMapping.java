package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hrm_vacancy_mapping")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrmVacancyMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hrm_company_id", nullable = false, length = 100)
    private String hrmCompanyId;

    @Column(name = "hrm_vacancy_id", nullable = false)
    private Long hrmVacancyId;

    @Column(name = "jobs_vacancy_id", nullable = false)
    private UUID jobsVacancyId;

    @Column(name = "last_modified_id")
    private Long lastModifiedId;

    @Builder.Default
    @Column(name = "sync_direction", length = 20)
    private String syncDirection = "HRM_TO_JOBS";

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
