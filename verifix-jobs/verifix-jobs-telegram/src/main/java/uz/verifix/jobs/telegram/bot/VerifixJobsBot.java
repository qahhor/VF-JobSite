package uz.verifix.jobs.telegram.bot;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import uz.verifix.jobs.telegram.config.BotConfig;
import uz.verifix.jobs.telegram.conversation.ConversationManager;
import uz.verifix.jobs.telegram.conversation.ConversationState;
import uz.verifix.jobs.telegram.handler.*;

import java.io.Serializable;

@Slf4j
@Component
public class VerifixJobsBot extends TelegramLongPollingBot {

    private final BotConfig botConfig;
    private final StartHandler startHandler;
    private final RegistrationHandler registrationHandler;
    private final SearchHandler searchHandler;
    private final NearbyHandler nearbyHandler;
    private final ApplyHandler applyHandler;
    private final ReferralHandler referralHandler;
    private final CallbackQueryHandler callbackQueryHandler;
    private final ConversationManager conversationManager;
    private final NotificationConsumer notificationConsumer;

    public VerifixJobsBot(BotConfig botConfig, StartHandler startHandler,
                          RegistrationHandler registrationHandler, SearchHandler searchHandler,
                          NearbyHandler nearbyHandler, ApplyHandler applyHandler,
                          ReferralHandler referralHandler, CallbackQueryHandler callbackQueryHandler,
                          ConversationManager conversationManager, NotificationConsumer notificationConsumer) {
        super(botConfig.getToken());
        this.botConfig = botConfig;
        this.startHandler = startHandler;
        this.registrationHandler = registrationHandler;
        this.searchHandler = searchHandler;
        this.nearbyHandler = nearbyHandler;
        this.applyHandler = applyHandler;
        this.referralHandler = referralHandler;
        this.callbackQueryHandler = callbackQueryHandler;
        this.conversationManager = conversationManager;
        this.notificationConsumer = notificationConsumer;
    }

    @PostConstruct
    public void init() {
        notificationConsumer.setMessageSender(msg -> {
            try {
                execute(msg);
            } catch (TelegramApiException e) {
                log.error("Failed to send notification: {}", e.getMessage());
            }
        });
    }

    @Override
    public String getBotUsername() {
        return botConfig.getUsername();
    }

    @Override
    public void onUpdateReceived(Update update) {
        try {
            if (update.hasCallbackQuery()) {
                BotApiMethod<? extends Serializable> response = callbackQueryHandler.handle(update.getCallbackQuery());
                if (response != null) {
                    execute(response);
                }
                return;
            }

            if (!update.hasMessage()) return;

            Message message = update.getMessage();
            Long chatId = message.getChatId();

            // Handle location for /nearby
            if (message.hasLocation()) {
                SendMessage response = nearbyHandler.handle(message);
                execute(response);
                return;
            }

            // Handle contact for registration
            if (message.hasContact()) {
                ConversationState state = conversationManager.get(chatId);
                if (state != null) {
                    SendMessage response = registrationHandler.handle(message, state);
                    execute(response);
                    return;
                }
            }

            // Check for active registration conversation
            ConversationState state = conversationManager.get(chatId);
            if (state != null && state.getCurrentStep() != ConversationState.RegistrationStep.COMPLETED) {
                SendMessage response = registrationHandler.handle(message, state);
                execute(response);
                return;
            }

            // Handle commands
            if (message.hasText()) {
                String text = message.getText().trim();
                SendMessage response = routeCommand(text, message);
                if (response != null) {
                    execute(response);
                }
            }
        } catch (Exception e) {
            log.error("Error processing update: {}", e.getMessage(), e);
        }
    }

    private SendMessage routeCommand(String text, Message message) {
        if (text.startsWith("/start")) {
            return startHandler.handle(message);
        }
        if (text.startsWith("/search")) {
            return searchHandler.handle(message);
        }
        if (text.equals("/nearby")) {
            return nearbyHandler.handle(message);
        }
        if (text.equals("/my_applications")) {
            return applyHandler.handleMyApplications(message.getChatId(), message.getFrom().getId());
        }
        if (text.equals("/referral")) {
            return referralHandler.handle(message);
        }
        if (text.equals("/profile")) {
            return startHandler.sendMainMenu(message.getChatId(), null);
        }
        if (text.equals("/help")) {
            return helpMessage(message.getChatId());
        }

        // Unknown command or text — show help
        return helpMessage(message.getChatId());
    }

    private SendMessage helpMessage(Long chatId) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText("📖 <b>Buyruqlar:</b>\n\n" +
                "🔍 /search [kalit so'z] — Ish qidirish\n" +
                "📍 /nearby — Yaqin atrofdagi ishlar\n" +
                "📋 /my_applications — Mening arizalarim\n" +
                "🔗 /referral — Do'stlarni taklif qilish\n" +
                "👤 /profile — Profilim\n" +
                "📖 /help — Yordam");
        msg.setParseMode("HTML");
        return msg;
    }
}
