package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingBenefit;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingBenefitRepository extends JpaRepository<BrandingBenefit, UUID> {

    List<BrandingBenefit> findByBrandingIdOrderBySortOrder(UUID brandingId);
}
