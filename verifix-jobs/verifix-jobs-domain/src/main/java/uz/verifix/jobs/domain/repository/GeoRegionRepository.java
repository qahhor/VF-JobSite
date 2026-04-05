package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    List<GeoRegion> findByCountry_Iso2IgnoreCaseAndIsActiveTrueOrderByNameEnAsc(String iso2);

    @EntityGraph(attributePaths = "country")
    Optional<GeoRegion> findByCountry_Iso2IgnoreCaseAndCodeIgnoreCase(String iso2, String code);

    @Query("SELECT r FROM GeoRegion r LEFT JOIN FETCH r.country WHERE " +
            ":search IS NULL OR LOWER(r.nameUzLat) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(r.nameRu) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(r.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "ORDER BY r.nameUzLat ASC")
    Page<GeoRegion> searchPaged(@Param("search") String search, Pageable pageable);
}
