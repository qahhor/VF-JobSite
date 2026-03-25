package uz.verifix.jobs.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.verifix.jobs.api.dto.request.WorkHistoryRequest;
import uz.verifix.jobs.api.dto.response.WorkHistoryResponse;
import uz.verifix.jobs.api.mapper.WorkHistoryMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.domain.entity.WorkHistory;
import uz.verifix.jobs.service.candidate.WorkHistoryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/work-history")
@RequiredArgsConstructor
public class WorkHistoryController {

    private final WorkHistoryService workHistoryService;
    private final WorkHistoryMapper workHistoryMapper;

    @PostMapping
    public ResponseEntity<WorkHistoryResponse> add(
            @Valid @RequestBody WorkHistoryRequest request,
            Authentication auth) {
        UUID candidateId = SecurityUtils.enforceCandidateAccess(auth, request.getCandidateId());
        WorkHistory wh = workHistoryService.add(
                candidateId, request.getJobTitle(), request.getCompanyName(),
                request.getEmploymentType(), request.getStartDate(), request.getEndDate(),
                request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(workHistoryMapper.toResponse(wh));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkHistoryResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody WorkHistoryRequest request,
            Authentication auth) {
        UUID candidateId = SecurityUtils.enforceCandidateAccess(auth, request.getCandidateId());
        WorkHistory wh = workHistoryService.update(id, candidateId,
                request.getJobTitle(), request.getCompanyName(), request.getEmploymentType(),
                request.getStartDate(), request.getEndDate(), request.getDescription());
        return ResponseEntity.ok(workHistoryMapper.toResponse(wh));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID candidateId,
            Authentication auth) {
        workHistoryService.delete(id, SecurityUtils.enforceCandidateAccess(auth, candidateId));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<WorkHistoryResponse>> getMine(Authentication auth) {
        List<WorkHistory> list = workHistoryService.getByCandidate(SecurityUtils.extractCandidateId(auth));
        return ResponseEntity.ok(list.stream().map(workHistoryMapper::toResponse).toList());
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<WorkHistoryResponse>> getByCandidate(
            @PathVariable UUID candidateId,
            Authentication auth) {
        List<WorkHistory> list = workHistoryService.getByCandidate(
                SecurityUtils.enforceCandidateAccess(auth, candidateId)
        );
        return ResponseEntity.ok(list.stream().map(workHistoryMapper::toResponse).toList());
    }
}
