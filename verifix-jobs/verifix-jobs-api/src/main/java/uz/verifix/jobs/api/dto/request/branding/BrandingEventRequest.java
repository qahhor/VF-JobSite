package uz.verifix.jobs.api.dto.request.branding;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import uz.verifix.jobs.domain.enums.BrandingEventType;

import java.util.UUID;

@Data
public class BrandingEventRequest {
    @NotNull private UUID brandingId;
    @NotNull private BrandingEventType eventType;
    private String sectionId;
    private String visitorId;
    private String source;
}
