package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingGallery;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingGalleryRepository extends JpaRepository<BrandingGallery, UUID> {

    List<BrandingGallery> findByBrandingId(UUID brandingId);
}
