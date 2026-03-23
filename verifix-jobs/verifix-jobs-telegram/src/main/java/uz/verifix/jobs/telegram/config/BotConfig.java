package uz.verifix.jobs.telegram.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.telegram.bot")
public class BotConfig {

    private String token;
    private String username;
    private String webAppUrl;
}
