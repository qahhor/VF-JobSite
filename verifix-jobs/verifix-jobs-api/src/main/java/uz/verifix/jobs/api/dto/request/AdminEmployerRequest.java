package uz.verifix.jobs.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

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
}
