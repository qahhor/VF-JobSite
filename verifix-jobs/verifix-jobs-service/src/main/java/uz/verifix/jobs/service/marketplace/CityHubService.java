package uz.verifix.jobs.service.marketplace;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CityHubService {

    private final VacancyRepository vacancyRepository;

    public record CityHub(String city, long vacancyCount, BigDecimal avgSalary) {}

    @Cacheable(value = "city-hubs", unless = "#result.isEmpty()")
    @Transactional(readOnly = true)
    public List<CityHub> getCities() {
        return vacancyRepository.findCityStats().stream()
                .map(row -> new CityHub(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO
                ))
                .toList();
    }
}
