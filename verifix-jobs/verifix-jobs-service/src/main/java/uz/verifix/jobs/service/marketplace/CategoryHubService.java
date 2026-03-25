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
public class CategoryHubService {

    private final VacancyRepository vacancyRepository;

    public record CategoryHub(String category, long vacancyCount, BigDecimal avgSalary, String icon) {}

    private static final java.util.Map<String, String> ICONS = java.util.Map.ofEntries(
            java.util.Map.entry("COOK", "🍳"), java.util.Map.entry("DRIVER", "🚗"),
            java.util.Map.entry("SALES", "🛒"), java.util.Map.entry("BUILDER", "🏗"),
            java.util.Map.entry("CLEANER", "🧹"), java.util.Map.entry("WAITER", "🍽"),
            java.util.Map.entry("CASHIER", "💵"), java.util.Map.entry("WAREHOUSE", "📦"),
            java.util.Map.entry("SECURITY", "🛡"), java.util.Map.entry("ELECTRICIAN", "⚡"),
            java.util.Map.entry("PLUMBER", "🔧"), java.util.Map.entry("TAILOR", "🧵"),
            java.util.Map.entry("COURIER", "📮"), java.util.Map.entry("LOADER", "💪")
    );

    @Cacheable(value = "category-hubs", unless = "#result.isEmpty()")
    @Transactional(readOnly = true)
    public List<CategoryHub> getCategories() {
        return vacancyRepository.findCategoryStats().stream()
                .map(row -> new CategoryHub(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO,
                        ICONS.getOrDefault((String) row[0], "📋")
                ))
                .toList();
    }
}
