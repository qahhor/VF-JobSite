package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingTestimonial;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingTestimonialRepository extends JpaRepository<BrandingTestimonial, UUID> {

    List<BrandingTestimonial> findByBrandingIdOrderBySortOrder(UUID brandingId);
}
