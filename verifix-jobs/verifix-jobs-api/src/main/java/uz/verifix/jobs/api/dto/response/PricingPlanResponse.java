package uz.verifix.jobs.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingPlanResponse {

    private UUID id;
    private String code;
    private String name;
    private Integer maxVacancies;
    private Integer maxResumeViews;
    private Boolean hasAts;
    private Boolean hasAnalytics;
    private Boolean hasApi;
    private Boolean hasBranding;
    private BigDecimal priceMonthlyUzs;
    private BigDecimal priceAnnualUzs;
}
