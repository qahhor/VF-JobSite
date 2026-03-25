package uz.verifix.jobs.service.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.common.exception.ErrorCode;
import uz.verifix.jobs.common.exception.UnauthorizedException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_EMPLOYER_ID = "employer_id";
    public static final String CLAIM_TYPE = "type";
    public static final String TOKEN_TYPE_ACCESS = "ACCESS";
    public static final String TOKEN_TYPE_REFRESH = "REFRESH";

    private final SecretKey signingKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expiration-ms:86400000}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshTokenExpiration
    ) {
        this.signingKey = Keys.hmacShaKeyFor(resolveSecret(secret));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        return generateAccessToken(userId, email, role, null);
    }

    public String generateAccessToken(UUID userId, String email, String role, UUID employerId) {
        return buildToken(buildClaims(role, email, employerId, TOKEN_TYPE_ACCESS), userId.toString(), accessTokenExpiration);
    }

    public String generateRefreshToken(UUID userId) {
        return generateRefreshToken(userId, null, null);
    }

    public String generateRefreshToken(UUID userId, String role, UUID employerId) {
        return buildToken(buildClaims(role, null, employerId, TOKEN_TYPE_REFRESH), userId.toString(), refreshTokenExpiration);
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseToken(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenValid(String token, String tokenType) {
        return isTokenValid(token) && tokenType.equals(getTokenType(token));
    }

    public String getSubject(String token) {
        return parseToken(token).getSubject();
    }

    public UUID getSubjectId(String token) {
        return UUID.fromString(getSubject(token));
    }

    public String getRole(String token) {
        return parseToken(token).get(CLAIM_ROLE, String.class);
    }

    public UUID getEmployerId(String token) {
        String employerId = parseToken(token).get(CLAIM_EMPLOYER_ID, String.class);
        return employerId == null || employerId.isBlank() ? null : UUID.fromString(employerId);
    }

    public String getTokenType(String token) {
        return parseToken(token).get(CLAIM_TYPE, String.class);
    }

    public void assertRefreshToken(String token) {
        if (!isTokenValid(token, TOKEN_TYPE_REFRESH)) {
            throw new UnauthorizedException(ErrorCode.INVALID_TOKEN.getDefaultMessage());
        }
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        Date now = new Date();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiration))
                .signWith(signingKey)
                .compact();
    }

    private Map<String, Object> buildClaims(String role, String email, UUID employerId, String tokenType) {
        java.util.LinkedHashMap<String, Object> claims = new java.util.LinkedHashMap<>();
        if (role != null) {
            claims.put(CLAIM_ROLE, role);
        }
        if (email != null) {
            claims.put(CLAIM_EMAIL, email);
        }
        if (employerId != null) {
            claims.put(CLAIM_EMPLOYER_ID, employerId.toString());
        }
        claims.put(CLAIM_TYPE, tokenType);
        return claims;
    }

    private byte[] resolveSecret(String secret) {
        try {
            byte[] decoded = Decoders.BASE64.decode(secret);
            if (decoded.length >= 32) {
                return decoded;
            }
        } catch (Exception ignored) {
        }

        try {
            return MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to derive JWT signing key", e);
        }
    }
}
