package uz.verifix.jobs.service.notification;

import org.springframework.stereotype.Component;

@Component
public class NotificationTemplates {

    public String newApplication(String vacancyTitle, String candidateName) {
        return "📨 <b>Yangi ariza!</b>\n\n" +
                "Vakansiya: " + vacancyTitle + "\n" +
                "Nomzod: " + candidateName + "\n\n" +
                "Employer portalda ko'rib chiqing.";
    }

    public String applicationStatusChanged(String vacancyTitle, String newStatus) {
        String statusUz = switch (newStatus) {
            case "VIEWED" -> "Ko'rib chiqilmoqda 👁";
            case "SHORTLIST" -> "Tanlangan nomzodlar ro'yxatida ⭐";
            case "INVITED" -> "Suhbatga taklif qilindingiz 📨";
            case "INTERVIEW" -> "Suhbat bosqichida 🤝";
            case "OFFER" -> "Sizga taklif berildi 🎁";
            default -> newStatus;
        };

        return "📋 <b>Ariza holati yangilandi</b>\n\n" +
                "Vakansiya: " + vacancyTitle + "\n" +
                "Yangi holat: " + statusUz;
    }

    public String hired(String vacancyTitle, String employerName) {
        return "🎉 <b>Tabriklaymiz!</b>\n\n" +
                "Siz \"" + vacancyTitle + "\" vakansiyasiga qabul qilindingiz!\n" +
                "Kompaniya: " + employerName + "\n\n" +
                "Omad tilaymiz!";
    }

    public String rejected(String vacancyTitle) {
        return "😔 <b>Ariza rad etildi</b>\n\n" +
                "Vakansiya: " + vacancyTitle + "\n\n" +
                "Boshqa vakansiyalarni qidiring: /search";
    }

    public String vacancyApproved(String vacancyTitle) {
        return "✅ <b>Vakansiya tasdiqlandi!</b>\n\n" +
                "\"" + vacancyTitle + "\" endi faol va nomzodlar ko'ra oladi.";
    }

    public String vacancyRejected(String vacancyTitle, String reason) {
        return "❌ <b>Vakansiya rad etildi</b>\n\n" +
                "\"" + vacancyTitle + "\"\n" +
                "Sabab: " + (reason != null ? reason : "Ko'rsatilmagan") + "\n\n" +
                "Tahrirlang va qayta yuboring.";
    }

    public String employerVerified() {
        return "✅ <b>Kompaniya tasdiqlandi!</b>\n\n" +
                "Sizning kompaniyangiz muvaffaqiyatli tekshirildi.\n" +
                "Endi vakansiyalar avto-tasdiqlanadi.";
    }

    public String referralHired(String refereeName) {
        return "🎉 <b>Taklif qilingan do'stingiz ishga qabul qilindi!</b>\n\n" +
                refereeName + " ishga qabul qilindi.\n" +
                "Mukofotingiz tez orada hisobingizga tushadi!";
    }

    public String reEngagement() {
        return "👋 <b>Sizni sog'indik!</b>\n\n" +
                "Yangi vakansiyalar qo'shildi! Ish qidirishni davom ettiring:\n\n" +
                "🔍 /search — Yangi ishlar\n" +
                "📍 /nearby — Yaqin atrofdagi ishlar\n\n" +
                "Yoki shunchaki yozing: <i>\"Toshkentda oshpaz\"</i>";
    }
}
