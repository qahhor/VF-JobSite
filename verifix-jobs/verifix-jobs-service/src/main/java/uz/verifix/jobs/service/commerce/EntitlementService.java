package uz.verifix.jobs.service.commerce;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Entitlement accounting — tracks contact credits, vacancy limits, feature access.
 * Deducts usage on each action. Checks expiration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EntitlementService {

    @PersistenceContext
    private EntityManager em;

    public record Entitlement(UUID id, String type, int total, int used, int remaining, String expiresAt) {}

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Entitlement> getEntitlements(UUID employerId) {
        List<Object[]> rows = em.createNativeQuery(
                "SELECT id, entitlement_type, total_amount, used_amount, expires_at FROM employer_entitlement " +
                "WHERE employer_id = ?1 AND (expires_at IS NULL OR expires_at > now()) ORDER BY created_at DESC")
                .setParameter(1, employerId).getResultList();
        return rows.stream().map(r -> new Entitlement(
                (UUID) r[0], (String) r[1], ((Number) r[2]).intValue(), ((Number) r[3]).intValue(),
                ((Number) r[2]).intValue() - ((Number) r[3]).intValue(),
                r[4] != null ? r[4].toString() : null
        )).toList();
    }

    @Transactional
    public boolean useCredit(UUID employerId, String type) {
        int updated = em.createNativeQuery(
                "UPDATE employer_entitlement SET used_amount = used_amount + 1 " +
                "WHERE employer_id = ?1 AND entitlement_type = ?2 AND used_amount < total_amount " +
                "AND (expires_at IS NULL OR expires_at > now()) " +
                "AND id = (SELECT id FROM employer_entitlement WHERE employer_id = ?1 AND entitlement_type = ?2 " +
                "AND used_amount < total_amount AND (expires_at IS NULL OR expires_at > now()) " +
                "ORDER BY created_at LIMIT 1)")
                .setParameter(1, employerId).setParameter(2, type).executeUpdate();
        if (updated > 0) {
            log.debug("Deducted 1 {} credit for employer {}", type, employerId);
            return true;
        }
        log.warn("No available {} credits for employer {}", type, employerId);
        return false;
    }

    @Transactional
    public void grantEntitlement(UUID employerId, String type, int amount, Instant expiresAt, String source) {
        UUID id = UUID.randomUUID();
        em.createNativeQuery("INSERT INTO employer_entitlement (id, employer_id, entitlement_type, total_amount, expires_at, source) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
                .setParameter(1, id).setParameter(2, employerId).setParameter(3, type)
                .setParameter(4, amount).setParameter(5, expiresAt).setParameter(6, source).executeUpdate();
        log.info("Granted {} {} credits to employer {}", amount, type, employerId);
    }
}
