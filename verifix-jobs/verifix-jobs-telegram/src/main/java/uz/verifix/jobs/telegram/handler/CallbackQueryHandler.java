package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.FavoriteVacancy;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.FavoriteVacancyRepository;
import uz.verifix.jobs.service.vacancy.VacancyService;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;

import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.ArrayList;
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
    private final SearchHandler searchHandler;
    private final CandidateRepository candidateRepository;
    private final FavoriteVacancyRepository favoriteVacancyRepository;

    public BotApiMethod<? extends Serializable> handle(CallbackQuery callbackQuery) {
        String data = callbackQuery.getData();
        Long chatId = callbackQuery.getMessage().getChatId();
        Integer messageId = callbackQuery.getMessage().getMessageId();

        if (data.startsWith("vacancy:")) {
            UUID vacancyId = UUID.fromString(data.substring("vacancy:".length()));
            return showVacancyDetail(chatId, messageId, vacancyId, callbackQuery.getFrom().getId());
        }

        if (data.startsWith("apply:")) {
            UUID vacancyId = UUID.fromString(data.substring("apply:".length()));
            return applyHandler.handleApply(callbackQuery, vacancyId);
        }

        if (data.startsWith("profile:")) {
            return profileHandler.handleCallback(callbackQuery);
        }

        // Search pagination: search_page:query:pageNum
        if (data.startsWith("search_page:")) {
            String[] parts = data.split(":", 3);
            if (parts.length == 3) {
                String query = parts[1];
                int page = Integer.parseInt(parts[2]);
                SendMessage msg = searchHandler.searchAndFormat(chatId, query, page);
                return msg;
            }
        }

        // Favorites toggle: fav:vacancyId
        if (data.startsWith("fav:")) {
            UUID vacancyId = UUID.fromString(data.substring("fav:".length()));
            return toggleFavorite(callbackQuery, vacancyId);
        }

        return null;
    }

    private EditMessageText showVacancyDetail(Long chatId, Integer messageId, UUID vacancyId, Long telegramId) {
        try {
            Vacancy vacancy = vacancyService.getById(vacancyId);
            String card = formatter.format(vacancy);

            EditMessageText edit = new EditMessageText();
            edit.setChatId(chatId.toString());
            edit.setMessageId(messageId);
            edit.setText(card);
            edit.setParseMode("HTML");

            // Check if favorited
            boolean isFav = false;
            Candidate candidate = candidateRepository.findByTelegramId(telegramId).orElse(null);
            if (candidate != null) {
                isFav = favoriteVacancyRepository.existsByCandidateIdAndVacancyId(candidate.getId(), vacancyId);
            }

            // Buttons
            List<List<InlineKeyboardButton>> rows = new ArrayList<>();

            // Apply + Favorite row
            InlineKeyboardButton applyBtn = new InlineKeyboardButton();
            applyBtn.setText("📨 Ariza berish");
            applyBtn.setCallbackData("apply:" + vacancyId);

            InlineKeyboardButton favBtn = new InlineKeyboardButton();
            favBtn.setText(isFav ? "💔 Olib tashlash" : "❤️ Saqlash");
            favBtn.setCallbackData("fav:" + vacancyId);

            rows.add(List.of(applyBtn, favBtn));

            InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
            keyboard.setKeyboard(rows);
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

    @Transactional
    private AnswerCallbackQuery toggleFavorite(CallbackQuery callbackQuery, UUID vacancyId) {
        Long telegramId = callbackQuery.getFrom().getId();
        Candidate candidate = candidateRepository.findByTelegramId(telegramId).orElse(null);

        AnswerCallbackQuery answer = new AnswerCallbackQuery();
        answer.setCallbackQueryId(callbackQuery.getId());

        if (candidate == null) {
            answer.setText("Avval ro'yxatdan o'ting: /start");
            answer.setShowAlert(true);
            return answer;
        }

        boolean exists = favoriteVacancyRepository.existsByCandidateIdAndVacancyId(candidate.getId(), vacancyId);
        if (exists) {
            favoriteVacancyRepository.deleteByCandidateIdAndVacancyId(candidate.getId(), vacancyId);
            answer.setText("💔 Olib tashlandi");
        } else {
            FavoriteVacancy fav = FavoriteVacancy.builder()
                    .candidateId(candidate.getId())
                    .vacancyId(vacancyId)
                    .build();
            favoriteVacancyRepository.save(fav);
            answer.setText("❤️ Saqlandi!");
        }

        return answer;
    }
}
