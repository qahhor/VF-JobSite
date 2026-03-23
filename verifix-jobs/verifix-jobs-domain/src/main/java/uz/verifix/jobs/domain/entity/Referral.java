package uz.verifix.jobs.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uz.verifix.jobs.domain.enums.ReferralStatus;
import uz.verifix.jobs.domain.enums.RewardStatus;

import java.math.BigDecimal;

@Entity
@Table(name = "referral")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id", nullable = false)
    private Candidate referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id", nullable = false)
    private Candidate referee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id")
    private Vacancy vacancy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReferralStatus status = ReferralStatus.INVITED;

    @Enumerated(EnumType.STRING)
    @Column(name = "reward_status", nullable = false)
    @Builder.Default
    private RewardStatus rewardStatus = RewardStatus.PENDING;

    @Column(name = "reward_amount", precision = 15, scale = 2)
    private BigDecimal rewardAmount;
}
