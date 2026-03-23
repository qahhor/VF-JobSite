package uz.verifix.jobs.telegram.channel;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.telegram.config.BotConfig;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;

import java.util.List;
import java.util.function.Consumer;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChannelPostingService {

    private final VacancyCardFormatter formatter;
    private final BotConfig botConfig;

    @Value("${app.telegram.channel.chat-id:}")
    private String channelChatId;

    @Value("${app.telegram.channel.enabled:false}")
    private boolean enabled;

    private Consumer<SendMessage> messageSender;

    public void setMessageSender(Consumer<SendMessage> sender) {
        this.messageSender = sender;
    }

    public void postVacancy(Vacancy vacancy) {
        if (!enabled || channelChatId.isBlank() || messageSender == null) return;

        try {
            String card = formatter.format(vacancy);

            // Premium branding enhancement
            if ("PREMIUM".equals(vacancy.getEmployer().getBrandingTier())) {
                card += "\n\n🏢 Kompaniya haqida: " + vacancy.getEmployer().getName() + " ⭐";
            }

            card += "\n\n📨 Ariza berish uchun botga yozing: @" + botConfig.getUsername();

            SendMessage msg = new SendMessage();
            msg.setChatId(channelChatId);
            msg.setText(card);
            msg.setParseMode("HTML");

            InlineKeyboardButton applyBtn = new InlineKeyboardButton();
            applyBtn.setText("📨 Ariza berish");
            applyBtn.setUrl("https://t.me/" + botConfig.getUsername() + "?start=apply_" + vacancy.getId());

            InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
            keyboard.setKeyboard(List.of(List.of(applyBtn)));
            msg.setReplyMarkup(keyboard);

            messageSender.accept(msg);
            log.info("Vacancy posted to channel: {} — {}", vacancy.getId(), vacancy.getTitle());
        } catch (Exception e) {
            log.error("Failed to post vacancy {} to channel: {}", vacancy.getId(), e.getMessage());
        }
    }

    public void postDailyDigest(List<Vacancy> vacancies) {
        if (!enabled || channelChatId.isBlank() || messageSender == null || vacancies.isEmpty()) return;

        try {
            StringBuilder sb = new StringBuilder();
            sb.append("📋 <b>Bugungi yangi vakansiyalar:</b>\n\n");

            int i = 1;
            for (Vacancy v : vacancies.stream().limit(10).toList()) {
                sb.append(formatter.formatCompact(v, i)).append("\n\n");
                i++;
            }

            if (vacancies.size() > 10) {
                sb.append("... va yana ").append(vacancies.size() - 10).append(" ta vakansiya\n\n");
            }

            sb.append("🔍 Batafsil: @").append(botConfig.getUsername());

            SendMessage msg = new SendMessage();
            msg.setChatId(channelChatId);
            msg.setText(sb.toString());
            msg.setParseMode("HTML");
            msg.setDisableWebPagePreview(true);

            messageSender.accept(msg);
            log.info("Daily digest posted to channel: {} vacancies", vacancies.size());
        } catch (Exception e) {
            log.error("Failed to post digest to channel: {}", e.getMessage());
        }
    }
}
