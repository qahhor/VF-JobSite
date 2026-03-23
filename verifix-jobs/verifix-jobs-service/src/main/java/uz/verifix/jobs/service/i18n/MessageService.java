package uz.verifix.jobs.service.i18n;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.enums.LanguagePreference;

import java.util.HashMap;
import java.util.Map;

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
            default -> "uz";
        };

        Map<String, String> langMessages = messages.getOrDefault(langCode, messages.get("uz"));
        return langMessages.getOrDefault(key, key);
    }

    public String getMessage(String key, LanguagePreference lang, Object... args) {
        String template = getMessage(key, lang);
        return String.format(template, args);
    }

    private void loadMessages() {
        // Uzbek Latin (default)
        Map<String, String> uz = new HashMap<>();
        uz.put("notification.new_application", "📨 Yangi ariza! %s vakansiyasiga %s ariza berdi.");
        uz.put("notification.hired", "🎉 Tabriklaymiz! Siz %s kompaniyasining %s vakansiyasiga qabul qilindingiz!");
        uz.put("notification.rejected", "Afsus, sizning %s vakansiyasiga arizangiz rad etildi.");
        uz.put("notification.vacancy_approved", "✅ Sizning \"%s\" vakansiyangiz tasdiqlandi va e'lon qilindi.");
        uz.put("notification.vacancy_rejected", "❌ Sizning \"%s\" vakansiyangiz rad etildi. Sabab: %s");
        uz.put("notification.employer_verified", "✅ Sizning kompaniyangiz muvaffaqiyatli tekshirildi!");
        uz.put("notification.weekly_report", "📊 Haftalik hisobot\n📋 Faol vakansiyalar: %d\n📨 Yangi arizalar: %d\n✅ Ishga qabul: %d");
        uz.put("notification.milestone", "🎉 Tabriklaymiz! Sizning kompaniyangizga %d ta ariza keldi!");
        uz.put("notification.digest_daily", "📋 Bugungi yangi vakansiyalar:");
        uz.put("notification.digest_weekly", "📋 Haftalik vakansiya to'plami:");
        uz.put("bot.welcome", "Assalomu alaykum! Verifix Jobs — Markaziy Osiyodagi eng yaxshi ish qidirish platformasi.");
        uz.put("bot.register_phone", "Telefon raqamingizni kiriting:");
        uz.put("bot.register_name", "Ismingizni kiriting:");
        uz.put("bot.register_city", "Shaharingizni tanlang:");
        uz.put("bot.search_prompt", "Qaysi sohada ish qidiryapsiz?");
        uz.put("bot.no_results", "Afsuski, mos vakansiyalar topilmadi. Boshqa mezonlarni sinab ko'ring.");
        uz.put("bot.apply_success", "✅ Arizangiz muvaffaqiyatli yuborildi!");
        uz.put("bot.already_applied", "Siz allaqachon bu vakansiyaga ariza bergansiz.");
        messages.put("uz", uz);

        // Russian
        Map<String, String> ru = new HashMap<>();
        ru.put("notification.new_application", "📨 Новая заявка! %s подал заявку на вакансию %s.");
        ru.put("notification.hired", "🎉 Поздравляем! Вы приняты на должность %s в компании %s!");
        ru.put("notification.rejected", "К сожалению, ваша заявка на вакансию %s отклонена.");
        ru.put("notification.vacancy_approved", "✅ Ваша вакансия \"%s\" одобрена и опубликована.");
        ru.put("notification.vacancy_rejected", "❌ Ваша вакансия \"%s\" отклонена. Причина: %s");
        ru.put("notification.employer_verified", "✅ Ваша компания успешно верифицирована!");
        ru.put("notification.weekly_report", "📊 Еженедельный отчёт\n📋 Активные вакансии: %d\n📨 Новые заявки: %d\n✅ Нанято: %d");
        ru.put("notification.milestone", "🎉 Поздравляем! Ваша компания получила %d заявок!");
        ru.put("notification.digest_daily", "📋 Новые вакансии сегодня:");
        ru.put("notification.digest_weekly", "📋 Еженедельная подборка вакансий:");
        ru.put("bot.welcome", "Здравствуйте! Verifix Jobs — лучшая платформа поиска работы в Центральной Азии.");
        ru.put("bot.register_phone", "Введите номер телефона:");
        ru.put("bot.register_name", "Введите ваше имя:");
        ru.put("bot.register_city", "Выберите город:");
        ru.put("bot.search_prompt", "В какой сфере ищете работу?");
        ru.put("bot.no_results", "К сожалению, подходящих вакансий не найдено. Попробуйте другие критерии.");
        ru.put("bot.apply_success", "✅ Ваша заявка успешно отправлена!");
        ru.put("bot.already_applied", "Вы уже подавали заявку на эту вакансию.");
        messages.put("ru", ru);

        // English
        Map<String, String> en = new HashMap<>();
        en.put("notification.new_application", "📨 New application! %s applied for %s vacancy.");
        en.put("notification.hired", "🎉 Congratulations! You've been hired for %s at %s!");
        en.put("notification.rejected", "Unfortunately, your application for %s was declined.");
        en.put("notification.vacancy_approved", "✅ Your vacancy \"%s\" has been approved and published.");
        en.put("notification.vacancy_rejected", "❌ Your vacancy \"%s\" was rejected. Reason: %s");
        en.put("notification.employer_verified", "✅ Your company has been successfully verified!");
        en.put("notification.weekly_report", "📊 Weekly Report\n📋 Active vacancies: %d\n📨 New applications: %d\n✅ Hired: %d");
        en.put("notification.milestone", "🎉 Congratulations! Your company received %d applications!");
        en.put("bot.welcome", "Hello! Verifix Jobs — the best job search platform in Central Asia.");
        en.put("bot.search_prompt", "What field are you looking for work in?");
        en.put("bot.no_results", "Sorry, no matching vacancies found. Try different criteria.");
        en.put("bot.apply_success", "✅ Your application has been submitted successfully!");
        en.put("bot.already_applied", "You have already applied for this vacancy.");
        messages.put("en", en);
    }
}
