package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingStatsCounter;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingStatsCounterRepository extends JpaRepository<BrandingStatsCounter, UUID> {

    List<BrandingStatsCounter> findByBrandingIdOrderBySortOrder(UUID brandingId);

    void deleteByBrandingId(UUID brandingId);
}
