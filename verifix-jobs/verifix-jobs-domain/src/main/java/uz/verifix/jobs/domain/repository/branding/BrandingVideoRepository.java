package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingVideo;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingVideoRepository extends JpaRepository<BrandingVideo, UUID> {

    List<BrandingVideo> findByBrandingIdOrderBySortOrder(UUID brandingId);

    long countByBrandingId(UUID brandingId);
}
