package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Location;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.service.vacancy.VacancyService;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NearbyHandler {

    private final VacancyService vacancyService;
    private final VacancyCardFormatter formatter;

    public SendMessage handle(Message message) {
        Long chatId = message.getChatId();

        Location location = message.getLocation();
        if (location == null) {
            return requestLocation(chatId);
        }

        return searchNearby(chatId, location.getLatitude(), location.getLongitude());
    }

    public SendMessage searchNearby(Long chatId, double lat, double lon) {
        List<Vacancy> vacancies = vacancyService.findNearby(lat, lon, 10);

        if (vacancies.isEmpty()) {
            return reply(chatId, "😔 Yaqin atrofda (10 km) hozircha ishlar topilmadi.\n\n" +
                    "Qidiruv radiusini kengaytirish uchun /search buyrug'idan foydalaning.");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📍 <b>Yaqin atrofdagi ishlar</b> (10 km):\n\n");

        List<List<InlineKeyboardButton>> rows = new ArrayList<>();
        int i = 1;
        for (Vacancy v : vacancies.stream().limit(5).toList()) {
            sb.append(formatter.formatCompact(v, i)).append("\n\n");

            InlineKeyboardButton btn = new InlineKeyboardButton();
            btn.setText("📋 " + i + ". Batafsil");
            btn.setCallbackData("vacancy:" + v.getId());
            rows.add(List.of(btn));
            i++;
        }

        SendMessage msg = reply(chatId, sb.toString());
        InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
        keyboard.setKeyboard(rows);
        msg.setReplyMarkup(keyboard);
        return msg;
    }

    private SendMessage requestLocation(Long chatId) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText("📍 Yaqin atrofdagi ishlarni topish uchun joylashuvingizni yuboring:");
        msg.setParseMode("HTML");

        KeyboardButton locationBtn = new KeyboardButton("📍 Joylashuvni yuborish");
        locationBtn.setRequestLocation(true);
        KeyboardRow row = new KeyboardRow();
        row.add(locationBtn);
        ReplyKeyboardMarkup keyboard = new ReplyKeyboardMarkup();
        keyboard.setKeyboard(List.of(row));
        keyboard.setResizeKeyboard(true);
        keyboard.setOneTimeKeyboard(true);
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
