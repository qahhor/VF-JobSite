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
import uz.verifix.jobs.domain.enums.DigestPreference;
import uz.verifix.jobs.domain.enums.EducationLevel;
import uz.verifix.jobs.domain.enums.Gender;
import uz.verifix.jobs.domain.enums.LanguagePreference;
import uz.verifix.jobs.domain.enums.MyIdStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate extends BaseEntity {

    @Column(name = "phone", unique = true, nullable = false)
    private String phone;

    @Column(name = "telegram_id", unique = true)
    private Long telegramId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "city")
    private String city;

    @Column(name = "region")
    private String region;

    @Column(name = "home_location", columnDefinition = "geometry(Point,4326)")
    private Point homeLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "education_level")
    private EducationLevel educationLevel;

    @Column(name = "work_experience_text", columnDefinition = "text")
    private String workExperienceText;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "skills", columnDefinition = "text[]")
    private String[] skills;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "preferred_categories", columnDefinition = "text[]")
    private String[] preferredCategories;

    @Column(name = "preferred_salary", precision = 15, scale = 2)
    private BigDecimal preferredSalary;

    @Column(name = "preferred_radius_km")
    private Integer preferredRadiusKm;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "passport_series")
    private String passportSeries;

    @Enumerated(EnumType.STRING)
    @Column(name = "myid_status", nullable = false)
    @Builder.Default
    private MyIdStatus myidStatus = MyIdStatus.NONE;

    @Column(name = "myid_verified_at")
    private Instant myidVerifiedAt;

    @Column(name = "referral_code", unique = true)
    private String referralCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by_id")
    private Candidate referredBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "language_pref")
    @Builder.Default
    private LanguagePreference languagePref = LanguagePreference.UZ;

    @Enumerated(EnumType.STRING)
    @Column(name = "digest_pref")
    @Builder.Default
    private DigestPreference digestPref = DigestPreference.DAILY;

    @OneToMany(mappedBy = "candidate")
    @Builder.Default
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "candidate")
    @Builder.Default
    private List<WorkHistory> workHistories = new ArrayList<>();
}
