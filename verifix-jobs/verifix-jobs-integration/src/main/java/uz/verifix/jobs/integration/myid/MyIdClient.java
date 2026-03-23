package uz.verifix.jobs.integration.myid;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
public class MyIdClient {

    private final MyIdConfig config;
    private final WebClient webClient;

    public MyIdClient(MyIdConfig config) {
        this.config = config;
        this.webClient = WebClient.builder()
                .baseUrl(config.getBaseUrl())
                .build();
    }

    /**
     * Generate MyID OAuth2 authorization URL.
     */
    public String getAuthUrl(String state) {
        return config.getBaseUrl() + config.getAuthorizePath()
                + "?response_type=code"
                + "&client_id=" + config.getClientId()
                + "&redirect_uri=" + URLEncoder.encode(config.getRedirectUri(), StandardCharsets.UTF_8)
                + "&scope=" + URLEncoder.encode(config.getScope(), StandardCharsets.UTF_8)
                + "&state=" + state;
    }

    /**
     * Exchange authorization code for access token.
     */
    public TokenResponse exchangeCode(String code) {
        try {
            Map<String, String> response = webClient.post()
                    .uri(config.getTokenPath())
                    .bodyValue(Map.of(
                            "grant_type", "authorization_code",
                            "code", code,
                            "client_id", config.getClientId(),
                            "client_secret", config.getClientSecret(),
                            "redirect_uri", config.getRedirectUri()
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !response.containsKey("access_token")) {
                log.error("MyID token exchange failed: empty response");
                return new TokenResponse(null, false, "Empty response");
            }

            log.info("MyID token exchange successful");
            return new TokenResponse(response.get("access_token"), true, null);
        } catch (Exception e) {
            log.error("MyID token exchange error: {}", e.getMessage());
            return new TokenResponse(null, false, e.getMessage());
        }
    }

    /**
     * Fetch user info using access token.
     */
    public MyIdUserInfo getUserInfo(String accessToken) {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(config.getUserInfoPath())
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                log.error("MyID user info: empty response");
                return null;
            }

            Map<String, Object> profile = (Map<String, Object>) response.getOrDefault("profile", response);

            return MyIdUserInfo.builder()
                    .passportSeries((String) profile.get("passport_no"))
                    .firstName((String) profile.get("first_name"))
                    .lastName((String) profile.get("last_name"))
                    .middleName((String) profile.get("middle_name"))
                    .birthDate((String) profile.get("birth_date"))
                    .gender((String) profile.get("gender"))
                    .address((String) profile.get("address"))
                    .photoBase64((String) profile.get("photo"))
                    .verified(true)
                    .build();
        } catch (Exception e) {
            log.error("MyID user info error: {}", e.getMessage());
            return null;
        }
    }

    public record TokenResponse(String accessToken, boolean success, String error) {}
}
