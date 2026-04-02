package uz.verifix.jobs.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
    private final Map<String, StoredOtp> inMemoryOtps = new ConcurrentHashMap<>();
    private final Map<String, StoredRateCounter> inMemoryRateCounters = new ConcurrentHashMap<>();

    public String generateOtp(String phone) {
        String code = generateCode();
        String key = OTP_PREFIX + phone;
        try {
          redisTemplate.opsForValue().set(key, code, OTP_TTL);
        } catch (RuntimeException ex) {
          log.warn("Redis unavailable while storing OTP for {}. Falling back to in-memory store: {}", maskedPhone(phone), ex.getMessage());
          inMemoryOtps.put(phone, new StoredOtp(code, Instant.now().plus(OTP_TTL)));
        }
        incrementRateLimit(phone);
        log.info("OTP generated for phone: {}", phone.substring(0, phone.length() - 4) + "****");
        return code;
    }

    public boolean verifyOtp(String phone, String code) {
        String key = OTP_PREFIX + phone;
        String storedCode = null;
        try {
            storedCode = redisTemplate.opsForValue().get(key);
        } catch (RuntimeException ex) {
            log.warn("Redis unavailable while reading OTP for {}. Checking in-memory fallback: {}", maskedPhone(phone), ex.getMessage());
        }

        if (storedCode == null) {
            StoredOtp fallback = inMemoryOtps.get(phone);
            if (fallback != null) {
                if (fallback.expiresAt().isBefore(Instant.now())) {
                    inMemoryOtps.remove(phone);
                } else {
                    storedCode = fallback.code();
                }
            }
        }

        if (storedCode != null && MessageDigest.isEqual(
                storedCode.getBytes(StandardCharsets.UTF_8), code.getBytes(StandardCharsets.UTF_8))) {
            try {
                redisTemplate.delete(key);
            } catch (RuntimeException ex) {
                log.warn("Redis unavailable while deleting OTP for {}. Clearing in-memory fallback only: {}", maskedPhone(phone), ex.getMessage());
            }
            inMemoryOtps.remove(phone);
            return true;
        }
        return false;
    }

    public boolean isRateLimited(String phone) {
        String key = OTP_RATE_PREFIX + phone;
        try {
            String count = redisTemplate.opsForValue().get(key);
            return count != null && Integer.parseInt(count) >= MAX_OTP_PER_HOUR;
        } catch (RuntimeException ex) {
            log.warn("Redis unavailable while checking OTP rate limit for {}. Using in-memory fallback: {}", maskedPhone(phone), ex.getMessage());
            StoredRateCounter fallback = inMemoryRateCounters.get(phone);
            if (fallback == null) {
                return false;
            }
            if (fallback.expiresAt().isBefore(Instant.now())) {
                inMemoryRateCounters.remove(phone);
                return false;
            }
            return fallback.count() >= MAX_OTP_PER_HOUR;
        }
    }

    private void incrementRateLimit(String phone) {
        String key = OTP_RATE_PREFIX + phone;
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                redisTemplate.expire(key, Duration.ofHours(1));
            }
        } catch (RuntimeException ex) {
            log.warn("Redis unavailable while incrementing OTP rate limit for {}. Using in-memory fallback: {}", maskedPhone(phone), ex.getMessage());
            StoredRateCounter current = inMemoryRateCounters.get(phone);
            Instant now = Instant.now();
            if (current == null || current.expiresAt().isBefore(now)) {
                inMemoryRateCounters.put(phone, new StoredRateCounter(1, now.plus(Duration.ofHours(1))));
            } else {
                inMemoryRateCounters.put(phone, new StoredRateCounter(current.count() + 1, current.expiresAt()));
            }
        }
    }

    private String maskedPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return "unknown";
        }
        return phone.substring(0, Math.max(0, phone.length() - 4)) + "****";
    }

    private String generateCode() {
        int code = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    private record StoredOtp(String code, Instant expiresAt) {}
    private record StoredRateCounter(int count, Instant expiresAt) {}
}
