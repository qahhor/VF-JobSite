package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;
import uz.verifix.jobs.domain.enums.GalleryCategory;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "branding_gallery")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingGallery extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private GalleryCategory category;

    @Column(name = "title", length = 200)
    private String title;

    @OneToMany(mappedBy = "gallery", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingGalleryImage> images = new ArrayList<>();
}
