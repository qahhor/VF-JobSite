package uz.verifix.jobs.telegram.miniapp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.service.auth.JwtService;
import uz.verifix.jobs.telegram.config.BotConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MiniAppAuthService {

    private final BotConfig botConfig;
    private final CandidateRepository candidateRepository;
    private final JwtService jwtService;

    /**
     * Validates Telegram Mini App initData and returns JWT for the candidate.
     * See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
     */
    public AuthResult authenticate(String initData) {
        if (initData == null || initData.isBlank()) {
            return AuthResult.failure("Missing initData");
        }

        // Parse initData
        Map<String, String> params = parseInitData(initData);
        String hash = params.remove("hash");

        if (hash == null) {
            return AuthResult.failure("Missing hash");
        }

        // Validate HMAC-SHA256
        if (!validateHash(params, hash)) {
            return AuthResult.failure("Invalid hash");
        }

        // Extract user
        String userJson = params.get("user");
        if (userJson == null) {
            return AuthResult.failure("Missing user data");
        }

        // Parse user ID from JSON (simple extraction)
        Long telegramId = extractTelegramId(userJson);
        if (telegramId == null) {
            return AuthResult.failure("Invalid user data");
        }

        // Find or identify candidate
        Optional<Candidate> candidateOpt = candidateRepository.findByTelegramId(telegramId);
        if (candidateOpt.isEmpty()) {
            return AuthResult.failure("Candidate not registered. Use /start in bot first.");
        }

        Candidate candidate = candidateOpt.get();
        String token = jwtService.generateAccessToken(candidate.getId(), candidate.getPhone(), "CANDIDATE");

        log.info("Mini App auth successful for telegramId={}, candidateId={}", telegramId, candidate.getId());
        return AuthResult.success(token, candidate.getId(), candidate.getFirstName());
    }

    private boolean validateHash(Map<String, String> params, String hash) {
        try {
            // Sort params and build data-check-string
            String dataCheckString = params.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("\n"));

            // secret_key = HMAC-SHA256(bot_token, "WebAppData")
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec("WebAppData".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] secretKey = hmac.doFinal(botConfig.getToken().getBytes(StandardCharsets.UTF_8));

            // hash = HMAC-SHA256(data_check_string, secret_key)
            Mac hmac2 = Mac.getInstance("HmacSHA256");
            hmac2.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            byte[] computedHash = hmac2.doFinal(dataCheckString.getBytes(StandardCharsets.UTF_8));

            String computedHex = HexFormat.of().formatHex(computedHash);
            return computedHex.equals(hash);
        } catch (Exception e) {
            log.error("Hash validation error: {}", e.getMessage());
            return false;
        }
    }

    private Map<String, String> parseInitData(String initData) {
        Map<String, String> params = new LinkedHashMap<>();
        for (String pair : initData.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                params.put(kv[0], URLDecoder.decode(kv[1], StandardCharsets.UTF_8));
            }
        }
        return params;
    }

    private Long extractTelegramId(String userJson) {
        try {
            // Simple extraction: find "id": followed by number
            int idx = userJson.indexOf("\"id\"");
            if (idx == -1) return null;
            String after = userJson.substring(idx + 4).replaceFirst("[^0-9]*", "");
            StringBuilder num = new StringBuilder();
            for (char c : after.toCharArray()) {
                if (Character.isDigit(c)) num.append(c);
                else break;
            }
            return num.isEmpty() ? null : Long.parseLong(num.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public record AuthResult(boolean success, String token, UUID candidateId, String firstName, String error) {
        static AuthResult success(String token, UUID candidateId, String firstName) {
            return new AuthResult(true, token, candidateId, firstName, null);
        }
        static AuthResult failure(String error) {
            return new AuthResult(false, null, null, null, error);
        }
    }
}
