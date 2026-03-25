package uz.verifix.jobs.api.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Enables Elasticsearch repositories ONLY when app.elasticsearch.enabled=true.
 * This prevents VacancySearchRepository from being scanned when ES is disabled.
 */
@Configuration
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "true")
@EnableElasticsearchRepositories(basePackages = {"uz.verifix.jobs.domain.repository", "uz.verifix.jobs.service.search"})
public class ElasticsearchConfig {
}
