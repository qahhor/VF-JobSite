package uz.verifix.jobs.telegram.formatter;

import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.telegram.util.TgUtils;

@Component
public class VacancyCardFormatter {

    public String format(Vacancy v) {
        StringBuilder sb = new StringBuilder();

        sb.append("💼 <b>").append(TgUtils.escapeHtml(v.getTitle())).append("</b>\n");

        if (v.getEmployer() != null) {
            sb.append("🏢 ").append(TgUtils.escapeHtml(v.getEmployer().getName()));
            sb.append(getBrandingBadge(v.getEmployer().getBrandingTier())).append("\n");
        }

        if (v.getCity() != null) {
            sb.append("📍 ").append(TgUtils.escapeHtml(v.getCity())).append("\n");
        }

        sb.append("💰 ").append(TgUtils.formatSalaryRange(v.getSalaryFrom(), v.getSalaryTo())).append("\n");

        if (v.getEmploymentType() != null) {
            sb.append("⏰ ").append(formatEmploymentType(v.getEmploymentType().name())).append("\n");
        }

        if (v.getBenefits() != null && v.getBenefits().length > 0) {
            sb.append("✅ ").append(String.join(", ", v.getBenefits())).append("\n");
        }

        if (v.getDescription() != null) {
            String desc = v.getDescription();
            if (desc.length() > 300) desc = desc.substring(0, 300) + "...";
            sb.append("\n").append(TgUtils.escapeHtml(desc)).append("\n");
        }

        if (v.getPositionsCount() != null && v.getPositionsCount() > 1) {
            sb.append("\n👥 <b>").append(v.getPositionsCount()).append("</b> ta o'rin ochiq");
        }

        return sb.toString();
    }

    public String formatCompact(Vacancy v, int index) {
        StringBuilder sb = new StringBuilder();
        sb.append("<b>").append(index).append(".</b> ");
        sb.append(TgUtils.escapeHtml(v.getTitle()));
        if (v.getEmployer() != null) {
            sb.append(" — ").append(TgUtils.escapeHtml(v.getEmployer().getName()));
        }
        if (v.getCity() != null) {
            sb.append("\n   📍 ").append(v.getCity());
        }
        sb.append("  💰 ").append(TgUtils.formatSalaryRange(v.getSalaryFrom(), v.getSalaryTo()));
        return sb.toString();
    }

    private String formatEmploymentType(String type) {
        return switch (type) {
            case "FULL_TIME" -> "To'liq stavka";
            case "PART_TIME" -> "Yarim stavka";
            case "CONTRACT" -> "Shartnoma";
            case "TEMPORARY" -> "Vaqtinchalik";
            default -> type;
        };
    }

    private String getBrandingBadge(String tier) {
        if ("PREMIUM".equals(tier)) return " ⭐";
        if ("BRANDED".equals(tier)) return " ✅";
        return "";
    }
}
