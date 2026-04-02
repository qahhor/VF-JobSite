package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;
import uz.verifix.jobs.service.marketplace.PublicVacancyService;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Dynamic XML Sitemap — all public vacancies, companies, categories, cities.
 * Includes hreflang alternates for uz/ru/en.
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

    @Value("${app.base-url:https://jobs.verifix.uz}")
    private String baseUrl;

    private final PublicVacancyService publicVacancyService;
    private final EmployerBrandingRepository brandingRepository;
    private static final DateTimeFormatter W3C_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemapRoot() {
        return buildSitemap();
    }

    @GetMapping(value = "/api/v1/public/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemapApi() {
        return buildSitemap();
    }

    private ResponseEntity<String> buildSitemap() {
        List<Vacancy> vacancies = publicVacancyService.findAllActiveForSitemap();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"\n");
        xml.append("        xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n");

        // Static pages
        appendUrl(xml, "/", "daily", "1.0", null);
        appendUrl(xml, "/jobs", "hourly", "0.9", null);
        appendUrl(xml, "/companies", "daily", "0.8", null);
        appendUrl(xml, "/categories", "daily", "0.8", null);
        appendUrl(xml, "/salary", "weekly", "0.7", null);
        appendUrl(xml, "/map", "daily", "0.7", null);

        // Collect unique cities and categories for hub pages
        java.util.Set<String> cities = new java.util.LinkedHashSet<>();
        java.util.Set<String> categories = new java.util.LinkedHashSet<>();
        java.util.Set<String> countries = new java.util.LinkedHashSet<>();

        for (Vacancy v : vacancies) {
            if (v.getCity() != null) cities.add(v.getCity());
            if (v.getCategory() != null) categories.add(v.getCategory());
            if (v.getCountry() != null) countries.add(v.getCountry());
        }

        // City pages
        for (String city : cities) {
            appendUrl(xml, "/vacancies/" + encode(city), "daily", "0.7", null);
        }

        // Category pages
        for (String category : categories) {
            appendUrl(xml, "/vacancies/category/" + encode(category), "daily", "0.7", null);
        }

        // Individual vacancy pages (limit to 5000 for sitemap size)
        int count = 0;
        for (Vacancy v : vacancies) {
            if (count >= 5000) break;
            String slug = v.getSlug() != null ? v.getSlug() : v.getId().toString();
            String lastmod = v.getUpdatedAt() != null ? W3C_DATE.format(v.getUpdatedAt()) : null;
            appendUrl(xml, "/jobs/" + encode(slug), "weekly", "0.6", lastmod);
            count++;
        }

        // Branded company pages
        List<EmployerBranding> published = brandingRepository.findByIsPublishedTrue();
        for (EmployerBranding b : published) {
            String slug = b.getCustomSlug() != null ? b.getCustomSlug() : b.getEmployer().getId().toString();
            String lastmod = b.getUpdatedAt() != null ? W3C_DATE.format(b.getUpdatedAt()) : null;
            appendUrl(xml, "/companies/" + slug, "weekly", "0.7", lastmod);
        }

        xml.append("</urlset>");

        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=3600")
                .body(xml.toString());
    }

    private void appendUrl(StringBuilder xml, String path, String changefreq, String priority, String lastmod) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(baseUrl).append(path).append("</loc>\n");
        if (lastmod != null) {
            xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        }
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        // Hreflang alternates for main languages
        for (String lang : List.of("uz", "ru", "en")) {
            xml.append("    <xhtml:link rel=\"alternate\" hreflang=\"").append(lang)
               .append("\" href=\"").append(baseUrl).append(path).append("?lang=").append(lang).append("\"/>\n");
        }
        xml.append("  </url>\n");
    }

    private String encode(String value) {
        try {
            return java.net.URLEncoder.encode(value, "UTF-8").replace("+", "%20");
        } catch (Exception e) {
            return value;
        }
    }
}
