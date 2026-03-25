package uz.verifix.jobs.service.ats;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.integration.ats.AtsBroadcastRequest;
import uz.verifix.jobs.integration.ats.AtsBroadcastToRequest;
import uz.verifix.jobs.integration.ats.AtsTelegramClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Sends broadcast messages through ATS Telegram bot.
 * Used for new vacancy notifications, re-engagement, and marketing.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AtsBroadcastService {

    private final Optional<AtsTelegramClient> atsClient;
    private final CandidateRepository candidateRepository;

    /**
     * Broadcast new vacancy to all Telegram bot subscribers.
     */
    public void broadcastNewVacancy(Vacancy vacancy, String companyCode) {
        if (atsClient.isEmpty()) return;

        String text = formatVacancyMessage(vacancy);

        AtsBroadcastRequest request = AtsBroadcastRequest.builder()
                .companyCode(companyCode)
                .method("sendMessage")
                .payload(Map.of(
                        "text", Map.of(
                                "uz", text,
                                "ru", formatVacancyMessageRu(vacancy)
                        ),
                        "parse_mode", "HTML"
                ))
                .build();

        atsClient.get().broadcastAll(request);
        log.info("Broadcast new vacancy '{}' to ATS Telegram users", vacancy.getTitle());
    }

    /**
     * Send notification to specific candidates matching a vacancy.
     */
    public void notifyMatchingCandidates(Vacancy vacancy, List<Candidate> candidates, String companyCode) {
        if (atsClient.isEmpty()) return;

        List<Long> chatIds = candidates.stream()
                .map(Candidate::getTelegramId)
                .filter(id -> id != null)
                .toList();

        if (chatIds.isEmpty()) return;

        String text = "🔔 <b>Sizga mos yangi vakansiya!</b>\n\n" +
                "📋 " + vacancy.getTitle() + "\n" +
                "🏢 " + (vacancy.getEmployer() != null ? vacancy.getEmployer().getName() : "") + "\n" +
                "📍 " + (vacancy.getCity() != null ? vacancy.getCity() : "") + "\n";

        if (vacancy.getSalaryFrom() != null) {
            text += "💰 " + formatSalary(vacancy.getSalaryFrom()) +
                    (vacancy.getSalaryTo() != null ? " — " + formatSalary(vacancy.getSalaryTo()) : "+") +
                    " " + (vacancy.getCurrency() != null ? vacancy.getCurrency() : "UZS") + "\n";
        }

        AtsBroadcastToRequest request = AtsBroadcastToRequest.builder()
                .companyCode(companyCode)
                .chatIds(chatIds)
                .method("sendMessage")
                .payload(Map.of(
                        "text", text,
                        "parse_mode", "HTML"
                ))
                .build();

        atsClient.get().broadcastTo(request);
        log.info("Notified {} matching candidates about vacancy '{}'", chatIds.size(), vacancy.getTitle());
    }

    /**
     * Send re-engagement message to inactive candidates.
     */
    public void sendReEngagement(List<Candidate> inactiveCandidates, String companyCode) {
        if (atsClient.isEmpty()) return;

        List<Long> chatIds = inactiveCandidates.stream()
                .map(Candidate::getTelegramId)
                .filter(id -> id != null)
                .toList();

        if (chatIds.isEmpty()) return;

        AtsBroadcastToRequest request = AtsBroadcastToRequest.builder()
                .companyCode(companyCode)
                .chatIds(chatIds)
                .method("sendMessage")
                .payload(Map.of(
                        "text", Map.of(
                                "uz", "👋 Salom! Sizni sog'indik. Yangi ish o'rinlari mavjud — ko'rib chiqing!",
                                "ru", "👋 Привет! Мы по вам скучали. Есть новые вакансии — загляните!"
                        ),
                        "parse_mode", "HTML"
                ))
                .build();

        atsClient.get().broadcastTo(request);
        log.info("Sent re-engagement to {} inactive candidates via ATS Telegram", chatIds.size());
    }

    private String formatVacancyMessage(Vacancy v) {
        StringBuilder sb = new StringBuilder();
        sb.append("📢 <b>Yangi vakansiya!</b>\n\n");
        sb.append("📋 <b>").append(v.getTitle()).append("</b>\n");
        if (v.getEmployer() != null) sb.append("🏢 ").append(v.getEmployer().getName()).append("\n");
        if (v.getCity() != null) sb.append("📍 ").append(v.getCity()).append("\n");
        if (v.getSalaryFrom() != null) {
            sb.append("💰 ").append(formatSalary(v.getSalaryFrom()));
            if (v.getSalaryTo() != null) sb.append(" — ").append(formatSalary(v.getSalaryTo()));
            sb.append(" UZS\n");
        }
        if (v.getPositionsCount() != null && v.getPositionsCount() > 1) {
            sb.append("👥 ").append(v.getPositionsCount()).append(" ta o'rin\n");
        }
        return sb.toString();
    }

    private String formatVacancyMessageRu(Vacancy v) {
        StringBuilder sb = new StringBuilder();
        sb.append("📢 <b>Новая вакансия!</b>\n\n");
        sb.append("📋 <b>").append(v.getTitle()).append("</b>\n");
        if (v.getEmployer() != null) sb.append("🏢 ").append(v.getEmployer().getName()).append("\n");
        if (v.getCity() != null) sb.append("📍 ").append(v.getCity()).append("\n");
        if (v.getSalaryFrom() != null) {
            sb.append("💰 ").append(formatSalary(v.getSalaryFrom()));
            if (v.getSalaryTo() != null) sb.append(" — ").append(formatSalary(v.getSalaryTo()));
            sb.append(" UZS\n");
        }
        return sb.toString();
    }

    private String formatSalary(java.math.BigDecimal n) {
        if (n.longValue() >= 1_000_000) return n.longValue() / 1_000_000 + "M";
        if (n.longValue() >= 1_000) return n.longValue() / 1_000 + "K";
        return n.toPlainString();
    }
}
