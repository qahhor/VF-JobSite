package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import uz.verifix.jobs.domain.enums.EmployerStatus;

@Data
public class AdminEmployerRequest {

    @NotBlank
    private String name;
    private String inn;
    private String legalName;
    private String city;
    private String region;
    private String industry;
    private String websiteUrl;
    private String employeeCountRange;
    private Integer foundedYear;
    private String description;

    /** Admin can set status directly (null = keep existing or use default ACTIVE on create) */
    private EmployerStatus status;

    /** Admin can grant/revoke verification flag */
    private Boolean isVerified;

    /** Required when changing status to BLOCKED/INACTIVE/SUSPENDED */
    private String deactivationReason;
}
