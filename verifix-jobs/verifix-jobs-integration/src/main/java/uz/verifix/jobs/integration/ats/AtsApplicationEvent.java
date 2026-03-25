package uz.verifix.jobs.integration.ats;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AtsApplicationEvent {
    @JsonProperty("application_id")
    private String applicationId;
    @JsonProperty("candidate_telegram_id")
    private Long candidateTelegramId;
    @JsonProperty("candidate_name")
    private String candidateName;
    @JsonProperty("vacancy_id")
    private String vacancyId;
    @JsonProperty("vacancy_title")
    private String vacancyTitle;
    @JsonProperty("old_status")
    private String oldStatus;
    @JsonProperty("new_status")
    private String newStatus;
    @JsonProperty("employer_name")
    private String employerName;
    private String note;
    // i18n message: { "uz": "Status o'zgardi", "ru": "Статус изменён" }
    @JsonProperty("message_i18n")
    private Map<String, String> messageI18n;
}
