package uz.verifix.jobs.service.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.domain.entity.*;
import uz.verifix.jobs.domain.repository.AiAgentRunRepository;
import uz.verifix.jobs.domain.repository.AiScreeningResultRepository;
import uz.verifix.jobs.domain.repository.ApplicationRepository;
import uz.verifix.jobs.integration.ai.ClaudeApiClient;

import java.util.*;

/**
 * AI Screening Agent — auto-evaluates applications using Claude API.
 * Produces a score (0-100), recommendation (ADVANCE/REVIEW/REJECT),
 * and structured pros/cons for each application.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiScreeningAgent {

    private final Optional<ClaudeApiClient> claudeClient;
    private final AiScreeningResultRepository screeningRepo;
    private final AiAgentRunRepository agentRunRepo;
    private final ApplicationRepository applicationRepo;

    private static final String SYSTEM_PROMPT = """
            Sen professional HR-screening agentisan. Nomzodning vakansiyaga mosligini baholagin.

            Quyidagi JSON formatida javob ber:
            {
              "score": 0-100 orasidagi raqam,
              "recommendation": "ADVANCE" yoki "REVIEW" yoki "REJECT",
              "summary": "qisqa baholash (1-2 gap)",
              "pros": ["ijobiy tomoni 1", "ijobiy tomoni 2"],
              "cons": ["kamchilik 1", "kamchilik 2"]
            }

            Baholash mezonlari:
            - 80-100: Vakansiyaga juda mos, darhol suhbatga taklif qilish mumkin (ADVANCE)
            - 50-79: Qisman mos, qo'shimcha tekshiruv kerak (REVIEW)
            - 0-49: Vakansiyaga mos emas (REJECT)

            Faqat JSON formatida javob ber, boshqa hech narsa yo'q.
            """;

    public boolean isAvailable() {
        return claudeClient.isPresent();
    }

    @Async
    @Transactional
    public void screenApplication(UUID applicationId) {
        if (claudeClient.isEmpty()) return;
        if (screeningRepo.existsByApplicationId(applicationId)) return;

        Application app = applicationRepo.findById(applicationId).orElse(null);
        if (app == null) return;

        Candidate candidate = app.getCandidate();
        Vacancy vacancy = app.getVacancy();
        UUID employerId = vacancy.getEmployer().getId();

        AiAgentRun run = AiAgentRun.builder()
                .employerId(employerId)
                .agentType("SCREENING")
                .inputData(Map.of("applicationId", applicationId.toString()))
                .build();
        run = agentRunRepo.save(run);

        long startTime = System.currentTimeMillis();

        try {
            String userMessage = buildUserMessage(candidate, vacancy);
            ClaudeApiClient.ChatResponse response = claudeClient.get().chat(SYSTEM_PROMPT, userMessage);

            String text = response.text().trim();
            if (text.startsWith("```")) {
                text = text.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
            }

            Map<String, Object> parsed = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(text, new com.fasterxml.jackson.core.type.TypeReference<>() {});

            int score = ((Number) parsed.getOrDefault("score", 0)).intValue();
            String recommendation = (String) parsed.getOrDefault("recommendation", "REVIEW");
            String summary = (String) parsed.getOrDefault("summary", "");
            @SuppressWarnings("unchecked")
            List<String> pros = (List<String>) parsed.getOrDefault("pros", List.of());
            @SuppressWarnings("unchecked")
            List<String> cons = (List<String>) parsed.getOrDefault("cons", List.of());

            AiScreeningResult result = AiScreeningResult.builder()
                    .applicationId(applicationId)
                    .agentRunId(run.getId())
                    .score(score)
                    .recommendation(recommendation)
                    .summary(summary)
                    .pros(pros)
                    .cons(cons)
                    .build();
            screeningRepo.save(result);

            run.complete(parsed, response.inputTokens() + response.outputTokens(),
                    System.currentTimeMillis() - startTime);
            agentRunRepo.save(run);

            log.info("Screened application {}: score={}, rec={}", applicationId, score, recommendation);

        } catch (Exception e) {
            run.fail(e.getMessage());
            agentRunRepo.save(run);
            log.error("AI screening failed for application {}: {}", applicationId, e.getMessage());
        }
    }

    @Transactional
    public void batchScreen(List<UUID> applicationIds) {
        for (UUID appId : applicationIds) {
            screenApplication(appId);
        }
    }

    private String buildUserMessage(Candidate c, Vacancy v) {
        StringBuilder sb = new StringBuilder();
        sb.append("VAKANSIYA:\n");
        sb.append("- Nomi: ").append(v.getTitle()).append("\n");
        if (v.getDescription() != null) sb.append("- Tavsif: ").append(v.getDescription(), 0, Math.min(v.getDescription().length(), 500)).append("\n");
        sb.append("- Kategoriya: ").append(v.getCategory()).append("\n");
        sb.append("- Shahar: ").append(v.getCity()).append("\n");
        if (v.getSalaryFrom() != null) sb.append("- Maosh: ").append(v.getSalaryFrom()).append(" - ").append(v.getSalaryTo()).append(" UZS\n");
        if (v.getBenefits() != null) sb.append("- Imtiyozlar: ").append(String.join(", ", v.getBenefits())).append("\n");

        sb.append("\nNOMZOD:\n");
        sb.append("- Ism: ").append(c.getFirstName() != null ? c.getFirstName() : "").append(" ").append(c.getLastName() != null ? c.getLastName() : "").append("\n");
        if (c.getCity() != null) sb.append("- Shahar: ").append(c.getCity()).append("\n");
        if (c.getSkills() != null) sb.append("- Ko'nikmalar: ").append(String.join(", ", c.getSkills())).append("\n");
        if (c.getEducationLevel() != null) sb.append("- Ta'lim: ").append(c.getEducationLevel()).append("\n");
        if (c.getPreferredSalary() != null) sb.append("- Kutilgan maosh: ").append(c.getPreferredSalary()).append(" UZS\n");
        if (c.getMyidStatus() != null) sb.append("- MyID: ").append(c.getMyidStatus()).append("\n");

        return sb.toString();
    }
}
