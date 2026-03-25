package uz.verifix.jobs.integration.verifix;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HrmSalaryStats {
    @JsonProperty("job_name")
    private String jobName;
    @JsonProperty("division_name")
    private String divisionName;
    @JsonProperty("region_name")
    private String regionName;
    @JsonProperty("avg_salary")
    private BigDecimal avgSalary;
    @JsonProperty("min_salary")
    private BigDecimal minSalary;
    @JsonProperty("max_salary")
    private BigDecimal maxSalary;
    @JsonProperty("employee_count")
    private int employeeCount;
}
