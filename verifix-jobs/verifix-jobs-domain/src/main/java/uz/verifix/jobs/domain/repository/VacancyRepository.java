package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface VacancyRepository extends JpaRepository<Vacancy, UUID>, JpaSpecificationExecutor<Vacancy> {

    Page<Vacancy> findByEmployerIdAndStatus(UUID employerId, VacancyStatus status, Pageable pageable);

    Page<Vacancy> findByEmployerId(UUID employerId, Pageable pageable);

    List<Vacancy> findByStatusAndCategory(VacancyStatus status, String category);

    @Query(value = "SELECT v.* FROM vacancy v " +
            "WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' AND v.moderation_status = 'APPROVED' " +
            "AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distanceMeters) " +
            "ORDER BY ST_DistanceSphere(v.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))",
            nativeQuery = true)
    List<Vacancy> findNearLocation(@Param("lon") double lon, @Param("lat") double lat, @Param("distanceMeters") double distanceMeters);

    long countByEmployerIdAndStatus(UUID employerId, VacancyStatus status);

    List<Vacancy> findByStatusAndExpiresAtBefore(VacancyStatus status, Instant before);

    @Query(value = "SELECT v.* FROM vacancy v WHERE v.deleted_at IS NULL " +
            "AND v.status = 'ACTIVE' AND v.positions_filled >= v.positions_count " +
            "AND v.positions_count > 0", nativeQuery = true)
    List<Vacancy> findFilledVacancies();

    @Query(value = "SELECT v.* FROM vacancy v WHERE v.deleted_at IS NULL " +
            "AND v.status = 'ACTIVE' AND v.moderation_status = 'APPROVED' " +
            "AND v.created_at > :since ORDER BY v.created_at DESC", nativeQuery = true)
    List<Vacancy> findRecentlyApproved(@Param("since") Instant since);

    @Query(value = "SELECT v.* FROM vacancy v WHERE v.deleted_at IS NULL " +
            "AND v.status = 'ACTIVE' AND v.city = :city " +
            "AND v.created_at > :since ORDER BY v.created_at DESC LIMIT 20", nativeQuery = true)
    List<Vacancy> findRecentByCity(@Param("city") String city, @Param("since") Instant since);
}
