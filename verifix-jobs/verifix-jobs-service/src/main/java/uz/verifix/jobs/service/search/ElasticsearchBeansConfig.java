package uz.verifix.jobs.service.search;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;

@Configuration
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "true", matchIfMissing = false)
public class ElasticsearchBeansConfig {

    @Bean
    public VacancyIndexService vacancyIndexService(VacancySearchRepository searchRepository,
                                                    ElasticsearchOperations elasticsearchOperations) {
        return new VacancyIndexService(searchRepository, elasticsearchOperations);
    }
}
