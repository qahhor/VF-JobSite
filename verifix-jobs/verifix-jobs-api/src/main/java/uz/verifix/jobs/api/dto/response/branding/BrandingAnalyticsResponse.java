package uz.verifix.jobs.api.dto.response.branding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BrandingAnalyticsResponse {
    private long totalPageViews;
    private long totalUniqueVisitors;
    private long totalVacancyClicks;
    private long totalApplyClicks;
    private double conversionRate;
    private List<DailyData> dailyData;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DailyData {
        private LocalDate date;
        private int pageViews;
        private int uniqueVisitors;
        private int vacancyClicks;
        private int applyClicks;
    }
}
