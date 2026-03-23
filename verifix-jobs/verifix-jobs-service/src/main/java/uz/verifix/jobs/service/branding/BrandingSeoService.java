package uz.verifix.jobs.service.branding;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import uz.verifix.jobs.domain.entity.branding.EmployerBranding;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BrandingSeoService {

    @Value("${app.base-url:https://jobs.verifix.uz}")
    private String baseUrl;

    public Map<String, Object> generateJsonLd(EmployerBranding branding) {
        Map<String, Object> jsonLd = new LinkedHashMap<>();
        jsonLd.put("@context", "https://schema.org");
        jsonLd.put("@type", "Organization");
        jsonLd.put("name", branding.getEmployer().getName());
        jsonLd.put("url", getPageUrl(branding));

        if (branding.getEmployer().getLogoUrl() != null) {
            jsonLd.put("logo", branding.getEmployer().getLogoUrl());
        }

        if (branding.getEmployer().getCity() != null) {
            Map<String, String> address = new LinkedHashMap<>();
            address.put("@type", "PostalAddress");
            address.put("addressLocality", branding.getEmployer().getCity());
            address.put("addressCountry", "UZ");
            jsonLd.put("address", address);
        }

        if (branding.getEmployer().getIndustry() != null) {
            jsonLd.put("industry", branding.getEmployer().getIndustry());
        }

        return jsonLd;
    }

    public Map<String, String> generateOgTags(EmployerBranding branding) {
        Map<String, String> og = new LinkedHashMap<>();
        og.put("og:type", "website");
        og.put("og:title", branding.getMetaTitle() != null ? branding.getMetaTitle() : branding.getEmployer().getName());
        og.put("og:description", branding.getMetaDescription() != null ? branding.getMetaDescription() :
                branding.getEmployer().getName() + " — vakansiyalar va ish o'rinlari");
        og.put("og:url", getPageUrl(branding));

        if (!branding.getCoverImages().isEmpty()) {
            og.put("og:image", branding.getCoverImages().get(0).getImageUrl());
        } else if (branding.getEmployer().getLogoUrl() != null) {
            og.put("og:image", branding.getEmployer().getLogoUrl());
        }

        return og;
    }

    private String getPageUrl(EmployerBranding branding) {
        String slug = branding.getCustomSlug() != null ? branding.getCustomSlug() : branding.getEmployer().getId().toString();
        return baseUrl + "/company/" + slug;
    }
}
