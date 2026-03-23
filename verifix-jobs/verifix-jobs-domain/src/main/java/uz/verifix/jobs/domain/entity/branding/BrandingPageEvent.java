package uz.verifix.jobs.domain.entity.branding;

import jakarta.persistence.*;
import lombok.*;
import uz.verifix.jobs.domain.enums.BrandingEventType;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "branding_page_event")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandingPageEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branding_id", nullable = false)
    private EmployerBranding branding;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private BrandingEventType eventType;

    @Column(name = "section_id", length = 100)
    private String sectionId;

    @Column(name = "visitor_id", length = 100)
    private String visitorId;

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
