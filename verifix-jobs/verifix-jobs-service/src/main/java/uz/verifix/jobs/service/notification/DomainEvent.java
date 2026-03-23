package uz.verifix.jobs.service.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainEvent {

    private String type;
    private UUID entityId;
    private String entityType;
    private UUID actorId;
    private Map<String, Object> payload;
    @Builder.Default
    private Instant timestamp = Instant.now();

    // Event types
    public static final String APPLICATION_NEW = "application.new";
    public static final String APPLICATION_STATUS_CHANGED = "application.status_changed";
    public static final String APPLICATION_HIRED = "application.hired";
    public static final String APPLICATION_REJECTED = "application.rejected";
    public static final String VACANCY_CREATED = "vacancy.created";
    public static final String VACANCY_APPROVED = "vacancy.approved";
    public static final String VACANCY_REJECTED = "vacancy.rejected";
    public static final String VACANCY_EXPIRED = "vacancy.expired";
    public static final String EMPLOYER_VERIFIED = "employer.verified";
    public static final String REFERRAL_HIRED = "referral.hired";
    public static final String BRANDING_PUBLISHED = "branding.published";
    public static final String BRANDING_UPGRADED = "branding.upgraded";
}
