package uz.verifix.jobs.service.branding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.enums.BrandingTier;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;
import uz.verifix.jobs.service.notification.DomainEvent;
import uz.verifix.jobs.service.notification.EventPublisher;

import java.time.Instant;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandingService {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$");
    private static final Pattern HEX_COLOR_PATTERN = Pattern.compile("^#[0-9A-Fa-f]{6}$");

    private final EmployerBrandingRepository brandingRepository;
    private final EmployerRepository employerRepository;
    private final EventPublisher eventPublisher;

    @Transactional
    public EmployerBranding initBranding(UUID employerId) {
        if (brandingRepository.findByEmployerId(employerId).isPresent()) {
            return brandingRepository.findByEmployerId(employerId).get();
        }
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
        EmployerBranding branding = EmployerBranding.builder()
                .employer(employer)
                .tier(BrandingTier.BASIC)
                .build();
        log.info("Branding initialized for employer {}", employerId);
        return brandingRepository.save(branding);
    }

    @Transactional
    @CacheEvict(value = "branding-page", allEntries = true)
    public EmployerBranding updateBranding(UUID employerId, String customSlug, String primaryColor,
                                            String secondaryColor, String accentColor, String coverType,
                                            String descriptionHtml, String metaTitle, String metaDescription) {
        EmployerBranding branding = getByEmployer(employerId);

        if (customSlug != null) {
            if (branding.getTier() != BrandingTier.PREMIUM) {
                throw new ForbiddenException("Custom slug requires PREMIUM branding tier");
            }
            if (!SLUG_PATTERN.matcher(customSlug).matches()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Slug must be 3-50 chars, lowercase alphanumeric with hyphens");
            }
            if (brandingRepository.existsByCustomSlug(customSlug) &&
                    !customSlug.equals(branding.getCustomSlug())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, org.springframework.http.HttpStatus.CONFLICT,
                        "This slug is already taken");
            }
            branding.setCustomSlug(customSlug);
        }

        if (primaryColor != null) {
            if (branding.getTier() != BrandingTier.PREMIUM) {
                throw new ForbiddenException("Custom colors require PREMIUM branding tier");
            }
            validateHexColor(primaryColor);
            branding.setPrimaryColor(primaryColor);
        }
        if (secondaryColor != null) {
            if (branding.getTier() != BrandingTier.PREMIUM) {
                throw new ForbiddenException("Custom colors require PREMIUM branding tier");
            }
            validateHexColor(secondaryColor);
            branding.setSecondaryColor(secondaryColor);
        }
        if (accentColor != null) {
            validateHexColor(accentColor);
            branding.setAccentColor(accentColor);
        }
        if (coverType != null) branding.setCoverType(uz.verifix.jobs.domain.enums.CoverType.valueOf(coverType));
        if (descriptionHtml != null) branding.setDescriptionHtml(descriptionHtml);
        if (metaTitle != null) branding.setMetaTitle(metaTitle);
        if (metaDescription != null) branding.setMetaDescription(metaDescription);

        return brandingRepository.save(branding);
    }

    @Transactional
    @CacheEvict(value = "branding-page", allEntries = true)
    public EmployerBranding publishBranding(UUID employerId) {
        EmployerBranding branding = getByEmployer(employerId);
        branding.setIsPublished(true);
        branding.setPublishedAt(Instant.now());
        branding = brandingRepository.save(branding);

        eventPublisher.publish(DomainEvent.BRANDING_PUBLISHED, employerId, "EmployerBranding");
        log.info("Branding published for employer {}", employerId);
        return branding;
    }

    @Transactional
    @CacheEvict(value = "branding-page", allEntries = true)
    public void unpublishBranding(UUID employerId) {
        EmployerBranding branding = getByEmployer(employerId);
        branding.setIsPublished(false);
        brandingRepository.save(branding);
        log.info("Branding unpublished for employer {}", employerId);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "branding-page", key = "#slug")
    public EmployerBranding getBrandingPage(String slug) {
        return brandingRepository.findByCustomSlug(slug)
                .or(() -> {
                    try {
                        UUID id = UUID.fromString(slug);
                        return brandingRepository.findByEmployerId(id);
                    } catch (IllegalArgumentException e) {
                        return java.util.Optional.empty();
                    }
                })
                .filter(b -> Boolean.TRUE.equals(b.getIsPublished()))
                .orElseThrow(() -> new ResourceNotFoundException("BrandingPage", slug));
    }

    @Transactional(readOnly = true)
    public EmployerBranding getBrandingForEmployer(UUID employerId) {
        return getByEmployer(employerId);
    }

    @Transactional
    public void upgradeTier(UUID employerId, BrandingTier tier) {
        EmployerBranding branding = getByEmployer(employerId);
        branding.setTier(tier);
        brandingRepository.save(branding);

        Employer employer = branding.getEmployer();
        employer.setBrandingTier(tier.name());
        employerRepository.save(employer);

        if (tier == BrandingTier.PREMIUM) {
            eventPublisher.publish(DomainEvent.BRANDING_UPGRADED, employerId, "Employer");
        }
        log.info("Branding tier upgraded to {} for employer {}", tier, employerId);
    }

    private EmployerBranding getByEmployer(UUID employerId) {
        return brandingRepository.findByEmployerId(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployerBranding", employerId.toString()));
    }

    private void validateHexColor(String color) {
        if (!HEX_COLOR_PATTERN.matcher(color).matches()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Color must be hex format: #RRGGBB");
        }
    }
}
