package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "pricing_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingPlan extends BaseEntity {

    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "max_vacancies")
    private Integer maxVacancies;

    @Column(name = "max_resume_views")
    private Integer maxResumeViews;

    @Column(name = "has_ats")
    @Builder.Default
    private Boolean hasAts = false;

    @Column(name = "has_analytics")
    @Builder.Default
    private Boolean hasAnalytics = false;

    @Column(name = "has_api")
    @Builder.Default
    private Boolean hasApi = false;

    @Column(name = "has_branding")
    @Builder.Default
    private Boolean hasBranding = false;

    @Column(name = "price_monthly_uzs", precision = 15, scale = 2)
    private BigDecimal priceMonthlyUzs;

    @Column(name = "price_annual_uzs", precision = 15, scale = 2)
    private BigDecimal priceAnnualUzs;
}
