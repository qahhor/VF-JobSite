package uz.verifix.jobs.service.search;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class SearchSynonymsTest {

    @Test
    void buildKeywordsForCookInTashkent() {
        String kw = SearchSynonyms.buildKeywords("Head Chef", "COOK", "Tashkent");
        assertThat(kw).contains("Head Chef", "cook", "oshpaz", "tashkent", "toshkent");
    }

    @Test
    void buildKeywordsHandlesNulls() {
        assertThat(SearchSynonyms.buildKeywords(null, null, null)).isEmpty();
    }

    @Test
    void allCategoriesHave14Entries() {
        assertThat(SearchSynonyms.CATEGORIES).hasSize(14);
    }

    @Test
    void allCitiesHave13Entries() {
        assertThat(SearchSynonyms.CITIES).hasSize(13);
    }

    @Test
    void categorySynonymsIncludeMultipleLanguages() {
        assertThat(SearchSynonyms.CATEGORIES.get("COOK")).contains("cook", "oshpaz", "повар");
        assertThat(SearchSynonyms.CATEGORIES.get("DRIVER")).contains("driver", "haydovchi", "водитель");
    }
}
