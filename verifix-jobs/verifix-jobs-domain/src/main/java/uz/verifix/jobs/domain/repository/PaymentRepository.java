package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Payment;
import uz.verifix.jobs.domain.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findByEmployerIdOrderByCreatedAtDesc(UUID employerId, Pageable pageable);

    List<Payment> findByEmployerIdAndStatus(UUID employerId, PaymentStatus status);

    Optional<Payment> findTopByEmployerIdAndStatusOrderByPaidAtDesc(UUID employerId, PaymentStatus status);
}
