package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.service.vacancy.VacancyService;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;

import java.util.ArrayList;
import java.util.List;

import static uz.verifix.jobs.telegram.util.TgUtils.*;

@Component
@RequiredArgsConstructor
public class SearchHandler {

    private final VacancyService vacancyService;
    private final VacancyCardFormatter formatter;

    private static final int PAGE_SIZE = 5;

    // Popular categories for quick buttons
    private static final String[][] QUICK_CATEGORIES = {
            {"👨‍🍳 Oshpaz", "COOK"},
            {"🚗 Haydovchi", "DRIVER"},
            {"🛒 Sotuvchi", "SALES"},
            {"🏗️ Qurilishchi", "BUILDER"},
            {"🍽️ Ofitsiant", "WAITER"},
            {"🛡️ Qo'riqchi", "SECURITY"},
            {"📦 Omborchi", "WAREHOUSE"},
            {"💰 Kassir", "CASHIER"},
            {"⚡ Elektrik", "ELECTRICIAN"},
            {"🧵 Tikuvchi", "TAILOR"},
            {"🏍️ Kuryer", "COURIER"},
            {"💪 Yukchi", "LOADER"},
    };

    public SendMessage handle(Message message) {
        Long chatId = message.getChatId();
        String text = message.getText();

        // Extract query from /search command
        String query = null;
        if (text != null && text.startsWith("/search") && text.length() > "/search".length()) {
            query = text.substring("/search".length()).trim();
        }

        // If menu button or no query — show category picker
        if (query == null || query.isBlank()) {
            return showCategoryPicker(chatId);
        }

        return searchAndFormat(chatId, query, 0);
    }

    /** Quick category picker — no typing needed */
    private SendMessage showCategoryPicker(Long chatId) {
        SendMessage msg = html(chatId,
                "🔍 <b>Qanday ish qidiryapsiz?</b>\n\n" +
                "Kasbni tanlang yoki nomini yozing:");

        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        for (int i = 0; i < QUICK_CATEGORIES.length; i += 3) {
            List<InlineKeyboardButton> row = new ArrayList<>();
            for (int j = i; j < Math.min(i + 3, QUICK_CATEGORIES.length); j++) {
                row.add(btn(QUICK_CATEGORIES[j][0], "cat:" + QUICK_CATEGORIES[j][1]));
            }
            rows.add(row);
        }

        // City row
        rows.add(List.of(
                btn("📍 Toshkent", "city_s:Tashkent"),
                btn("📍 Samarqand", "city_s:Samarkand"),
                btn("📍 Buxoro", "city_s:Bukhara")
        ));
        rows.add(List.of(
                btn("📍 Andijon", "city_s:Andijan"),
                btn("📍 Namangan", "city_s:Namangan"),
                btn("📍 Farg'ona", "city_s:Fergana")
        ));

        // "Show all" button
        rows.add(List.of(btn("📋 Barcha vakansiyalar", "all_vacancies")));

        msg.setReplyMarkup(keyboard(rows));
        return msg;
    }

    /** Search by category code */
    public SendMessage searchByCategory(Long chatId, String category, int page) {
        Page<Vacancy> results = vacancyService.search(null, category, null, null, PageRequest.of(page, PAGE_SIZE));
        if (results.isEmpty()) {
            return html(chatId, "😔 Bu kategoriyada vakansiya topilmadi.");
        }
        return formatResults(chatId, categoryLabel(category), results, page, "cat:" + category + ":");
    }

    /** Search by city */
    public SendMessage searchByCity(Long chatId, String city, int page) {
        Page<Vacancy> results = vacancyService.search(city, null, null, null, PageRequest.of(page, PAGE_SIZE));
        if (results.isEmpty()) {
            return html(chatId, "😔 " + city + " shahrida vakansiya topilmadi.");
        }
        return formatResults(chatId, "📍 " + city, results, page, "city_s:" + city + ":");
    }

    /** Search all vacancies */
    public SendMessage searchAll(Long chatId, int page) {
        Page<Vacancy> results = vacancyService.search(null, null, null, null, PageRequest.of(page, PAGE_SIZE));
        if (results.isEmpty()) {
            return html(chatId, "😔 Vakansiyalar topilmadi.");
        }
        return formatResults(chatId, "Barcha vakansiyalar", results, page, "all:");
    }

    /** Free text search */
    public SendMessage searchAndFormat(Long chatId, String query, int page) {
        Page<Vacancy> results = vacancyService.search(query, null, null, null, PageRequest.of(page, PAGE_SIZE));

        if (results.isEmpty() && page == 0) {
            results = vacancyService.search(null, query, null, null, PageRequest.of(0, PAGE_SIZE));
        }

        if (results.isEmpty()) {
            SendMessage msg = html(chatId, "😔 \"" + escapeHtml(query) + "\" bo'yicha natija topilmadi.\n\nKasbni tanlang:");
            msg.setReplyMarkup(keyboard(quickCategoryRows()));
            return msg;
        }

        return formatResults(chatId, "\"" + escapeHtml(query) + "\"", results, page, CB_SEARCH_PAGE + query + ":");
    }

    /** Common result formatter with pagination */
    private SendMessage formatResults(Long chatId, String title, Page<Vacancy> results, int page, String pagePrefix) {
        StringBuilder sb = new StringBuilder();
        sb.append("🔍 <b>").append(title).append("</b>  (").append(results.getTotalElements()).append(" ta)\n\n");

        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        int i = page * PAGE_SIZE + 1;
        for (Vacancy v : results.getContent()) {
            sb.append(formatter.formatCompact(v, i)).append("\n\n");
            rows.add(List.of(btn("📋 " + i + ". Batafsil", CB_VACANCY + v.getId())));
            i++;
        }

        // Pagination
        List<InlineKeyboardButton> navRow = new ArrayList<>();
        if (page > 0) navRow.add(btn("⬅️ Oldingi", pagePrefix + (page - 1)));
        if (results.getTotalPages() > page + 1) navRow.add(btn("Keyingi ➡️", pagePrefix + (page + 1)));
        if (!navRow.isEmpty()) rows.add(navRow);

        // Back to categories
        rows.add(List.of(btn("🔙 Kasblar ro'yxati", "show_categories")));

        sb.append("📄 ").append(page + 1).append("/").append(results.getTotalPages());

        SendMessage msg = html(chatId, sb.toString());
        msg.setReplyMarkup(keyboard(rows));
        return msg;
    }

    private List<List<InlineKeyboardButton>> quickCategoryRows() {
        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        for (int i = 0; i < Math.min(6, QUICK_CATEGORIES.length); i += 3) {
            List<InlineKeyboardButton> row = new ArrayList<>();
            for (int j = i; j < Math.min(i + 3, QUICK_CATEGORIES.length); j++) {
                row.add(btn(QUICK_CATEGORIES[j][0], "cat:" + QUICK_CATEGORIES[j][1]));
            }
            rows.add(row);
        }
        return rows;
    }

    private String categoryLabel(String code) {
        for (String[] cat : QUICK_CATEGORIES) {
            if (cat[1].equals(code)) return cat[0];
        }
        return code;
    }
}
