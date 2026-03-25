package uz.verifix.jobs.service.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.AiAgentRun;
import uz.verifix.jobs.domain.repository.AiAgentRunRepository;
import uz.verifix.jobs.integration.ai.ClaudeApiClient;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * AI Intake Agent — helps employers create better vacancy descriptions.
 * Takes a rough description and produces a structured, optimized vacancy.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiIntakeAgent {

    private final Optional<ClaudeApiClient> claudeClient;
    private final AiAgentRunRepository agentRunRepo;

    private static final String SYSTEM_PROMPT = """
            Sen professional HR-kontent yordamchisissan. Ish beruvchi vakansiya yaratmoqchi.
            Uning kiritgan ma'lumotlari asosida professional vakansiya matni yarat.

            JSON formatida javob ber:
            {
              "title": "optimallashtirilgan vakansiya nomi",
              "description": "batafsil va professional tavsif (300-500 so'z)",
              "category": "kategoriya kodi (COOK, DRIVER, SALES, BUILDER, va h.k.)",
              "employmentType": "FULL_TIME | PART_TIME | CONTRACT | TEMPORARY",
              "benefits": ["imtiyoz 1", "imtiyoz 2", "imtiyoz 3"],
              "requirements": ["talab 1", "talab 2"],
              "salaryRecommendation": {"from": raqam, "to": raqam},
              "tips": ["vakansiyani yaxshilash bo'yicha maslahat 1", "maslahat 2"]
            }

            O'zbek tilida (lotin alifbosi) yoz. Professional va jalb qiluvchi tarzda yoz.
            Faqat JSON formatida javob ber.
            """;

    public record IntakeResult(
            String title, String description, String category, String employmentType,
            java.util.List<String> benefits, java.util.List<String> requirements,
            Map<String, Object> salaryRecommendation, java.util.List<String> tips
    ) {}

    public IntakeResult generateVacancy(UUID employerId, String roughDescription, String city) {
        if (claudeClient.isEmpty()) return null;

        AiAgentRun run = AiAgentRun.builder()
                .employerId(employerId)
                .agentType("INTAKE")
                .inputData(Map.of("description", roughDescription, "city", city != null ? city : ""))
                .build();
        run = agentRunRepo.save(run);

        long start = System.currentTimeMillis();

        try {
            String userMessage = "Shahar: " + (city != null ? city : "ko'rsatilmagan") +
                    "\n\nIsh beruvchi yozgan matn:\n" + roughDescription;

            ClaudeApiClient.ChatResponse response = claudeClient.get().chat(SYSTEM_PROMPT, userMessage);
            String text = response.text().trim();
            if (text.startsWith("```")) text = text.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");

            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(text, Map.class);

            run.complete(parsed, response.inputTokens() + response.outputTokens(), System.currentTimeMillis() - start);
            agentRunRepo.save(run);

            return new IntakeResult(
                    (String) parsed.get("title"),
                    (String) parsed.get("description"),
                    (String) parsed.get("category"),
                    (String) parsed.get("employmentType"),
                    (java.util.List<String>) parsed.getOrDefault("benefits", java.util.List.of()),
                    (java.util.List<String>) parsed.getOrDefault("requirements", java.util.List.of()),
                    (Map<String, Object>) parsed.get("salaryRecommendation"),
                    (java.util.List<String>) parsed.getOrDefault("tips", java.util.List.of())
            );
        } catch (Exception e) {
            run.fail(e.getMessage());
            agentRunRepo.save(run);
            log.error("AI intake failed: {}", e.getMessage());
            return null;
        }
    }
}
