package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Employer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uz.verifix.jobs.domain.enums.EmployerStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, UUID> {

    Optional<Employer> findByInn(String inn);

    Page<Employer> findByStatus(EmployerStatus status, Pageable pageable);

    Page<Employer> findByStatusAndNameContainingIgnoreCase(EmployerStatus status, String name, Pageable pageable);

    boolean existsByInn(String inn);

    List<Employer> findByHrmSyncEnabledTrue();

    Optional<Employer> findBySlug(String slug);

    Page<Employer> findByNameContainingIgnoreCase(String name, Pageable pageable);

    long countByStatus(EmployerStatus status);

    long countByIsVerifiedTrue();

    Optional<Employer> findByHrmCompanyId(String hrmCompanyId);

    @Query(value = "SELECT e.* FROM employer e " +
            "WHERE e.deleted_at IS NULL " +
            "AND ST_DWithin(e.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distanceMeters) " +
            "ORDER BY ST_DistanceSphere(e.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))",
            nativeQuery = true)
    List<Employer> findNearLocation(@Param("lon") double lon, @Param("lat") double lat, @Param("distanceMeters") double distanceMeters);
}
