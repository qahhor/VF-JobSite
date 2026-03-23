package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingStory;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingStoryRepository extends JpaRepository<BrandingStory, UUID> {

    List<BrandingStory> findByBrandingIdOrderByCreatedAtDesc(UUID brandingId);

    List<BrandingStory> findByBrandingIdAndIsPublishedTrueOrderByPublishedAtDesc(UUID brandingId);
}
