package uz.verifix.jobs.service.talenthub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;

/**
 * Talent Hub — reusable candidate pools for employers.
 * Cross-vacancy reuse, tagging, shortlisting, export into hiring flows.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TalentHubService {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Map<String, Object> createList(UUID employerId, String name, String description) {
        UUID id = UUID.randomUUID();
        em.createNativeQuery("INSERT INTO talent_list (id, employer_id, name, description) VALUES (?1, ?2, ?3, ?4)")
                .setParameter(1, id).setParameter(2, employerId)
                .setParameter(3, name).setParameter(4, description)
                .executeUpdate();
        return Map.of("id", id.toString(), "name", name);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getLists(UUID employerId) {
        List<Object[]> rows = em.createNativeQuery(
                        "SELECT id, name, description, candidate_count, created_at FROM talent_list WHERE employer_id = ?1 ORDER BY created_at DESC")
                .setParameter(1, employerId).getResultList();
        return rows.stream().map(r -> Map.<String, Object>of(
                "id", r[0].toString(), "name", r[1], "description", r[2] != null ? r[2] : "",
                "candidateCount", r[3], "createdAt", r[4].toString()
        )).toList();
    }

    @Transactional
    public void addCandidate(UUID listId, UUID candidateId, String notes, List<String> tags) {
        UUID id = UUID.randomUUID();
        String tagsJson = tags != null ? "[\"" + String.join("\",\"", tags) + "\"]" : null;
        em.createNativeQuery("INSERT INTO talent_list_candidate (id, talent_list_id, candidate_id, notes, tags) VALUES (?1, ?2, ?3, ?4, ?5::jsonb) ON CONFLICT DO NOTHING")
                .setParameter(1, id).setParameter(2, listId).setParameter(3, candidateId)
                .setParameter(4, notes).setParameter(5, tagsJson).executeUpdate();
        em.createNativeQuery("UPDATE talent_list SET candidate_count = (SELECT COUNT(*) FROM talent_list_candidate WHERE talent_list_id = ?1), updated_at = now() WHERE id = ?1")
                .setParameter(1, listId).executeUpdate();
    }

    @Transactional
    public void removeCandidate(UUID listId, UUID candidateId) {
        em.createNativeQuery("DELETE FROM talent_list_candidate WHERE talent_list_id = ?1 AND candidate_id = ?2")
                .setParameter(1, listId).setParameter(2, candidateId).executeUpdate();
        em.createNativeQuery("UPDATE talent_list SET candidate_count = (SELECT COUNT(*) FROM talent_list_candidate WHERE talent_list_id = ?1), updated_at = now() WHERE id = ?1")
                .setParameter(1, listId).executeUpdate();
    }
}
