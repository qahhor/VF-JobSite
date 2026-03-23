package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;

@Entity
@Table(name = "branding_benefit")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingBenefit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Column(name = "icon", nullable = false, length = 50)
    private String icon;

    @Column(name = "title_uz", length = 200)
    private String titleUz;

    @Column(name = "title_ru", length = 200)
    private String titleRu;

    @Column(name = "description_uz", columnDefinition = "text")
    private String descriptionUz;

    @Column(name = "description_ru", columnDefinition = "text")
    private String descriptionRu;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
