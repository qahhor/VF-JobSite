package uz.verifix.jobs.service.search;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import uz.verifix.jobs.domain.entity.Vacancy;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class VacancyIndexService {

    private final VacancySearchRepository searchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    public void index(Vacancy vacancy) {
        VacancyDocument doc = toDocument(vacancy);
        searchRepository.save(doc);
        log.debug("Vacancy indexed: {}", vacancy.getId());
    }

    public void delete(String vacancyId) {
        searchRepository.deleteById(vacancyId);
        log.debug("Vacancy removed from index: {}", vacancyId);
    }

    public List<VacancyDocument> search(String query, String city, String category,
                                         BigDecimal salaryFrom, BigDecimal salaryTo,
                                         Double lat, Double lon, Double radiusKm,
                                         int page, int size) {

        BoolQuery.Builder boolBuilder = new BoolQuery.Builder();

        if (query != null && !query.isBlank()) {
            // Multi-field search: searchKeywords (synonyms), title, description, employerName
            boolBuilder.must(m -> m.multiMatch(mm -> mm
                    .query(query)
                    .fields("searchKeywords^3", "title^2", "description", "employerName")
                    .fuzziness("AUTO")
            ));
        }

        if (city != null) {
            String resolvedCity = resolveCity(city);
            boolBuilder.filter(f -> f.term(t -> t.field("city").value(resolvedCity)));
        }

        if (category != null) {
            String resolvedCategory = resolveCategory(category);
            boolBuilder.filter(f -> f.term(t -> t.field("category").value(resolvedCategory)));
        }

        if (salaryFrom != null) {
            boolBuilder.filter(f -> f.range(r -> r.number(n -> n.field("salaryTo").gte(salaryFrom.doubleValue()))));
        }

        if (salaryTo != null) {
            boolBuilder.filter(f -> f.range(r -> r.number(n -> n.field("salaryFrom").lte(salaryTo.doubleValue()))));
        }

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(q -> q.bool(boolBuilder.build()))
                .withPageable(PageRequest.of(page, size))
                .build();

        SearchHits<VacancyDocument> hits = elasticsearchOperations.search(nativeQuery, VacancyDocument.class);
        return hits.getSearchHits().stream().map(SearchHit::getContent).toList();
    }

    public void reindexAll(List<Vacancy> vacancies) {
        List<VacancyDocument> docs = vacancies.stream().map(this::toDocument).toList();
        searchRepository.saveAll(docs);
        log.info("Reindexed {} vacancies", docs.size());
    }

    private VacancyDocument toDocument(Vacancy v) {
        VacancyDocument.VacancyDocumentBuilder builder = VacancyDocument.builder()
                .id(v.getId().toString())
                .title(v.getTitle())
                .description(v.getDescription())
                .category(v.getCategory())
                .city(v.getCity())
                .region(v.getRegion())
                .employerId(v.getEmployer().getId().toString())
                .employerName(v.getEmployer().getName())
                .employerLogoUrl(v.getEmployer().getLogoUrl())
                .salaryFrom(v.getSalaryFrom())
                .salaryTo(v.getSalaryTo())
                .currency(v.getCurrency())
                .employmentType(v.getEmploymentType() != null ? v.getEmploymentType().name() : null)
                .shiftSchedule(v.getShiftSchedule() != null ? v.getShiftSchedule().name() : null)
                .benefits(v.getBenefits())
                .isMassHiring(v.getIsMassHiring())
                .positionsCount(v.getPositionsCount())
                .positionsFilled(v.getPositionsFilled())
                .expiresAt(v.getExpiresAt())
                .createdAt(v.getCreatedAt());

        if (v.getLocation() != null) {
            builder.location(new GeoPoint(v.getLocation().getY(), v.getLocation().getX()));
        }

        // Multilingual search keywords
        builder.searchKeywords(SearchSynonyms.buildKeywords(
                v.getTitle(),
                v.getCategory(),
                v.getCity()
        ));

        return builder.build();
    }

    /** Resolve city name in any language to canonical English name */
    private String resolveCity(String input) {
        if (input == null) return null;
        String lower = input.toLowerCase();
        for (var entry : SearchSynonyms.CITIES.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(input) || entry.getValue().stream().anyMatch(s -> s.equalsIgnoreCase(lower))) {
                return entry.getKey();
            }
        }
        return input; // return as-is if not found
    }

    /** Resolve category name in any language to category code */
    private String resolveCategory(String input) {
        if (input == null) return null;
        String lower = input.toLowerCase();
        // Check if already a code
        if (SearchSynonyms.CATEGORIES.containsKey(input.toUpperCase())) return input.toUpperCase();
        // Search in synonyms
        for (var entry : SearchSynonyms.CATEGORIES.entrySet()) {
            if (entry.getValue().stream().anyMatch(s -> s.equalsIgnoreCase(lower))) {
                return entry.getKey();
            }
        }
        return input;
    }
}
