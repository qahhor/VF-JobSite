package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingOfficeLocation;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingOfficeLocationRepository extends JpaRepository<BrandingOfficeLocation, UUID> {

    List<BrandingOfficeLocation> findByBrandingId(UUID brandingId);
}
