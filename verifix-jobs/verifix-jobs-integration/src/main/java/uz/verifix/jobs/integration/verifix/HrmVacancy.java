package uz.verifix.jobs.integration.verifix;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HrmVacancy {
    @JsonProperty("vacancy_id")
    private Long vacancyId;
    private String name;
    private String description;
    @JsonProperty("description_in_html")
    private String descriptionHtml;
    @JsonProperty("division_id")
    private Long divisionId;
    @JsonProperty("division_name")
    private String divisionName;
    @JsonProperty("job_id")
    private Long jobId;
    @JsonProperty("job_name")
    private String jobName;
    @JsonProperty("region_id")
    private Long regionId;
    @JsonProperty("region_name")
    private String regionName;
    @JsonProperty("wage_from")
    private BigDecimal wageFrom;
    @JsonProperty("wage_to")
    private BigDecimal wageTo;
    private int quantity;
    private String scope;
    @JsonProperty("is_urgent")
    private boolean urgent;
    private LocalDate deadline;
    @JsonProperty("opened_date")
    private LocalDate openedDate;
    @JsonProperty("schedule_name")
    private String scheduleName;
    @JsonProperty("vacancy_purpose")
    private String vacancyPurpose;
    private String status;
    @JsonProperty("modified_id")
    private Long modifiedId;
}
