package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrandingStoryRequest {
    @NotBlank private String title;
    private String contentHtml;
    private String coverImageUrl;
    private String authorName;
    private String authorPhotoUrl;
    private String authorPosition;
}
