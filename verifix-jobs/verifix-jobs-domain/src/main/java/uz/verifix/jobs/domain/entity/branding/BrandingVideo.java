package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;
import uz.verifix.jobs.domain.enums.VideoType;

@Entity
@Table(name = "branding_video")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingVideo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Enumerated(EnumType.STRING)
    @Column(name = "video_type")
    private VideoType videoType;

    @Column(name = "video_url", nullable = false, length = 1000)
    private String videoUrl;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
