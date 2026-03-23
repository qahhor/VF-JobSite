package uz.verifix.jobs.service.branding;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.branding.BrandingAnalytics;
import uz.verifix.jobs.domain.entity.branding.BrandingPageEvent;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.enums.BrandingEventType;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.branding.BrandingAnalyticsRepository;
import uz.verifix.jobs.domain.repository.branding.BrandingPageEventRepository;
import uz.verifix.jobs.domain.repository.branding.BrandingStatsCounterRepository;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;

import java.time.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandingAnalyticsService {

    private final BrandingPageEventRepository eventRepository;
    private final BrandingAnalyticsRepository analyticsRepository;
    private final EmployerBrandingRepository brandingRepository;
    private final ApplicationRepository applicationRepository;
    private final BrandingStatsCounterRepository statsCounterRepository;

    @Async
    @Transactional
    public void trackEvent(UUID brandingId, BrandingEventType eventType, String sectionId,
                           String visitorId, String source, String userAgent) {
        EmployerBranding branding = brandingRepository.findById(brandingId).orElse(null);
        if (branding == null) return;

        BrandingPageEvent event = BrandingPageEvent.builder()
                .branding(branding)
                .eventType(eventType)
                .sectionId(sectionId)
                .visitorId(visitorId)
                .source(source)
                .userAgent(userAgent)
                .build();
        eventRepository.save(event);
    }

    @Scheduled(cron = "0 30 2 * * *")
    @Transactional
    public void aggregateDaily() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Instant from = yesterday.atStartOfDay(ZoneId.of("Asia/Tashkent")).toInstant();
        Instant to = yesterday.plusDays(1).atStartOfDay(ZoneId.of("Asia/Tashkent")).toInstant();

        List<Object[]> aggregated = eventRepository.aggregateEventsByDateRange(from, to);

        for (Object[] row : aggregated) {
            UUID brandingId = (UUID) row[0];
            BrandingEventType eventType = (BrandingEventType) row[1];
            long count = (Long) row[2];

            BrandingAnalytics analytics = analyticsRepository
                    .findByBrandingIdAndDate(brandingId, yesterday)
                    .orElseGet(() -> {
                        EmployerBranding branding = brandingRepository.findById(brandingId).orElse(null);
                        if (branding == null) return null;
                        return BrandingAnalytics.builder()
                                .branding(branding)
                                .date(yesterday)
                                .build();
                    });

            if (analytics == null) continue;

            switch (eventType) {
                case PAGE_VIEW -> analytics.setPageViews(analytics.getPageViews() + (int) count);
                case VACANCY_CLICK -> analytics.setVacancyClicks(analytics.getVacancyClicks() + (int) count);
                case APPLY_CLICK -> analytics.setApplyClicks(analytics.getApplyClicks() + (int) count);
                default -> {}
            }
            analyticsRepository.save(analytics);
        }

        // Delete events older than 90 days
        Instant cutoff = Instant.now().minus(Duration.ofDays(90));
        eventRepository.deleteByCreatedAtBefore(cutoff);

        log.info("Branding analytics aggregated for {}", yesterday);
    }

    @Transactional(readOnly = true)
    public List<BrandingAnalytics> getAnalytics(UUID employerId, LocalDate from, LocalDate to) {
        EmployerBranding branding = brandingRepository.findByEmployerId(employerId).orElse(null);
        if (branding == null) return List.of();
        return analyticsRepository.findByBrandingIdAndDateBetweenOrderByDate(branding.getId(), from, to);
    }

    @Transactional
    public void generateAutoStats(UUID employerId) {
        EmployerBranding branding = brandingRepository.findByEmployerId(employerId).orElse(null);
        if (branding == null) return;

        long hiredCount = applicationRepository.countByVacancy_EmployerIdAndStatus(employerId, ApplicationStatus.HIRED);

        // Auto-update "Total hired" stat if it exists
        branding.getStatsCounters().stream()
                .filter(c -> "auto_hired".equals(c.getIcon()))
                .findFirst()
                .ifPresent(c -> {
                    c.setValue(hiredCount + "+");
                    statsCounterRepository.save(c);
                });
    }
}
