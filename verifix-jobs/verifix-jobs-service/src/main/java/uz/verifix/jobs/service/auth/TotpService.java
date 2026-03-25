package uz.verifix.jobs.service.auth;

import org.springframework.stereotype.Service;
import uz.verifix.jobs.common.util.Base32Utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;

@Service
public class TotpService {

    private static final String HMAC_ALGORITHM = "HmacSHA1";
    private static final int DEFAULT_DIGITS = 6;
    private static final int TIME_STEP_SECONDS = 30;
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateSecret() {
        byte[] bytes = new byte[20];
        secureRandom.nextBytes(bytes);
        return Base32Utils.encode(bytes);
    }

    public String buildOtpAuthUri(String issuer, String accountName, String secret) {
        return "otpauth://totp/" + issuer + ":" + accountName
                + "?secret=" + secret
                + "&issuer=" + issuer
                + "&digits=" + DEFAULT_DIGITS
                + "&period=" + TIME_STEP_SECONDS;
    }

    public boolean verify(String secret, String code) {
        if (secret == null || secret.isBlank() || code == null || !code.matches("\\d{6}")) {
            return false;
        }
        long timeWindow = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;
        for (long offset = -1; offset <= 1; offset++) {
            if (generateCode(secret, timeWindow + offset).equals(code)) {
                return true;
            }
        }
        return false;
    }

    private String generateCode(String secret, long counter) {
        try {
            byte[] key = Base32Utils.decode(secret);
            byte[] counterBytes = ByteBuffer.allocate(8).putLong(counter).array();
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(key, HMAC_ALGORITHM));
            byte[] hash = mac.doFinal(counterBytes);
            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);
            int otp = binary % 1_000_000;
            return String.format("%06d", otp);
        } catch (Exception e) {
            return "000000";
        }
    }
}
