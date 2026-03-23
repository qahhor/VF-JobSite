package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.service.vacancy.VacancyService;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CallbackQueryHandler {

    private final VacancyService vacancyService;
    private final VacancyCardFormatter formatter;
    private final ApplyHandler applyHandler;
    private final ProfileHandler profileHandler;

    public BotApiMethod<? extends Serializable> handle(CallbackQuery callbackQuery) {
        String data = callbackQuery.getData();
        Long chatId = callbackQuery.getMessage().getChatId();
        Integer messageId = callbackQuery.getMessage().getMessageId();

        if (data.startsWith("vacancy:")) {
            UUID vacancyId = UUID.fromString(data.substring("vacancy:".length()));
            return showVacancyDetail(chatId, messageId, vacancyId);
        }

        if (data.startsWith("apply:")) {
            UUID vacancyId = UUID.fromString(data.substring("apply:".length()));
            return applyHandler.handleApply(callbackQuery, vacancyId);
        }

        if (data.startsWith("profile:")) {
            return profileHandler.handleCallback(callbackQuery);
        }

        return null;
    }

    private EditMessageText showVacancyDetail(Long chatId, Integer messageId, UUID vacancyId) {
        try {
            Vacancy vacancy = vacancyService.getById(vacancyId);
            String card = formatter.format(vacancy);

            EditMessageText edit = new EditMessageText();
            edit.setChatId(chatId.toString());
            edit.setMessageId(messageId);
            edit.setText(card);
            edit.setParseMode("HTML");

            // Apply button
            InlineKeyboardButton applyBtn = new InlineKeyboardButton();
            applyBtn.setText("📨 Ariza berish");
            applyBtn.setCallbackData("apply:" + vacancyId);

            InlineKeyboardButton backBtn = new InlineKeyboardButton();
            backBtn.setText("🔙 Orqaga");
            backBtn.setCallbackData("back:search");

            InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
            keyboard.setKeyboard(List.of(List.of(applyBtn), List.of(backBtn)));
            edit.setReplyMarkup(keyboard);

            return edit;
        } catch (Exception e) {
            log.error("Error showing vacancy {}: {}", vacancyId, e.getMessage());
            EditMessageText edit = new EditMessageText();
            edit.setChatId(chatId.toString());
            edit.setMessageId(messageId);
            edit.setText("❌ Vakansiya topilmadi.");
            return edit;
        }
    }
}
