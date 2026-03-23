package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.VerificationLog;
import uz.verifix.jobs.domain.enums.UserType;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationLogRepository extends JpaRepository<VerificationLog, UUID> {

    List<VerificationLog> findByEntityTypeAndEntityId(UserType entityType, UUID entityId);
}
