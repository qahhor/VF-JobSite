package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;

import java.time.Instant;

@Entity
@Table(name = "branding_story")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingStory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "content_html", columnDefinition = "text")
    private String contentHtml;

    @Column(name = "cover_image_url", length = 1000)
    private String coverImageUrl;

    @Column(name = "author_name", length = 200)
    private String authorName;

    @Column(name = "author_photo_url", length = 1000)
    private String authorPhotoUrl;

    @Column(name = "author_position", length = 200)
    private String authorPosition;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;
}
