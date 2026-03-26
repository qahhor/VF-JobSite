package uz.verifix.jobs.telegram;

import org.junit.jupiter.api.Test;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.telegram.formatter.VacancyCardFormatter;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class VacancyCardFormatterTest {

    private final VacancyCardFormatter formatter = new VacancyCardFormatter();

    @Test
    void formatFullCard() {
        Vacancy v = createVacancy("Senior Cook", "Tashkent", new BigDecimal("5000000"), new BigDecimal("8000000"));
        String card = formatter.format(v);

        assertThat(card).contains("Senior Cook");
        assertThat(card).contains("Tashkent");
        assertThat(card).contains("5.0M");
        assertThat(card).contains("8.0M");
        assertThat(card).contains("Test Employer");
    }

    @Test
    void formatCompactCard() {
        Vacancy v = createVacancy("Driver", "Samarkand", new BigDecimal("3000000"), null);
        String compact = formatter.formatCompact(v, 1);

        assertThat(compact).contains("1.");
        assertThat(compact).contains("Driver");
        assertThat(compact).contains("Samarkand");
        assertThat(compact).contains("3.0M");
    }

    @Test
    void formatWithNullSalary() {
        Vacancy v = createVacancy("Cleaner", "Nukus", null, null);
        String card = formatter.format(v);

        assertThat(card).contains("Kelishiladi");
    }

    @Test
    void formatWithBenefits() {
        Vacancy v = createVacancy("Waiter", "Bukhara", null, null);
        v.setBenefits(new String[]{"Lunch", "Transport"});
        String card = formatter.format(v);

        assertThat(card).contains("Lunch");
        assertThat(card).contains("Transport");
    }

    @Test
    void formatEscapesHtml() {
        Vacancy v = createVacancy("Cook <script>alert</script>", "City", null, null);
        String card = formatter.format(v);

        assertThat(card).doesNotContain("<script>");
        assertThat(card).contains("&lt;script&gt;");
    }

    private Vacancy createVacancy(String title, String city, BigDecimal salaryFrom, BigDecimal salaryTo) {
        Vacancy v = new Vacancy();
        v.setId(UUID.randomUUID());
        v.setTitle(title);
        v.setCity(city);
        v.setSalaryFrom(salaryFrom);
        v.setSalaryTo(salaryTo);
        v.setDescription("Test description for this vacancy");
        Employer e = new Employer();
        e.setId(UUID.randomUUID());
        e.setName("Test Employer");
        e.setBrandingTier(null);
        v.setEmployer(e);
        return v;
    }
}
