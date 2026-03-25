package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import uz.verifix.jobs.api.dto.request.branding.BrandingBenefitRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingFaqRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingLocationRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingSocialLinkRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingStatsCounterRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingStoryRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingTestimonialRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingUpdateRequest;
import uz.verifix.jobs.api.dto.request.branding.BrandingVideoRequest;
import uz.verifix.jobs.api.dto.request.branding.ReorderRequest;
import uz.verifix.jobs.api.dto.response.branding.BrandingAnalyticsResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.branding.BrandingAnalytics;
import uz.verifix.jobs.domain.entity.branding.BrandingBenefit;
import uz.verifix.jobs.domain.entity.branding.BrandingCoverImage;
import uz.verifix.jobs.domain.entity.branding.BrandingFaq;
import uz.verifix.jobs.domain.entity.branding.BrandingGallery;
import uz.verifix.jobs.domain.entity.branding.BrandingGalleryImage;
import uz.verifix.jobs.domain.entity.branding.BrandingOfficeLocation;
import uz.verifix.jobs.domain.entity.branding.BrandingStory;
import uz.verifix.jobs.domain.entity.branding.BrandingTestimonial;
import uz.verifix.jobs.domain.entity.branding.BrandingVideo;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.enums.GalleryCategory;
import uz.verifix.jobs.service.branding.BrandingAnalyticsService;
import uz.verifix.jobs.service.branding.BrandingContentService;
import uz.verifix.jobs.service.branding.BrandingMediaService;
import uz.verifix.jobs.service.branding.BrandingQrService;
import uz.verifix.jobs.service.branding.BrandingService;

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

    @PostMapping
    public ResponseEntity<Map<String, UUID>> initBranding(
            @RequestParam(required = false) UUID employerId,
            Authentication auth) {
        EmployerBranding branding = brandingService.initBranding(resolveEmployerId(auth, employerId));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", branding.getId()));
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateBranding(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody BrandingUpdateRequest request,
            Authentication auth) {
        UUID authenticatedEmployerId = resolveEmployerId(auth, employerId);
        brandingService.updateBranding(authenticatedEmployerId, request.getCustomSlug(),
                request.getPrimaryColor(), request.getSecondaryColor(), request.getAccentColor(),
                request.getCoverType(), request.getDescriptionHtml(),
                request.getMetaTitle(), request.getMetaDescription());
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @PatchMapping("/publish")
    public ResponseEntity<Map<String, String>> publishBranding(
            @RequestParam(required = false) UUID employerId,
            Authentication auth) {
        brandingService.publishBranding(resolveEmployerId(auth, employerId));
        return ResponseEntity.ok(Map.of("status", "published"));
    }

    @PatchMapping("/unpublish")
    public ResponseEntity<Void> unpublishBranding(
            @RequestParam(required = false) UUID employerId,
            Authentication auth) {
        brandingService.unpublishBranding(resolveEmployerId(auth, employerId));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/covers")
    public ResponseEntity<Map<String, UUID>> uploadCover(
            @RequestParam(required = false) UUID employerId,
            @RequestParam MultipartFile file,
            Authentication auth) throws IOException {
        BrandingCoverImage cover = mediaService.uploadCoverImage(resolveEmployerId(auth, employerId), file);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", cover.getId()));
    }

    @DeleteMapping("/covers/{id}")
    public ResponseEntity<Void> deleteCover(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            Authentication auth) {
        mediaService.deleteCoverImage(resolveEmployerId(auth, employerId), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/covers/reorder")
    public ResponseEntity<Void> reorderCovers(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody ReorderRequest request,
            Authentication auth) {
        mediaService.reorderCovers(resolveEmployerId(auth, employerId), request.getOrderedIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/galleries")
    public ResponseEntity<Map<String, UUID>> createGallery(
            @RequestParam(required = false) UUID employerId,
            @RequestParam GalleryCategory category,
            @RequestParam(required = false) String title,
            Authentication auth) {
        BrandingGallery gallery = mediaService.createGallery(resolveEmployerId(auth, employerId), category, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", gallery.getId()));
    }

    @PostMapping("/galleries/{galleryId}/images")
    public ResponseEntity<Map<String, UUID>> uploadGalleryImage(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID galleryId,
            @RequestParam MultipartFile file,
            Authentication auth) throws IOException {
        BrandingGalleryImage image = mediaService.uploadGalleryImage(resolveEmployerId(auth, employerId), galleryId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", image.getId()));
    }

    @DeleteMapping("/galleries/{galleryId}/images/{imageId}")
    public ResponseEntity<Void> deleteGalleryImage(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID galleryId,
            @PathVariable UUID imageId,
            Authentication auth) {
        mediaService.deleteGalleryImage(resolveEmployerId(auth, employerId), galleryId, imageId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/videos")
    public ResponseEntity<Map<String, UUID>> addVideo(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody BrandingVideoRequest request,
            Authentication auth) {
        BrandingVideo video = mediaService.addVideo(resolveEmployerId(auth, employerId),
                request.getVideoType(), request.getVideoUrl(), request.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", video.getId()));
    }

    @DeleteMapping("/videos/{id}")
    public ResponseEntity<Void> deleteVideo(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            Authentication auth) {
        mediaService.deleteVideo(resolveEmployerId(auth, employerId), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/benefits")
    public ResponseEntity<Map<String, UUID>> addBenefit(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody BrandingBenefitRequest request,
            Authentication auth) {
        BrandingBenefit benefit = contentService.addBenefit(resolveEmployerId(auth, employerId), request.getIcon(),
                request.getTitleUz(), request.getTitleRu(), request.getDescriptionUz(),
                request.getDescriptionRu(), request.getImageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", benefit.getId()));
    }

    @PutMapping("/benefits/{id}")
    public ResponseEntity<Void> updateBenefit(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            @Valid @RequestBody BrandingBenefitRequest request,
            Authentication auth) {
        contentService.updateBenefit(resolveEmployerId(auth, employerId), id, request.getIcon(),
                request.getTitleUz(), request.getTitleRu(), request.getDescriptionUz(),
                request.getDescriptionRu(), request.getImageUrl());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/benefits/reorder")
    public ResponseEntity<Void> reorderBenefits(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody ReorderRequest request,
            Authentication auth) {
        contentService.reorderBenefits(resolveEmployerId(auth, employerId), request.getOrderedIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/testimonials")
    public ResponseEntity<Map<String, UUID>> addTestimonial(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody BrandingTestimonialRequest request,
            Authentication auth) {
        BrandingTestimonial testimonial = contentService.addTestimonial(resolveEmployerId(auth, employerId), request.getEmployeeName(),
                request.getEmployeePosition(), request.getEmployeePhotoUrl(),
                request.getTextUz(), request.getTextRu());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", testimonial.getId()));
    }

    @DeleteMapping("/testimonials/{id}")
    public ResponseEntity<Void> deleteTestimonial(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            Authentication auth) {
        contentService.deleteTestimonial(resolveEmployerId(auth, employerId), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/stories")
    public ResponseEntity<Map<String, UUID>> createStory(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody BrandingStoryRequest request,
            Authentication auth) {
        BrandingStory story = contentService.createStory(resolveEmployerId(auth, employerId), request.getTitle(),
                request.getContentHtml(), request.getCoverImageUrl(),
                request.getAuthorName(), request.getAuthorPhotoUrl(), request.getAuthorPosition());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", story.getId()));
    }

    @PutMapping("/stories/{id}")
    public ResponseEntity<Void> updateStory(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            @Valid @RequestBody BrandingStoryRequest request,
            Authentication auth) {
        contentService.updateStory(resolveEmployerId(auth, employerId), id, request.getTitle(),
                request.getContentHtml(), request.getCoverImageUrl(), request.getAuthorName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/stories/{id}/publish")
    public ResponseEntity<Void> publishStory(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            @RequestParam boolean publish,
            Authentication auth) {
        contentService.publishStory(resolveEmployerId(auth, employerId), id, publish);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/faqs")
    public ResponseEntity<Map<String, UUID>> addFaq(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody BrandingFaqRequest request,
            Authentication auth) {
        BrandingFaq faq = contentService.addFaq(resolveEmployerId(auth, employerId), request.getQuestionUz(),
                request.getQuestionRu(), request.getAnswerUz(), request.getAnswerRu());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", faq.getId()));
    }

    @PutMapping("/faqs/reorder")
    public ResponseEntity<Void> reorderFaqs(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody ReorderRequest request,
            Authentication auth) {
        contentService.reorderFaqs(resolveEmployerId(auth, employerId), request.getOrderedIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/locations")
    public ResponseEntity<Map<String, UUID>> addLocation(
            @RequestParam(required = false) UUID employerId,
            @Valid @RequestBody BrandingLocationRequest request,
            Authentication auth) {
        BrandingOfficeLocation location = contentService.addLocation(resolveEmployerId(auth, employerId), request.getName(),
                request.getAddress(), request.getCity(), request.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", location.getId()));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<Void> deleteLocation(
            @RequestParam(required = false) UUID employerId,
            @PathVariable UUID id,
            Authentication auth) {
        contentService.deleteLocation(resolveEmployerId(auth, employerId), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/social-links")
    public ResponseEntity<Void> updateSocialLinks(
            @RequestParam(required = false) UUID employerId,
            @RequestBody List<BrandingSocialLinkRequest> links,
            Authentication auth) {
        contentService.updateSocialLinks(resolveEmployerId(auth, employerId),
                links.stream().map(link -> new BrandingContentService.SocialLinkInput(link.getPlatform(), link.getUrl())).toList());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/stats")
    public ResponseEntity<Void> updateStats(
            @RequestParam(required = false) UUID employerId,
            @RequestBody List<BrandingStatsCounterRequest> counters,
            Authentication auth) {
        contentService.updateStatsCounters(resolveEmployerId(auth, employerId),
                counters.stream().map(counter -> new BrandingContentService.StatsCounterInput(
                        counter.getLabelUz(), counter.getLabelRu(), counter.getValue(), counter.getIcon())).toList());
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateQr(
            @RequestParam(required = false) UUID employerId,
            Authentication auth) {
        byte[] qr = qrService.generateQr(resolveEmployerId(auth, employerId));
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(qr);
    }

    @GetMapping("/analytics")
    public ResponseEntity<BrandingAnalyticsResponse> getAnalytics(
            @RequestParam(required = false) UUID employerId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            Authentication auth) {
        UUID authenticatedEmployerId = resolveEmployerId(auth, employerId);
        if (from == null) {
            from = LocalDate.now().minusDays(30);
        }
        if (to == null) {
            to = LocalDate.now();
        }

        List<BrandingAnalytics> data = analyticsService.getAnalytics(authenticatedEmployerId, from, to);
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
                .dailyData(data.stream().map(day -> BrandingAnalyticsResponse.DailyData.builder()
                        .date(day.getDate())
                        .pageViews(day.getPageViews())
                        .uniqueVisitors(day.getUniqueVisitors())
                        .vacancyClicks(day.getVacancyClicks())
                        .applyClicks(day.getApplyClicks())
                        .build()).toList())
                .build());
    }

    private UUID resolveEmployerId(Authentication auth, UUID employerId) {
        return SecurityUtils.enforceEmployerAccess(auth, employerId);
    }
}

