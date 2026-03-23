package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.telegram.conversation.ConversationManager;
import uz.verifix.jobs.telegram.conversation.ConversationState;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProfileHandler {

    private final CandidateRepository candidateRepository;
    private final ConversationManager conversationManager;

    public SendMessage handle(Message message) {
        Long telegramId = message.getFrom().getId();
        Long chatId = message.getChatId();

        Optional<Candidate> candidateOpt = candidateRepository.findByTelegramId(telegramId);
        if (candidateOpt.isEmpty()) {
            return reply(chatId, "❌ Avval /start buyrug'i bilan ro'yxatdan o'ting.");
        }

        Candidate c = candidateOpt.get();
        return showProfile(chatId, c);
    }

    public SendMessage showProfile(Long chatId, Candidate c) {
        StringBuilder sb = new StringBuilder();
        sb.append("👤 <b>Mening profilim</b>\n\n");
        sb.append("📛 Ism: ").append(c.getFirstName()).append(" ").append(c.getLastName()).append("\n");
        sb.append("📱 Telefon: ").append(c.getPhone()).append("\n");
        sb.append("📍 Shahar: ").append(c.getCity() != null ? c.getCity() : "—").append("\n");

        if (c.getSkills() != null && c.getSkills().length > 0) {
            sb.append("🛠 Ko'nikmalar: ").append(String.join(", ", c.getSkills())).append("\n");
        }

        if (c.getPreferredCategories() != null && c.getPreferredCategories().length > 0) {
            sb.append("📂 Kategoriyalar: ").append(String.join(", ", c.getPreferredCategories())).append("\n");
        }

        if (c.getEducationLevel() != null) {
            sb.append("🎓 Ta'lim: ").append(c.getEducationLevel().name()).append("\n");
        }

        sb.append("🔗 Taklif kodi: <code>").append(c.getReferralCode()).append("</code>\n");

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(sb.toString());
        msg.setParseMode("HTML");

        // Edit buttons
        InlineKeyboardButton editCity = button("📍 Shahar", "profile:edit_city");
        InlineKeyboardButton editSkills = button("🛠 Ko'nikmalar", "profile:edit_skills");
        InlineKeyboardButton editCategories = button("📂 Kategoriyalar", "profile:edit_categories");

        InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
        keyboard.setKeyboard(List.of(
                List.of(editCity, editSkills),
                List.of(editCategories)
        ));
        msg.setReplyMarkup(keyboard);

        return msg;
    }

    public SendMessage handleProfileEdit(Message message, String field) {
        Long telegramId = message.getFrom().getId();
        Long chatId = message.getChatId();
        String text = message.getText();

        if (text == null || text.isBlank()) {
            return reply(chatId, "❌ Iltimos, ma'lumotni kiriting.");
        }

        Optional<Candidate> candidateOpt = candidateRepository.findByTelegramId(telegramId);
        if (candidateOpt.isEmpty()) return reply(chatId, "❌ Profil topilmadi.");

        Candidate c = candidateOpt.get();

        switch (field) {
            case "city" -> c.setCity(text.trim());
            case "skills" -> c.setSkills(text.split(",\\s*"));
            case "categories" -> c.setPreferredCategories(text.split(",\\s*"));
            default -> {
                return reply(chatId, "❌ Noma'lum maydon.");
            }
        }

        candidateRepository.save(c);
        conversationManager.delete(chatId);

        return reply(chatId, "✅ Profil yangilandi!\n\n/profile — Profilni ko'rish");
    }

    public EditMessageText handleCallback(CallbackQuery callbackQuery) {
        Long chatId = callbackQuery.getMessage().getChatId();
        Integer messageId = callbackQuery.getMessage().getMessageId();
        String data = callbackQuery.getData();

        String prompt = switch (data) {
            case "profile:edit_city" -> "📍 Yangi shahringizni kiriting:";
            case "profile:edit_skills" -> "🛠 Ko'nikmalaringizni kiriting (vergul bilan ajrating):\nMasalan: haydovchilik, payvandlash, oshpazlik";
            case "profile:edit_categories" -> "📂 Qiziqtirgan kategoriyalarni kiriting (vergul bilan):\nMasalan: transport, qurilish, oshxona";
            default -> null;
        };

        if (prompt == null) return null;

        // Store which field is being edited
        String field = data.replace("profile:edit_", "");
        ConversationState state = ConversationState.builder()
                .chatId(chatId)
                .currentStep(ConversationState.RegistrationStep.COMPLETED)
                .city(field) // reuse city field to store edit mode
                .build();
        conversationManager.save(chatId, state);

        EditMessageText edit = new EditMessageText();
        edit.setChatId(chatId.toString());
        edit.setMessageId(messageId);
        edit.setText(prompt);
        edit.setParseMode("HTML");
        return edit;
    }

    private InlineKeyboardButton button(String text, String callbackData) {
        InlineKeyboardButton btn = new InlineKeyboardButton();
        btn.setText(text);
        btn.setCallbackData(callbackData);
        return btn;
    }

    private SendMessage reply(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setParseMode("HTML");
        return msg;
    }
}
