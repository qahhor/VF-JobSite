package uz.verifix.jobs.service.search;

import java.util.List;
import java.util.Map;

/**
 * Multilingual synonyms for job search in Central Asia.
 * Maps categories and cities to all their known translations:
 * uz_lat (Latin), uz_cyr (Cyrillic), ru (Russian), en (English), kk, tg, ky
 */
public final class SearchSynonyms {

    private SearchSynonyms() {}

    /** Category code → all known translations */
    public static final Map<String, List<String>> CATEGORIES = Map.ofEntries(
            Map.entry("COOK", List.of("cook", "oshpaz", "ошпаз", "повар", "аспаз", "oshpozchu", "ашпозчу")),
            Map.entry("DRIVER", List.of("driver", "haydovchi", "хайдовчи", "ҳайдовчи", "водитель", "жүргізуші", "ронанда", "айдоочу")),
            Map.entry("SALES", List.of("sales", "sotuvchi", "сотувчи", "продавец", "сатушы", "фурӯшанда", "сатуучу")),
            Map.entry("BUILDER", List.of("builder", "qurilishchi", "қурилишчи", "строитель", "құрылысшы", "сохтмончӣ", "куруучу")),
            Map.entry("CLEANER", List.of("cleaner", "tozalovchi", "тозаловчи", "уборщик", "тазалаушы", "тозакунанда", "тазалоочу")),
            Map.entry("WAITER", List.of("waiter", "ofitsiant", "официант", "офицант", "даяшы", "пешхизмат", "тейлөөчү")),
            Map.entry("CASHIER", List.of("cashier", "kassir", "кассир", "кассачы")),
            Map.entry("WAREHOUSE", List.of("warehouse", "omborchi", "омборчи", "кладовщик", "қоймашы", "анборчӣ", "кампачы")),
            Map.entry("SECURITY", List.of("security", "qoʻriqchi", "қўриқчи", "охранник", "күзетші", "посбон", "күзөтчү")),
            Map.entry("ELECTRICIAN", List.of("electrician", "elektrik", "электрик")),
            Map.entry("PLUMBER", List.of("plumber", "santexnik", "сантехник")),
            Map.entry("TAILOR", List.of("tailor", "tikuvchi", "тикувчи", "швея", "тігінші", "дӯзанда", "тигүүчү")),
            Map.entry("COURIER", List.of("courier", "kuryer", "курьер", "курер")),
            Map.entry("LOADER", List.of("loader", "yukchi", "юкчи", "грузчик", "жүкші", "борбардор", "жүкчү"))
    );

    /** City name → all known spellings */
    public static final Map<String, List<String>> CITIES = Map.ofEntries(
            Map.entry("Tashkent", List.of("tashkent", "toshkent", "ташкент", "тошкент")),
            Map.entry("Samarkand", List.of("samarkand", "samarqand", "самарканд", "самарқанд")),
            Map.entry("Bukhara", List.of("bukhara", "buxoro", "бухара", "бухоро")),
            Map.entry("Andijan", List.of("andijan", "andijon", "андижан", "андижон")),
            Map.entry("Namangan", List.of("namangan", "наманган")),
            Map.entry("Fergana", List.of("fergana", "fargona", "фаргона", "фергана")),
            Map.entry("Nukus", List.of("nukus", "нукус")),
            Map.entry("Navoi", List.of("navoi", "navoiy", "навои", "навоий")),
            Map.entry("Karshi", List.of("karshi", "qarshi", "карши", "қарши")),
            Map.entry("Jizzakh", List.of("jizzakh", "jizzax", "джизак", "жиззах")),
            Map.entry("Termez", List.of("termez", "termiz", "термез")),
            Map.entry("Urgench", List.of("urgench", "urganch", "ургенч")),
            Map.entry("Gulistan", List.of("gulistan", "guliston", "гулистан"))
    );

    /**
     * Build search keywords string for a vacancy.
     * Includes all translations of category and city + original title.
     */
    public static String buildKeywords(String title, String category, String city) {
        StringBuilder sb = new StringBuilder();

        // Original title
        if (title != null) sb.append(title).append(" ");

        // Category synonyms
        if (category != null) {
            List<String> catSynonyms = CATEGORIES.get(category.toUpperCase());
            if (catSynonyms != null) {
                sb.append(String.join(" ", catSynonyms)).append(" ");
            }
            sb.append(category).append(" ");
        }

        // City synonyms
        if (city != null) {
            for (var entry : CITIES.entrySet()) {
                if (entry.getKey().equalsIgnoreCase(city) || entry.getValue().stream().anyMatch(s -> s.equalsIgnoreCase(city))) {
                    sb.append(String.join(" ", entry.getValue())).append(" ");
                    sb.append(entry.getKey()).append(" ");
                    break;
                }
            }
            sb.append(city).append(" ");
        }

        return sb.toString().trim();
    }
}
