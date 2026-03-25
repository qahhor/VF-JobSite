package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.repository.VacancyRepository;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Dynamic XML Sitemap — all public vacancies, companies, categories, cities.
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

    @Value("${app.base-url:https://jobs.verifix.uz}")
    private String baseUrl;

    private final EmployerBrandingRepository brandingRepository;
    private final VacancyRepository vacancyRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            .withZone(ZoneId.of("Asia/Tashkent"));

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Static pages
        addUrl(xml, "/", "1.0", "daily", null);
        addUrl(xml, "/jobs", "0.9", "hourly", null);
        addUrl(xml, "/companies", "0.7", "daily", null);

        // Category pages
        for (String cat : List.of("cook", "driver", "sales", "builder", "cleaner", "waiter",
                "cashier", "warehouse", "security", "electrician", "plumber", "tailor", "courier", "loader")) {
            addUrl(xml, "/jobs/category/" + cat, "0.7", "daily", null);
        }

        // City pages
        for (String city : List.of("tashkent", "samarkand", "bukhara", "andijan", "namangan",
                "fergana", "nukus", "karshi", "navoi", "jizzakh", "termez", "urgench")) {
            addUrl(xml, "/jobs/city/" + city, "0.7", "daily", null);
        }

        // Active vacancies (last 30 days)
        List<Vacancy> vacancies = vacancyRepository.findRecentlyApproved(Instant.now().minus(30, ChronoUnit.DAYS));
        for (Vacancy v : vacancies) {
            String slug = v.getSlug() != null ? v.getSlug() : v.getId().toString();
            String lastmod = DATE_FMT.format(v.getUpdatedAt() != null ? v.getUpdatedAt() : v.getCreatedAt());
            addUrl(xml, "/jobs/" + slug, "0.8", "weekly", lastmod);
        }

        // Branded company pages
        List<EmployerBranding> published = brandingRepository.findByIsPublishedTrue();
        for (EmployerBranding b : published) {
            String slug = b.getCustomSlug() != null ? b.getCustomSlug() : b.getEmployer().getId().toString();
            String lastmod = b.getUpdatedAt() != null ? DATE_FMT.format(b.getUpdatedAt()) : null;
            addUrl(xml, "/companies/" + slug, "0.7", "weekly", lastmod);
        }

        xml.append("</urlset>");
        return ResponseEntity.ok(xml.toString());
    }

    private void addUrl(StringBuilder xml, String path, String priority, String changefreq, String lastmod) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(baseUrl).append(path).append("</loc>\n");
        if (lastmod != null) xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }
}
