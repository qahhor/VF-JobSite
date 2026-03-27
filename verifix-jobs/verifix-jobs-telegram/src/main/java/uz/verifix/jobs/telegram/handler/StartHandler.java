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

        // Start registration
        ConversationState state = ConversationState.builder()
                .chatId(chatId)
                .currentStep(ConversationState.RegistrationStep.PHONE)
                .referralCode(referralCode)
                .build();
        conversationManager.save(chatId, state);

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText("👋 Salom! <b>Verifix Jobs</b> ga xush kelibsiz!\n\n" +
                "Ish topish uchun ro'yxatdan o'ting.\n\n" +
                "📱 Telefon raqamingizni yuboring:");
        msg.setParseMode("HTML");

        // Phone share button
        KeyboardButton phoneButton = new KeyboardButton("📱 Telefon raqamni yuborish");
        phoneButton.setRequestContact(true);
        KeyboardRow row = new KeyboardRow();
        row.add(phoneButton);
        ReplyKeyboardMarkup keyboard = new ReplyKeyboardMarkup();
        keyboard.setKeyboard(List.of(row));
        keyboard.setResizeKeyboard(true);
        keyboard.setOneTimeKeyboard(true);
        msg.setReplyMarkup(keyboard);

        log.info("New user started registration: telegramId={}", telegramId);
        return msg;
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
