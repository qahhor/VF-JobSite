package uz.verifix.jobs.service.automation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.integration.ai.ClaudeApiClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Parses uploaded CV/resume files into structured candidate data using Claude API.
 * Supports plain text extraction from PDF/DOCX (text must be pre-extracted).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeParserService {

    private final Optional<ClaudeApiClient> claudeClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            Sen professional HR-assistentsan. Rezyume matnini tahlil qilib, strukturalangan ma'lumot chiqar.

            JSON formatida javob ber:
            {
              "firstName": "ism",
              "lastName": "familiya",
              "phone": "telefon raqami (E.164 formatda, masalan +998901234567)",
              "email": "email yoki null",
              "city": "shahar",
              "educationLevel": "PRIMARY | SECONDARY | VOCATIONAL | BACHELORS | MASTERS | OTHER",
              "skills": ["ko'nikma1", "ko'nikma2"],
              "preferredCategories": ["kategoriya1"],
              "preferredSalary": raqam yoki null,
              "workHistory": [
                {
                  "companyName": "kompaniya nomi",
                  "jobTitle": "lavozim",
                  "startDate": "YYYY-MM",
                  "endDate": "YYYY-MM yoki null (hozir ishlayotgan bo'lsa)",
                  "description": "qisqa tavsif"
                }
              ],
              "summary": "nomzod haqida qisqa xulosa (1-2 gap)",
              "languages": ["til1", "til2"],
              "totalExperienceYears": raqam
            }

            Faqat JSON formatida javob ber. Agar ma'lumot topilmasa, null qo'y.
            """;

    public record ParsedResume(
            String firstName, String lastName, String phone, String email,
            String city, String educationLevel, List<String> skills,
            List<String> preferredCategories, java.math.BigDecimal preferredSalary,
            List<WorkEntry> workHistory, String summary, List<String> languages,
            Integer totalExperienceYears
    ) {}

    public record WorkEntry(
            String companyName, String jobTitle, String startDate,
            String endDate, String description
    ) {}

    /**
     * Parse resume text into structured candidate data.
     * @param resumeText plain text extracted from PDF/DOCX
     * @return parsed resume or null if AI unavailable
     */
    public ParsedResume parse(String resumeText) {
        if (claudeClient.isEmpty()) {
            log.warn("Resume parsing unavailable — Claude API not configured");
            return null;
        }

        if (resumeText == null || resumeText.isBlank()) return null;

        // Truncate to prevent token overflow
        String text = resumeText.length() > 8000 ? resumeText.substring(0, 8000) : resumeText;

        try {
            ClaudeApiClient.ChatResponse response = claudeClient.get().chat(SYSTEM_PROMPT, text);
            String json = response.text().trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "");
            }

            Map<String, Object> parsed = objectMapper.readValue(json, new TypeReference<>() {});

            @SuppressWarnings("unchecked")
            List<Map<String, String>> workRaw = (List<Map<String, String>>) parsed.get("workHistory");
            List<WorkEntry> workHistory = workRaw != null ? workRaw.stream()
                    .map(w -> new WorkEntry(w.get("companyName"), w.get("jobTitle"),
                            w.get("startDate"), w.get("endDate"), w.get("description")))
                    .toList() : List.of();

            return new ParsedResume(
                    str(parsed, "firstName"), str(parsed, "lastName"),
                    str(parsed, "phone"), str(parsed, "email"),
                    str(parsed, "city"), str(parsed, "educationLevel"),
                    strList(parsed, "skills"), strList(parsed, "preferredCategories"),
                    decimal(parsed, "preferredSalary"),
                    workHistory, str(parsed, "summary"),
                    strList(parsed, "languages"),
                    intVal(parsed, "totalExperienceYears")
            );

        } catch (Exception e) {
            log.error("Resume parsing failed: {}", e.getMessage());
            return null;
        }
    }

    private String str(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null && !"null".equals(v.toString()) ? v.toString() : null;
    }

    @SuppressWarnings("unchecked")
    private List<String> strList(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v instanceof List) return (List<String>) v;
        return List.of();
    }

    private java.math.BigDecimal decimal(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null || "null".equals(v.toString())) return null;
        try { return new java.math.BigDecimal(v.toString()); } catch (Exception e) { return null; }
    }

    private Integer intVal(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null || "null".equals(v.toString())) return null;
        try { return ((Number) v).intValue(); } catch (Exception e) { return null; }
    }
}
