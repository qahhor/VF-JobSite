package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.Message;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.telegram.conversation.ConversationManager;
import uz.verifix.jobs.telegram.conversation.ConversationState;
import uz.verifix.jobs.telegram.util.TgUtils;

import java.util.List;
import java.util.Optional;

import static uz.verifix.jobs.telegram.util.TgUtils.*;

@Component
@RequiredArgsConstructor
public class ProfileHandler {

    private final CandidateRepository candidateRepository;
    private final ConversationManager conversationManager;

    public SendMessage handle(Message message) {
        Long telegramId = message.getFrom().getId();
        Long chatId = message.getChatId();

        Optional<Candidate> opt = candidateRepository.findByTelegramId(telegramId);
        if (opt.isEmpty()) {
            return html(chatId, "❌ Avval /start buyrug'i bilan ro'yxatdan o'ting.");
        }
        return showProfile(chatId, opt.get());
    }

    public SendMessage showProfile(Long chatId, Candidate c) {
        StringBuilder sb = new StringBuilder();
        sb.append("👤 <b>Mening profilim</b>\n\n");
        sb.append("📛 <b>").append(escapeHtml(c.getFirstName()));
        if (c.getLastName() != null) sb.append(" ").append(escapeHtml(c.getLastName()));
        sb.append("</b>\n");
        sb.append("📱 ").append(c.getPhone()).append("\n");
        sb.append("📍 ").append(c.getCity() != null ? c.getCity() : "Shahar ko'rsatilmagan").append("\n");

        if (c.getSkills() != null && c.getSkills().length > 0) {
            sb.append("🛠 ").append(String.join(", ", c.getSkills())).append("\n");
        }
        if (c.getPreferredCategories() != null && c.getPreferredCategories().length > 0) {
            sb.append("📂 ").append(String.join(", ", c.getPreferredCategories())).append("\n");
        }
        if (c.getEducationLevel() != null) {
            sb.append("🎓 ").append(c.getEducationLevel().name()).append("\n");
        }
        sb.append("\n🔗 Taklif kodi: <code>").append(c.getReferralCode()).append("</code>");

        SendMessage msg = html(chatId, sb.toString());
        msg.setReplyMarkup(keyboard(List.of(
                List.of(btn("📍 Shahar", "profile:edit_city"), btn("🛠 Ko'nikmalar", "profile:edit_skills")),
                List.of(btn("📂 Kategoriyalar", "profile:edit_categories"), btn("🌐 Til", "profile:change_lang"))
        )));
        return msg;
    }

    public SendMessage handleProfileEdit(Message message, String field) {
        Long telegramId = message.getFrom().getId();
        Long chatId = message.getChatId();
        String text = message.getText();

        if (text == null || text.isBlank()) {
            return html(chatId, "❌ Iltimos, ma'lumotni kiriting.");
        }

        Optional<Candidate> opt = candidateRepository.findByTelegramId(telegramId);
        if (opt.isEmpty()) return html(chatId, "❌ Profil topilmadi.");

        Candidate c = opt.get();
        String fieldName = switch (field) {
            case "city" -> { c.setCity(text.trim()); yield "Shahar"; }
            case "skills" -> { c.setSkills(text.split(",\\s*")); yield "Ko'nikmalar"; }
            case "categories" -> { c.setPreferredCategories(text.split(",\\s*")); yield "Kategoriyalar"; }
            default -> null;
        };

        if (fieldName == null) return html(chatId, "❌ Noma'lum maydon.");

        candidateRepository.save(c);
        conversationManager.delete(chatId);

        return html(chatId, "✅ <b>" + fieldName + "</b> yangilandi!\n\n👤 Profilni ko'rish: /profile");
    }

    public EditMessageText handleCallback(CallbackQuery cq) {
        Long chatId = cq.getMessage().getChatId();
        Integer msgId = cq.getMessage().getMessageId();
        String data = cq.getData();

        // Language change — return SendMessage (not EditMessage), handled specially
        if (data.equals("profile:change_lang")) {
            return null; // Handled in CallbackQueryHandler
        }

        String field = data.replace("profile:edit_", "");
        String prompt = switch (field) {
            case "city" -> "📍 Yangi shahringizni kiriting:";
            case "skills" -> "🛠 Ko'nikmalaringizni kiriting (vergul bilan):\n<i>Masalan: haydovchilik, payvandlash, oshpazlik</i>";
            case "categories" -> "📂 Qiziqtirgan kategoriyalarni kiriting (vergul bilan):\n<i>Masalan: transport, qurilish, oshxona</i>";
            default -> null;
        };

        if (prompt == null) return null;

        // Store edit mode with dedicated editField (not city hack)
        ConversationState state = ConversationState.builder()
                .chatId(chatId)
                .currentStep(ConversationState.RegistrationStep.COMPLETED)
                .editField(field)
                .build();
        conversationManager.save(chatId, state);

        EditMessageText edit = new EditMessageText();
        edit.setChatId(chatId.toString());
        edit.setMessageId(msgId);
        edit.setText(prompt);
        edit.setParseMode("HTML");
        return edit;
    }
}
