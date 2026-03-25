package uz.verifix.jobs.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.verifix.jobs.domain.entity.VacancyTemplate;

import java.util.List;
import java.util.UUID;

@Repository
public interface VacancyTemplateRepository extends JpaRepository<VacancyTemplate, UUID> {
    List<VacancyTemplate> findByEmployerIdOrderByUseCountDesc(UUID employerId);
}
