package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingGalleryImage;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingGalleryImageRepository extends JpaRepository<BrandingGalleryImage, UUID> {

    List<BrandingGalleryImage> findByGalleryIdOrderBySortOrder(UUID galleryId);
}
