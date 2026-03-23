package uz.verifix.jobs.integration.myid;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.myid")
public class MyIdConfig {

    private String clientId;
    private String clientSecret;
    private String baseUrl = "https://myid.uz";
    private String authorizePath = "/api/v1/oauth2/authorize";
    private String tokenPath = "/api/v1/oauth2/token";
    private String userInfoPath = "/api/v1/users/me";
    private String redirectUri;
    private String scope = "openid profile address";
}
