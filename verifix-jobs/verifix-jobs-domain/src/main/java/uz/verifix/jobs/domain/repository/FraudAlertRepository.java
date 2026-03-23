package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.FraudAlert;

import java.util.UUID;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, UUID> {

    Page<FraudAlert> findByReviewedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<FraudAlert> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByReviewedFalse();
}
