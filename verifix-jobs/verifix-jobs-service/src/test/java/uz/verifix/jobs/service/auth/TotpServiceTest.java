package uz.verifix.jobs.service.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TotpServiceTest {

    @Test
    void shouldGenerateBase32SecretAndOtpUri() {
        TotpService totpService = new TotpService();

        String secret = totpService.generateSecret();
        String uri = totpService.buildOtpAuthUri("VerifixJobs", "admin@example.com", secret);

        assertNotNull(secret);
        assertFalse(secret.isBlank());
        assertTrue(secret.matches("[A-Z2-7]+"));
        assertTrue(uri.contains("otpauth://totp/VerifixJobs:admin@example.com"));
        assertTrue(uri.contains("secret=" + secret));
    }

    @Test
    void shouldRejectInvalidTotpCode() {
        TotpService totpService = new TotpService();
        String secret = totpService.generateSecret();

        assertFalse(totpService.verify(secret, "12345"));
        assertFalse(totpService.verify(secret, "abcdef"));
    }
}
