package uz.verifix.jobs.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.verifix.jobs.api.dto.response.CandidateProfileResponse;
import uz.verifix.jobs.api.mapper.CandidateMapper;
import uz.verifix.jobs.api.security.SecurityUtils;
import uz.verifix.jobs.service.candidate.CandidateViewService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateViewController {

    private final CandidateViewService candidateViewService;
    private final CandidateMapper candidateMapper;

    @GetMapping("/{id}")
    public ResponseEntity<CandidateProfileResponse> getCandidate(
            @PathVariable UUID id,
            Authentication auth) {

        UUID employerId = SecurityUtils.extractEmployerId(auth);
        return ResponseEntity.ok(candidateMapper.toProfileResponse(
                candidateViewService.viewCandidate(id, employerId),
                candidateViewService.getWorkHistory(id)
        ));
    }
}
