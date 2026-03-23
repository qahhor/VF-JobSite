package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "branding_analytics",
        uniqueConstraints = @UniqueConstraint(columnNames = {"branding_id", "date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "page_views") @Builder.Default private Integer pageViews = 0;
    @Column(name = "unique_visitors") @Builder.Default private Integer uniqueVisitors = 0;
    @Column(name = "vacancy_clicks") @Builder.Default private Integer vacancyClicks = 0;
    @Column(name = "apply_clicks") @Builder.Default private Integer applyClicks = 0;
    @Column(name = "avg_time_on_page_seconds") @Builder.Default private Integer avgTimeOnPageSeconds = 0;
    @Column(name = "source_telegram") @Builder.Default private Integer sourceTelegram = 0;
    @Column(name = "source_web") @Builder.Default private Integer sourceWeb = 0;
    @Column(name = "source_search") @Builder.Default private Integer sourceSearch = 0;
    @Column(name = "source_qr") @Builder.Default private Integer sourceQr = 0;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
