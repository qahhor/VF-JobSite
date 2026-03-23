package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Referral;
import uz.verifix.jobs.domain.enums.ReferralStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {

    List<Referral> findByReferrerId(UUID referrerId);

    List<Referral> findByRefereeId(UUID refereeId);

    long countByReferrerIdAndStatus(UUID referrerId, ReferralStatus status);

    @Query(value = "SELECT c.id, c.first_name, c.last_name, " +
            "COUNT(r.id) as referral_count, " +
            "COUNT(CASE WHEN r.status = 'HIRED' THEN 1 END) as hired_count " +
            "FROM referral r JOIN candidate c ON r.referrer_id = c.id " +
            "WHERE r.deleted_at IS NULL " +
            "GROUP BY c.id, c.first_name, c.last_name " +
            "ORDER BY referral_count DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopReferrers(@Param("limit") int limit);
}
