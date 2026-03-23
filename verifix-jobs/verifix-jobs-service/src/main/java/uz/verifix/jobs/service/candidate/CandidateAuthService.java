package uz.verifix.jobs.service.candidate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.BusinessException;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.util.PhoneUtils;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.service.auth.JwtService;
import uz.verifix.jobs.service.auth.OtpService;
import uz.verifix.jobs.service.notification.SmsService;

import java.security.SecureRandom;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidateAuthService {

    private final CandidateRepository candidateRepository;
    private final OtpService otpService;
    private final SmsService smsService;
    private final JwtService jwtService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String REFERRAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public void sendOtp(String phone) {
        String normalized = PhoneUtils.normalize(phone);
        if (!PhoneUtils.isValid(normalized)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, "Invalid phone number");
        }
        if (otpService.isRateLimited(normalized)) {
            throw new BusinessException(ErrorCode.OTP_RATE_LIMIT, HttpStatus.TOO_MANY_REQUESTS);
        }

        String code = otpService.generateOtp(normalized);
        smsService.send(normalized, "Verifix Jobs: Sizning kodingiz: " + code);
        log.info("OTP sent to {}", normalized);
    }

    @Transactional
    public VerifyResult verifyOtp(String phone, String code) {
        String normalized = PhoneUtils.normalize(phone);

        if (!otpService.verifyOtp(normalized, code)) {
            throw new BusinessException(ErrorCode.INVALID_OTP, HttpStatus.UNAUTHORIZED);
        }

        Optional<Candidate> existingCandidate = candidateRepository.findByPhone(normalized);
        boolean isNewUser = existingCandidate.isEmpty();

        Candidate candidate;
        if (isNewUser) {
            candidate = Candidate.builder()
                    .phone(normalized)
                    .referralCode(generateReferralCode())
                    .build();
            candidate = candidateRepository.save(candidate);
            log.info("New candidate registered: {}", candidate.getId());
        } else {
            candidate = existingCandidate.get();
        }

        String accessToken = jwtService.generateAccessToken(candidate.getId(), normalized, "CANDIDATE");
        String refreshToken = jwtService.generateRefreshToken(candidate.getId());

        return new VerifyResult(candidate.getId(), accessToken, refreshToken, isNewUser);
    }

    private String generateReferralCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder code = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                code.append(REFERRAL_CHARS.charAt(RANDOM.nextInt(REFERRAL_CHARS.length())));
            }
            String result = code.toString();
            if (candidateRepository.findByReferralCode(result).isEmpty()) {
                return result;
            }
        }
        // Fallback to UUID-based code if all attempts collide (extremely unlikely)
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public record VerifyResult(UUID candidateId, String accessToken, String refreshToken, boolean newUser) {}
}
