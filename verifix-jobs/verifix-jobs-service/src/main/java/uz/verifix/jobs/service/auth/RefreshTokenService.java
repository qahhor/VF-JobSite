package uz.verifix.jobs.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.common.util.HashUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private static final String REFRESH_PREFIX = "auth:refresh:";

    private final StringRedisTemplate redisTemplate;
    private final Map<UUID, StoredToken> inMemoryTokens = new ConcurrentHashMap<>();

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public void store(UUID userId, String refreshToken) {
        String hashed = hash(refreshToken);
        Duration ttl = Duration.ofMillis(refreshTokenExpirationMs);
        try {
            redisTemplate.opsForValue().set(key(userId), hashed, ttl);
            inMemoryTokens.remove(userId);
        } catch (RuntimeException ex) {
            log.warn("Redis unavailable while storing refresh token for {}. Falling back to in-memory store: {}", userId, ex.getMessage());
            inMemoryTokens.put(userId, new StoredToken(hashed, Instant.now().plus(ttl)));
        }
    }

    public boolean matches(UUID userId, String refreshToken) {
        String expectedHash = hash(refreshToken);
        try {
            String stored = redisTemplate.opsForValue().get(key(userId));
            if (stored != null) {
                return stored.equals(expectedHash);
            }
        } catch (RuntimeException ex) {
            log.warn("Redis unavailable while reading refresh token for {}. Checking in-memory fallback: {}", userId, ex.getMessage());
        }
        StoredToken fallback = inMemoryTokens.get(userId);
        if (fallback == null) {
            return false;
        }
        if (fallback.expiresAt().isBefore(Instant.now())) {
            inMemoryTokens.remove(userId);
            return false;
        }
        return fallback.hash().equals(expectedHash);
    }

    public boolean rotate(UUID userId, String oldToken, String newToken) {
        if (!matches(userId, oldToken)) {
            return false;
        }
        store(userId, newToken);
        return true;
    }

    public void revoke(UUID userId) {
        try {
            redisTemplate.delete(key(userId));
        } catch (RuntimeException ex) {
            log.warn("Redis unavailable while revoking refresh token for {}. Clearing in-memory fallback only: {}", userId, ex.getMessage());
        }
        inMemoryTokens.remove(userId);
    }

    private String key(UUID userId) {
        return REFRESH_PREFIX + userId;
    }

    private String hash(String token) {
        return HashUtils.sha256Hex(token);
    }

    private record StoredToken(String hash, Instant expiresAt) {}
}
