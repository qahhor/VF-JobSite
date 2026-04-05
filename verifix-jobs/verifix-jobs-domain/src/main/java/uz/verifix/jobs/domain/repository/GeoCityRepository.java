package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.GeoCity;

import java.util.List;
import java.util.UUID;

@Repository
public interface GeoCityRepository extends JpaRepository<GeoCity, UUID> {

    List<GeoCity> findByCountryOrderByPopulationDesc(String country);

    @Query("SELECT g FROM GeoCity g WHERE LOWER(g.nameUzLat) LIKE LOWER(CONCAT(:query, '%')) " +
            "OR LOWER(g.nameRu) LIKE LOWER(CONCAT(:query, '%')) " +
            "OR LOWER(g.nameEn) LIKE LOWER(CONCAT(:query, '%')) " +
            "ORDER BY g.population DESC")
    List<GeoCity> searchByName(@Param("query") String query);

    @EntityGraph(attributePaths = {"countryRef", "regionRef", "districtRef"})
    @Query("""
            SELECT g FROM GeoCity g
            LEFT JOIN g.countryRef countryRef
            LEFT JOIN g.regionRef regionRef
            LEFT JOIN g.districtRef districtRef
            WHERE (:country IS NULL
                OR UPPER(g.country) = UPPER(:country)
                OR (countryRef IS NOT NULL AND UPPER(countryRef.iso2) = UPPER(:country)))
            AND (:region IS NULL
                OR LOWER(COALESCE(g.region, '')) = LOWER(:region)
                OR (regionRef IS NOT NULL AND (
                    LOWER(regionRef.code) = LOWER(:region)
                    OR LOWER(regionRef.fullCode) = LOWER(:region)
                    OR LOWER(regionRef.nameUzLat) = LOWER(:region)
                    OR LOWER(regionRef.nameRu) = LOWER(:region)
                    OR LOWER(regionRef.nameEn) = LOWER(:region)
                )))
            AND (:district IS NULL
                OR LOWER(COALESCE(g.district, '')) = LOWER(:district)
                OR (districtRef IS NOT NULL AND (
                    LOWER(districtRef.code) = LOWER(:district)
                    OR LOWER(districtRef.fullCode) = LOWER(:district)
                    OR LOWER(districtRef.nameUzLat) = LOWER(:district)
                    OR LOWER(districtRef.nameRu) = LOWER(:district)
                    OR LOWER(districtRef.nameEn) = LOWER(:district)
                )))
            ORDER BY COALESCE(g.population, 0) DESC, g.nameUzLat ASC
            """)
    List<GeoCity> findByGeoScope(@Param("country") String country,
                                 @Param("region") String region,
                                 @Param("district") String district);

    @Query(value = "SELECT gc.* FROM geo_city gc " +
            "WHERE gc.deleted_at IS NULL " +
            "ORDER BY ST_DistanceSphere(gc.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) " +
            "LIMIT :limit",
            nativeQuery = true)
    List<GeoCity> findNearestCities(@Param("lon") double lon, @Param("lat") double lat, @Param("limit") int limit);

    @EntityGraph(attributePaths = {"countryRef", "regionRef"})
    @Query("SELECT g FROM GeoCity g WHERE " +
            "(:search IS NULL OR LOWER(g.nameUzLat) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(g.nameRu) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(g.nameEn) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(g.country) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
            "ORDER BY COALESCE(g.population, 0) DESC, g.nameUzLat ASC")
    Page<GeoCity> searchPaged(@Param("search") String search, Pageable pageable);
}
