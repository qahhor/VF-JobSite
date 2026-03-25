package uz.verifix.jobs.service.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.common.util.HashUtils;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final String REFRESH_PREFIX = "auth:refresh:";

    private final StringRedisTemplate redisTemplate;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public void store(UUID userId, String refreshToken) {
        redisTemplate.opsForValue().set(key(userId), hash(refreshToken), Duration.ofMillis(refreshTokenExpirationMs));
    }

    public boolean matches(UUID userId, String refreshToken) {
        String stored = redisTemplate.opsForValue().get(key(userId));
        return stored != null && stored.equals(hash(refreshToken));
    }

    public boolean rotate(UUID userId, String oldToken, String newToken) {
        if (!matches(userId, oldToken)) {
            return false;
        }
        store(userId, newToken);
        return true;
    }

    public void revoke(UUID userId) {
        redisTemplate.delete(key(userId));
    }

    private String key(UUID userId) {
        return REFRESH_PREFIX + userId;
    }

    private String hash(String token) {
        return HashUtils.sha256Hex(token);
    }
}
