package uz.verifix.jobs.service.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.AiAgentRun;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.AiAgentRunRepository;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.integration.ai.ClaudeApiClient;
import uz.verifix.jobs.service.notification.NotificationService;

import java.util.*;

/**
 * AI Outreach Agent — generates personalized invitation messages
 * and sends them via Telegram/SMS to potential candidates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiOutreachAgent {

    private final Optional<ClaudeApiClient> claudeClient;
    private final AiAgentRunRepository agentRunRepo;
    private final CandidateRepository candidateRepository;
    private final VacancyRepository vacancyRepository;
    private final NotificationService notificationService;

    private static final String SYSTEM_PROMPT = """
            Sen professional HR-recruitersan. Nomzodga vakansiyaga taklif xabarini yoz.
            Xabar qisqa (3-5 gap), do'stona, professional va vakansiyaning asosiy afzalliklarini ko'rsatsin.
            O'zbek tilida (lotin alifbosi) yoz. HTML parse_mode uchun <b>, <i> teglarini ishlat.
            Faqat xabar matnini ber, boshqa hech narsa yo'q.
            """;

    public record OutreachMessage(UUID candidateId, String candidateName, String message) {}
    public record OutreachResult(List<OutreachMessage> messages, int sent, int failed) {}

    /**
     * Generate personalized outreach messages for candidates.
     * Returns messages for employer review before sending.
     */
    public List<OutreachMessage> generateMessages(UUID vacancyId, List<UUID> candidateIds) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId).orElse(null);
        if (vacancy == null) return List.of();

        List<OutreachMessage> messages = new ArrayList<>();
        for (UUID candidateId : candidateIds) {
            candidateRepository.findById(candidateId).ifPresent(candidate -> {
                String message = generateMessage(candidate, vacancy);
                String name = (candidate.getFirstName() != null ? candidate.getFirstName() : "") + " " +
                        (candidate.getLastName() != null ? candidate.getLastName() : "");
                messages.add(new OutreachMessage(candidateId, name.trim(), message));
            });
        }
        return messages;
    }

    /**
     * Send approved outreach messages to candidates.
     */
    public OutreachResult sendMessages(UUID employerId, UUID vacancyId, List<OutreachMessage> messages) {
        AiAgentRun run = AiAgentRun.builder()
                .employerId(employerId).agentType("OUTREACH")
                .inputData(Map.of("vacancyId", vacancyId.toString(), "candidateCount", messages.size()))
                .build();
        run = agentRunRepo.save(run);

        int sent = 0, failed = 0;
        for (OutreachMessage msg : messages) {
            try {
                notificationService.dispatch(
                        uz.verifix.jobs.domain.enums.UserType.CANDIDATE,
                        msg.candidateId(), "outreach.invitation", msg.message());
                sent++;
            } catch (Exception e) {
                log.warn("Outreach to {} failed: {}", msg.candidateId(), e.getMessage());
                failed++;
            }
        }

        run.complete(Map.of("sent", sent, "failed", failed), 0, 0);
        agentRunRepo.save(run);

        log.info("Outreach completed: {} sent, {} failed", sent, failed);
        return new OutreachResult(messages, sent, failed);
    }

    private String generateMessage(Candidate candidate, Vacancy vacancy) {
        if (claudeClient.isPresent()) {
            try {
                String userMessage = "Nomzod: " + (candidate.getFirstName() != null ? candidate.getFirstName() : "Hurmatli nomzod") +
                        "\nVakansiya: " + vacancy.getTitle() +
                        "\nKompaniya: " + (vacancy.getEmployer() != null ? vacancy.getEmployer().getName() : "") +
                        "\nShahar: " + (vacancy.getCity() != null ? vacancy.getCity() : "") +
                        (vacancy.getSalaryFrom() != null ? "\nMaosh: " + vacancy.getSalaryFrom() + " UZS" : "");

                ClaudeApiClient.ChatResponse response = claudeClient.get().chat(SYSTEM_PROMPT, userMessage);
                return response.text().trim();
            } catch (Exception e) {
                log.warn("AI message generation failed, using template: {}", e.getMessage());
            }
        }

        // Template fallback
        return String.format("Salom, <b>%s</b>! 👋\n\n" +
                        "Sizga mos vakansiya bor:\n" +
                        "📋 <b>%s</b>\n" +
                        "🏢 %s\n" +
                        "📍 %s\n" +
                        (vacancy.getSalaryFrom() != null ? "💰 %s UZS\n" : "") +
                        "\nQiziqsangiz, ariza topshiring! 🚀",
                candidate.getFirstName() != null ? candidate.getFirstName() : "Hurmatli nomzod",
                vacancy.getTitle(),
                vacancy.getEmployer() != null ? vacancy.getEmployer().getName() : "",
                vacancy.getCity() != null ? vacancy.getCity() : "",
                vacancy.getSalaryFrom() != null ? vacancy.getSalaryFrom().toPlainString() : "");
    }
}
