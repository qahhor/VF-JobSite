package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteVacancyRepository extends JpaRepository<FavoriteVacancy, UUID> {
    Page<FavoriteVacancy> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId, Pageable pageable);
    Optional<FavoriteVacancy> findByCandidateIdAndVacancyId(UUID candidateId, UUID vacancyId);
    boolean existsByCandidateIdAndVacancyId(UUID candidateId, UUID vacancyId);
    void deleteByCandidateIdAndVacancyId(UUID candidateId, UUID vacancyId);
}
