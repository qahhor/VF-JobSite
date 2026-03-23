package uz.verifix.jobs.domain.repository;

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

    @Query(value = "SELECT gc.* FROM geo_city gc " +
            "WHERE gc.deleted_at IS NULL " +
            "ORDER BY ST_DistanceSphere(gc.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) " +
            "LIMIT :limit",
            nativeQuery = true)
    List<GeoCity> findNearestCities(@Param("lon") double lon, @Param("lat") double lat, @Param("limit") int limit);
}
