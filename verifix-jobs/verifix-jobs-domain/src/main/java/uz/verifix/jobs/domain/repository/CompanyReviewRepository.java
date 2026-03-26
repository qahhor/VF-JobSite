package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.CompanyReview;

import java.util.UUID;

@Repository
public interface CompanyReviewRepository extends JpaRepository<CompanyReview, UUID> {

    Page<CompanyReview> findByEmployerIdAndStatusOrderByCreatedAtDesc(UUID employerId, String status, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM CompanyReview r WHERE r.employerId = ?1 AND r.status = 'PUBLISHED'")
    Double getAverageRating(UUID employerId);

    @Query("SELECT COUNT(r) FROM CompanyReview r WHERE r.employerId = ?1 AND r.status = 'PUBLISHED'")
    long countByEmployer(UUID employerId);
}
