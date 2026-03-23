package uz.verifix.jobs.service.ml;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uz.verifix.jobs.domain.enums.LanguagePreference;
import uz.verifix.jobs.domain.enums.NotificationChannel;
import uz.verifix.jobs.domain.enums.UserType;

import java.time.*;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationOptimizer {

    /**
     * Determine the best notification channel based on user type.
     * Candidates prefer Telegram, employers prefer SMS/Telegram.
     */
    public NotificationChannel getBestChannel(UserType userType, UUID userId) {
        // Default: Telegram for candidates, Telegram for employers
        // In future: analyze delivery/read rates from Notification table
        return NotificationChannel.TELEGRAM;
    }

    /**
     * Determine optimal send time based on user's language preference (timezone proxy).
     */
    public Instant getBestTime(LanguagePreference langPref) {
        ZoneId timezone;
        if (langPref == LanguagePreference.RU) {
            timezone = ZoneId.of("Europe/Moscow"); // 10:00 Moscow
        } else {
            timezone = ZoneId.of("Asia/Tashkent"); // 10:00 Tashkent
        }

        LocalDateTime today10am = LocalDate.now(timezone).atTime(10, 0);
        Instant target = today10am.atZone(timezone).toInstant();

        // If 10 AM already passed today, schedule for tomorrow
        if (target.isBefore(Instant.now())) {
            target = today10am.plusDays(1).atZone(timezone).toInstant();
        }

        return target;
    }

    /**
     * Get personalized digest time for a candidate.
     */
    public Instant getDigestTime(UUID candidateId, LanguagePreference langPref) {
        // Base: use language-based timezone
        // Future: track last app activity, send 1h before typical active time
        return getBestTime(langPref);
    }
}
