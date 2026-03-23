package uz.verifix.jobs.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.branding.BrandingEventRequest;
import uz.verifix.jobs.api.dto.response.VacancyResponse;
import uz.verifix.jobs.api.dto.response.branding.BrandingPageResponse;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.entity.branding.*;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.service.branding.BrandingAnalyticsService;
import uz.verifix.jobs.service.branding.BrandingSeoService;
import uz.verifix.jobs.service.branding.BrandingService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/company")
@RequiredArgsConstructor
public class CompanyPageController {

    private final BrandingService brandingService;
    private final BrandingSeoService seoService;
    private final BrandingAnalyticsService analyticsService;
    private final VacancyRepository vacancyRepository;

    @GetMapping("/{slug}")
    public ResponseEntity<BrandingPageResponse> getCompanyPage(@PathVariable String slug) {
        EmployerBranding branding = brandingService.getBrandingPage(slug);
        return ResponseEntity.ok(toBrandingPageResponse(branding));
    }

    @GetMapping("/{slug}/vacancies")
    public ResponseEntity<Page<VacancyResponse>> getCompanyVacancies(
            @PathVariable String slug, Pageable pageable) {
        EmployerBranding branding = brandingService.getBrandingPage(slug);
        Page<Vacancy> vacancies = vacancyRepository.findByEmployerIdAndStatus(
                branding.getEmployer().getId(), VacancyStatus.ACTIVE, pageable);
        return ResponseEntity.ok(vacancies.map(this::toVacancyResponse));
    }

    @PostMapping("/events")
    public ResponseEntity<Void> trackEvent(@Valid @RequestBody BrandingEventRequest request,
                                            HttpServletRequest httpRequest) {
        analyticsService.trackEvent(request.getBrandingId(), request.getEventType(),
                request.getSectionId(), request.getVisitorId(), request.getSource(),
                httpRequest.getHeader("User-Agent"));
        return ResponseEntity.ok().build();
    }

    private BrandingPageResponse toBrandingPageResponse(EmployerBranding b) {
        return BrandingPageResponse.builder()
                .id(b.getId())
                .employerId(b.getEmployer().getId())
                .employerName(b.getEmployer().getName())
                .logoUrl(b.getEmployer().getLogoUrl())
                .tier(b.getTier().name())
                .customSlug(b.getCustomSlug())
                .primaryColor(b.getPrimaryColor())
                .secondaryColor(b.getSecondaryColor())
                .accentColor(b.getAccentColor())
                .coverType(b.getCoverType().name())
                .descriptionHtml(b.getDescriptionHtml())
                .metaTitle(b.getMetaTitle())
                .metaDescription(b.getMetaDescription())
                .industry(b.getEmployer().getIndustry())
                .city(b.getEmployer().getCity())
                .isPublished(Boolean.TRUE.equals(b.getIsPublished()))
                .publishedAt(b.getPublishedAt())
                .coverImages(b.getCoverImages().stream().map(c -> BrandingPageResponse.CoverImageDto.builder()
                        .id(c.getId()).imageUrl(c.getImageUrl()).sortOrder(c.getSortOrder()).altText(c.getAltText()).build()).toList())
                .galleries(b.getGalleries().stream().map(g -> BrandingPageResponse.GalleryDto.builder()
                        .id(g.getId()).category(g.getCategory().name()).title(g.getTitle())
                        .images(g.getImages().stream().map(i -> BrandingPageResponse.GalleryImageDto.builder()
                                .id(i.getId()).imageUrl(i.getImageUrl()).caption(i.getCaption()).sortOrder(i.getSortOrder()).build()).toList())
                        .build()).toList())
                .videos(b.getVideos().stream().map(v -> BrandingPageResponse.VideoDto.builder()
                        .id(v.getId()).videoType(v.getVideoType().name()).videoUrl(v.getVideoUrl())
                        .thumbnailUrl(v.getThumbnailUrl()).title(v.getTitle()).durationSeconds(v.getDurationSeconds()).build()).toList())
                .benefits(b.getBenefits().stream().map(bn -> BrandingPageResponse.BenefitDto.builder()
                        .id(bn.getId()).icon(bn.getIcon()).titleUz(bn.getTitleUz()).titleRu(bn.getTitleRu())
                        .descriptionUz(bn.getDescriptionUz()).descriptionRu(bn.getDescriptionRu()).imageUrl(bn.getImageUrl()).build()).toList())
                .testimonials(b.getTestimonials().stream().map(t -> BrandingPageResponse.TestimonialDto.builder()
                        .id(t.getId()).employeeName(t.getEmployeeName()).employeePosition(t.getEmployeePosition())
                        .employeePhotoUrl(t.getEmployeePhotoUrl()).textUz(t.getTextUz()).textRu(t.getTextRu())
                        .isVerified(Boolean.TRUE.equals(t.getIsVerified())).build()).toList())
                .stories(b.getStories().stream().filter(s -> Boolean.TRUE.equals(s.getIsPublished()))
                        .map(s -> BrandingPageResponse.StoryDto.builder()
                                .id(s.getId()).title(s.getTitle()).contentHtml(s.getContentHtml())
                                .coverImageUrl(s.getCoverImageUrl()).authorName(s.getAuthorName())
                                .authorPhotoUrl(s.getAuthorPhotoUrl()).authorPosition(s.getAuthorPosition())
                                .publishedAt(s.getPublishedAt()).isPublished(true).build()).toList())
                .faqs(b.getFaqs().stream().map(f -> BrandingPageResponse.FaqDto.builder()
                        .id(f.getId()).questionUz(f.getQuestionUz()).questionRu(f.getQuestionRu())
                        .answerUz(f.getAnswerUz()).answerRu(f.getAnswerRu()).build()).toList())
                .officeLocations(b.getOfficeLocations().stream().map(l -> BrandingPageResponse.OfficeLocationDto.builder()
                        .id(l.getId()).name(l.getName()).address(l.getAddress()).city(l.getCity())
                        .type(l.getType() != null ? l.getType().name() : null)
                        .latitude(l.getLocation() != null ? l.getLocation().getY() : null)
                        .longitude(l.getLocation() != null ? l.getLocation().getX() : null).build()).toList())
                .socialLinks(b.getSocialLinks().stream().map(sl -> BrandingPageResponse.SocialLinkDto.builder()
                        .id(sl.getId()).platform(sl.getPlatform().name()).url(sl.getUrl()).build()).toList())
                .statsCounters(b.getStatsCounters().stream().map(sc -> BrandingPageResponse.StatsCounterDto.builder()
                        .id(sc.getId()).labelUz(sc.getLabelUz()).labelRu(sc.getLabelRu())
                        .value(sc.getValue()).icon(sc.getIcon()).build()).toList())
                .jsonLd(seoService.generateJsonLd(b))
                .ogTags(seoService.generateOgTags(b))
                .build();
    }

    private VacancyResponse toVacancyResponse(Vacancy v) {
        return VacancyResponse.builder()
                .id(v.getId())
                .title(v.getTitle())
                .description(v.getDescription())
                .category(v.getCategory())
                .city(v.getCity())
                .salaryFrom(v.getSalaryFrom())
                .salaryTo(v.getSalaryTo())
                .currency(v.getCurrency())
                .employmentType(v.getEmploymentType() != null ? v.getEmploymentType().name() : null)
                .status(v.getStatus().name())
                .build();
    }
}
