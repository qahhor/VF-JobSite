package uz.verifix.jobs.telegram.util;

import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;

import java.math.BigDecimal;
import java.util.List;

public final class TgUtils {

    private TgUtils() {}

    public static SendMessage html(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setParseMode("HTML");
        return msg;
    }

    public static InlineKeyboardButton btn(String text, String callbackData) {
        InlineKeyboardButton button = new InlineKeyboardButton();
        button.setText(text);
        button.setCallbackData(callbackData);
        return button;
    }

    public static InlineKeyboardButton urlBtn(String text, String url) {
        InlineKeyboardButton button = new InlineKeyboardButton();
        button.setText(text);
        button.setUrl(url);
        return button;
    }

    public static InlineKeyboardMarkup keyboard(List<List<InlineKeyboardButton>> rows) {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        markup.setKeyboard(rows);
        return markup;
    }

    public static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    public static String formatSalary(BigDecimal n) {
        if (n == null) return "0";
        long val = n.longValue();
        if (val >= 1_000_000) return String.format("%.1fM", val / 1_000_000.0);
        if (val >= 1_000) return (val / 1_000) + "K";
        return String.valueOf(val);
    }

    public static String formatSalaryRange(BigDecimal from, BigDecimal to) {
        if (from == null && to == null) return "Kelishiladi";
        if (from != null && to != null) return formatSalary(from) + " – " + formatSalary(to) + " UZS";
        if (from != null) return formatSalary(from) + "+ UZS";
        return "≤" + formatSalary(to) + " UZS";
    }

    // Callback data constants
    public static final String CB_VACANCY = "v:";
    public static final String CB_APPLY = "a:";
    public static final String CB_APPLY_CONFIRM = "ac:";
    public static final String CB_FAVORITE = "f:";
    public static final String CB_SEARCH_PAGE = "sp:";
    public static final String CB_PROFILE_EDIT = "pe:";
}
