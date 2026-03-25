package uz.verifix.jobs.service.hiringproject;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

/**
 * Hiring Project — umbrella entity above individual vacancies.
 * Enables project-based hiring management (e.g., "Q2 Retail Expansion — 50 hires").
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HiringProjectService {

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Map<String, Object> createProject(UUID employerId, String name, String description,
                                              Integer targetHires, LocalDate deadline) {
        UUID id = UUID.randomUUID();
        em.createNativeQuery("INSERT INTO hiring_project (id, employer_id, name, description, target_hires, deadline) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
                .setParameter(1, id).setParameter(2, employerId).setParameter(3, name)
                .setParameter(4, description).setParameter(5, targetHires).setParameter(6, deadline)
                .executeUpdate();
        log.info("Created hiring project '{}' for employer {}", name, employerId);
        return Map.of("id", id.toString(), "name", name, "status", "ACTIVE");
    }

    @Transactional
    public void addVacancyToProject(UUID projectId, UUID vacancyId) {
        UUID id = UUID.randomUUID();
        em.createNativeQuery("INSERT INTO hiring_project_vacancy (id, project_id, vacancy_id) VALUES (?1, ?2, ?3) ON CONFLICT DO NOTHING")
                .setParameter(1, id).setParameter(2, projectId).setParameter(3, vacancyId)
                .executeUpdate();
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getProjects(UUID employerId) {
        List<Object[]> rows = em.createNativeQuery(
                        "SELECT hp.id, hp.name, hp.description, hp.status, hp.target_hires, hp.actual_hires, hp.deadline, hp.created_at, " +
                                "(SELECT COUNT(*) FROM hiring_project_vacancy hpv WHERE hpv.project_id = hp.id) as vacancy_count " +
                                "FROM hiring_project hp WHERE hp.employer_id = ?1 AND hp.deleted_at IS NULL ORDER BY hp.created_at DESC")
                .setParameter(1, employerId)
                .getResultList();

        return rows.stream().map(r -> Map.<String, Object>of(
                "id", r[0].toString(), "name", r[1], "description", r[2] != null ? r[2] : "",
                "status", r[3], "targetHires", r[4] != null ? r[4] : 0,
                "actualHires", r[5] != null ? r[5] : 0,
                "deadline", r[6] != null ? r[6].toString() : null,
                "vacancyCount", ((Number) r[8]).intValue()
        )).toList();
    }

    @Transactional
    public void updateActualHires(UUID projectId, int hires) {
        em.createNativeQuery("UPDATE hiring_project SET actual_hires = ?1, updated_at = now() WHERE id = ?2")
                .setParameter(1, hires).setParameter(2, projectId).executeUpdate();
    }
}
