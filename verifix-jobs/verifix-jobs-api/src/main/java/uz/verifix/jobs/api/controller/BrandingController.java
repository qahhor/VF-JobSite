package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.verifix.jobs.api.dto.request.branding.*;
import uz.verifix.jobs.api.dto.response.branding.BrandingAnalyticsResponse;
import uz.verifix.jobs.domain.entity.branding.*;
import uz.verifix.jobs.domain.enums.GalleryCategory;
import uz.verifix.jobs.service.branding.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/branding")
@RequiredArgsConstructor
public class BrandingController {

    private final BrandingService brandingService;
    private final BrandingMediaService mediaService;
    private final BrandingContentService contentService;
    private final BrandingAnalyticsService analyticsService;
    private final BrandingQrService qrService;

    // ==================== BRANDING CRUD ====================

    @PostMapping
    public ResponseEntity<Map<String, UUID>> initBranding(@RequestParam UUID employerId) {
        EmployerBranding branding = brandingService.initBranding(employerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", branding.getId()));
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateBranding(
            @RequestParam UUID employerId, @Valid @RequestBody BrandingUpdateRequest request) {
        brandingService.updateBranding(employerId, request.getCustomSlug(),
                request.getPrimaryColor(), request.getSecondaryColor(), request.getAccentColor(),
                request.getCoverType(), request.getDescriptionHtml(),
                request.getMetaTitle(), request.getMetaDescription());
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @PatchMapping("/publish")
    public ResponseEntity<Map<String, String>> publishBranding(@RequestParam UUID employerId) {
        brandingService.publishBranding(employerId);
        return ResponseEntity.ok(Map.of("status", "published"));
    }

    @PatchMapping("/unpublish")
    public ResponseEntity<Void> unpublishBranding(@RequestParam UUID employerId) {
        brandingService.unpublishBranding(employerId);
        return ResponseEntity.noContent().build();
    }

    // ==================== COVERS ====================

    @PostMapping("/covers")
    public ResponseEntity<Map<String, UUID>> uploadCover(
            @RequestParam UUID employerId, @RequestParam MultipartFile file) throws IOException {
        BrandingCoverImage cover = mediaService.uploadCoverImage(employerId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", cover.getId()));
    }

    @DeleteMapping("/covers/{id}")
    public ResponseEntity<Void> deleteCover(@RequestParam UUID employerId, @PathVariable UUID id) {
        mediaService.deleteCoverImage(employerId, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/covers/reorder")
    public ResponseEntity<Void> reorderCovers(
            @RequestParam UUID employerId, @Valid @RequestBody ReorderRequest request) {
        mediaService.reorderCovers(employerId, request.getOrderedIds());
        return ResponseEntity.ok().build();
    }

    // ==================== GALLERIES ====================

    @PostMapping("/galleries")
    public ResponseEntity<Map<String, UUID>> createGallery(
            @RequestParam UUID employerId, @RequestParam GalleryCategory category,
            @RequestParam(required = false) String title) {
        BrandingGallery gallery = mediaService.createGallery(employerId, category, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", gallery.getId()));
    }

    @PostMapping("/galleries/{galleryId}/images")
    public ResponseEntity<Map<String, UUID>> uploadGalleryImage(
            @RequestParam UUID employerId, @PathVariable UUID galleryId,
            @RequestParam MultipartFile file) throws IOException {
        BrandingGalleryImage image = mediaService.uploadGalleryImage(employerId, galleryId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", image.getId()));
    }

    @DeleteMapping("/galleries/{galleryId}/images/{imageId}")
    public ResponseEntity<Void> deleteGalleryImage(
            @RequestParam UUID employerId, @PathVariable UUID galleryId, @PathVariable UUID imageId) {
        mediaService.deleteGalleryImage(employerId, galleryId, imageId);
        return ResponseEntity.noContent().build();
    }

    // ==================== VIDEOS ====================

    @PostMapping("/videos")
    public ResponseEntity<Map<String, UUID>> addVideo(
            @RequestParam UUID employerId, @Valid @RequestBody BrandingVideoRequest request) {
        BrandingVideo video = mediaService.addVideo(employerId, request.getVideoType(), request.getVideoUrl(), request.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", video.getId()));
    }

    @DeleteMapping("/videos/{id}")
    public ResponseEntity<Void> deleteVideo(@RequestParam UUID employerId, @PathVariable UUID id) {
        mediaService.deleteVideo(employerId, id);
        return ResponseEntity.noContent().build();
    }

    // ==================== BENEFITS ====================

    @PostMapping("/benefits")
    public ResponseEntity<Map<String, UUID>> addBenefit(
            @RequestParam UUID employerId, @Valid @RequestBody BrandingBenefitRequest request) {
        BrandingBenefit benefit = contentService.addBenefit(employerId, request.getIcon(),
                request.getTitleUz(), request.getTitleRu(), request.getDescriptionUz(),
                request.getDescriptionRu(), request.getImageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", benefit.getId()));
    }

    @PutMapping("/benefits/{id}")
    public ResponseEntity<Void> updateBenefit(
            @RequestParam UUID employerId, @PathVariable UUID id,
            @Valid @RequestBody BrandingBenefitRequest request) {
        contentService.updateBenefit(employerId, id, request.getIcon(),
                request.getTitleUz(), request.getTitleRu(), request.getDescriptionUz(),
                request.getDescriptionRu(), request.getImageUrl());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/benefits/reorder")
    public ResponseEntity<Void> reorderBenefits(
            @RequestParam UUID employerId, @Valid @RequestBody ReorderRequest request) {
        contentService.reorderBenefits(employerId, request.getOrderedIds());
        return ResponseEntity.ok().build();
    }

    // ==================== TESTIMONIALS ====================

    @PostMapping("/testimonials")
    public ResponseEntity<Map<String, UUID>> addTestimonial(
            @RequestParam UUID employerId, @Valid @RequestBody BrandingTestimonialRequest request) {
        BrandingTestimonial t = contentService.addTestimonial(employerId, request.getEmployeeName(),
                request.getEmployeePosition(), request.getEmployeePhotoUrl(),
                request.getTextUz(), request.getTextRu());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", t.getId()));
    }

    @DeleteMapping("/testimonials/{id}")
    public ResponseEntity<Void> deleteTestimonial(@RequestParam UUID employerId, @PathVariable UUID id) {
        contentService.deleteTestimonial(employerId, id);
        return ResponseEntity.noContent().build();
    }

    // ==================== STORIES ====================

    @PostMapping("/stories")
    public ResponseEntity<Map<String, UUID>> createStory(
            @RequestParam UUID employerId, @Valid @RequestBody BrandingStoryRequest request) {
        BrandingStory story = contentService.createStory(employerId, request.getTitle(),
                request.getContentHtml(), request.getCoverImageUrl(),
                request.getAuthorName(), request.getAuthorPhotoUrl(), request.getAuthorPosition());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", story.getId()));
    }

    @PutMapping("/stories/{id}")
    public ResponseEntity<Void> updateStory(
            @RequestParam UUID employerId, @PathVariable UUID id,
            @Valid @RequestBody BrandingStoryRequest request) {
        contentService.updateStory(employerId, id, request.getTitle(),
                request.getContentHtml(), request.getCoverImageUrl(), request.getAuthorName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/stories/{id}/publish")
    public ResponseEntity<Void> publishStory(
            @RequestParam UUID employerId, @PathVariable UUID id, @RequestParam boolean publish) {
        contentService.publishStory(employerId, id, publish);
        return ResponseEntity.ok().build();
    }

    // ==================== FAQ ====================

    @PostMapping("/faqs")
    public ResponseEntity<Map<String, UUID>> addFaq(
            @RequestParam UUID employerId, @Valid @RequestBody BrandingFaqRequest request) {
        BrandingFaq faq = contentService.addFaq(employerId, request.getQuestionUz(),
                request.getQuestionRu(), request.getAnswerUz(), request.getAnswerRu());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", faq.getId()));
    }

    @PutMapping("/faqs/reorder")
    public ResponseEntity<Void> reorderFaqs(
            @RequestParam UUID employerId, @Valid @RequestBody ReorderRequest request) {
        contentService.reorderFaqs(employerId, request.getOrderedIds());
        return ResponseEntity.ok().build();
    }

    // ==================== LOCATIONS ====================

    @PostMapping("/locations")
    public ResponseEntity<Map<String, UUID>> addLocation(
            @RequestParam UUID employerId, @Valid @RequestBody BrandingLocationRequest request) {
        BrandingOfficeLocation loc = contentService.addLocation(employerId, request.getName(),
                request.getAddress(), request.getCity(), request.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", loc.getId()));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<Void> deleteLocation(@RequestParam UUID employerId, @PathVariable UUID id) {
        contentService.deleteLocation(employerId, id);
        return ResponseEntity.noContent().build();
    }

    // ==================== SOCIAL LINKS ====================

    @PutMapping("/social-links")
    public ResponseEntity<Void> updateSocialLinks(
            @RequestParam UUID employerId, @RequestBody List<BrandingSocialLinkRequest> links) {
        contentService.updateSocialLinks(employerId,
                links.stream().map(l -> new BrandingContentService.SocialLinkInput(l.getPlatform(), l.getUrl())).toList());
        return ResponseEntity.ok().build();
    }

    // ==================== STATS COUNTERS ====================

    @PutMapping("/stats")
    public ResponseEntity<Void> updateStats(
            @RequestParam UUID employerId, @RequestBody List<BrandingStatsCounterRequest> counters) {
        contentService.updateStatsCounters(employerId,
                counters.stream().map(c -> new BrandingContentService.StatsCounterInput(
                        c.getLabelUz(), c.getLabelRu(), c.getValue(), c.getIcon())).toList());
        return ResponseEntity.ok().build();
    }

    // ==================== QR ====================

    @GetMapping(value = "/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateQr(@RequestParam UUID employerId) {
        byte[] qr = qrService.generateQr(employerId);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(qr);
    }

    // ==================== ANALYTICS ====================

    @GetMapping("/analytics")
    public ResponseEntity<BrandingAnalyticsResponse> getAnalytics(
            @RequestParam UUID employerId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to == null) to = LocalDate.now();

        List<BrandingAnalytics> data = analyticsService.getAnalytics(employerId, from, to);
        long totalViews = data.stream().mapToInt(BrandingAnalytics::getPageViews).sum();
        long totalVisitors = data.stream().mapToInt(BrandingAnalytics::getUniqueVisitors).sum();
        long totalClicks = data.stream().mapToInt(BrandingAnalytics::getVacancyClicks).sum();
        long totalApplies = data.stream().mapToInt(BrandingAnalytics::getApplyClicks).sum();

        return ResponseEntity.ok(BrandingAnalyticsResponse.builder()
                .totalPageViews(totalViews)
                .totalUniqueVisitors(totalVisitors)
                .totalVacancyClicks(totalClicks)
                .totalApplyClicks(totalApplies)
                .conversionRate(totalViews > 0 ? (double) totalApplies / totalViews * 100 : 0)
                .dailyData(data.stream().map(d -> BrandingAnalyticsResponse.DailyData.builder()
                        .date(d.getDate()).pageViews(d.getPageViews()).uniqueVisitors(d.getUniqueVisitors())
                        .vacancyClicks(d.getVacancyClicks()).applyClicks(d.getApplyClicks()).build()).toList())
                .build());
    }
}
