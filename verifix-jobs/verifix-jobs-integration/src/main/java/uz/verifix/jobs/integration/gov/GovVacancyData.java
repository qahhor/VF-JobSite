package uz.verifix.jobs.integration.gov;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GovVacancyData {
    private String externalId;
    private String title;
    private String description;
    private String category;
    private String city;
    private String region;
    private String employerName;
    private String employerInn;
    private BigDecimal salaryFrom;
    private BigDecimal salaryTo;
    private String employmentType;
    private int positionsCount;
}
