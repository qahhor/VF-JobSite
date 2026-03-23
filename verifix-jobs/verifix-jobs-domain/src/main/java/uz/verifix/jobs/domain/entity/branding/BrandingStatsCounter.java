package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;

@Entity
@Table(name = "branding_stats_counter")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingStatsCounter extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Column(name = "label_uz", length = 100)
    private String labelUz;

    @Column(name = "label_ru", length = 100)
    private String labelRu;

    @Column(name = "value", length = 50)
    private String value;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
