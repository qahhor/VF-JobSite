package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.Candidate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    Optional<Candidate> findByPhone(String phone);

    Optional<Candidate> findByTelegramId(Long telegramId);

    Optional<Candidate> findByReferralCode(String referralCode);

    boolean existsByPhone(String phone);

    boolean existsByTelegramId(Long telegramId);

    @Query(value = "SELECT c.* FROM candidate c " +
            "WHERE c.deleted_at IS NULL " +
            "AND ST_DWithin(c.home_location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distanceMeters) " +
            "ORDER BY ST_DistanceSphere(c.home_location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))",
            nativeQuery = true)
    List<Candidate> findNearLocation(@Param("lon") double lon, @Param("lat") double lat, @Param("distanceMeters") double distanceMeters);
}
