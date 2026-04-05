package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerProfileResponse {

    private UUID id;
    private String name;
    private String inn;
    private String legalName;
    private String logoUrl;
    private String industry;
    private String city;
    private String region;
    private Double latitude;
    private Double longitude;
    private String status;
    private String moderationStatus;
    private String subscriptionPlan;
    private Boolean isVerified;
    private Instant verifiedAt;
    private Instant deactivatedAt;
    private String deactivationReason;
    private long activeVacancies;
    private long totalVacancies;
    private String description;
    private String websiteUrl;
    private String employeeCountRange;
    private Integer foundedYear;
    private String slug;
    private Instant createdAt;
    private Instant updatedAt;
}
