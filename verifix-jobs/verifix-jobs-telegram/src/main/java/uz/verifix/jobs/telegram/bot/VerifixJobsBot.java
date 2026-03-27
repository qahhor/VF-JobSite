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
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.FavoriteVacancyRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.telegram.channel.ChannelPostingService;
import uz.verifix.jobs.telegram.config.BotConfig;
import uz.verifix.jobs.telegram.conversation.ConversationManager;
import uz.verifix.jobs.telegram.conversation.ConversationState;
import uz.verifix.jobs.telegram.handler.*;

import java.io.Serializable;
import java.util.List;
import org.springframework.data.domain.PageRequest;

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
    private final ProfileHandler profileHandler;
    private final ConversationManager conversationManager;
    private final NotificationConsumer notificationConsumer;
    private final ChannelPostingService channelPostingService;
    private final AiChatHandler aiChatHandler;
    private final CandidateRepository candidateRepository;
    private final FavoriteVacancyRepository favoriteVacancyRepository;
    private final VacancyRepository vacancyRepository;

    public VerifixJobsBot(BotConfig botConfig, StartHandler startHandler,
                          RegistrationHandler registrationHandler, SearchHandler searchHandler,
                          NearbyHandler nearbyHandler, ApplyHandler applyHandler,
                          ReferralHandler referralHandler, CallbackQueryHandler callbackQueryHandler,
                          ProfileHandler profileHandler,
                          ConversationManager conversationManager, NotificationConsumer notificationConsumer,
                          ChannelPostingService channelPostingService, AiChatHandler aiChatHandler,
                          CandidateRepository candidateRepository, FavoriteVacancyRepository favoriteVacancyRepository,
                          VacancyRepository vacancyRepository) {
        super(botConfig.getToken());
        this.botConfig = botConfig;
        this.startHandler = startHandler;
        this.registrationHandler = registrationHandler;
        this.searchHandler = searchHandler;
        this.nearbyHandler = nearbyHandler;
        this.applyHandler = applyHandler;
        this.referralHandler = referralHandler;
        this.callbackQueryHandler = callbackQueryHandler;
        this.profileHandler = profileHandler;
        this.conversationManager = conversationManager;
        this.notificationConsumer = notificationConsumer;
        this.channelPostingService = channelPostingService;
        this.aiChatHandler = aiChatHandler;
        this.candidateRepository = candidateRepository;
        this.favoriteVacancyRepository = favoriteVacancyRepository;
        this.vacancyRepository = vacancyRepository;
    }

    @PostConstruct
    public void init() {
        log.info("=== VerifixJobsBot initializing ===");
        log.info("Bot username: {}", botConfig.getUsername());
        log.info("Bot token present: {}", botConfig.getToken() != null && !botConfig.getToken().isBlank());
        log.info("Bot token length: {}", botConfig.getToken() != null ? botConfig.getToken().length() : 0);

        notificationConsumer.setMessageSender(msg -> {
            try {
                execute(msg);
            } catch (TelegramApiException e) {
                log.error("Failed to send notification: {}", e.getMessage());
            }
        });
        channelPostingService.setMessageSender(msg -> {
            try {
                execute(msg);
            } catch (TelegramApiException e) {
                log.error("Failed to post to channel: {}", e.getMessage());
            }
        });
        log.info("=== VerifixJobsBot initialized successfully ===");
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

            // Check for active conversation
            ConversationState state = conversationManager.get(chatId);
            if (state != null) {
                // Profile edit mode
                if (state.getEditField() != null && state.getCurrentStep() == ConversationState.RegistrationStep.COMPLETED) {
                    SendMessage response = profileHandler.handleProfileEdit(message, state.getEditField());
                    execute(response);
                    return;
                }
                // Registration flow
                if (state.getCurrentStep() != ConversationState.RegistrationStep.COMPLETED) {
                    SendMessage response = registrationHandler.handle(message, state);
                    execute(response);
                    return;
                }
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
        // Slash commands
        if (text.startsWith("/start")) return startHandler.handle(message);
        if (text.startsWith("/search")) return searchHandler.handle(message);
        if (text.equals("/nearby")) return nearbyHandler.handle(message);
        if (text.equals("/my_applications")) return applyHandler.handleMyApplications(message.getChatId(), message.getFrom().getId());
        if (text.equals("/referral")) return referralHandler.handle(message);
        if (text.equals("/profile")) return profileHandler.handle(message);
        if (text.equals("/help")) return startHandler.sendMainMenu(message.getChatId(), null);

        // Language selection from existing user (profile change)
        if (text.contains("O'zbekcha") || text.contains("Русский") || text.contains("English")
                || text.contains("Қазақша") || text.contains("Тоҷикӣ") || text.contains("Кыргызча")) {
            return handleLanguageChange(message);
        }

        // Reply keyboard menu buttons
        if (text.contains("Bosh menyu")) return startHandler.sendMainMenu(message.getChatId(), null);
        if (text.contains("Ish qidirish")) return searchHandler.handle(message);
        if (text.contains("Yaqindagi ishlar")) return nearbyHandler.handle(message);
        if (text.contains("Arizalarim")) return applyHandler.handleMyApplications(message.getChatId(), message.getFrom().getId());
        if (text.contains("Saqlangan")) return handleFavorites(message);
        if (text.contains("Profilim")) return profileHandler.handle(message);
        if (text.contains("Taklif qilish")) return referralHandler.handle(message);

        // Natural language → AI chat / keyword search
        if (!text.startsWith("/")) {
            return aiChatHandler.handle(message);
        }

        return helpMessage(message.getChatId());
    }

    private SendMessage handleLanguageChange(Message message) {
        Long chatId = message.getChatId();
        Long telegramId = message.getFrom().getId();
        String text = message.getText();

        String lang = "uz";
        String langName = "O'zbekcha";
        if (text.contains("Русский")) { lang = "ru"; langName = "Русский"; }
        else if (text.contains("English")) { lang = "en"; langName = "English"; }
        else if (text.contains("Қазақша")) { lang = "kk"; langName = "Қазақша"; }
        else if (text.contains("Тоҷикӣ")) { lang = "tg"; langName = "Тоҷикӣ"; }
        else if (text.contains("Кыргызча")) { lang = "ky"; langName = "Кыргызча"; }

        // Update existing candidate's language
        Candidate candidate = candidateRepository.findByTelegramId(telegramId).orElse(null);
        if (candidate != null) {
            uz.verifix.jobs.domain.enums.LanguagePreference pref = switch (lang) {
                case "ru" -> uz.verifix.jobs.domain.enums.LanguagePreference.RU;
                case "en" -> uz.verifix.jobs.domain.enums.LanguagePreference.EN;
                default -> uz.verifix.jobs.domain.enums.LanguagePreference.UZ;
            };
            candidate.setLanguagePref(pref);
            candidateRepository.save(candidate);
        }

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText("✅ Til o'zgartirildi: <b>" + langName + "</b>");
        msg.setParseMode("HTML");
        msg.setReplyMarkup(StartHandler.buildMainMenuKeyboard());
        return msg;
    }

    private SendMessage handleFavorites(Message message) {
        Long chatId = message.getChatId();
        Long telegramId = message.getFrom().getId();
        Candidate candidate = candidateRepository.findByTelegramId(telegramId).orElse(null);
        if (candidate == null) {
            SendMessage msg = new SendMessage();
            msg.setChatId(chatId.toString());
            msg.setText("❌ Avval ro'yxatdan o'ting: /start");
            return msg;
        }

        List<FavoriteVacancy> favs = favoriteVacancyRepository
                .findByCandidateIdOrderByCreatedAtDesc(candidate.getId(), PageRequest.of(0, 10))
                .getContent();

        if (favs.isEmpty()) {
            SendMessage msg = new SendMessage();
            msg.setChatId(chatId.toString());
            msg.setText("❤️ <b>Saqlangan vakansiyalar</b>\n\nHali saqlangan vakansiya yo'q.\n\n🔍 Ish qidirish uchun \"Ish qidirish\" tugmasini bosing.");
            msg.setParseMode("HTML");
            return msg;
        }

        StringBuilder sb = new StringBuilder("❤️ <b>Saqlangan vakansiyalar</b> (" + favs.size() + ")\n\n");
        for (int i = 0; i < favs.size(); i++) {
            Vacancy v = vacancyRepository.findById(favs.get(i).getVacancyId()).orElse(null);
            if (v == null) continue;
            sb.append(i + 1).append(". <b>").append(v.getTitle()).append("</b>\n");
            if (v.getEmployer() != null) sb.append("   🏢 ").append(v.getEmployer().getName()).append("\n");
            if (v.getCity() != null) sb.append("   📍 ").append(v.getCity());
            if (v.getSalaryFrom() != null) {
                sb.append("  💰 ").append(formatSalary(v.getSalaryFrom()));
                if (v.getSalaryTo() != null) sb.append(" – ").append(formatSalary(v.getSalaryTo()));
                sb.append(" UZS");
            }
            sb.append("\n\n");
        }

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(sb.toString());
        msg.setParseMode("HTML");
        return msg;
    }

    private String formatSalary(java.math.BigDecimal n) {
        if (n == null) return "0";
        long val = n.longValue();
        if (val >= 1_000_000) return String.format("%.1fM", val / 1_000_000.0);
        if (val >= 1_000) return (val / 1_000) + "K";
        return String.valueOf(val);
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
