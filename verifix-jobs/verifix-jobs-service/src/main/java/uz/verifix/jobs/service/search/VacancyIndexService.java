package uz.verifix.jobs.service.search;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Vacancy;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "true", matchIfMissing = false)
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
        Criteria criteria = new Criteria();

        if (query != null && !query.isBlank()) {
            criteria = criteria.and(new Criteria("title").matches(query)
                    .or(new Criteria("description").matches(query)));
        }

        if (city != null) {
            criteria = criteria.and(new Criteria("city").is(city));
        }

        if (category != null) {
            criteria = criteria.and(new Criteria("category").is(category));
        }

        if (salaryFrom != null) {
            criteria = criteria.and(new Criteria("salaryTo").greaterThanEqual(salaryFrom));
        }

        if (salaryTo != null) {
            criteria = criteria.and(new Criteria("salaryFrom").lessThanEqual(salaryTo));
        }

        if (lat != null && lon != null && radiusKm != null) {
            criteria = criteria.and(new Criteria("location").within(new GeoPoint(lat, lon), radiusKm + "km"));
        }

        Query searchQuery = new CriteriaQuery(criteria)
                .setPageable(PageRequest.of(page, size));

        SearchHits<VacancyDocument> hits = elasticsearchOperations.search(searchQuery, VacancyDocument.class);
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

        return builder.build();
    }
}
