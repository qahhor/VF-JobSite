package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {

    private String planCode;
    private String planName;
    private long activeVacancies;
    private int maxVacancies;
    private boolean hasAts;
    private boolean hasAnalytics;
    private boolean hasApi;
    private boolean hasBranding;
}
