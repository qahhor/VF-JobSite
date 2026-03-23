package uz.verifix.jobs.service.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.Employer;
import uz.verifix.jobs.domain.enums.EmployerStatus;
import uz.verifix.jobs.domain.repository.EmployerRepository;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminEmployerService {

    private final EmployerRepository employerRepository;

    @Transactional(readOnly = true)
    public Page<Employer> list(EmployerStatus status, Pageable pageable) {
        if (status != null) {
            return employerRepository.findByStatus(status, pageable);
        }
        return employerRepository.findAll(pageable);
    }

    @Transactional
    public Employer changeStatus(UUID employerId, EmployerStatus newStatus) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
        employer.setStatus(newStatus);
        log.info("Employer {} status changed to {}", employerId, newStatus);
        return employerRepository.save(employer);
    }

    @Transactional
    public Employer verify(UUID employerId) {
        Employer employer = employerRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer", employerId.toString()));
        employer.setIsVerified(true);
        employer.setStatus(EmployerStatus.ACTIVE);
        log.info("Employer {} verified", employerId);
        return employerRepository.save(employer);
    }
}
