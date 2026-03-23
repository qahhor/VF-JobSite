package uz.verifix.jobs.common.util;

import java.util.regex.Pattern;

public final class PhoneUtils {

    private static final Pattern E164_PATTERN = Pattern.compile("^\\+[1-9]\\d{6,14}$");
    private static final String UZ_COUNTRY_CODE = "+998";

    private PhoneUtils() {}

    public static String normalize(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[^\\d+]", "");
        if (!digits.startsWith("+")) {
            if (digits.startsWith("998")) {
                digits = "+" + digits;
            } else if (digits.length() == 9) {
                digits = UZ_COUNTRY_CODE + digits;
            }
        }
        return digits;
    }

    public static boolean isValid(String phone) {
        if (phone == null) return false;
        return E164_PATTERN.matcher(phone).matches();
    }

    public static boolean isUzbek(String phone) {
        return phone != null && phone.startsWith(UZ_COUNTRY_CODE);
    }
}
