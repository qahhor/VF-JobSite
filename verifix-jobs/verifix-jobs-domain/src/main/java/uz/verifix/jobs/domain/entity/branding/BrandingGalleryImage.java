package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;

@Entity
@Table(name = "branding_gallery_image")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingGalleryImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id", nullable = false)
    private BrandingGallery gallery;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "caption", length = 500)
    private String caption;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
