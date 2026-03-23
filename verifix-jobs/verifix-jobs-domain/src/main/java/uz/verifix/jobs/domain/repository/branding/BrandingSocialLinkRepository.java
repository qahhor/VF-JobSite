package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingSocialLink;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingSocialLinkRepository extends JpaRepository<BrandingSocialLink, UUID> {

    List<BrandingSocialLink> findByBrandingIdOrderBySortOrder(UUID brandingId);

    void deleteByBrandingId(UUID brandingId);
}
