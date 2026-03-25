package uz.verifix.jobs.service.referral;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Referral;
import uz.verifix.jobs.domain.enums.ReferralStatus;
import uz.verifix.jobs.domain.enums.RewardStatus;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.ReferralRepository;
import uz.verifix.jobs.common.exception.BusinessException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReferralServiceTest {

    @Mock private ReferralRepository referralRepository;
    @Mock private CandidateRepository candidateRepository;
    @InjectMocks private ReferralService referralService;

    @Test
    void shouldCreateReferral() {
        UUID referrerId = UUID.randomUUID();
        UUID refereeId = UUID.randomUUID();
        Candidate referrer = Candidate.builder().id(referrerId).referralCode("ABC123").build();
        Candidate referee = Candidate.builder().id(refereeId).build();

        when(candidateRepository.findById(referrerId)).thenReturn(Optional.of(referrer));
        when(candidateRepository.findById(refereeId)).thenReturn(Optional.of(referee));
        when(referralRepository.save(any(Referral.class))).thenAnswer(inv -> inv.getArgument(0));

        Referral result = referralService.createReferral(referrerId, refereeId);

        assertThat(result.getStatus()).isEqualTo(ReferralStatus.REGISTERED);
        assertThat(result.getRewardStatus()).isEqualTo(RewardStatus.PENDING);
    }

    @Test
    void shouldPreventSelfReferral() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> referralService.createReferral(userId, userId))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void shouldAwardRewardOnHire() {
        UUID referralId = UUID.randomUUID();
        Referral referral = Referral.builder().id(referralId).status(ReferralStatus.APPLIED).rewardStatus(RewardStatus.PENDING).build();

        when(referralRepository.findById(referralId)).thenReturn(Optional.of(referral));
        when(referralRepository.save(any(Referral.class))).thenAnswer(inv -> inv.getArgument(0));

        Referral result = referralService.markHired(referralId);

        assertThat(result.getStatus()).isEqualTo(ReferralStatus.HIRED);
        assertThat(result.getRewardStatus()).isEqualTo(RewardStatus.AWARDED);
    }
}
