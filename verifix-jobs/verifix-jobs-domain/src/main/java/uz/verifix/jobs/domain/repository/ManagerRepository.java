package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Manager;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, UUID> {

    Optional<Manager> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Manager> findByEmployerId(UUID employerId);
}
