package uz.verifix.jobs.api.dto.request.branding;

import lombok.Data;

@Data
public class BrandingStatsCounterRequest {
    private String labelUz;
    private String labelRu;
    private String value;
    private String icon;
}
