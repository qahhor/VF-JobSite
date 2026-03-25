package uz.verifix.jobs.service.moderation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.moderation")
public class ModerationProperties {

    private BigDecimal minimumWageUzs = new BigDecimal("1155000");
    private String minimumWageReason = "Salary below minimum wage";
    private String manualReviewReason = "Manual review required by moderation rules";
    private List<ContentRule> rejectRules = defaultRejectRules();
    private List<String> manualReviewKeywords = new ArrayList<>(List.of(
            "crypto",
            "bitcoin",
            "remote work",
            "udalenka",
            "vakhta"
    ));
    private AutoApprove autoApprove = new AutoApprove();

    private static List<ContentRule> defaultRejectRules() {
        return new ArrayList<>(List.of(
                new ContentRule(RuleType.TERM, "mlm", "Content contains prohibited words", true),
                new ContentRule(RuleType.TERM, "network marketing", "Content contains prohibited words", true),
                new ContentRule(RuleType.TERM, "depozit", "Content contains prohibited words", true),
                new ContentRule(RuleType.TERM, "vlozhenie", "Content contains prohibited words", true),
                new ContentRule(RuleType.TERM, "piramida", "Content contains prohibited words", true),
                new ContentRule(RuleType.TERM, "zalog", "Content contains prohibited words", true)
        ));
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContentRule {
        private RuleType type = RuleType.TERM;
        private String pattern;
        private String reason = "Content contains prohibited words";
        private boolean enabled = true;
    }

    public enum RuleType {
        TERM,
        REGEX
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class AutoApprove {
        private long minApproved = 10;
        private double maxRejectionRate = 0.05d;
    }
}
