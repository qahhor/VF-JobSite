package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;
import uz.verifix.jobs.domain.enums.EmploymentType;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.ShiftSchedule;
import uz.verifix.jobs.domain.enums.VacancySource;
import uz.verifix.jobs.domain.enums.VacancyStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vacancy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vacancy extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "city")
    private String city;

    @Column(name = "region")
    private String region;

    @Column(name = "location", columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(name = "salary_from", precision = 15, scale = 2)
    private BigDecimal salaryFrom;

    @Column(name = "salary_to", precision = 15, scale = 2)
    private BigDecimal salaryTo;

    @Column(name = "currency")
    @Builder.Default
    private String currency = "UZS";

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type")
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_schedule")
    private ShiftSchedule shiftSchedule;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "benefits", columnDefinition = "text[]")
    private String[] benefits;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private VacancyStatus status = VacancyStatus.DRAFT;

    @Column(name = "is_mass_hiring")
    @Builder.Default
    private Boolean isMassHiring = false;

    @Column(name = "positions_count")
    @Builder.Default
    private Integer positionsCount = 1;

    @Column(name = "positions_filled")
    @Builder.Default
    private Integer positionsFilled = 0;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", nullable = false)
    @Builder.Default
    private ModerationStatus moderationStatus = ModerationStatus.PENDING;

    @Column(name = "moderation_note", columnDefinition = "text")
    private String moderationNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    @Builder.Default
    private VacancySource source = VacancySource.MANUAL;

    @OneToMany(mappedBy = "vacancy")
    @Builder.Default
    private List<Application> applications = new ArrayList<>();
}
