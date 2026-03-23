package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.ReferralRepository;
import uz.verifix.jobs.domain.enums.ReferralStatus;
import uz.verifix.jobs.telegram.config.BotConfig;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ReferralHandler {

    private final CandidateRepository candidateRepository;
    private final ReferralRepository referralRepository;
    private final BotConfig botConfig;

    public SendMessage handle(Message message) {
        Long chatId = message.getChatId();
        Long telegramId = message.getFrom().getId();

        Optional<Candidate> candidateOpt = candidateRepository.findByTelegramId(telegramId);
        if (candidateOpt.isEmpty()) {
            return reply(chatId, "❌ Avval /start buyrug'i bilan ro'yxatdan o'ting.");
        }

        Candidate candidate = candidateOpt.get();
        String referralCode = candidate.getReferralCode();
        String deepLink = "https://t.me/" + botConfig.getUsername() + "?start=ref_" + referralCode;

        long hiredCount = referralRepository.countByReferrerIdAndStatus(candidate.getId(), ReferralStatus.HIRED);
        long totalReferrals = referralRepository.findByReferrerId(candidate.getId()).size();

        StringBuilder sb = new StringBuilder();
        sb.append("🔗 <b>Taklif dasturi</b>\n\n");
        sb.append("Sizning taklif kodingiz: <code>").append(referralCode).append("</code>\n\n");
        sb.append("📤 Havolangiz:\n").append(deepLink).append("\n\n");
        sb.append("Do'stlaringizga yuboring va ular ishga qabul qilinsa, mukofot oling!\n\n");
        sb.append("📊 <b>Statistika:</b>\n");
        sb.append("👥 Jami taklif qilingan: ").append(totalReferrals).append("\n");
        sb.append("✅ Ishga qabul qilingan: ").append(hiredCount).append("\n");

        return reply(chatId, sb.toString());
    }

    private SendMessage reply(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setParseMode("HTML");
        msg.setDisableWebPagePreview(true);
        return msg;
    }
}
