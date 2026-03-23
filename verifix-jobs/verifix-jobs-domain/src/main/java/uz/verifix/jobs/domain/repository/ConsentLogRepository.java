package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.ConsentLog;
import uz.verifix.jobs.domain.enums.UserType;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConsentLogRepository extends JpaRepository<ConsentLog, UUID> {

    List<ConsentLog> findByUserTypeAndUserId(UserType userType, UUID userId);
}
