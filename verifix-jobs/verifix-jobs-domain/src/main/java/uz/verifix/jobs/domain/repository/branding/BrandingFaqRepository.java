package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingFaq;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingFaqRepository extends JpaRepository<BrandingFaq, UUID> {

    List<BrandingFaq> findByBrandingIdOrderBySortOrder(UUID brandingId);
}
