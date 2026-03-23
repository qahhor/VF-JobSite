package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "ml_candidate_score", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"candidate_id", "vacancy_id", "model_version"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlCandidateScore extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;

    @Column(name = "match_score", nullable = false, precision = 5, scale = 4)
    private BigDecimal matchScore;

    @Column(name = "factors_json", columnDefinition = "jsonb")
    private String factorsJson;

    @Column(name = "model_version", nullable = false)
    private String modelVersion;

    @Column(name = "scored_at")
    private Instant scoredAt;
}
