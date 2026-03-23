package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import uz.verifix.jobs.domain.enums.SocialPlatform;

@Data
public class BrandingSocialLinkRequest {
    private SocialPlatform platform;
    @NotBlank private String url;
}
