package uz.verifix.jobs.integration.ats;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AtsVacancyPayload {
    @JsonProperty("vacancy_id")
    private String vacancyId;
    private String title;
    private String description;
    private String category;
    private String city;
    private String region;
    @JsonProperty("salary_from")
    private BigDecimal salaryFrom;
    @JsonProperty("salary_to")
    private BigDecimal salaryTo;
    private String currency;
    @JsonProperty("employment_type")
    private String employmentType;
    @JsonProperty("shift_schedule")
    private String shiftSchedule;
    private List<String> benefits;
    @JsonProperty("positions_count")
    private int positionsCount;
    @JsonProperty("is_mass_hiring")
    private boolean massHiring;
    @JsonProperty("employer_name")
    private String employerName;
    @JsonProperty("employer_logo_url")
    private String employerLogoUrl;
    @JsonProperty("expires_at")
    private String expiresAt;
    @JsonProperty("deeplink_vacancy_id")
    private String deeplinkVacancyId;
    // i18n support: { "uz": "...", "ru": "...", "en": "..." }
    @JsonProperty("title_i18n")
    private Map<String, String> titleI18n;
    @JsonProperty("description_i18n")
    private Map<String, String> descriptionI18n;
}
