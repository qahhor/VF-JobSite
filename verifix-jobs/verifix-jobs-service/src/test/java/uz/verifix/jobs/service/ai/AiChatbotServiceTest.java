package uz.verifix.jobs.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.repository.CandidateRepository;
import uz.verifix.jobs.integration.ai.ClaudeApiClient;
import uz.verifix.jobs.service.vacancy.VacancyService;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiChatbotServiceTest {

    @Mock private ClaudeApiClient claudeClient;
    @Mock private VacancyService vacancyService;
    @Mock private CandidateRepository candidateRepository;

    @Test
    void shouldReturnNullWhenDisabled() {
        AiChatbotService service = new AiChatbotService(
                Optional.empty(), vacancyService, candidateRepository, new ObjectMapper());

        assertThat(service.isEnabled()).isFalse();
        assertThat(service.processMessage("test", 12345L)).isNull();
    }

    @Test
    void shouldProcessSearchIntent() {
        String jsonResponse = """
                {"intent":"SEARCH","city":"Tashkent","category":"COOK","salaryMin":null,"message":"Toshkentda oshpaz ishi topildi!"}
                """;
        when(claudeClient.chat(anyString(), anyString()))
                .thenReturn(new ClaudeApiClient.ChatResponse(jsonResponse, 100, 50));

        Vacancy v = Vacancy.builder().title("Oshpaz kerak").city("Tashkent").build();
        when(vacancyService.search(eq("Tashkent"), eq("COOK"), isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(v)));

        AiChatbotService service = new AiChatbotService(
                Optional.of(claudeClient), vacancyService, candidateRepository, new ObjectMapper());

        AiChatbotService.ChatResult result = service.processMessage("Toshkentda oshpaz ish kerak", 12345L);

        assertThat(result).isNotNull();
        assertThat(result.intent()).isEqualTo("SEARCH");
        assertThat(result.city()).isEqualTo("Tashkent");
        assertThat(result.vacancies()).hasSize(1);
    }

    @Test
    void shouldHandleGreetingIntent() {
        String jsonResponse = """
                {"intent":"GREETING","city":null,"category":null,"salaryMin":null,"message":"Salom! Sizga qanday yordam bera olaman?"}
                """;
        when(claudeClient.chat(anyString(), anyString()))
                .thenReturn(new ClaudeApiClient.ChatResponse(jsonResponse, 50, 30));

        AiChatbotService service = new AiChatbotService(
                Optional.of(claudeClient), vacancyService, candidateRepository, new ObjectMapper());

        AiChatbotService.ChatResult result = service.processMessage("Salom", null);

        assertThat(result).isNotNull();
        assertThat(result.intent()).isEqualTo("GREETING");
        assertThat(result.vacancies()).isEmpty();
    }

    @Test
    void shouldReturnNullOnApiFailure() {
        when(claudeClient.chat(anyString(), anyString())).thenThrow(new RuntimeException("API error"));

        AiChatbotService service = new AiChatbotService(
                Optional.of(claudeClient), vacancyService, candidateRepository, new ObjectMapper());

        AiChatbotService.ChatResult result = service.processMessage("test", 12345L);

        assertThat(result).isNull();
    }
}
