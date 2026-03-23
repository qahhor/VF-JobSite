package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Contact;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import uz.verifix.jobs.common.util.PhoneUtils;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.telegram.conversation.ConversationManager;
import uz.verifix.jobs.telegram.conversation.ConversationState;
import uz.verifix.jobs.telegram.conversation.ConversationState.RegistrationStep;

import java.security.SecureRandom;

@Slf4j
@Component
@RequiredArgsConstructor
public class RegistrationHandler {

    private final ConversationManager conversationManager;
    private final CandidateRepository candidateRepository;
    private final StartHandler startHandler;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String REFERRAL_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public SendMessage handle(Message message, ConversationState state) {
        Long chatId = message.getChatId();

        return switch (state.getCurrentStep()) {
            case PHONE -> handlePhone(message, state);
            case FIRST_NAME -> handleFirstName(message, state);
            case LAST_NAME -> handleLastName(message, state);
            case CITY -> handleCity(message, state);
            case CATEGORIES -> handleCategories(message, state);
            default -> startHandler.sendMainMenu(chatId, state.getFirstName());
        };
    }

    private SendMessage handlePhone(Message message, ConversationState state) {
        String phone = null;

        Contact contact = message.getContact();
        if (contact != null) {
            phone = PhoneUtils.normalize(contact.getPhoneNumber());
        } else if (message.getText() != null) {
            phone = PhoneUtils.normalize(message.getText().trim());
        }

        if (phone == null || !PhoneUtils.isValid(phone)) {
            return reply(state.getChatId(), "❌ Noto'g'ri raqam. Iltimos, +998XXXXXXXXX formatida yuboring.");
        }

        state.setPhone(phone);
        state.setCurrentStep(RegistrationStep.FIRST_NAME);
        conversationManager.save(state.getChatId(), state);

        SendMessage msg = reply(state.getChatId(), "✅ Raqam qabul qilindi!\n\n👤 Ismingizni kiriting:");
        msg.setReplyMarkup(new ReplyKeyboardRemove(true));
        return msg;
    }

    private SendMessage handleFirstName(Message message, ConversationState state) {
        String name = message.getText();
        if (name == null || name.isBlank() || name.length() < 2) {
            return reply(state.getChatId(), "❌ Iltimos, ismingizni kiriting (kamida 2 harf):");
        }

        state.setFirstName(name.trim());
        state.setCurrentStep(RegistrationStep.LAST_NAME);
        conversationManager.save(state.getChatId(), state);

        return reply(state.getChatId(), "👤 Familiyangizni kiriting:");
    }

    private SendMessage handleLastName(Message message, ConversationState state) {
        String name = message.getText();
        if (name == null || name.isBlank() || name.length() < 2) {
            return reply(state.getChatId(), "❌ Iltimos, familiyangizni kiriting (kamida 2 harf):");
        }

        state.setLastName(name.trim());
        state.setCurrentStep(RegistrationStep.CITY);
        conversationManager.save(state.getChatId(), state);

        return reply(state.getChatId(), "📍 Shahringizni kiriting (masalan: Toshkent):");
    }

    private SendMessage handleCity(Message message, ConversationState state) {
        String city = message.getText();
        if (city == null || city.isBlank()) {
            return reply(state.getChatId(), "❌ Iltimos, shahar nomini kiriting:");
        }

        state.setCity(city.trim());
        state.setCurrentStep(RegistrationStep.COMPLETED);
        conversationManager.save(state.getChatId(), state);

        // Create candidate
        Candidate candidate = Candidate.builder()
                .phone(state.getPhone())
                .telegramId(message.getFrom().getId())
                .firstName(state.getFirstName())
                .lastName(state.getLastName())
                .city(state.getCity())
                .referralCode(generateReferralCode())
                .build();

        // Handle referral
        if (state.getReferralCode() != null) {
            candidateRepository.findByReferralCode(state.getReferralCode())
                    .ifPresent(candidate::setReferredBy);
        }

        candidateRepository.save(candidate);
        conversationManager.delete(state.getChatId());

        log.info("Candidate registered via Telegram: {} {}, city: {}", state.getFirstName(), state.getLastName(), state.getCity());

        return reply(state.getChatId(),
                "🎉 <b>Ro'yxatdan o'tdingiz!</b>\n\n" +
                "Xush kelibsiz, " + state.getFirstName() + "!\n\n" +
                "🔍 /search — Ish qidirish\n" +
                "📍 /nearby — Yaqin atrofdagi ishlar\n" +
                "🔗 /referral — Do'stlarni taklif qiling va mukofot oling!");
    }

    private SendMessage handleCategories(Message message, ConversationState state) {
        return startHandler.sendMainMenu(state.getChatId(), state.getFirstName());
    }

    private String generateReferralCode() {
        StringBuilder code = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            code.append(REFERRAL_CHARS.charAt(RANDOM.nextInt(REFERRAL_CHARS.length())));
        }
        if (candidateRepository.findByReferralCode(code.toString()).isPresent()) {
            return generateReferralCode();
        }
        return code.toString();
    }

    private SendMessage reply(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setParseMode("HTML");
        return msg;
    }
}
