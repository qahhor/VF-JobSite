package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uz.verifix.jobs.domain.enums.SmsProvider;
import uz.verifix.jobs.domain.enums.SmsStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "sms_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsLog extends BaseEntity {

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "message_text", columnDefinition = "text")
    private String messageText;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private SmsProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SmsStatus status = SmsStatus.PENDING;

    @Column(name = "cost", precision = 10, scale = 4)
    private BigDecimal cost;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;
}
