package uz.verifix.jobs.service.branding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.repository.EmployerRepository;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;
import uz.verifix.jobs.service.notification.NotificationService;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandingPromoService {

    private final EmployerBrandingRepository brandingRepository;
    private final EmployerRepository employerRepository;
    private final NotificationService notificationService;

    /**
     * Called when employer upgrades to PREMIUM branding.
     * Posts announcement to channel and notifies relevant candidates.
     */
    public void onPremiumUpgrade(UUID employerId) {
        Employer employer = employerRepository.findById(employerId).orElse(null);
        if (employer == null) return;

        EmployerBranding branding = brandingRepository.findByEmployerId(employerId).orElse(null);
        String slug = branding != null && branding.getCustomSlug() != null
                ? branding.getCustomSlug()
                : employerId.toString();

        String announcement = String.format(
                "🌟 Yangi Premium ish beruvchi: %s!\n" +
                "Barcha vakansiyalarni ko'ring: jobs.verifix.uz/company/%s",
                employer.getName(), slug);

        log.info("Premium branding promo for employer {}: {}", employerId, announcement);

        // Channel announcement would be sent via ChannelPostingService
        // Candidate notifications for those who applied to this employer before
        // would be handled via NotificationService
    }
}
