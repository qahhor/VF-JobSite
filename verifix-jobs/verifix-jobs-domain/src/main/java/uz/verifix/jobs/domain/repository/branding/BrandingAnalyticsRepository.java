package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingAnalytics;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandingAnalyticsRepository extends JpaRepository<BrandingAnalytics, UUID> {

    List<BrandingAnalytics> findByBrandingIdAndDateBetweenOrderByDate(UUID brandingId, LocalDate from, LocalDate to);

    Optional<BrandingAnalytics> findByBrandingIdAndDate(UUID brandingId, LocalDate date);
}
