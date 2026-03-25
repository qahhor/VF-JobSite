package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.GeoDistrict;

import java.util.List;
import java.util.UUID;

@Repository
public interface GeoDistrictRepository extends JpaRepository<GeoDistrict, UUID> {

    @EntityGraph(attributePaths = {"country", "region"})
    List<GeoDistrict> findByCountry_Iso2IgnoreCaseOrderByNameEnAsc(String iso2);

    @EntityGraph(attributePaths = {"country", "region"})
    List<GeoDistrict> findByCountry_Iso2IgnoreCaseAndRegion_CodeIgnoreCaseOrderByNameEnAsc(String iso2, String regionCode);
}
