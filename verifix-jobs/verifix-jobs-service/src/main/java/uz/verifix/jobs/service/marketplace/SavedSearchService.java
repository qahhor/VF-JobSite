package uz.verifix.jobs.service.marketplace;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedSearchService {

    @PersistenceContext
    private EntityManager em;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public record SavedSearchPayload(
            String name,
            String query,
            String city,
            String category,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String employmentType,
            String shiftSchedule,
            List<String> benefits,
            boolean verifiedOnly,
            boolean notifyEnabled
    ) {}

    public record SavedSearchView(
            UUID id,
            String name,
            String query,
            String city,
            String category,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String employmentType,
            String shiftSchedule,
            List<String> benefits,
            boolean verifiedOnly,
            boolean notifyEnabled,
            Instant createdAt
    ) {}

    public record AlertableSavedSearch(
            UUID id,
            UUID candidateId,
            String name,
            String query,
            String city,
            String category,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            String employmentType,
            String shiftSchedule,
            List<String> benefits,
            boolean verifiedOnly,
            Instant baseline
    ) {}

    @Transactional
    public SavedSearchView saveSearch(UUID candidateId, SavedSearchPayload payload) {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.now();
        String filtersJson = serializeFilters(payload);

        em.createNativeQuery("""
                INSERT INTO saved_search (id, candidate_id, name, query, filters, notify_enabled, created_at)
                VALUES (?1, ?2, ?3, ?4, ?5::jsonb, ?6, ?7)
                """)
                .setParameter(1, id)
                .setParameter(2, candidateId)
                .setParameter(3, payload.name())
                .setParameter(4, payload.query())
                .setParameter(5, filtersJson)
                .setParameter(6, payload.notifyEnabled())
                .setParameter(7, createdAt)
                .executeUpdate();

        return new SavedSearchView(
                id,
                payload.name(),
                payload.query(),
                payload.city(),
                payload.category(),
                payload.minSalary(),
                payload.maxSalary(),
                payload.employmentType(),
                payload.shiftSchedule(),
                normalizeBenefits(payload.benefits()),
                payload.verifiedOnly(),
                payload.notifyEnabled(),
                createdAt
        );
    }

    @Transactional(readOnly = true)
    public List<SavedSearchView> getSavedSearches(UUID candidateId) {
        List<Object[]> rows = em.createNativeQuery("""
                SELECT id, name, query, filters, notify_enabled, created_at
                FROM saved_search
                WHERE candidate_id = ?1
                ORDER BY created_at DESC
                """)
                .setParameter(1, candidateId)
                .getResultList();
        return rows.stream().map(this::toView).toList();
    }

    @Transactional
    public void deleteSearch(UUID searchId, UUID candidateId) {
        em.createNativeQuery("DELETE FROM saved_search WHERE id = ?1 AND candidate_id = ?2")
                .setParameter(1, searchId)
                .setParameter(2, candidateId)
                .executeUpdate();
    }

    @Transactional(readOnly = true)
    public List<AlertableSavedSearch> getAlertableSearches() {
        List<Object[]> rows = em.createNativeQuery("""
                SELECT id, candidate_id, name, query, filters, COALESCE(last_notified_at, created_at)
                FROM saved_search
                WHERE notify_enabled = true
                """)
                .getResultList();
        return rows.stream().map(this::toAlertable).toList();
    }

    @Transactional
    public void markNotified(UUID searchId, Instant notifiedAt) {
        em.createNativeQuery("UPDATE saved_search SET last_notified_at = ?2 WHERE id = ?1")
                .setParameter(1, searchId)
                .setParameter(2, notifiedAt)
                .executeUpdate();
    }

    private SavedSearchView toView(Object[] row) {
        Map<String, Object> filters = parseFilters(row[3]);
        return new SavedSearchView(
                asUuid(row[0]),
                asString(row[1]),
                asNullableString(row[2]),
                getString(filters, "city"),
                getString(filters, "category"),
                getBigDecimal(filters, "minSalary"),
                getBigDecimal(filters, "maxSalary"),
                getString(filters, "employmentType"),
                getString(filters, "shiftSchedule"),
                getStringList(filters, "benefits"),
                getBoolean(filters, "verifiedOnly"),
                row[4] != null && Boolean.TRUE.equals(row[4]),
                toInstant(row[5])
        );
    }

    private AlertableSavedSearch toAlertable(Object[] row) {
        Map<String, Object> filters = parseFilters(row[4]);
        return new AlertableSavedSearch(
                asUuid(row[0]),
                asUuid(row[1]),
                asString(row[2]),
                asNullableString(row[3]),
                getString(filters, "city"),
                getString(filters, "category"),
                getBigDecimal(filters, "minSalary"),
                getBigDecimal(filters, "maxSalary"),
                getString(filters, "employmentType"),
                getString(filters, "shiftSchedule"),
                getStringList(filters, "benefits"),
                getBoolean(filters, "verifiedOnly"),
                toInstant(row[5])
        );
    }

    private String serializeFilters(SavedSearchPayload payload) {
        Map<String, Object> filters = new LinkedHashMap<>();
        putIfText(filters, "city", payload.city());
        putIfText(filters, "category", payload.category());
        putIfNotNull(filters, "minSalary", payload.minSalary());
        putIfNotNull(filters, "maxSalary", payload.maxSalary());
        putIfText(filters, "employmentType", payload.employmentType());
        putIfText(filters, "shiftSchedule", payload.shiftSchedule());

        List<String> benefits = normalizeBenefits(payload.benefits());
        if (!benefits.isEmpty()) {
            filters.put("benefits", benefits);
        }
        if (payload.verifiedOnly()) {
            filters.put("verifiedOnly", true);
        }

        try {
            return objectMapper.writeValueAsString(filters);
        } catch (Exception e) {
            throw new IllegalStateException("Could not serialize saved search filters", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseFilters(Object raw) {
        if (raw == null) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(raw.toString(), Map.class);
        } catch (Exception e) {
            log.warn("Could not parse saved_search filters: {}", e.getMessage());
            return Map.of();
        }
    }

    private List<String> normalizeBenefits(List<String> benefits) {
        if (benefits == null || benefits.isEmpty()) {
            return List.of();
        }
        List<String> normalized = new ArrayList<>();
        for (String value : benefits) {
            if (value == null || value.isBlank()) {
                continue;
            }
            for (String item : value.split(",")) {
                String cleaned = item.trim().toLowerCase();
                if (!cleaned.isBlank() && !normalized.contains(cleaned)) {
                    normalized.add(cleaned);
                }
            }
        }
        return normalized;
    }

    private void putIfText(Map<String, Object> filters, String key, String value) {
        if (value != null && !value.isBlank()) {
            filters.put(key, value);
        }
    }

    private void putIfNotNull(Map<String, Object> filters, String key, Object value) {
        if (value != null) {
            filters.put(key, value);
        }
    }

    private UUID asUuid(Object value) {
        return UUID.fromString(value.toString());
    }

    private String asString(Object value) {
        return value != null ? value.toString() : "";
    }

    private String asNullableString(Object value) {
        return value != null ? value.toString() : null;
    }

    private Instant toInstant(Object value) {
        return value instanceof Instant instant ? instant : Instant.parse(value.toString());
    }

    private String getString(Map<String, Object> filters, String key) {
        Object value = filters.get(key);
        return value != null ? value.toString() : "";
    }

    private BigDecimal getBigDecimal(Map<String, Object> filters, String key) {
        Object value = filters.get(key);
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        return new BigDecimal(value.toString());
    }

    private List<String> getStringList(Map<String, Object> filters, String key) {
        Object value = filters.get(key);
        if (value == null) {
            return List.of();
        }
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).map(String::trim).filter(item -> !item.isBlank()).toList();
        }
        return normalizeBenefits(List.of(value.toString()));
    }

    private boolean getBoolean(Map<String, Object> filters, String key) {
        Object value = filters.get(key);
        return value != null && Boolean.parseBoolean(value.toString());
    }
}
