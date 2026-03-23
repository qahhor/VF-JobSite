package uz.verifix.jobs.service.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface VacancySearchRepository extends ElasticsearchRepository<VacancyDocument, String> {
}
