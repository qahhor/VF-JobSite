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
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.service.vacancy.VacancyService;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;
import uz.verifix.jobs.telegram.util.TgUtils;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

import static uz.verifix.jobs.telegram.util.TgUtils.*;

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
    private final FavoriteService favoriteService;

    public BotApiMethod<? extends Serializable> handle(CallbackQuery cq) {
        String data = cq.getData();
        Long chatId = cq.getMessage().getChatId();
        Integer msgId = cq.getMessage().getMessageId();
        Long telegramId = cq.getFrom().getId();

        try {
            // Vacancy detail
            if (data.startsWith(CB_VACANCY)) {
                UUID vid = UUID.fromString(data.substring(CB_VACANCY.length()));
                return showVacancyDetail(chatId, msgId, vid, telegramId);
            }

            // Apply confirmation step
            if (data.startsWith(CB_APPLY_CONFIRM)) {
                UUID vid = UUID.fromString(data.substring(CB_APPLY_CONFIRM.length()));
                return applyHandler.handleApply(cq, vid);
            }

            // Apply — show confirmation first
            if (data.startsWith(CB_APPLY)) {
                UUID vid = UUID.fromString(data.substring(CB_APPLY.length()));
                return showApplyConfirmation(chatId, msgId, vid);
            }

            // Profile edit
            if (data.startsWith(CB_PROFILE_EDIT) || data.startsWith("profile:")) {
                return profileHandler.handleCallback(cq);
            }

            // Search pagination (free text)
            if (data.startsWith(CB_SEARCH_PAGE)) {
                String rest = data.substring(CB_SEARCH_PAGE.length());
                int lastColon = rest.lastIndexOf(':');
                if (lastColon > 0) {
                    String query = rest.substring(0, lastColon);
                    int page = Integer.parseInt(rest.substring(lastColon + 1));
                    return searchHandler.searchAndFormat(chatId, query, page);
                }
            }

            // Category search: cat:COOK or cat:COOK:2 (page)
            if (data.startsWith("cat:")) {
                String rest = data.substring("cat:".length());
                int colon = rest.indexOf(':');
                if (colon > 0) {
                    return searchHandler.searchByCategory(chatId, rest.substring(0, colon), Integer.parseInt(rest.substring(colon + 1)));
                }
                return searchHandler.searchByCategory(chatId, rest, 0);
            }

            // City search: city_s:Tashkent or city_s:Tashkent:2
            if (data.startsWith("city_s:")) {
                String rest = data.substring("city_s:".length());
                int colon = rest.indexOf(':');
                if (colon > 0) {
                    return searchHandler.searchByCity(chatId, rest.substring(0, colon), Integer.parseInt(rest.substring(colon + 1)));
                }
                return searchHandler.searchByCity(chatId, rest, 0);
            }

            // All vacancies: all_vacancies or all:2
            if (data.equals("all_vacancies") || data.startsWith("all:")) {
                int page = data.startsWith("all:") ? Integer.parseInt(data.substring("all:".length())) : 0;
                return searchHandler.searchAll(chatId, page);
            }

            // Back to category picker
            if (data.equals("show_categories")) {
                return searchHandler.searchAndFormat(chatId, "", 0);
            }

            // Back to main menu
            if (data.equals("show_main_menu")) {
                return StartHandler.buildMainMenuMessage(chatId);
            }

            // Favorite toggle
            if (data.startsWith(CB_FAVORITE)) {
                UUID vid = UUID.fromString(data.substring(CB_FAVORITE.length()));
                return toggleFavorite(cq, vid);
            }
        } catch (Exception e) {
            log.error("Callback error [{}]: {}", data, e.getMessage());
            return answer(cq.getId(), "Xatolik yuz berdi", true);
        }

        return null;
    }

    private EditMessageText showVacancyDetail(Long chatId, Integer msgId, UUID vacancyId, Long telegramId) {
        Vacancy vacancy = vacancyService.getById(vacancyId);
        String card = formatter.format(vacancy);

        boolean isFav = false;
        Candidate candidate = candidateRepository.findByTelegramId(telegramId).orElse(null);
        if (candidate != null) {
            isFav = favoriteService.isFavorited(candidate.getId(), vacancyId);
        }

        EditMessageText edit = new EditMessageText();
        edit.setChatId(chatId.toString());
        edit.setMessageId(msgId);
        edit.setText(card);
        edit.setParseMode("HTML");
        edit.setReplyMarkup(keyboard(List.of(
                List.of(
                        btn("📨 Ariza berish", CB_APPLY + vacancyId),
                        btn(isFav ? "💔 Olib tashlash" : "❤️ Saqlash", CB_FAVORITE + vacancyId)
                )
        )));

        return edit;
    }

    private EditMessageText showApplyConfirmation(Long chatId, Integer msgId, UUID vacancyId) {
        Vacancy vacancy = vacancyService.getById(vacancyId);

        EditMessageText edit = new EditMessageText();
        edit.setChatId(chatId.toString());
        edit.setMessageId(msgId);
        edit.setText("📨 <b>Ariza topshirasizmi?</b>\n\n" +
                "📋 " + TgUtils.escapeHtml(vacancy.getTitle()) + "\n" +
                "🏢 " + (vacancy.getEmployer() != null ? TgUtils.escapeHtml(vacancy.getEmployer().getName()) : "") + "\n" +
                "💰 " + TgUtils.formatSalaryRange(vacancy.getSalaryFrom(), vacancy.getSalaryTo()));
        edit.setParseMode("HTML");
        edit.setReplyMarkup(keyboard(List.of(
                List.of(
                        btn("✅ Ha, topshirish", CB_APPLY_CONFIRM + vacancyId),
                        btn("❌ Bekor qilish", CB_VACANCY + vacancyId)
                )
        )));
        return edit;
    }

    private AnswerCallbackQuery toggleFavorite(CallbackQuery cq, UUID vacancyId) {
        Long telegramId = cq.getFrom().getId();
        Candidate candidate = candidateRepository.findByTelegramId(telegramId).orElse(null);

        if (candidate == null) {
            return answer(cq.getId(), "Avval ro'yxatdan o'ting: /start", true);
        }

        boolean added = favoriteService.toggle(candidate.getId(), vacancyId);
        return answer(cq.getId(), added ? "❤️ Saqlandi!" : "💔 Olib tashlandi", false);
    }

    private AnswerCallbackQuery answer(String callbackId, String text, boolean showAlert) {
        AnswerCallbackQuery a = new AnswerCallbackQuery();
        a.setCallbackQueryId(callbackId);
        a.setText(text);
        a.setShowAlert(showAlert);
        return a;
    }
}
