package uz.verifix.jobs.common.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class DateUtils {

    public static final ZoneId TASHKENT_ZONE = ZoneId.of("Asia/Tashkent");

    private DateUtils() {}

    public static ZonedDateTime nowTashkent() {
        return ZonedDateTime.now(TASHKENT_ZONE);
    }

    public static LocalDate todayTashkent() {
        return LocalDate.now(TASHKENT_ZONE);
    }

    public static LocalDateTime toTashkentLocal(Instant instant) {
        return LocalDateTime.ofInstant(instant, TASHKENT_ZONE);
    }
}
