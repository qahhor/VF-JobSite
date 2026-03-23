package uz.verifix.jobs.api.dto.request.branding;

import lombok.Data;

@Data
public class BrandingUpdateRequest {
    private String customSlug;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String coverType;
    private String descriptionHtml;
    private String metaTitle;
    private String metaDescription;
}
