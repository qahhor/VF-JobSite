package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VacancyResponse {

    private UUID id;
    private UUID employerId;
    private String employerName;
    private String title;
    private String description;
    private String category;
    private String city;
    private String region;
    private Double latitude;
    private Double longitude;
    private BigDecimal salaryFrom;
    private BigDecimal salaryTo;
    private String currency;
    private String employmentType;
    private String shiftSchedule;
    private List<String> benefits;
    private String status;
    private String moderationStatus;
    private Boolean isMassHiring;
    private Integer positionsCount;
    private Integer positionsFilled;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;
}
