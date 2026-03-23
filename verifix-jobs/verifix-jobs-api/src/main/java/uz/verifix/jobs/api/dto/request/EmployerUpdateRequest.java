package uz.verifix.jobs.api.dto.request;

import lombok.Data;

@Data
public class EmployerUpdateRequest {

    private String name;
    private String legalName;
    private String industry;
    private String city;
    private String region;
    private Double latitude;
    private Double longitude;
}
