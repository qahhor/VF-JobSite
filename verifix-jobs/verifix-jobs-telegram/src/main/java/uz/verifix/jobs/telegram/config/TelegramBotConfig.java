package uz.verifix.jobs.telegram.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

import java.util.List;

/**
 * Manual bot registration — required because telegrambots-spring-boot-starter 6.x
 * uses META-INF/spring.factories for auto-configuration, which Spring Boot 3.x
 * no longer reads. This config replaces the starter's TelegramBotInitializer.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class TelegramBotConfig {

    private final List<TelegramLongPollingBot> longPollingBots;

    @PostConstruct
    public void registerBots() {
        try {
            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            for (TelegramLongPollingBot bot : longPollingBots) {
                botsApi.registerBot(bot);
                log.info("Telegram bot registered: {}", bot.getBotUsername());
            }
        } catch (TelegramApiException e) {
            log.error("Failed to register Telegram bot: {}", e.getMessage(), e);
        }
    }
}
