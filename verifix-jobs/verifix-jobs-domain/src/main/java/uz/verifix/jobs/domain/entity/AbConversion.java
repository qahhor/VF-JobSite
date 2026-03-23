package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "ab_conversion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbConversion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    private AbExperiment experiment;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "variant", nullable = false, length = 10)
    private String variant;

    @Builder.Default
    @Column(name = "converted", nullable = false)
    private boolean converted = false;
}
