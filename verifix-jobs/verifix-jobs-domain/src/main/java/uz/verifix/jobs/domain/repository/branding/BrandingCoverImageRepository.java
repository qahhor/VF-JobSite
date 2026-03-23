package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingCoverImage;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingCoverImageRepository extends JpaRepository<BrandingCoverImage, UUID> {

    List<BrandingCoverImage> findByBrandingIdOrderBySortOrder(UUID brandingId);

    long countByBrandingId(UUID brandingId);
}
