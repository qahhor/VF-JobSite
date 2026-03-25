package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.enums.ApplicationStatus;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    Optional<Application> findByVacancyIdAndCandidateId(UUID vacancyId, UUID candidateId);

    boolean existsByVacancyIdAndCandidateId(UUID vacancyId, UUID candidateId);

    Page<Application> findByVacancyIdAndStatus(UUID vacancyId, ApplicationStatus status, Pageable pageable);

    Page<Application> findByVacancyId(UUID vacancyId, Pageable pageable);

    Page<Application> findByCandidateId(UUID candidateId, Pageable pageable);

    long countByVacancyIdAndStatus(UUID vacancyId, ApplicationStatus status);

    long countByVacancyId(UUID vacancyId);

    long countByVacancy_EmployerId(UUID employerId);

    long countByVacancy_EmployerIdAndStatus(UUID employerId, ApplicationStatus status);

    boolean existsByCandidateIdAndVacancy_EmployerId(UUID candidateId, UUID employerId);

    long countByStatus(ApplicationStatus status);

    long countByVacancy_EmployerIdAndStatusAndCreatedAtAfter(UUID employerId, ApplicationStatus status, java.time.Instant after);

    java.util.List<Application> findByCandidateId(UUID candidateId);

    java.util.Optional<Application> findTopByCandidateIdOrderByAppliedAtDesc(UUID candidateId);

    Page<Application> findByCandidateIdAndStatus(UUID candidateId, ApplicationStatus status, Pageable pageable);

    Page<Application> findByCandidateIdOrderByAppliedAtDesc(UUID candidateId, Pageable pageable);

    long countByVacancy_EmployerIdAndViewedAtIsNotNull(UUID employerId);

    long countByVacancy_EmployerIdAndStatusIn(UUID employerId, java.util.List<String> statuses);

    java.util.List<Application> findByVacancy_EmployerIdAndStatusIn(UUID employerId, java.util.List<ApplicationStatus> statuses);

    long countByVacancyIdAndStatusIn(UUID vacancyId, java.util.List<ApplicationStatus> statuses);

    long countByCandidateIdAndAppliedAtAfter(UUID candidateId, java.time.Instant after);

    @org.springframework.data.jpa.repository.Query(value = "SELECT v.title, v.id, " +
            "COUNT(a.id), " +
            "SUM(CASE WHEN a.status = 'VIEWED' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN a.status = 'SHORTLIST' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN a.status = 'INTERVIEW' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN a.status = 'OFFER' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN a.status = 'HIRED' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN a.status = 'REJECTED' THEN 1 ELSE 0 END), " +
            "COALESCE(AVG(EXTRACT(EPOCH FROM (a.hired_at - a.applied_at))/3600), 0), " +
            "COALESCE(CAST(SUM(CASE WHEN a.status = 'HIRED' THEN 1 ELSE 0 END) AS FLOAT) / NULLIF(COUNT(a.id), 0), 0) " +
            "FROM application a JOIN vacancy v ON a.vacancy_id = v.id " +
            "WHERE v.employer_id = :employerId AND v.deleted_at IS NULL AND a.deleted_at IS NULL " +
            "GROUP BY v.id, v.title ORDER BY COUNT(a.id) DESC", nativeQuery = true)
    java.util.List<Object[]> findHiringFunnelByEmployer(@org.springframework.data.repository.query.Param("employerId") UUID employerId);
}
