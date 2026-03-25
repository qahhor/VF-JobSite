package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.GeoRegion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GeoRegionRepository extends JpaRepository<GeoRegion, UUID> {

    @EntityGraph(attributePaths = "country")
    List<GeoRegion> findByCountry_Iso2IgnoreCaseOrderByNameEnAsc(String iso2);

    @EntityGraph(attributePaths = "country")
    Optional<GeoRegion> findByCountry_Iso2IgnoreCaseAndCodeIgnoreCase(String iso2, String code);
}
