package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.WorkHistoryRequest;
import uz.verifix.jobs.api.dto.response.WorkHistoryResponse;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.service.candidate.WorkHistoryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/work-history")
@RequiredArgsConstructor
public class WorkHistoryController {

    private final WorkHistoryService workHistoryService;

    @PostMapping
    public ResponseEntity<WorkHistoryResponse> add(@Valid @RequestBody WorkHistoryRequest request) {
        WorkHistory wh = workHistoryService.add(
                request.getCandidateId(), request.getJobTitle(), request.getCompanyName(),
                request.getEmploymentType(), request.getStartDate(), request.getEndDate(),
                request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(wh));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkHistoryResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody WorkHistoryRequest request) {
        WorkHistory wh = workHistoryService.update(id, request.getCandidateId(),
                request.getJobTitle(), request.getCompanyName(), request.getEmploymentType(),
                request.getStartDate(), request.getEndDate(), request.getDescription());
        return ResponseEntity.ok(toResponse(wh));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestParam UUID candidateId) {
        workHistoryService.delete(id, candidateId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<WorkHistoryResponse>> getByCandidate(@PathVariable UUID candidateId) {
        List<WorkHistory> list = workHistoryService.getByCandidate(candidateId);
        return ResponseEntity.ok(list.stream().map(this::toResponse).toList());
    }

    private WorkHistoryResponse toResponse(WorkHistory wh) {
        return WorkHistoryResponse.builder()
                .id(wh.getId())
                .jobTitle(wh.getJobTitle())
                .companyName(wh.getCompanyName())
                .employmentType(wh.getEmploymentType())
                .startDate(wh.getStartDate())
                .endDate(wh.getEndDate())
                .description(wh.getDescription())
                .build();
    }
}
