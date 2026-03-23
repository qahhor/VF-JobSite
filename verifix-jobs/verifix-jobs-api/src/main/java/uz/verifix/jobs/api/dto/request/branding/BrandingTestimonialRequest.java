package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrandingTestimonialRequest {
    @NotBlank private String employeeName;
    private String employeePosition;
    private String employeePhotoUrl;
    private String textUz;
    private String textRu;
}
