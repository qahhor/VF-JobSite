package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.PricingPlan;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PricingPlanRepository extends JpaRepository<PricingPlan, UUID> {

    Optional<PricingPlan> findByCode(String code);
}
