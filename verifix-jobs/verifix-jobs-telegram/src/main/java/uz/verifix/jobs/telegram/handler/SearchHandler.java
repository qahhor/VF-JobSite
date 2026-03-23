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

    public SendMessage handle(Message message) {
        Long chatId = message.getChatId();
        String text = message.getText();

        // Extract query after /search
        String query = null;
        if (text != null && text.length() > "/search".length()) {
            query = text.substring("/search".length()).trim();
        }

        if (query == null || query.isBlank()) {
            return reply(chatId, "🔍 <b>Ish qidirish</b>\n\n" +
                    "Kalit so'z yoki shahar nomini yozing:\n" +
                    "Masalan: <code>/search Toshkent kassir</code>");
        }

        // Simple search: try city first, then category
        Page<Vacancy> results = vacancyService.search(query, null, null, null, PageRequest.of(0, 5));

        if (results.isEmpty()) {
            results = vacancyService.search(null, query, null, null, PageRequest.of(0, 5));
        }

        if (results.isEmpty()) {
            return reply(chatId, "😔 \"" + query + "\" bo'yicha natija topilmadi.\n\n" +
                    "Boshqa kalit so'z bilan urinib ko'ring.");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🔍 <b>Natijalar:</b> \"").append(query).append("\"\n\n");

        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        int i = 1;
        for (Vacancy v : results.getContent()) {
            sb.append(formatter.formatCompact(v, i)).append("\n\n");

            InlineKeyboardButton btn = new InlineKeyboardButton();
            btn.setText("📋 " + i + ". Batafsil");
            btn.setCallbackData("vacancy:" + v.getId());
            rows.add(List.of(btn));
            i++;
        }

        if (results.getTotalPages() > 1) {
            sb.append("\n📄 Sahifa 1/").append(results.getTotalPages());
        }

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
