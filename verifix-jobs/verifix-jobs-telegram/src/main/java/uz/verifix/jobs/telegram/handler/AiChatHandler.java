package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.service.ai.AiChatbotService;
import uz.verifix.jobs.service.vacancy.VacancyService;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiChatHandler {

    private final VacancyService vacancyService;
    private final VacancyCardFormatter formatter;
    private final AiChatbotService aiChatbotService;

    private static final Map<String, String> CITY_MAP = Map.ofEntries(
            Map.entry("toshkent", "Tashkent"), Map.entry("tashkent", "Tashkent"),
            Map.entry("samarqand", "Samarkand"), Map.entry("samarkand", "Samarkand"),
            Map.entry("buxoro", "Bukhara"), Map.entry("bukhara", "Bukhara"),
            Map.entry("andijon", "Andijan"), Map.entry("andijan", "Andijan"),
            Map.entry("namangan", "Namangan"),
            Map.entry("farg'ona", "Fergana"), Map.entry("fergana", "Fergana"), Map.entry("fargona", "Fergana"),
            Map.entry("nukus", "Nukus"),
            Map.entry("qarshi", "Karshi"), Map.entry("karshi", "Karshi"),
            Map.entry("navoiy", "Navoi"), Map.entry("navoi", "Navoi"),
            Map.entry("jizzax", "Jizzakh"), Map.entry("jizzakh", "Jizzakh"),
            Map.entry("guliston", "Gulistan"), Map.entry("gulistan", "Gulistan"),
            Map.entry("termiz", "Termez"), Map.entry("termez", "Termez"),
            Map.entry("urganch", "Urgench"), Map.entry("urgench", "Urgench"),
            Map.entry("xiva", "Khiva"), Map.entry("khiva", "Khiva"),
            Map.entry("chirchiq", "Chirchik"), Map.entry("chirchik", "Chirchik"),
            Map.entry("olmaliq", "Almalyk"), Map.entry("almalyk", "Almalyk")
    );

    private static final Map<String, String> CATEGORY_MAP = Map.ofEntries(
            Map.entry("oshpaz", "COOK"), Map.entry("povar", "COOK"), Map.entry("cook", "COOK"),
            Map.entry("haydovchi", "DRIVER"), Map.entry("voditel", "DRIVER"), Map.entry("driver", "DRIVER"),
            Map.entry("sotuvchi", "SALES"), Map.entry("prodavets", "SALES"), Map.entry("sales", "SALES"),
            Map.entry("quruvchi", "BUILDER"), Map.entry("stroitel", "BUILDER"), Map.entry("builder", "BUILDER"),
            Map.entry("tozalovchi", "CLEANER"), Map.entry("uborshik", "CLEANER"), Map.entry("cleaner", "CLEANER"),
            Map.entry("ofitsiant", "WAITER"), Map.entry("waiter", "WAITER"),
            Map.entry("kassir", "CASHIER"), Map.entry("cashier", "CASHIER"),
            Map.entry("ombor", "WAREHOUSE"), Map.entry("sklad", "WAREHOUSE"), Map.entry("warehouse", "WAREHOUSE"),
            Map.entry("qorovul", "SECURITY"), Map.entry("oxrana", "SECURITY"), Map.entry("security", "SECURITY"),
            Map.entry("elektrik", "ELECTRICIAN"), Map.entry("electrician", "ELECTRICIAN"),
            Map.entry("santexnik", "PLUMBER"), Map.entry("plumber", "PLUMBER"),
            Map.entry("tikuvchi", "TAILOR"), Map.entry("shvey", "TAILOR"), Map.entry("tailor", "TAILOR"),
            Map.entry("kuryer", "COURIER"), Map.entry("courier", "COURIER"),
            Map.entry("yuk", "LOADER"), Map.entry("gruzchik", "LOADER"), Map.entry("loader", "LOADER"),
            Map.entry("mexanik", "MECHANIC"), Map.entry("mechanic", "MECHANIC"),
            Map.entry("bo'yoqchi", "PAINTER"), Map.entry("malyar", "PAINTER"), Map.entry("painter", "PAINTER"),
            Map.entry("payvandchi", "WELDER"), Map.entry("svarshik", "WELDER"), Map.entry("welder", "WELDER"),
            Map.entry("duradgor", "CARPENTER"), Map.entry("plotnik", "CARPENTER"), Map.entry("carpenter", "CARPENTER"),
            Map.entry("bog'bon", "GARDENER"), Map.entry("sadovnik", "GARDENER"), Map.entry("gardener", "GARDENER"),
            Map.entry("enaga", "NANNY"), Map.entry("nyanya", "NANNY"), Map.entry("nanny", "NANNY")
    );

    private static final Pattern SALARY_PATTERN = Pattern.compile(
            "(\\d+(?:[.,]\\d+)?)\\s*(?:million|mln|millon|miliyon|mln|млн)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SALARY_THOUSAND_PATTERN = Pattern.compile(
            "(\\d+(?:[.,]\\d+)?)\\s*(?:ming|tys|тыс|thousand|k)",
            Pattern.CASE_INSENSITIVE
    );

    public SendMessage handle(Message message) {
        Long chatId = message.getChatId();
        String text = message.getText().trim();
        String textLower = text.toLowerCase();

        // Try Claude API first if enabled
        if (aiChatbotService.isEnabled()) {
            AiChatbotService.ChatResult aiResult = aiChatbotService.processMessage(text, message.getFrom().getId());
            if (aiResult != null) {
                return buildAiResponse(chatId, aiResult);
            }
            log.debug("Claude API unavailable, falling back to keyword search");
        }

        // Keyword-based fallback
        return handleKeywordSearch(chatId, textLower);
    }

    private SendMessage buildAiResponse(Long chatId, AiChatbotService.ChatResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("🤖 ").append(result.message()).append("\n");

        List<Vacancy> vacancies = result.vacancies();
        if (vacancies != null && !vacancies.isEmpty()) {
            sb.append("\n");
            List<List<InlineKeyboardButton>> rows = new ArrayList<>();
            int i = 1;
            for (Vacancy v : vacancies) {
                sb.append(formatter.formatCompact(v, i)).append("\n\n");
                InlineKeyboardButton btn = new InlineKeyboardButton();
                btn.setText("📋 " + i + ". Batafsil");
                btn.setCallbackData("vacancy:" + v.getId());
                rows.add(List.of(btn));
                i++;
            }

            SendMessage msg = reply(chatId, sb.toString());
            if (!rows.isEmpty()) {
                InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
                keyboard.setKeyboard(rows);
                msg.setReplyMarkup(keyboard);
            }
            return msg;
        }

        if ("GREETING".equals(result.intent()) || "HELP".equals(result.intent()) || "INFO".equals(result.intent())) {
            return reply(chatId, sb.toString());
        }

        // SEARCH intent but no results
        if ("SEARCH".equals(result.intent())) {
            sb.append("\n😔 Afsuski, mos ish o'rni topilmadi. Boshqa so'rov bilan urinib ko'ring.");
        }
        return reply(chatId, sb.toString());
    }

    private SendMessage handleKeywordSearch(Long chatId, String text) {
        String city = extractCity(text);
        String category = extractCategory(text);
        BigDecimal salaryFrom = extractSalary(text);

        if (city == null && category == null && salaryFrom == null) {
            return reply(chatId, "🤖 <b>AI Ish Qidiruv</b>\n\n" +
                    "Men sizga ish topishda yordam beraman! Shunchaki yozing:\n\n" +
                    "💬 <i>\"Toshkentda oshpaz ish kerak\"</i>\n" +
                    "💬 <i>\"haydovchi 5 million\"</i>\n" +
                    "💬 <i>\"Samarqand sotuvchi\"</i>\n\n" +
                    "Yoki buyruqlardan foydalaning:\n" +
                    "🔍 /search [kalit so'z] — Oddiy qidiruv\n" +
                    "📍 /nearby — Yaqin atrofdagi ishlar");
        }

        log.info("Keyword search — city: {}, category: {}, salary: {} from text: '{}'", city, category, salaryFrom, text);

        Page<Vacancy> results = vacancyService.search(city, category, salaryFrom, null, PageRequest.of(0, 5));

        if (results.isEmpty() && city != null && category != null) {
            results = vacancyService.search(city, null, salaryFrom, null, PageRequest.of(0, 5));
        }
        if (results.isEmpty() && category != null) {
            results = vacancyService.search(null, category, null, null, PageRequest.of(0, 5));
        }

        if (results.isEmpty()) {
            StringBuilder noResult = new StringBuilder("😔 Afsuski, ");
            if (category != null) noResult.append("<b>").append(category.toLowerCase()).append("</b> ");
            if (city != null) noResult.append(city).append("da ");
            noResult.append("bo'sh ish o'rni topilmadi.\n\n");
            noResult.append("🔄 Boshqa shahar yoki kasb nomini yozing.");
            return reply(chatId, noResult.toString());
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🤖 <b>Sizga mos ishlar:</b>\n");
        if (city != null) sb.append("📍 ").append(city);
        if (category != null) sb.append(" | 🏷 ").append(category);
        if (salaryFrom != null) sb.append(" | 💰 ").append(salaryFrom.toPlainString()).append("+");
        sb.append("\n\n");

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

        if (results.getTotalElements() > 5) {
            sb.append("📊 Jami <b>").append(results.getTotalElements()).append("</b> ish topildi.");
        }

        SendMessage msg = reply(chatId, sb.toString());
        if (!rows.isEmpty()) {
            InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
            keyboard.setKeyboard(rows);
            msg.setReplyMarkup(keyboard);
        }
        return msg;
    }

    private String extractCity(String text) {
        for (Map.Entry<String, String> entry : CITY_MAP.entrySet()) {
            if (text.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String extractCategory(String text) {
        for (Map.Entry<String, String> entry : CATEGORY_MAP.entrySet()) {
            if (text.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private BigDecimal extractSalary(String text) {
        Matcher m = SALARY_PATTERN.matcher(text);
        if (m.find()) {
            String num = m.group(1).replace(",", ".");
            return new BigDecimal(num).multiply(BigDecimal.valueOf(1_000_000));
        }
        Matcher mk = SALARY_THOUSAND_PATTERN.matcher(text);
        if (mk.find()) {
            String num = mk.group(1).replace(",", ".");
            return new BigDecimal(num).multiply(BigDecimal.valueOf(1_000));
        }
        return null;
    }

    private SendMessage reply(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setParseMode("HTML");
        return msg;
    }
}
