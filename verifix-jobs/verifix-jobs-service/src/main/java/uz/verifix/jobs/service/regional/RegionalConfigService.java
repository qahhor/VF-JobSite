package uz.verifix.jobs.service.regional;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Regional configuration for multi-country expansion.
 * Supports UZ, KZ, KG, TJ with country-specific settings.
 */
@Slf4j
@Service
public class RegionalConfigService {

    public record Country(String code, String name, String currency, String phonePrefix,
                           String defaultLanguage, List<String> languages, BigDecimal minimumWage) {}

    private static final Map<String, Country> COUNTRIES = Map.of(
            "UZ", new Country("UZ", "O'zbekiston", "UZS", "+998", "uz",
                    List.of("uz", "ru", "en"), BigDecimal.valueOf(1155000)),
            "KZ", new Country("KZ", "Qozog'iston", "KZT", "+7", "kk",
                    List.of("kk", "ru", "en"), BigDecimal.valueOf(85000)),
            "KG", new Country("KG", "Qirg'iziston", "KGS", "+996", "ky",
                    List.of("ky", "ru", "en"), BigDecimal.valueOf(2070)),
            "TJ", new Country("TJ", "Tojikiston", "TJS", "+992", "tg",
                    List.of("tg", "ru", "en"), BigDecimal.valueOf(600))
    );

    public Country getCountry(String code) {
        return COUNTRIES.getOrDefault(code.toUpperCase(), COUNTRIES.get("UZ"));
    }

    public List<Country> getAllCountries() {
        return List.copyOf(COUNTRIES.values());
    }

    public String getCurrency(String countryCode) {
        Country c = getCountry(countryCode);
        return c != null ? c.currency() : "UZS";
    }

    public BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) return amount;
        // Approximate exchange rates (update periodically)
        Map<String, BigDecimal> toUsd = Map.of(
                "UZS", BigDecimal.valueOf(0.000079),
                "KZT", BigDecimal.valueOf(0.0020),
                "KGS", BigDecimal.valueOf(0.011),
                "TJS", BigDecimal.valueOf(0.091)
        );
        BigDecimal usd = amount.multiply(toUsd.getOrDefault(fromCurrency, BigDecimal.ONE));
        BigDecimal rate = toUsd.getOrDefault(toCurrency, BigDecimal.ONE);
        return rate.compareTo(BigDecimal.ZERO) > 0 ? usd.divide(rate, 0, BigDecimal.ROUND_HALF_UP) : amount;
    }
}
