package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployerBrandingRepository extends JpaRepository<EmployerBranding, UUID> {

    Optional<EmployerBranding> findByEmployerId(UUID employerId);

    Optional<EmployerBranding> findByCustomSlug(String customSlug);

    boolean existsByCustomSlug(String customSlug);

    List<EmployerBranding> findByIsPublishedTrue();
}
