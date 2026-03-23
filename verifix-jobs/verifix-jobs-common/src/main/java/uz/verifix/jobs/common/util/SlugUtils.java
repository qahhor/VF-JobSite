package uz.verifix.jobs.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-{2,}");

    private static final Map<Character, String> CYRILLIC_MAP = Map.ofEntries(
            Map.entry('а', "a"), Map.entry('б', "b"), Map.entry('в', "v"),
            Map.entry('г', "g"), Map.entry('д', "d"), Map.entry('е', "e"),
            Map.entry('ё', "yo"), Map.entry('ж', "zh"), Map.entry('з', "z"),
            Map.entry('и', "i"), Map.entry('й', "y"), Map.entry('к', "k"),
            Map.entry('л', "l"), Map.entry('м', "m"), Map.entry('н', "n"),
            Map.entry('о', "o"), Map.entry('п', "p"), Map.entry('р', "r"),
            Map.entry('с', "s"), Map.entry('т', "t"), Map.entry('у', "u"),
            Map.entry('ф', "f"), Map.entry('х', "kh"), Map.entry('ц', "ts"),
            Map.entry('ч', "ch"), Map.entry('ш', "sh"), Map.entry('щ', "shch"),
            Map.entry('ъ', ""), Map.entry('ы', "y"), Map.entry('ь', ""),
            Map.entry('э', "e"), Map.entry('ю', "yu"), Map.entry('я', "ya"),
            Map.entry('ў', "o"), Map.entry('қ', "q"), Map.entry('ғ', "g"),
            Map.entry('ҳ', "h")
    );

    private SlugUtils() {}

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) return "";
        String transliterated = transliterate(input.toLowerCase(Locale.ROOT));
        String normalized = Normalizer.normalize(transliterated, Normalizer.Form.NFD);
        String slug = WHITESPACE.matcher(normalized).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = MULTIPLE_DASHES.matcher(slug).replaceAll("-");
        return slug.replaceAll("^-|-$", "");
    }

    private static String transliterate(String text) {
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            String replacement = CYRILLIC_MAP.get(c);
            sb.append(replacement != null ? replacement : c);
        }
        return sb.toString();
    }
}
