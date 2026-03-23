package uz.verifix.jobs.service.branding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.branding.*;
import uz.verifix.jobs.domain.enums.BrandingTier;
import uz.verifix.jobs.domain.enums.OfficeLocationType;
import uz.verifix.jobs.domain.enums.SocialPlatform;
import uz.verifix.jobs.domain.repository.branding.*;
import uz.verifix.jobs.service.geo.GeoService;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandingContentService {

    private final EmployerBrandingRepository brandingRepository;
    private final BrandingBenefitRepository benefitRepository;
    private final BrandingTestimonialRepository testimonialRepository;
    private final BrandingStoryRepository storyRepository;
    private final BrandingFaqRepository faqRepository;
    private final BrandingOfficeLocationRepository locationRepository;
    private final BrandingSocialLinkRepository socialLinkRepository;
    private final BrandingStatsCounterRepository statsCounterRepository;
    private final GeoService geoService;

    // ==================== BENEFITS ====================

    @Transactional
    public BrandingBenefit addBenefit(UUID employerId, String icon, String titleUz, String titleRu,
                                       String descUz, String descRu, String imageUrl) {
        EmployerBranding branding = getByEmployer(employerId);
        BrandingBenefit benefit = BrandingBenefit.builder()
                .branding(branding)
                .icon(icon).titleUz(titleUz).titleRu(titleRu)
                .descriptionUz(descUz).descriptionRu(descRu)
                .imageUrl(imageUrl)
                .build();
        return benefitRepository.save(benefit);
    }

    @Transactional
    public BrandingBenefit updateBenefit(UUID employerId, UUID benefitId, String icon, String titleUz, String titleRu,
                                          String descUz, String descRu, String imageUrl) {
        getByEmployer(employerId);
        BrandingBenefit benefit = benefitRepository.findById(benefitId)
                .orElseThrow(() -> new ResourceNotFoundException("Benefit", benefitId.toString()));
        if (icon != null) benefit.setIcon(icon);
        if (titleUz != null) benefit.setTitleUz(titleUz);
        if (titleRu != null) benefit.setTitleRu(titleRu);
        if (descUz != null) benefit.setDescriptionUz(descUz);
        if (descRu != null) benefit.setDescriptionRu(descRu);
        if (imageUrl != null) benefit.setImageUrl(imageUrl);
        return benefitRepository.save(benefit);
    }

    @Transactional
    public void reorderBenefits(UUID employerId, List<UUID> orderedIds) {
        EmployerBranding branding = getByEmployer(employerId);
        List<BrandingBenefit> benefits = benefitRepository.findByBrandingIdOrderBySortOrder(branding.getId());
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            UUID id = orderedIds.get(i);
            benefits.stream().filter(b -> b.getId().equals(id)).findFirst()
                    .ifPresent(b -> b.setSortOrder(order));
        }
        benefitRepository.saveAll(benefits);
    }

    @Transactional
    public void deleteBenefit(UUID employerId, UUID benefitId) {
        getByEmployer(employerId);
        benefitRepository.deleteById(benefitId);
    }

    // ==================== TESTIMONIALS ====================

    @Transactional
    public BrandingTestimonial addTestimonial(UUID employerId, String name, String position,
                                               String photoUrl, String textUz, String textRu) {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);
        BrandingTestimonial testimonial = BrandingTestimonial.builder()
                .branding(branding)
                .employeeName(name).employeePosition(position)
                .employeePhotoUrl(photoUrl).textUz(textUz).textRu(textRu)
                .build();
        return testimonialRepository.save(testimonial);
    }

    @Transactional
    public void deleteTestimonial(UUID employerId, UUID testimonialId) {
        getByEmployer(employerId);
        testimonialRepository.deleteById(testimonialId);
    }

    // ==================== STORIES ====================

    @Transactional
    public BrandingStory createStory(UUID employerId, String title, String contentHtml, String coverImageUrl,
                                      String authorName, String authorPhotoUrl, String authorPosition) {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);
        BrandingStory story = BrandingStory.builder()
                .branding(branding)
                .title(title).contentHtml(sanitizeHtml(contentHtml))
                .coverImageUrl(coverImageUrl)
                .authorName(authorName).authorPhotoUrl(authorPhotoUrl).authorPosition(authorPosition)
                .build();
        return storyRepository.save(story);
    }

    @Transactional
    public BrandingStory updateStory(UUID employerId, UUID storyId, String title, String contentHtml,
                                      String coverImageUrl, String authorName) {
        getByEmployer(employerId);
        BrandingStory story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", storyId.toString()));
        if (title != null) story.setTitle(title);
        if (contentHtml != null) story.setContentHtml(sanitizeHtml(contentHtml));
        if (coverImageUrl != null) story.setCoverImageUrl(coverImageUrl);
        if (authorName != null) story.setAuthorName(authorName);
        return storyRepository.save(story);
    }

    @Transactional
    public void publishStory(UUID employerId, UUID storyId, boolean publish) {
        getByEmployer(employerId);
        BrandingStory story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", storyId.toString()));
        story.setIsPublished(publish);
        if (publish) story.setPublishedAt(Instant.now());
        storyRepository.save(story);
    }

    @Transactional
    public void deleteStory(UUID employerId, UUID storyId) {
        getByEmployer(employerId);
        storyRepository.deleteById(storyId);
    }

    // ==================== FAQ ====================

    @Transactional
    public BrandingFaq addFaq(UUID employerId, String questionUz, String questionRu, String answerUz, String answerRu) {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);
        BrandingFaq faq = BrandingFaq.builder()
                .branding(branding)
                .questionUz(questionUz).questionRu(questionRu)
                .answerUz(answerUz).answerRu(answerRu)
                .build();
        return faqRepository.save(faq);
    }

    @Transactional
    public void reorderFaqs(UUID employerId, List<UUID> orderedIds) {
        EmployerBranding branding = getByEmployer(employerId);
        List<BrandingFaq> faqs = faqRepository.findByBrandingIdOrderBySortOrder(branding.getId());
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            UUID id = orderedIds.get(i);
            faqs.stream().filter(f -> f.getId().equals(id)).findFirst()
                    .ifPresent(f -> f.setSortOrder(order));
        }
        faqRepository.saveAll(faqs);
    }

    @Transactional
    public void deleteFaq(UUID employerId, UUID faqId) {
        getByEmployer(employerId);
        faqRepository.deleteById(faqId);
    }

    // ==================== OFFICE LOCATIONS ====================

    @Transactional
    public BrandingOfficeLocation addLocation(UUID employerId, String name, String address, String city,
                                               OfficeLocationType type) {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);

        BrandingOfficeLocation location = BrandingOfficeLocation.builder()
                .branding(branding)
                .name(name).address(address).city(city).type(type)
                .build();

        // Geocode address if provided
        if (address != null && !address.isBlank()) {
            try {
                var point = geoService.geocodeAddress(address);
                if (point != null) {
                    location.setLocation(geoService.createPoint(point.latitude(), point.longitude()));
                }
            } catch (Exception e) {
                log.warn("Geocoding failed for address: {}", address);
            }
        }

        return locationRepository.save(location);
    }

    @Transactional
    public void deleteLocation(UUID employerId, UUID locationId) {
        getByEmployer(employerId);
        locationRepository.deleteById(locationId);
    }

    // ==================== SOCIAL LINKS ====================

    @Transactional
    public void updateSocialLinks(UUID employerId, List<SocialLinkInput> links) {
        EmployerBranding branding = getByEmployer(employerId);
        socialLinkRepository.deleteByBrandingId(branding.getId());
        for (int i = 0; i < links.size(); i++) {
            SocialLinkInput input = links.get(i);
            BrandingSocialLink link = BrandingSocialLink.builder()
                    .branding(branding)
                    .platform(input.platform())
                    .url(input.url())
                    .sortOrder(i)
                    .build();
            socialLinkRepository.save(link);
        }
    }

    // ==================== STATS COUNTERS ====================

    @Transactional
    public void updateStatsCounters(UUID employerId, List<StatsCounterInput> counters) {
        EmployerBranding branding = getByEmployer(employerId);
        requireTier(branding, BrandingTier.PREMIUM);
        statsCounterRepository.deleteByBrandingId(branding.getId());
        for (int i = 0; i < Math.min(counters.size(), 5); i++) {
            StatsCounterInput input = counters.get(i);
            BrandingStatsCounter counter = BrandingStatsCounter.builder()
                    .branding(branding)
                    .labelUz(input.labelUz()).labelRu(input.labelRu())
                    .value(input.value()).icon(input.icon())
                    .sortOrder(i)
                    .build();
            statsCounterRepository.save(counter);
        }
    }

    // ==================== HELPERS ====================

    private EmployerBranding getByEmployer(UUID employerId) {
        return brandingRepository.findByEmployerId(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployerBranding", employerId.toString()));
    }

    private void requireTier(EmployerBranding branding, BrandingTier required) {
        if (branding.getTier().ordinal() < required.ordinal()) {
            throw new ForbiddenException("This feature requires " + required + " branding tier. Please upgrade.");
        }
    }

    private String sanitizeHtml(String html) {
        if (html == null) return null;
        // Basic HTML sanitization — strip script tags and event handlers
        return html.replaceAll("(?i)<script[^>]*>.*?</script>", "")
                .replaceAll("(?i)\\s+on\\w+\\s*=\\s*[\"'][^\"']*[\"']", "")
                .replaceAll("(?i)\\s+on\\w+\\s*=\\s*\\S+", "");
    }

    public record SocialLinkInput(SocialPlatform platform, String url) {}

    public record StatsCounterInput(String labelUz, String labelRu, String value, String icon) {}
}
