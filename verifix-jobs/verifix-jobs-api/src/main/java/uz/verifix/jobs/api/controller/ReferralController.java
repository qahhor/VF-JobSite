package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.response.LeaderboardEntryResponse;
import uz.verifix.jobs.api.dto.response.ReferralResponse;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.Referral;
import uz.verifix.jobs.domain.repository.ReferralRepository;
import uz.verifix.jobs.service.referral.ReferralService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;
    private final ReferralRepository referralRepository;

    @GetMapping("/my")
    public ResponseEntity<List<ReferralResponse>> getMyReferrals(Authentication auth) {
        return getMyReferrals(SecurityUtils.extractCandidateId(auth), auth);
    }

    @GetMapping("/my/{candidateId}")
    public ResponseEntity<List<ReferralResponse>> getMyReferrals(
            @PathVariable UUID candidateId,
            Authentication auth) {
        List<Referral> referrals = referralService.getByReferrer(
                SecurityUtils.enforceCandidateAccess(auth, candidateId)
        );
        return ResponseEntity.ok(referrals.stream().map(this::toResponse).toList());
    }

    @GetMapping("/my/stats")
    public ResponseEntity<ReferralService.ReferralStats> getMyStats(Authentication auth) {
        return getMyStats(SecurityUtils.extractCandidateId(auth), auth);
    }

    @GetMapping("/my/{candidateId}/stats")
    public ResponseEntity<ReferralService.ReferralStats> getMyStats(
            @PathVariable UUID candidateId,
            Authentication auth) {
        return ResponseEntity.ok(referralService.getStats(
                SecurityUtils.enforceCandidateAccess(auth, candidateId)
        ));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntryResponse>> getLeaderboard() {
        List<Object[]> top = referralRepository.findTopReferrers(20);
        List<LeaderboardEntryResponse> leaderboard = top.stream()
                .map(row -> LeaderboardEntryResponse.builder()
                        .candidateId((UUID) row[0])
                        .firstName((String) row[1])
                        .lastName((String) row[2])
                        .referralCount(((Number) row[3]).longValue())
                        .hiredCount(((Number) row[4]).longValue())
                        .build())
                .toList();
        return ResponseEntity.ok(leaderboard);
    }

    private ReferralResponse toResponse(Referral r) {
        return ReferralResponse.builder()
                .id(r.getId())
                .refereeFirstName(r.getReferee().getFirstName())
                .refereeLastName(r.getReferee().getLastName())
                .status(r.getStatus().name())
                .rewardStatus(r.getRewardStatus().name())
                .rewardAmount(r.getRewardAmount())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
