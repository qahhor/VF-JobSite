package uz.verifix.jobs.service.talenthub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ForbiddenException;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;

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

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Map<String, Object> createList(UUID employerId, String name, String description) {
        @SuppressWarnings("unchecked")
        List<Object[]> existingRows = em.createNativeQuery(
                        "SELECT id, name, description FROM talent_list WHERE employer_id = ?1 AND LOWER(name) = LOWER(?2) ORDER BY created_at DESC LIMIT 1")
                .setParameter(1, employerId)
                .setParameter(2, name)
                .getResultList();
        if (!existingRows.isEmpty()) {
            Object[] existing = existingRows.getFirst();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", existing[0].toString());
            result.put("name", existing[1]);
            result.put("description", existing[2] != null ? existing[2] : "");
            return result;
        }

        UUID id = UUID.randomUUID();
        em.createNativeQuery("INSERT INTO talent_list (id, employer_id, name, description) VALUES (?1, ?2, ?3, ?4)")
                .setParameter(1, id).setParameter(2, employerId)
                .setParameter(3, name).setParameter(4, description)
                .executeUpdate();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", id.toString());
        result.put("name", name);
        result.put("description", description != null ? description : "");
        return result;
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
    public void addCandidate(UUID employerId, UUID listId, UUID candidateId, String notes, List<String> tags) {
        assertListOwnership(listId, employerId);
        UUID id = UUID.randomUUID();
        String tagsJson = tags != null ? "[\"" + String.join("\",\"", tags) + "\"]" : null;
        em.createNativeQuery("INSERT INTO talent_list_candidate (id, talent_list_id, candidate_id, notes, tags) VALUES (?1, ?2, ?3, ?4, ?5::jsonb) ON CONFLICT DO NOTHING")
                .setParameter(1, id).setParameter(2, listId).setParameter(3, candidateId)
                .setParameter(4, notes).setParameter(5, tagsJson).executeUpdate();
        em.createNativeQuery("UPDATE talent_list SET candidate_count = (SELECT COUNT(*) FROM talent_list_candidate WHERE talent_list_id = ?1), updated_at = now() WHERE id = ?1")
                .setParameter(1, listId).executeUpdate();
    }

    @Transactional
    public void removeCandidate(UUID employerId, UUID listId, UUID candidateId) {
        assertListOwnership(listId, employerId);
        em.createNativeQuery("DELETE FROM talent_list_candidate WHERE talent_list_id = ?1 AND candidate_id = ?2")
                .setParameter(1, listId).setParameter(2, candidateId).executeUpdate();
        em.createNativeQuery("UPDATE talent_list SET candidate_count = (SELECT COUNT(*) FROM talent_list_candidate WHERE talent_list_id = ?1), updated_at = now() WHERE id = ?1")
                .setParameter(1, listId).executeUpdate();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getListCandidates(UUID employerId, UUID listId) {
        assertListOwnership(listId, employerId);
        @SuppressWarnings("unchecked")
        List<UUID> candidateIds = em.createNativeQuery(
                        "SELECT candidate_id FROM talent_list_candidate WHERE talent_list_id = ?1 ORDER BY added_at DESC")
                .setParameter(1, listId)
                .getResultList();
        return mapCandidates(candidateIds);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHiredCandidates(UUID employerId) {
        List<Application> applications = applicationRepository.findByVacancy_EmployerIdAndStatusIn(
                employerId, List.of(ApplicationStatus.HIRED));
        LinkedHashMap<UUID, Candidate> uniqueCandidates = new LinkedHashMap<>();
        for (Application application : applications) {
            if (application.getCandidate() != null) {
                uniqueCandidates.putIfAbsent(application.getCandidate().getId(), application.getCandidate());
            }
        }
        return uniqueCandidates.values().stream().map(this::toCandidateMap).toList();
    }

    private void assertListOwnership(UUID listId, UUID employerId) {
        Number count = (Number) em.createNativeQuery(
                        "SELECT COUNT(*) FROM talent_list WHERE id = ?1 AND employer_id = ?2")
                .setParameter(1, listId)
                .setParameter(2, employerId)
                .getSingleResult();
        if (count == null || count.longValue() == 0) {
            throw new ForbiddenException("Talent list does not belong to this employer");
        }
    }

    private List<Map<String, Object>> mapCandidates(List<UUID> candidateIds) {
        if (candidateIds.isEmpty()) {
            return List.of();
        }
        List<Candidate> candidates = candidateRepository.findAllById(candidateIds);
        Map<UUID, Candidate> candidateMap = new HashMap<>();
        for (Candidate candidate : candidates) {
            candidateMap.put(candidate.getId(), candidate);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (UUID candidateId : candidateIds) {
            Candidate candidate = candidateMap.get(candidateId);
            if (candidate != null) {
                result.add(toCandidateMap(candidate));
            }
        }
        return result;
    }

    private Map<String, Object> toCandidateMap(Candidate candidate) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", candidate.getId());
        data.put("firstName", candidate.getFirstName());
        data.put("lastName", candidate.getLastName());
        data.put("phone", candidate.getPhone());
        data.put("city", candidate.getCity());
        data.put("myidStatus", candidate.getMyidStatus() != null ? candidate.getMyidStatus().name() : null);
        data.put("skills", candidate.getSkills() != null ? Arrays.asList(candidate.getSkills()) : List.of());
        data.put("createdAt", candidate.getCreatedAt());
        return data;
    }
}
