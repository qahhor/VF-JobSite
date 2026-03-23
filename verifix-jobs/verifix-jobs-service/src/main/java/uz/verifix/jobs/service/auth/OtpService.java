package uz.verifix.jobs.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_PREFIX = "otp:";
    private static final String OTP_RATE_PREFIX = "otp_rate:";
    private static final int OTP_LENGTH = 6;
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final int MAX_OTP_PER_HOUR = 5;

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateOtp(String phone) {
        String code = generateCode();
        String key = OTP_PREFIX + phone;
        redisTemplate.opsForValue().set(key, code, OTP_TTL);
        incrementRateLimit(phone);
        log.info("OTP generated for phone: {}", phone.substring(0, phone.length() - 4) + "****");
        return code;
    }

    public boolean verifyOtp(String phone, String code) {
        String key = OTP_PREFIX + phone;
        String storedCode = redisTemplate.opsForValue().get(key);
        if (storedCode != null && storedCode.equals(code)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }

    public boolean isRateLimited(String phone) {
        String key = OTP_RATE_PREFIX + phone;
        String count = redisTemplate.opsForValue().get(key);
        return count != null && Integer.parseInt(count) >= MAX_OTP_PER_HOUR;
    }

    private void incrementRateLimit(String phone) {
        String key = OTP_RATE_PREFIX + phone;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofHours(1));
        }
    }

    private String generateCode() {
        int code = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}
