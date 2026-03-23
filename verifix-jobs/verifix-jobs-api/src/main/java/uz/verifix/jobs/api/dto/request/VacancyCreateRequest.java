package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VacancyCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String category;

    private String city;
    private String region;
    private Double latitude;
    private Double longitude;

    @Positive(message = "Salary must be positive")
    private BigDecimal salaryFrom;

    @Positive(message = "Salary must be positive")
    private BigDecimal salaryTo;

    private String currency;
    private String employmentType;
    private String shiftSchedule;
    private List<String> benefits;

    private Boolean isMassHiring;

    @Positive(message = "Positions count must be positive")
    private Integer positionsCount;
}
