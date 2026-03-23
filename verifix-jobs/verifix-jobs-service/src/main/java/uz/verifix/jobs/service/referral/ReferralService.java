package uz.verifix.jobs.service.referral;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Referral;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ReferralStatus;
import uz.verifix.jobs.domain.enums.RewardStatus;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.ReferralRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;

    private static final BigDecimal DEFAULT_REWARD = new BigDecimal("50000"); // 50,000 UZS

    @Transactional
    public Referral createReferral(UUID referrerId, UUID refereeId) {
        Candidate referrer = candidateRepository.findById(referrerId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", referrerId.toString()));
        Candidate referee = candidateRepository.findById(refereeId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", refereeId.toString()));

        Referral referral = Referral.builder()
                .referrer(referrer)
                .referee(referee)
                .status(ReferralStatus.REGISTERED)
                .rewardStatus(RewardStatus.PENDING)
                .build();

        referral = referralRepository.save(referral);
        log.info("Referral created: {} referred {}", referrerId, refereeId);
        return referral;
    }

    @Transactional
    public void onRefereeApplied(UUID refereeId, UUID vacancyId) {
        List<Referral> referrals = referralRepository.findByRefereeId(refereeId);
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);

        for (Referral ref : referrals) {
            if (ref.getStatus() == ReferralStatus.REGISTERED || ref.getStatus() == ReferralStatus.INVITED) {
                ref.setStatus(ReferralStatus.APPLIED);
                if (vacancy != null) {
                    ref.setVacancy(vacancy);
                }
                referralRepository.save(ref);
                log.info("Referral {} updated to APPLIED for vacancy {}", ref.getId(), vacancyId);
            }
        }
    }

    @Transactional
    public void onRefereeHired(UUID refereeId) {
        List<Referral> referrals = referralRepository.findByRefereeId(refereeId);

        for (Referral ref : referrals) {
            if (ref.getStatus() == ReferralStatus.APPLIED) {
                ref.setStatus(ReferralStatus.HIRED);
                ref.setRewardAmount(DEFAULT_REWARD);
                ref.setRewardStatus(RewardStatus.AWARDED);
                referralRepository.save(ref);
                log.info("Referral {} marked as HIRED, reward awarded to referrer {}", ref.getId(), ref.getReferrer().getId());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Referral> getByReferrer(UUID referrerId) {
        return referralRepository.findByReferrerId(referrerId);
    }

    @Transactional(readOnly = true)
    public ReferralStats getStats(UUID referrerId) {
        List<Referral> referrals = referralRepository.findByReferrerId(referrerId);
        long total = referrals.size();
        long applied = referrals.stream().filter(r -> r.getStatus() == ReferralStatus.APPLIED).count();
        long hired = referrals.stream().filter(r -> r.getStatus() == ReferralStatus.HIRED).count();
        BigDecimal totalRewards = referrals.stream()
                .filter(r -> r.getRewardAmount() != null)
                .map(Referral::getRewardAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ReferralStats(total, applied, hired, totalRewards);
    }

    public record ReferralStats(long totalReferrals, long applied, long hired, BigDecimal totalRewards) {}
}
