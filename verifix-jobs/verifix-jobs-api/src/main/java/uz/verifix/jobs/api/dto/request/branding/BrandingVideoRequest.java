package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import uz.verifix.jobs.domain.enums.VideoType;

@Data
public class BrandingVideoRequest {
    private VideoType videoType;
    @NotBlank private String videoUrl;
    private String title;
}
