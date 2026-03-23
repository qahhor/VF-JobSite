package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.response.SalaryPredictionResponse;
import uz.verifix.jobs.service.ml.SalaryPredictionService;

@RestController
@RequestMapping("/api/v1/salary")
@RequiredArgsConstructor
public class SalaryInsightController {

    private final SalaryPredictionService salaryService;

    @GetMapping("/predict")
    public ResponseEntity<SalaryPredictionResponse> predict(
            @RequestParam String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String employmentType) {

        var prediction = salaryService.predictSalary(category, city, employmentType);
        return ResponseEntity.ok(toResponse(prediction));
    }

    @GetMapping("/market")
    public ResponseEntity<SalaryPredictionResponse> marketRate(
            @RequestParam String category,
            @RequestParam(required = false) String city) {

        var prediction = salaryService.getMarketRate(category, city);
        return ResponseEntity.ok(toResponse(prediction));
    }

    private SalaryPredictionResponse toResponse(SalaryPredictionService.SalaryPrediction p) {
        return SalaryPredictionResponse.builder()
                .p25(p.p25()).median(p.median()).p75(p.p75())
                .sampleSize(p.sampleSize())
                .category(p.category()).city(p.city())
                .currency("UZS")
                .build();
    }
}
