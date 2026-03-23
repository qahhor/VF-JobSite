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
}
