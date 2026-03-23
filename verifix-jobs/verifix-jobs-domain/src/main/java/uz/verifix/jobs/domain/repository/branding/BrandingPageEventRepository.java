package uz.verifix.jobs.domain.repository.branding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.branding.BrandingPageEvent;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BrandingPageEventRepository extends JpaRepository<BrandingPageEvent, UUID> {

    List<BrandingPageEvent> findByBrandingIdAndCreatedAtBetween(UUID brandingId, Instant from, Instant to);

    @Query("SELECT e.branding.id, e.eventType, COUNT(e) FROM BrandingPageEvent e " +
            "WHERE e.createdAt BETWEEN :from AND :to GROUP BY e.branding.id, e.eventType")
    List<Object[]> aggregateEventsByDateRange(@Param("from") Instant from, @Param("to") Instant to);

    @Modifying
    @Query("DELETE FROM BrandingPageEvent e WHERE e.createdAt < :before")
    void deleteByCreatedAtBefore(@Param("before") Instant before);
}
