package uz.verifix.jobs.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Notification;
import uz.verifix.jobs.domain.enums.UserType;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserTypeAndUserId(UserType userType, UUID userId, Pageable pageable);
}
