package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.enums.ModerationStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employer extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "inn", unique = true)
    private String inn;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "industry")
    private String industry;

    @Column(name = "city")
    private String city;

    @Column(name = "region")
    private String region;

    @Column(name = "location", columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EmployerStatus status = EmployerStatus.PENDING;

    @Column(name = "subscription_plan")
    private String subscriptionPlan;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "myid_verified_at")
    private Instant myidVerifiedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", nullable = false)
    @Builder.Default
    private ModerationStatus moderationStatus = ModerationStatus.PENDING;

    @Column(name = "branding_tier")
    @Builder.Default
    private String brandingTier = "BASIC";

    @Column(name = "branding_expires_at")
    private Instant brandingExpiresAt;

    @OneToMany(mappedBy = "employer")
    @Builder.Default
    private List<Manager> managers = new ArrayList<>();

    @OneToMany(mappedBy = "employer")
    @Builder.Default
    private List<Vacancy> vacancies = new ArrayList<>();

    @OneToMany(mappedBy = "employer")
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();
}
