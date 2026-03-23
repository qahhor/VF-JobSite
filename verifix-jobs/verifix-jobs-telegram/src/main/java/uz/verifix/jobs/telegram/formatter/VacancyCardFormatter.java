package uz.verifix.jobs.telegram.formatter;

import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.Vacancy;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class VacancyCardFormatter {

    public String format(Vacancy vacancy) {
        StringBuilder sb = new StringBuilder();

        sb.append("💼 <b>").append(escapeHtml(vacancy.getTitle())).append("</b>\n");

        String brandingBadge = getBrandingBadge(vacancy.getEmployer().getBrandingTier());
        sb.append("🏢 ").append(escapeHtml(vacancy.getEmployer().getName())).append(brandingBadge).append("\n");

        if (vacancy.getCity() != null) {
            sb.append("📍 ").append(escapeHtml(vacancy.getCity())).append("\n");
        }

        if (vacancy.getSalaryFrom() != null || vacancy.getSalaryTo() != null) {
            sb.append("💰 ").append(formatSalary(vacancy.getSalaryFrom(), vacancy.getSalaryTo(), vacancy.getCurrency())).append("\n");
        }

        if (vacancy.getEmploymentType() != null) {
            sb.append("⏰ ").append(vacancy.getEmploymentType().name().replace("_", " ")).append("\n");
        }

        if (vacancy.getBenefits() != null && vacancy.getBenefits().length > 0) {
            sb.append("✅ ").append(String.join(", ", vacancy.getBenefits())).append("\n");
        }

        if (vacancy.getDescription() != null) {
            String desc = vacancy.getDescription();
            if (desc.length() > 200) {
                desc = desc.substring(0, 200) + "...";
            }
            sb.append("\n").append(escapeHtml(desc)).append("\n");
        }

        if (vacancy.getPositionsCount() != null && vacancy.getPositionsCount() > 1) {
            sb.append("\n👥 Ochiq joylar: ").append(vacancy.getPositionsCount());
        }

        return sb.toString();
    }

    public String formatCompact(Vacancy vacancy, int index) {
        StringBuilder sb = new StringBuilder();
        sb.append(index).append(". <b>").append(escapeHtml(vacancy.getTitle())).append("</b>");
        sb.append(" — ").append(escapeHtml(vacancy.getEmployer().getName()));
        if (vacancy.getCity() != null) {
            sb.append(" (").append(vacancy.getCity()).append(")");
        }
        if (vacancy.getSalaryFrom() != null) {
            sb.append(" 💰").append(formatSalary(vacancy.getSalaryFrom(), vacancy.getSalaryTo(), vacancy.getCurrency()));
        }
        return sb.toString();
    }

    private String formatSalary(BigDecimal from, BigDecimal to, String currency) {
        String cur = currency != null ? currency : "UZS";
        if (from != null && to != null) {
            return formatNumber(from) + " - " + formatNumber(to) + " " + cur;
        } else if (from != null) {
            return "dan " + formatNumber(from) + " " + cur;
        } else if (to != null) {
            return "gacha " + formatNumber(to) + " " + cur;
        }
        return "Kelishiladi";
    }

    private String formatNumber(BigDecimal number) {
        long val = number.longValue();
        if (val >= 1_000_000) {
            return String.format("%.1fM", val / 1_000_000.0);
        } else if (val >= 1_000) {
            return String.format("%.0fK", val / 1_000.0);
        }
        return String.valueOf(val);
    }

    private String getBrandingBadge(String brandingTier) {
        if ("PREMIUM".equals(brandingTier)) return " ⭐ Premium Employer";
        if ("BRANDED".equals(brandingTier)) return " ✅";
        return "";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
