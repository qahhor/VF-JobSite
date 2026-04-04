package uz.verifix.jobs.service.i18n;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.enums.LanguagePreference;

import java.util.HashMap;
import java.util.Map;

/**
 * Multilingual message service — 2 languages: UZ (Latin), RU
 */
@Slf4j
@Service
public class MessageService {

    private final Map<String, Map<String, String>> messages = new HashMap<>();

    public MessageService() {
        loadMessages();
    }

    public String getMessage(String key, LanguagePreference lang) {
        String langCode = switch (lang) {
            case UZ -> "uz";
            case RU -> "ru";
        };
        Map<String, String> langMessages = messages.getOrDefault(langCode, messages.get("uz"));
        return langMessages.getOrDefault(key, key);
    }

    public String getMessage(String key, String langCode) {
        Map<String, String> langMessages = messages.getOrDefault(langCode, messages.get("uz"));
        return langMessages.getOrDefault(key, key);
    }

    public String getMessage(String key, LanguagePreference lang, Object... args) {
        String template = getMessage(key, lang);
        return String.format(template, args);
    }

    public String getMessage(String key, String langCode, Object... args) {
        String template = getMessage(key, langCode);
        return String.format(template, args);
    }

    private void loadMessages() {
        // ========== UZBEK LATIN (default) ==========
        Map<String, String> uz = new HashMap<>();
        uz.put("notification.new_application", "📨 Yangi ariza! %s vakansiyasiga %s ariza berdi.");
        uz.put("notification.hired", "🎉 Tabriklaymiz! Siz %s kompaniyasining %s vakansiyasiga qabul qilindingiz!");
        uz.put("notification.rejected", "Afsus, sizning %s vakansiyasiga arizangiz rad etildi.");
        uz.put("notification.status_changed", "📌 %s vakansiyasi bo'yicha arizangiz holati: %s");
        uz.put("notification.vacancy_approved", "✅ Sizning \"%s\" vakansiyangiz tasdiqlandi va e'lon qilindi.");
        uz.put("notification.vacancy_rejected", "❌ Sizning \"%s\" vakansiyangiz rad etildi. Sabab: %s");
        uz.put("notification.employer_verified", "✅ Sizning kompaniyangiz muvaffaqiyatli tekshirildi!");
        uz.put("notification.weekly_report", "📊 Haftalik hisobot\n📋 Faol vakansiyalar: %d\n📨 Yangi arizalar: %d\n✅ Ishga qabul: %d");
        uz.put("notification.interview", "📅 Suhbatga taklif! %s vakansiyasi, %s");
        uz.put("bot.welcome", "Assalomu alaykum! Verifix Jobs — Markaziy Osiyodagi eng yaxshi ish qidirish platformasi.");
        uz.put("bot.register_phone", "Telefon raqamingizni kiriting:");
        uz.put("bot.register_name", "Ismingizni kiriting:");
        uz.put("bot.register_city", "Shaharingizni tanlang:");
        uz.put("bot.search_prompt", "Qaysi sohada ish qidiryapsiz?");
        uz.put("bot.no_results", "Afsuski, mos vakansiyalar topilmadi.");
        uz.put("bot.apply_success", "✅ Arizangiz muvaffaqiyatli yuborildi!");
        uz.put("bot.already_applied", "Siz allaqachon bu vakansiyaga ariza bergansiz.");
        messages.put("uz", uz);

        // ========== RUSSIAN ==========
        Map<String, String> ru = new HashMap<>();
        ru.put("notification.new_application", "📨 Новая заявка! %s подал заявку на вакансию %s.");
        ru.put("notification.hired", "🎉 Поздравляем! Вы приняты на должность %s в компании %s!");
        ru.put("notification.rejected", "К сожалению, ваша заявка на вакансию %s отклонена.");
        ru.put("notification.status_changed", "📌 Статус вашей заявки на вакансию %s: %s");
        ru.put("notification.vacancy_approved", "✅ Ваша вакансия \"%s\" одобрена и опубликована.");
        ru.put("notification.vacancy_rejected", "❌ Ваша вакансия \"%s\" отклонена. Причина: %s");
        ru.put("notification.employer_verified", "✅ Ваша компания успешно верифицирована!");
        ru.put("notification.weekly_report", "📊 Еженедельный отчёт\n📋 Активные вакансии: %d\n📨 Новые заявки: %d\n✅ Нанято: %d");
        ru.put("notification.interview", "📅 Приглашение на собеседование! Вакансия %s, %s");
        ru.put("bot.welcome", "Здравствуйте! Verifix Jobs — лучшая платформа поиска работы в Центральной Азии.");
        ru.put("bot.register_phone", "Введите номер телефона:");
        ru.put("bot.register_name", "Введите ваше имя:");
        ru.put("bot.register_city", "Выберите город:");
        ru.put("bot.search_prompt", "В какой сфере ищете работу?");
        ru.put("bot.no_results", "К сожалению, подходящих вакансий не найдено.");
        ru.put("bot.apply_success", "✅ Ваша заявка успешно отправлена!");
        ru.put("bot.already_applied", "Вы уже подавали заявку на эту вакансию.");
        messages.put("ru", ru);

        log.info("i18n loaded: {} languages, {} total keys",
                messages.size(), messages.values().stream().mapToInt(Map::size).sum());
    }
}
