package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import uz.verifix.jobs.domain.enums.OfficeLocationType;

@Data
public class BrandingLocationRequest {
    @NotBlank private String name;
    private String address;
    private String city;
    private OfficeLocationType type;
}
