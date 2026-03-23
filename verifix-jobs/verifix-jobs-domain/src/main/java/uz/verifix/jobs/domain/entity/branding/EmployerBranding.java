package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.entity.BaseEntity;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.BrandingTier;
import uz.verifix.jobs.domain.enums.CoverType;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employer_branding")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerBranding extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false, unique = true)
    private Employer employer;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false)
    @Builder.Default
    private BrandingTier tier = BrandingTier.BASIC;

    @Column(name = "custom_slug", unique = true, length = 100)
    private String customSlug;

    @Column(name = "primary_color", length = 7)
    @Builder.Default
    private String primaryColor = "#1B5E8C";

    @Column(name = "secondary_color", length = 7)
    @Builder.Default
    private String secondaryColor = "#2ECC71";

    @Column(name = "accent_color", length = 7)
    @Builder.Default
    private String accentColor = "#F39C12";

    @Enumerated(EnumType.STRING)
    @Column(name = "cover_type")
    @Builder.Default
    private CoverType coverType = CoverType.SINGLE;

    @Column(name = "description_html", columnDefinition = "text")
    private String descriptionHtml;

    @Column(name = "meta_title", length = 200)
    private String metaTitle;

    @Column(name = "meta_description", length = 500)
    private String metaDescription;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "published_at")
    private Instant publishedAt;

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingCoverImage> coverImages = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingGallery> galleries = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingVideo> videos = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingBenefit> benefits = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingTestimonial> testimonials = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingStory> stories = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingFaq> faqs = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingOfficeLocation> officeLocations = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingSocialLink> socialLinks = new ArrayList<>();

    @OneToMany(mappedBy = "branding", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BrandingStatsCounter> statsCounters = new ArrayList<>();
}
