package uz.verifix.jobs.api.dto.response.branding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BrandingPageResponse {
    private UUID id;
    private UUID employerId;
    private String employerName;
    private String logoUrl;
    private String tier;
    private String customSlug;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String coverType;
    private String descriptionHtml;
    private String metaTitle;
    private String metaDescription;
    private String industry;
    private String city;
    private boolean isPublished;
    private Instant publishedAt;

    // Nested sections
    private List<CoverImageDto> coverImages;
    private List<GalleryDto> galleries;
    private List<VideoDto> videos;
    private List<BenefitDto> benefits;
    private List<TestimonialDto> testimonials;
    private List<StoryDto> stories;
    private List<FaqDto> faqs;
    private List<OfficeLocationDto> officeLocations;
    private List<SocialLinkDto> socialLinks;
    private List<StatsCounterDto> statsCounters;

    // SEO
    private Map<String, Object> jsonLd;
    private Map<String, String> ogTags;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CoverImageDto {
        private UUID id; private String imageUrl; private int sortOrder; private String altText;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class GalleryDto {
        private UUID id; private String category; private String title; private List<GalleryImageDto> images;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class GalleryImageDto {
        private UUID id; private String imageUrl; private String caption; private int sortOrder;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VideoDto {
        private UUID id; private String videoType; private String videoUrl;
        private String thumbnailUrl; private String title; private Integer durationSeconds;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BenefitDto {
        private UUID id; private String icon; private String titleUz; private String titleRu;
        private String descriptionUz; private String descriptionRu; private String imageUrl;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TestimonialDto {
        private UUID id; private String employeeName; private String employeePosition;
        private String employeePhotoUrl; private String textUz; private String textRu; private boolean isVerified;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StoryDto {
        private UUID id; private String title; private String contentHtml; private String coverImageUrl;
        private String authorName; private String authorPhotoUrl; private String authorPosition;
        private Instant publishedAt; private boolean isPublished;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FaqDto {
        private UUID id; private String questionUz; private String questionRu;
        private String answerUz; private String answerRu;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OfficeLocationDto {
        private UUID id; private String name; private String address; private String city;
        private String type; private Double latitude; private Double longitude;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SocialLinkDto {
        private UUID id; private String platform; private String url;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatsCounterDto {
        private UUID id; private String labelUz; private String labelRu; private String value; private String icon;
    }
}
