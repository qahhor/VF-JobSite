package uz.verifix.jobs.telegram.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
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

        Vacancy vacancy = vacancyOpt.get();
        // Initialize lazy employer within transaction
        Hibernate.initialize(vacancy.getEmployer());

        if (applicationRepository.existsByVacancyIdAndCandidateId(vacancyId, candidate.getId())) {
            return editMessage(chatId, messageId, "⚠️ Siz bu vakansiyaga allaqachon ariza bergansiz.");
        }

        Application application = Application.builder()
                .vacancy(vacancy)
                .candidate(candidate)
                .status(ApplicationStatus.NEW)
                .source(ApplicationSource.TELEGRAM)
                .appliedAt(Instant.now())
                .build();
        applicationRepository.save(application);

        String employerName = vacancy.getEmployer() != null ? vacancy.getEmployer().getName() : "";
        log.info("Candidate {} applied to vacancy {} via Telegram", candidate.getId(), vacancyId);

        return editMessage(chatId, messageId,
                "✅ <b>Ariza yuborildi!</b>\n\n" +
                "📋 " + vacancy.getTitle() + "\n" +
                "🏢 " + employerName + "\n\n" +
                "Ish beruvchi sizning arizangizni ko'rib chiqadi.");
    }

    @Transactional(readOnly = true)
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
            // Initialize lazy relations within transaction
            Hibernate.initialize(app.getVacancy());
            if (app.getVacancy() != null && app.getVacancy().getEmployer() != null) {
                Hibernate.initialize(app.getVacancy().getEmployer());
            }

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

            String title = app.getVacancy() != null ? app.getVacancy().getTitle() : "—";
            String employer = (app.getVacancy() != null && app.getVacancy().getEmployer() != null)
                    ? app.getVacancy().getEmployer().getName() : "—";

            sb.append(i).append(". ").append(statusEmoji).append(" <b>")
                    .append(title).append("</b>\n")
                    .append("   🏢 ").append(employer)
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
