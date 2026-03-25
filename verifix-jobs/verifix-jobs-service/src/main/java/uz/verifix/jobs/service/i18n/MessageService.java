package uz.verifix.jobs.service.i18n;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.enums.LanguagePreference;

import java.util.HashMap;
import java.util.Map;

/**
 * Multilingual message service — 7 languages:
 * UZ (Latin), UZ (Cyrillic), RU, EN, KK, TG, KY
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
            case EN -> "en";
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

        // ========== UZBEK CYRILLIC ==========
        Map<String, String> uz_cyr = new HashMap<>();
        uz_cyr.put("notification.new_application", "📨 Янги ариза! %s вакансиясига %s ариза берди.");
        uz_cyr.put("notification.hired", "🎉 Табриклаймиз! Сиз %s компаниясининг %s вакансиясига қабул қилиндингиз!");
        uz_cyr.put("notification.rejected", "Афсус, сизнинг %s вакансиясига аризангиз рад этилди.");
        uz_cyr.put("notification.status_changed", "📌 %s вакансияси бўйича аризангиз ҳолати: %s");
        uz_cyr.put("notification.vacancy_approved", "✅ Сизнинг \"%s\" вакансиянгиз тасдиқланди.");
        uz_cyr.put("bot.welcome", "Ассалому алайкум! Verifix Jobs — Марказий Осиёдаги энг яхши иш қидириш платформаси.");
        uz_cyr.put("bot.search_prompt", "Қайси соҳада иш қидиряпсиз?");
        uz_cyr.put("bot.no_results", "Афсуски, мос вакансиялар топилмади.");
        uz_cyr.put("bot.apply_success", "✅ Аризангиз муваффақиятли юборилди!");
        messages.put("uz_cyr", uz_cyr);

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

        // ========== ENGLISH ==========
        Map<String, String> en = new HashMap<>();
        en.put("notification.new_application", "📨 New application! %s applied for %s.");
        en.put("notification.hired", "🎉 Congratulations! You've been hired for %s at %s!");
        en.put("notification.rejected", "Unfortunately, your application for %s was declined.");
        en.put("notification.status_changed", "📌 Your application for %s status: %s");
        en.put("notification.vacancy_approved", "✅ Your vacancy \"%s\" has been approved and published.");
        en.put("notification.vacancy_rejected", "❌ Your vacancy \"%s\" was rejected. Reason: %s");
        en.put("notification.employer_verified", "✅ Your company has been verified!");
        en.put("notification.weekly_report", "📊 Weekly Report\n📋 Active vacancies: %d\n📨 New applications: %d\n✅ Hired: %d");
        en.put("notification.interview", "📅 Interview invitation! Vacancy %s, %s");
        en.put("bot.welcome", "Hello! Verifix Jobs — the best job search platform in Central Asia.");
        en.put("bot.search_prompt", "What field are you looking for work in?");
        en.put("bot.no_results", "Sorry, no matching vacancies found.");
        en.put("bot.apply_success", "✅ Your application has been submitted!");
        en.put("bot.already_applied", "You have already applied for this vacancy.");
        messages.put("en", en);

        // ========== KAZAKH ==========
        Map<String, String> kk = new HashMap<>();
        kk.put("notification.new_application", "📨 Жаңа өтінім! %s %s бос орнына өтінім берді.");
        kk.put("notification.hired", "🎉 Құттықтаймыз! Сіз %s компаниясының %s бос орнына қабылдандыңыз!");
        kk.put("notification.rejected", "Өкінішке орай, %s бос орнына өтініміңіз қабылданбады.");
        kk.put("notification.status_changed", "📌 %s бос орнына өтініміңіздің мәртебесі: %s");
        kk.put("notification.vacancy_approved", "✅ Сіздің \"%s\" бос орныңыз мақұлданды.");
        kk.put("notification.interview", "📅 Сұхбатқа шақыру! %s бос орны, %s");
        kk.put("bot.welcome", "Сәлеметсіз бе! Verifix Jobs — Орталық Азиядағы ең жақсы жұмыс іздеу платформасы.");
        kk.put("bot.search_prompt", "Қандай салада жұмыс іздеп жүрсіз?");
        kk.put("bot.no_results", "Өкінішке орай, сәйкес бос орындар табылмады.");
        kk.put("bot.apply_success", "✅ Өтініміңіз сәтті жіберілді!");
        kk.put("bot.already_applied", "Сіз бұл бос орынға өтінім бергенсіз.");
        messages.put("kk", kk);

        // ========== TAJIK ==========
        Map<String, String> tg = new HashMap<>();
        tg.put("notification.new_application", "📨 Аризаи нав! %s ба ҷойи кории %s ариза дод.");
        tg.put("notification.hired", "🎉 Табрик! Шумо ба вазифаи %s дар ширкати %s қабул шудед!");
        tg.put("notification.rejected", "Мутаассифона, аризаи шумо ба ҷойи кории %s рад карда шуд.");
        tg.put("notification.status_changed", "📌 Ҳолати аризаи шумо барои %s: %s");
        tg.put("notification.vacancy_approved", "✅ Ҷойи кории \"%s\" тасдиқ шуд.");
        tg.put("notification.interview", "📅 Даъват ба мусоҳиба! Ҷойи кории %s, %s");
        tg.put("bot.welcome", "Салом! Verifix Jobs — беҳтарин платформаи ҷустуҷӯи кор дар Осиёи Марказӣ.");
        tg.put("bot.search_prompt", "Дар кадом соҳа кор ҷустуҷӯ мекунед?");
        tg.put("bot.no_results", "Мутаассифона, ҷойи кории мувофиқ ёфт нашуд.");
        tg.put("bot.apply_success", "✅ Аризаи шумо бомуваффақият фиристода шуд!");
        messages.put("tg", tg);

        // ========== KYRGYZ ==========
        Map<String, String> ky = new HashMap<>();
        ky.put("notification.new_application", "📨 Жаңы арыз! %s %s вакансиясына арыз берди.");
        ky.put("notification.hired", "🎉 Куттуктайбыз! Сиз %s компаниясынын %s вакансиясына кабыл алындыңыз!");
        ky.put("notification.rejected", "Тилекке каршы, %s вакансиясына арызыңыз четке кагылды.");
        ky.put("notification.status_changed", "📌 %s вакансиясы боюнча арызыңыздын абалы: %s");
        ky.put("notification.vacancy_approved", "✅ Сиздин \"%s\" вакансияңыз бекитилди.");
        ky.put("notification.interview", "📅 Маектешүүгө чакыруу! %s вакансиясы, %s");
        ky.put("bot.welcome", "Саламатсызбы! Verifix Jobs — Борбордук Азиядагы эң мыкты жумуш издөө платформасы.");
        ky.put("bot.search_prompt", "Кандай тармакта жумуш издеп жатасыз?");
        ky.put("bot.no_results", "Тилекке каршы, ылайыктуу вакансиялар табылган жок.");
        ky.put("bot.apply_success", "✅ Арызыңыз ийгиликтүү жөнөтүлдү!");
        messages.put("ky", ky);

        log.info("i18n loaded: {} languages, {} total keys",
                messages.size(), messages.values().stream().mapToInt(Map::size).sum());
    }
}
