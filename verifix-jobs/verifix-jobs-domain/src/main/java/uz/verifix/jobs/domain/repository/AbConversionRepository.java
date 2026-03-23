package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.AbConversion;
import uz.verifix.jobs.domain.entity.AbExperiment;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AbConversionRepository extends JpaRepository<AbConversion, UUID> {

    Optional<AbConversion> findByExperimentAndUserId(AbExperiment experiment, UUID userId);

    long countByExperimentAndVariant(AbExperiment experiment, String variant);

    long countByExperimentAndVariantAndConvertedTrue(AbExperiment experiment, String variant);
}
