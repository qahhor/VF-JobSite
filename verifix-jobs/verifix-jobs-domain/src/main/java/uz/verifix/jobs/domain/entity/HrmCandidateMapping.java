package uz.verifix.jobs.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hrm_candidate_mapping")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrmCandidateMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "jobs_candidate_id", nullable = false)
    private UUID jobsCandidateId;

    @Column(name = "hrm_company_id", nullable = false, length = 100)
    private String hrmCompanyId;

    @Column(name = "hrm_candidate_id", nullable = false, length = 100)
    private String hrmCandidateId;

    @Column(name = "synced_at")
    private Instant syncedAt;

    @PrePersist
    void prePersist() {
        if (syncedAt == null) syncedAt = Instant.now();
    }
}
