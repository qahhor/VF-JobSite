package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import uz.verifix.jobs.domain.entity.Application;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ApplicationSource;
import uz.verifix.jobs.domain.enums.ApplicationStatus;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplyHandler {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;

    public EditMessageText handleApply(CallbackQuery callbackQuery, UUID vacancyId) {
        Long chatId = callbackQuery.getMessage().getChatId();
        Integer messageId = callbackQuery.getMessage().getMessageId();
        Long telegramId = callbackQuery.getFrom().getId();

        Optional<Candidate> candidateOpt = candidateRepository.findByTelegramId(telegramId);
        if (candidateOpt.isEmpty()) {
            return editMessage(chatId, messageId, "❌ Avval /start buyrug'i bilan ro'yxatdan o'ting.");
        }

        Candidate candidate = candidateOpt.get();
        Optional<Vacancy> vacancyOpt = vacancyRepository.findById(vacancyId);
        if (vacancyOpt.isEmpty()) {
            return editMessage(chatId, messageId, "❌ Vakansiya topilmadi.");
        }

        if (applicationRepository.existsByVacancyIdAndCandidateId(vacancyId, candidate.getId())) {
            return editMessage(chatId, messageId, "⚠️ Siz bu vakansiyaga allaqachon ariza bergansiz.");
        }

        Application application = Application.builder()
                .vacancy(vacancyOpt.get())
                .candidate(candidate)
                .status(ApplicationStatus.NEW)
                .source(ApplicationSource.TELEGRAM)
                .appliedAt(Instant.now())
                .build();
        applicationRepository.save(application);

        log.info("Candidate {} applied to vacancy {} via Telegram", candidate.getId(), vacancyId);

        return editMessage(chatId, messageId,
                "✅ <b>Ariza yuborildi!</b>\n\n" +
                "Vakansiya: " + vacancyOpt.get().getTitle() + "\n" +
                "Kompaniya: " + vacancyOpt.get().getEmployer().getName() + "\n\n" +
                "Ish beruvchi sizning arizangizni ko'rib chiqadi.");
    }

    public SendMessage handleMyApplications(Long chatId, Long telegramId) {
        Optional<Candidate> candidateOpt = candidateRepository.findByTelegramId(telegramId);
        if (candidateOpt.isEmpty()) {
            return reply(chatId, "❌ Avval /start buyrug'i bilan ro'yxatdan o'ting.");
        }

        Page<Application> applications = applicationRepository.findByCandidateId(
                candidateOpt.get().getId(), PageRequest.of(0, 10));

        if (applications.isEmpty()) {
            return reply(chatId, "📋 Sizda hali arizalar yo'q.\n\n🔍 /search — Ish qidirish");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📋 <b>Mening arizalarim:</b>\n\n");

        int i = 1;
        for (Application app : applications.getContent()) {
            String statusEmoji = switch (app.getStatus()) {
                case NEW -> "🆕";
                case VIEWED -> "👁";
                case SHORTLIST -> "⭐";
                case INVITED -> "📨";
                case INTERVIEW -> "🤝";
                case OFFER -> "🎁";
                case HIRED -> "✅";
                case REJECTED -> "❌";
                case WITHDRAWN -> "🔙";
            };
            sb.append(i).append(". ").append(statusEmoji).append(" <b>")
                    .append(app.getVacancy().getTitle()).append("</b>\n")
                    .append("   🏢 ").append(app.getVacancy().getEmployer().getName())
                    .append(" — ").append(app.getStatus().name()).append("\n\n");
            i++;
        }

        return reply(chatId, sb.toString());
    }

    private EditMessageText editMessage(Long chatId, Integer messageId, String text) {
        EditMessageText edit = new EditMessageText();
        edit.setChatId(chatId.toString());
        edit.setMessageId(messageId);
        edit.setText(text);
        edit.setParseMode("HTML");
        return edit;
    }

    private SendMessage reply(Long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId.toString());
        msg.setText(text);
        msg.setParseMode("HTML");
        return msg;
    }
}
