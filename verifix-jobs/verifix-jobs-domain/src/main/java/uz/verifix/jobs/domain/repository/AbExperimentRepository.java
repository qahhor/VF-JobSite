package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.AbExperiment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AbExperimentRepository extends JpaRepository<AbExperiment, UUID> {

    Optional<AbExperiment> findByName(String name);

    List<AbExperiment> findByActiveTrue();
}
