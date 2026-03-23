package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Referral;
import uz.verifix.jobs.domain.enums.ReferralStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {

    List<Referral> findByReferrerId(UUID referrerId);

    long countByReferrerIdAndStatus(UUID referrerId, ReferralStatus status);
}
