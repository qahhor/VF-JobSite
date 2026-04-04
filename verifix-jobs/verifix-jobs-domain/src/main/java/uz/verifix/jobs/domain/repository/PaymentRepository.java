package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Payment;
import uz.verifix.jobs.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findByEmployerIdOrderByCreatedAtDesc(UUID employerId, Pageable pageable);

    List<Payment> findByEmployerIdAndStatus(UUID employerId, PaymentStatus status);

    Optional<Payment> findTopByEmployerIdAndStatusOrderByPaidAtDesc(UUID employerId, PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' AND p.paidAt >= :since")
    BigDecimal sumCompletedAmountSince(@Param("since") Instant since);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'COMPLETED' AND p.paidAt >= :since")
    long countCompletedSince(@Param("since") Instant since);
}
