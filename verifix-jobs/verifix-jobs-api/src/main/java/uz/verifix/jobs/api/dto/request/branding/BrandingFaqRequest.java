package uz.verifix.jobs.api.dto.request.branding;

import lombok.Data;

@Data
public class BrandingFaqRequest {
    private String questionUz;
    private String questionRu;
    private String answerUz;
    private String answerRu;
}
