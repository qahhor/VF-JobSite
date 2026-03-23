package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.SmsLog;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, UUID> {

    long countByPhoneAndCreatedAtAfter(String phone, Instant after);
}
