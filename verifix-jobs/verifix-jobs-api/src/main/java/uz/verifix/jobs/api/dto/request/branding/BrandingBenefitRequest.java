package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrandingBenefitRequest {
    @NotBlank private String icon;
    private String titleUz;
    private String titleRu;
    private String descriptionUz;
    private String descriptionRu;
    private String imageUrl;
}
