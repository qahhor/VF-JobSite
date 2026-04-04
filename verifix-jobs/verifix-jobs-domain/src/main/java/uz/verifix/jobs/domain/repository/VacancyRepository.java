package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface VacancyRepository extends JpaRepository<Vacancy, UUID>, JpaSpecificationExecutor<Vacancy> {

    @Query("SELECT v FROM Vacancy v WHERE v.deletedAt IS NULL AND v.employer.id = :employerId AND v.status = :status")
    Page<Vacancy> findByEmployerIdAndStatus(UUID employerId, VacancyStatus status, Pageable pageable);

    @Query("SELECT v FROM Vacancy v WHERE v.deletedAt IS NULL AND v.employer.id = :employerId")
    Page<Vacancy> findByEmployerId(UUID employerId, Pageable pageable);

    List<Vacancy> findByStatus(VacancyStatus status);

    List<Vacancy> findByStatusAndCategory(VacancyStatus status, String category);

    @Query(value = "SELECT v.* FROM vacancy v " +
            "WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' AND v.moderation_status = 'APPROVED' " +
            "AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distanceMeters) " +
            "ORDER BY ST_DistanceSphere(v.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))",
            nativeQuery = true)
    List<Vacancy> findNearLocation(@Param("lon") double lon, @Param("lat") double lat, @Param("distanceMeters") double distanceMeters);

    @Query("SELECT COUNT(v) FROM Vacancy v WHERE v.deletedAt IS NULL AND v.employer.id = :employerId AND v.status = :status")
    long countByEmployerIdAndStatus(@Param("employerId") UUID employerId, @Param("status") VacancyStatus status);

    @Query("SELECT COUNT(v) FROM Vacancy v WHERE v.deletedAt IS NULL AND v.employer.id = :employerId AND v.moderationStatus = :status")
    long countByEmployerIdAndModerationStatus(@Param("employerId") UUID employerId, @Param("status") ModerationStatus status);

    @Query("SELECT COUNT(v) FROM Vacancy v WHERE v.deletedAt IS NULL AND v.employer.id = :employerId AND v.moderationStatus IN :statuses")
    long countByEmployerIdAndModerationStatusIn(@Param("employerId") UUID employerId, @Param("statuses") Collection<ModerationStatus> statuses);

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

    long countByStatus(VacancyStatus status);

    long countByCreatedAtAfter(Instant after);

    @Query(value = "SELECT AVG(salary_from) as avg_salary, MIN(salary_from) as min_salary, " +
            "MAX(salary_to) as max_salary, COUNT(*) as cnt FROM vacancy " +
            "WHERE deleted_at IS NULL AND status = 'ACTIVE' AND salary_from IS NOT NULL " +
            "AND category = :category AND city = :city", nativeQuery = true)
    List<Object[]> findSalaryStatsByCategoryAndCity(@Param("category") String category, @Param("city") String city);

    @Query(value = "SELECT AVG(salary_from) as avg_salary, MIN(salary_from) as min_salary, " +
            "MAX(salary_to) as max_salary, COUNT(*) as cnt FROM vacancy " +
            "WHERE deleted_at IS NULL AND status = 'ACTIVE' AND salary_from IS NOT NULL " +
            "AND category = :category", nativeQuery = true)
    List<Object[]> findSalaryStatsByCategory(@Param("category") String category);

    // Public marketplace: text search with DB fallback (no Elasticsearch needed)
    @Query(value = "SELECT v.* FROM vacancy v WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' " +
            "AND (:city IS NULL OR v.city ILIKE '%' || :city || '%') " +
            "AND (:category IS NULL OR v.category = :category) " +
            "AND (:salaryMin IS NULL OR v.salary_from >= CAST(:salaryMin AS DECIMAL)) " +
            "AND (:employmentType IS NULL OR v.employment_type = :employmentType) " +
            "AND (:query IS NULL OR v.title ILIKE '%' || :query || '%' OR v.description ILIKE '%' || :query || '%') " +
            "ORDER BY v.created_at DESC",
            countQuery = "SELECT COUNT(*) FROM vacancy v WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' " +
            "AND (:city IS NULL OR v.city ILIKE '%' || :city || '%') " +
            "AND (:category IS NULL OR v.category = :category) " +
            "AND (:salaryMin IS NULL OR v.salary_from >= CAST(:salaryMin AS DECIMAL)) " +
            "AND (:employmentType IS NULL OR v.employment_type = :employmentType) " +
            "AND (:query IS NULL OR v.title ILIKE '%' || :query || '%' OR v.description ILIKE '%' || :query || '%')",
            nativeQuery = true)
    Page<Vacancy> searchActive(@Param("city") String city, @Param("category") String category,
                                @Param("salaryMin") java.math.BigDecimal salaryMin,
                                @Param("employmentType") String employmentType,
                                @Param("query") String query, Pageable pageable);

    Vacancy findBySlugAndStatus(String slug, VacancyStatus status);

    @Query("SELECT v FROM Vacancy v WHERE v.deletedAt IS NULL AND v.id = :id AND v.status = :status")
    java.util.Optional<Vacancy> findByIdAndStatus(@Param("id") UUID id, @Param("status") VacancyStatus status);

    Page<Vacancy> findByCategoryAndStatus(String category, VacancyStatus status, Pageable pageable);

    Page<Vacancy> findByCityAndStatus(String city, VacancyStatus status, Pageable pageable);

    @Query("SELECT v FROM Vacancy v WHERE v.deletedAt IS NULL AND v.employer.id = :employerId AND v.status = :status")
    List<Vacancy> findByEmployerIdAndStatus(@Param("employerId") UUID employerId, @Param("status") VacancyStatus status);

    @Query("SELECT v FROM Vacancy v WHERE v.deletedAt IS NULL AND v.id = :id")
    java.util.Optional<Vacancy> findVisibleById(@Param("id") UUID id);

    // Category/City hub aggregations
    @Query(value = "SELECT v.category, COUNT(*) as cnt, AVG(v.salary_from) as avg_salary " +
            "FROM vacancy v WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' " +
            "GROUP BY v.category ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> findCategoryStats();

    @Query(value = "SELECT v.city, COUNT(*) as cnt, AVG(v.salary_from) as avg_salary " +
            "FROM vacancy v WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' AND v.city IS NOT NULL " +
            "GROUP BY v.city ORDER BY cnt DESC", nativeQuery = true)
    List<Object[]> findCityStats();

    // Salary trends by category
    @Query(value = "SELECT v.category, v.city, AVG(v.salary_from), AVG(v.salary_from), " +
            "MIN(v.salary_from), MAX(v.salary_to), COUNT(*), " +
            "(SELECT COUNT(*) FROM application a WHERE a.vacancy_id = ANY(ARRAY_AGG(v.id))) " +
            "FROM vacancy v WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' " +
            "AND v.salary_from IS NOT NULL AND (:category IS NULL OR v.category = :category) " +
            "GROUP BY v.category, v.city ORDER BY COUNT(*) DESC", nativeQuery = true)
    List<Object[]> findSalaryTrendsByCategory(@Param("category") String category);

    // City comparison
    @Query(value = "SELECT v.city, AVG(v.salary_from), COUNT(*), " +
            "CAST(COUNT(*) AS FLOAT) / NULLIF((SELECT COUNT(*) FROM vacancy WHERE deleted_at IS NULL AND status = 'ACTIVE'), 0) " +
            "FROM vacancy v WHERE v.deleted_at IS NULL AND v.status = 'ACTIVE' " +
            "AND v.salary_from IS NOT NULL AND (:category IS NULL OR v.category = :category) " +
            "GROUP BY v.city ORDER BY COUNT(*) DESC", nativeQuery = true)
    List<Object[]> findCityComparisonByCategory(@Param("category") String category);
}
