package uz.verifix.jobs.service.automation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.verifix.jobs.common.exception.ResourceNotFoundException;
import uz.verifix.jobs.domain.entity.VacancyTemplate;
import uz.verifix.jobs.domain.repository.VacancyTemplateRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Manages reusable vacancy templates for employers.
 * Templates store pre-filled vacancy data (title, description, category, benefits, etc.)
 * that can be quickly applied when creating new vacancies.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyTemplateService {

    private final VacancyTemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public List<VacancyTemplate> getTemplates(UUID employerId) {
        return templateRepository.findByEmployerIdOrderByUseCountDesc(employerId);
    }

    @Transactional
    public VacancyTemplate createTemplate(UUID employerId, String name, Map<String, Object> templateData) {
        VacancyTemplate template = VacancyTemplate.builder()
                .employerId(employerId)
                .name(name)
                .templateData(templateData)
                .build();
        log.info("Created vacancy template '{}' for employer {}", name, employerId);
        return templateRepository.save(template);
    }

    @Transactional
    public VacancyTemplate updateTemplate(UUID templateId, UUID employerId, String name, Map<String, Object> templateData) {
        VacancyTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("VacancyTemplate", templateId.toString()));
        if (!template.getEmployerId().equals(employerId)) {
            throw new ResourceNotFoundException("VacancyTemplate", templateId.toString());
        }
        template.setName(name);
        template.setTemplateData(templateData);
        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(UUID templateId, UUID employerId) {
        VacancyTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("VacancyTemplate", templateId.toString()));
        if (!template.getEmployerId().equals(employerId)) {
            throw new ResourceNotFoundException("VacancyTemplate", templateId.toString());
        }
        template.softDelete();
        templateRepository.save(template);
    }

    @Transactional
    public Map<String, Object> useTemplate(UUID templateId, UUID employerId) {
        VacancyTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("VacancyTemplate", templateId.toString()));
        if (!template.getEmployerId().equals(employerId)) {
            throw new ResourceNotFoundException("VacancyTemplate", templateId.toString());
        }
        template.setUseCount(template.getUseCount() + 1);
        templateRepository.save(template);
        return template.getTemplateData();
    }
}
