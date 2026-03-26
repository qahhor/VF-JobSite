package uz.verifix.jobs.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.service.search.VacancyDocument;
import uz.verifix.jobs.service.search.VacancyIndexService;

import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.VacancyStatus;
import uz.verifix.jobs.domain.repository.VacancyRepository;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final VacancyIndexService vacancyIndexService;
    private final VacancyRepository vacancyRepository;

    public SearchController(@Autowired(required = false) VacancyIndexService vacancyIndexService,
                            VacancyRepository vacancyRepository) {
        this.vacancyIndexService = vacancyIndexService;
        this.vacancyRepository = vacancyRepository;
    }

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindex() {
        if (vacancyIndexService == null) {
            return ResponseEntity.ok(Map.of("status", "skipped", "reason", "ES disabled"));
        }
        List<Vacancy> active = vacancyRepository.findByStatus(VacancyStatus.ACTIVE);
        vacancyIndexService.reindexAll(active);
        return ResponseEntity.ok(Map.of("status", "done", "indexed", active.size()));
    }

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

        if (vacancyIndexService == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<VacancyDocument> results = vacancyIndexService.search(
                q, city, category, salaryFrom, salaryTo, lat, lon, radiusKm, page, size);
        return ResponseEntity.ok(results);
    }
}
