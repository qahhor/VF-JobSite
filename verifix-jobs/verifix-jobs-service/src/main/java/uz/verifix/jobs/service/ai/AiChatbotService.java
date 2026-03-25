package uz.verifix.jobs.service.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.integration.ai.ClaudeApiClient;
import uz.verifix.jobs.service.vacancy.VacancyService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class AiChatbotService {

    private final ClaudeApiClient claudeClient;
    private final VacancyService vacancyService;
    private final CandidateRepository candidateRepository;
    private final ObjectMapper objectMapper;
    private final boolean enabled;

    private static final String SYSTEM_PROMPT = """
            Sen Verifix Jobs platformasining AI yordamchisissan. Foydalanuvchilarga ish topishda yordam berasan.
            O'zbekistondagi blue-collar (ishchi kasblari) bo'yicha ish o'rinlarini qidirish uchun yordam berasan.

            Foydalanuvchi so'rovini tahlil qilib, quyidagi JSON formatida javob ber:
            {
              "intent": "SEARCH" | "INFO" | "HELP" | "GREETING" | "OTHER",
              "city": "shahar nomi yoki null",
              "category": "kasb kategoriyasi yoki null",
              "salaryMin": raqam yoki null,
              "message": "foydalanuvchiga javob matni (HTML formatda, qisqa va do'stona)"
            }

            Kategoriyalar: COOK, DRIVER, SALES, BUILDER, CLEANER, WAITER, CASHIER, WAREHOUSE,
            SECURITY, ELECTRICIAN, PLUMBER, TAILOR, COURIER, LOADER, MECHANIC, PAINTER, WELDER,
            CARPENTER, GARDENER, NANNY

            Shaharlar: Tashkent, Samarkand, Bukhara, Andijan, Namangan, Fergana, Nukus, Karshi,
            Navoi, Jizzakh, Gulistan, Termez, Urgench, Khiva, Chirchik, Almalyk

            Har doim o'zbek tilida javob ber (lotin alifbosi). Javobni faqat JSON formatda ber, boshqa hech narsa yo'q.
            Ish izlovchiga do'stona va qisqa javob ber. Emoji ishlat.
            """;

    public AiChatbotService(
            Optional<ClaudeApiClient> claudeClient,
            VacancyService vacancyService,
            CandidateRepository candidateRepository,
            ObjectMapper objectMapper
    ) {
        this.claudeClient = claudeClient.orElse(null);
        this.vacancyService = vacancyService;
        this.candidateRepository = candidateRepository;
        this.objectMapper = objectMapper;
        this.enabled = claudeClient.isPresent();
        if (enabled) {
            log.info("AI Chatbot initialized with Claude API");
        } else {
            log.info("AI Chatbot running in keyword-only mode (no Claude API key configured)");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public record ChatResult(
            String message,
            String city,
            String category,
            BigDecimal salaryMin,
            String intent,
            List<Vacancy> vacancies
    ) {}

    public ChatResult processMessage(String userMessage, Long telegramId) {
        if (!enabled) {
            return null;
        }

        try {
            String context = buildUserContext(telegramId);
            String fullMessage = context.isEmpty() ? userMessage : context + "\n\nFoydalanuvchi xabari: " + userMessage;

            ClaudeApiClient.ChatResponse response = claudeClient.chat(SYSTEM_PROMPT, fullMessage);
            String text = response.text().trim();

            // Strip markdown code blocks if present
            if (text.startsWith("```")) {
                text = text.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
            }

            Map<String, Object> parsed = objectMapper.readValue(text, new TypeReference<>() {});

            String intent = getString(parsed, "intent", "OTHER");
            String city = getString(parsed, "city", null);
            String category = getString(parsed, "category", null);
            BigDecimal salaryMin = getDecimal(parsed, "salaryMin");
            String message = getString(parsed, "message", "");

            List<Vacancy> vacancies = List.of();
            if ("SEARCH".equals(intent) && (city != null || category != null)) {
                Page<Vacancy> results = vacancyService.search(city, category, salaryMin, null, PageRequest.of(0, 5));
                vacancies = results.getContent();
            }

            return new ChatResult(message, city, category, salaryMin, intent, vacancies);

        } catch (Exception e) {
            log.warn("Claude API processing failed, caller should fall back to keyword search: {}", e.getMessage());
            return null;
        }
    }

    private String buildUserContext(Long telegramId) {
        if (telegramId == null) return "";
        try {
            return candidateRepository.findByTelegramId(telegramId)
                    .map(c -> {
                        StringBuilder sb = new StringBuilder("Foydalanuvchi profili: ");
                        if (c.getFirstName() != null) sb.append("Ism: ").append(c.getFirstName()).append(". ");
                        if (c.getCity() != null) sb.append("Shahar: ").append(c.getCity()).append(". ");
                        if (c.getPreferredCategories() != null && c.getPreferredCategories().length > 0) {
                            sb.append("Qiziqishlari: ").append(String.join(", ", c.getPreferredCategories())).append(". ");
                        }
                        if (c.getPreferredSalary() != null) {
                            sb.append("Kutilgan maosh: ").append(c.getPreferredSalary().toPlainString()).append(" UZS.");
                        }
                        return sb.toString();
                    })
                    .orElse("");
        } catch (Exception e) {
            return "";
        }
    }

    private String getString(Map<String, Object> map, String key, String defaultValue) {
        Object val = map.get(key);
        if (val == null || "null".equals(val.toString())) return defaultValue;
        String s = val.toString().trim();
        return s.isEmpty() ? defaultValue : s;
    }

    private BigDecimal getDecimal(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null || "null".equals(val.toString())) return null;
        try {
            return new BigDecimal(val.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
