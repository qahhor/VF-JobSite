package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;
import uz.verifix.jobs.domain.repository.branding.EmployerBrandingRepository;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    @Value("${app.base-url:https://jobs.verifix.uz}")
    private String baseUrl;

    private final EmployerBrandingRepository brandingRepository;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Homepage
        xml.append("  <url><loc>").append(baseUrl).append("</loc><priority>1.0</priority></url>\n");

        // Published branding pages
        List<EmployerBranding> published = brandingRepository.findByIsPublishedTrue();
        for (EmployerBranding b : published) {
            String slug = b.getCustomSlug() != null ? b.getCustomSlug() : b.getEmployer().getId().toString();
            xml.append("  <url>\n");
            xml.append("    <loc>").append(baseUrl).append("/company/").append(slug).append("</loc>\n");
            xml.append("    <priority>0.9</priority>\n");
            xml.append("    <changefreq>weekly</changefreq>\n");
            if (b.getUpdatedAt() != null) {
                xml.append("    <lastmod>").append(b.getUpdatedAt().toString().substring(0, 10)).append("</lastmod>\n");
            }
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return ResponseEntity.ok(xml.toString());
    }
}
