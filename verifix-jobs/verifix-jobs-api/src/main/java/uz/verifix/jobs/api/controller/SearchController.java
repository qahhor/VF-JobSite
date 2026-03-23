package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.service.search.VacancyDocument;
import uz.verifix.jobs.service.search.VacancyIndexService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.elasticsearch.enabled", havingValue = "true", matchIfMissing = false)
public class SearchController {

    private final VacancyIndexService vacancyIndexService;

    @GetMapping("/vacancies")
    public ResponseEntity<List<VacancyDocument>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal salaryFrom,
            @RequestParam(required = false) BigDecimal salaryTo,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radiusKm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<VacancyDocument> results = vacancyIndexService.search(
                q, city, category, salaryFrom, salaryTo, lat, lon, radiusKm, page, size);
        return ResponseEntity.ok(results);
    }
}
