package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.AdminUser;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

    Optional<AdminUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
