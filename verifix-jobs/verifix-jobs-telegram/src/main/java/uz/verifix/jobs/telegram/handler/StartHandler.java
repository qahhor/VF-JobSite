package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.telegram.conversation.ConversationManager;
import uz.verifix.jobs.telegram.conversation.ConversationState;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartHandler {

    private final CandidateRepository candidateRepository;
    private final ConversationManager conversationManager;

    public SendMessage handle(Message message) {
        Long chatId = message.getChatId();
        Long telegramId = message.getFrom().getId();
        String text = message.getText();

        // Check for referral deep link: /start ref_ABCDEF
        String referralCode = null;
        if (text != null && text.startsWith("/start ref_")) {
            referralCode = text.substring("/start ref_".length()).trim();
        }

        Optional<Candidate> existing = candidateRepository.findByTelegramId(telegramId);

        if (existing.isPresent()) {
            return sendMainMenu(chatId, existing.get().getFirstName());
        }

        // Start registration — first step: language selection
        ConversationState state = ConversationState.builder()
                .chatId(chatId)
                .currentStep(ConversationState.RegistrationStep.LANGUAGE)
                .referralCode(referralCode)
                .build();
        conversationManager.save(chatId, state);

        log.info("New user started registration: telegramId={}", telegramId);
        return buildLanguageSelection(chatId);
    }

    public SendMessage sendMainMenu(Long chatId, String name) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText("👋 <b>" + (name != null ? name : "Do'stim") + "</b>, nima qilmoqchisiz?");
        msg.setParseMode("HTML");
        msg.setReplyMarkup(buildMainMenuKeyboard());
        return msg;
    }

    public static SendMessage buildMainMenuMessage(Long chatId) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText("👋 Nima qilmoqchisiz?");
        msg.setParseMode("HTML");
        msg.setReplyMarkup(buildMainMenuKeyboard());
        return msg;
    }

    /** Language selection screen for new users */
    public static SendMessage buildLanguageSelection(Long chatId) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText("👋 <b>Verifix Jobs</b> ga xush kelibsiz!\n\n🌐 Tilni tanlang / Выберите язык / Choose language:");
        msg.setParseMode("HTML");

        List<KeyboardRow> rows = new ArrayList<>();
        KeyboardRow r1 = new KeyboardRow();
        r1.add("🇺🇿 O'zbekcha");
        r1.add("🇷🇺 Русский");
        rows.add(r1);
        KeyboardRow r2 = new KeyboardRow();
        r2.add("🇬🇧 English");
        r2.add("🇰🇿 Қазақша");
        rows.add(r2);
        KeyboardRow r3 = new KeyboardRow();
        r3.add("🇹🇯 Тоҷикӣ");
        r3.add("🇰🇬 Кыргызча");
        rows.add(r3);

        ReplyKeyboardMarkup kb = new ReplyKeyboardMarkup();
        kb.setKeyboard(rows);
        kb.setResizeKeyboard(true);
        kb.setOneTimeKeyboard(true);
        msg.setReplyMarkup(kb);
        return msg;
    }

    /** Language selection for existing users (from profile) */
    public static SendMessage buildLanguageChange(Long chatId) {
        SendMessage msg = buildLanguageSelection(chatId);
        msg.setText("🌐 Tilni tanlang:");
        return msg;
    }

    public static ReplyKeyboardMarkup buildMainMenuKeyboard() {
        List<KeyboardRow> rows = new ArrayList<>();

        KeyboardRow row1 = new KeyboardRow();
        row1.add("🔍 Ish qidirish");
        row1.add("📍 Yaqindagi ishlar");
        rows.add(row1);

        KeyboardRow row2 = new KeyboardRow();
        row2.add("📋 Arizalarim");
        row2.add("❤️ Saqlangan");
        rows.add(row2);

        KeyboardRow row3 = new KeyboardRow();
        row3.add("👤 Profilim");
        row3.add("🔗 Taklif qilish");
        rows.add(row3);

        ReplyKeyboardMarkup keyboard = new ReplyKeyboardMarkup();
        keyboard.setKeyboard(rows);
        keyboard.setResizeKeyboard(true);
        keyboard.setIsPersistent(true);
        return keyboard;
    }
}
