package uz.verifix.jobs.service.marketplace;

import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedSearchService {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Map<String, Object> saveSearch(UUID candidateId, String query, Map<String, Object> filters, boolean notifyEnabled) {
        UUID id = UUID.randomUUID();
        String filtersJson = filters != null ? new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(filters).toString() : null;
        em.createNativeQuery("INSERT INTO saved_search (id, candidate_id, query, filters, notify_enabled) VALUES (?1, ?2, ?3, ?4::jsonb, ?5)")
                .setParameter(1, id).setParameter(2, candidateId).setParameter(3, query)
                .setParameter(4, filtersJson).setParameter(5, notifyEnabled).executeUpdate();
        return Map.of("id", id.toString(), "query", query != null ? query : "");
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getSavedSearches(UUID candidateId) {
        List<Object[]> rows = em.createNativeQuery("SELECT id, query, filters, notify_enabled, created_at FROM saved_search WHERE candidate_id = ?1 ORDER BY created_at DESC")
                .setParameter(1, candidateId).getResultList();
        return rows.stream().map(r -> Map.<String, Object>of(
                "id", r[0].toString(), "query", r[1] != null ? r[1] : "",
                "notifyEnabled", r[3], "createdAt", r[4].toString()
        )).toList();
    }

    @Transactional
    public void deleteSearch(UUID searchId, UUID candidateId) {
        em.createNativeQuery("DELETE FROM saved_search WHERE id = ?1 AND candidate_id = ?2")
                .setParameter(1, searchId).setParameter(2, candidateId).executeUpdate();
    }
}
