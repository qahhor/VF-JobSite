package uz.verifix.jobs.service.auth;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    @Test
    void shouldGenerateAccessTokenWithCanonicalClaims() {
        JwtService jwtService = new JwtService("change-me-dev-secret", 900000, 604800000);
        UUID userId = UUID.randomUUID();
        UUID employerId = UUID.randomUUID();

        String token = jwtService.generateAccessToken(userId, "admin@example.com", "EMPLOYER_ADMIN", employerId);

        assertTrue(jwtService.isTokenValid(token, JwtService.TOKEN_TYPE_ACCESS));
        assertEquals(userId, jwtService.getSubjectId(token));
        assertEquals(employerId, jwtService.getEmployerId(token));
        assertEquals("EMPLOYER_ADMIN", jwtService.getRole(token));
        assertEquals(JwtService.TOKEN_TYPE_ACCESS, jwtService.getTokenType(token));
    }

    @Test
    void shouldGenerateRefreshTokenWithRefreshType() {
        JwtService jwtService = new JwtService("change-me-dev-secret", 900000, 604800000);
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateRefreshToken(userId, "CANDIDATE", null);

        assertTrue(jwtService.isTokenValid(token, JwtService.TOKEN_TYPE_REFRESH));
        assertEquals(userId, jwtService.getSubjectId(token));
        assertEquals("CANDIDATE", jwtService.getRole(token));
        assertNull(jwtService.getEmployerId(token));
        assertEquals(JwtService.TOKEN_TYPE_REFRESH, jwtService.getTokenType(token));
    }
}
