package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;
import uz.verifix.jobs.domain.enums.SocialPlatform;

@Entity
@Table(name = "branding_social_link")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingSocialLink extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform")
    private SocialPlatform platform;

    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
