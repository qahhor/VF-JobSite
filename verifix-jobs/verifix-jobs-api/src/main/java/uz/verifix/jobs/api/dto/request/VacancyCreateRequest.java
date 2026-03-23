package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VacancyCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 100, message = "City must not exceed 100 characters")
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
    @Size(max = 50, message = "Benefits list must not exceed 50 items")
    private List<String> benefits;

    private Boolean isMassHiring;

    @Positive(message = "Positions count must be positive")
    private Integer positionsCount;
}
