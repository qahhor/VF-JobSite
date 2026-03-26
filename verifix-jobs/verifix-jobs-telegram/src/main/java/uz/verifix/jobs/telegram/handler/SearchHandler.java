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

@Component
@RequiredArgsConstructor
public class SearchHandler {

    private final VacancyService vacancyService;
    private final VacancyCardFormatter formatter;

    private static final int PAGE_SIZE = 5;

    public SendMessage handle(Message message) {
        Long chatId = message.getChatId();
        String text = message.getText();

        // Extract query — from /search command or button text
        String query = null;
        if (text != null) {
            if (text.startsWith("/search") && text.length() > "/search".length()) {
                query = text.substring("/search".length()).trim();
            } else if (text.contains("Ish qidirish")) {
                // Menu button clicked — prompt for query
                return reply(chatId, "🔍 <b>Ish qidirish</b>\n\n" +
                        "Nimani qidiryapsiz? Yozing:\n\n" +
                        "Masalan:\n" +
                        "• <code>Toshkent oshpaz</code>\n" +
                        "• <code>haydovchi</code>\n" +
                        "• <code>kassir 5 million</code>\n\n" +
                        "Yoki shahar/kasb nomini yozing:");
            }
        }

        if (query == null || query.isBlank()) {
            return reply(chatId, "🔍 <b>Ish qidirish</b>\n\n" +
                    "Kalit so'z yozing:\n" +
                    "Masalan: <code>/search Toshkent kassir</code>");
        }

        return searchAndFormat(chatId, query, 0);
    }

    public SendMessage searchAndFormat(Long chatId, String query, int page) {
        Page<Vacancy> results = vacancyService.search(query, null, null, null, PageRequest.of(page, PAGE_SIZE));

        if (results.isEmpty() && page == 0) {
            results = vacancyService.search(null, query, null, null, PageRequest.of(0, PAGE_SIZE));
        }

        if (results.isEmpty()) {
            return reply(chatId, "😔 \"" + query + "\" bo'yicha natija topilmadi.\n\n" +
                    "Boshqa kalit so'z bilan urinib ko'ring.");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🔍 <b>Natijalar:</b> \"").append(query).append("\"");
        sb.append("  (").append(results.getTotalElements()).append(" ta)\n\n");

        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        int i = page * PAGE_SIZE + 1;
        for (Vacancy v : results.getContent()) {
            sb.append(formatter.formatCompact(v, i)).append("\n\n");

            InlineKeyboardButton btn = new InlineKeyboardButton();
            btn.setText("📋 " + i + ". Batafsil");
            btn.setCallbackData("vacancy:" + v.getId());
            rows.add(List.of(btn));
            i++;
        }

        // Pagination buttons
        List<InlineKeyboardButton> navRow = new ArrayList<>();
        if (page > 0) {
            InlineKeyboardButton prev = new InlineKeyboardButton();
            prev.setText("⬅️ Oldingi");
            prev.setCallbackData("search_page:" + query + ":" + (page - 1));
            navRow.add(prev);
        }
        if (results.getTotalPages() > page + 1) {
            InlineKeyboardButton next = new InlineKeyboardButton();
            next.setText("Keyingi ➡️");
            next.setCallbackData("search_page:" + query + ":" + (page + 1));
            navRow.add(next);
        }
        if (!navRow.isEmpty()) {
            rows.add(navRow);
        }

        sb.append("📄 Sahifa ").append(page + 1).append("/").append(results.getTotalPages());

        SendMessage msg = reply(chatId, sb.toString());
        InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
        keyboard.setKeyboard(rows);
        msg.setReplyMarkup(keyboard);
        return msg;
    }

    private SendMessage reply(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setParseMode("HTML");
        return msg;
    }
}
