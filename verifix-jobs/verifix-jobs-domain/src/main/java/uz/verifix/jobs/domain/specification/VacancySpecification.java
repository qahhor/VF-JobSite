package uz.verifix.jobs.domain.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import uz.verifix.jobs.domain.entity.Vacancy;
import uz.verifix.jobs.domain.enums.ModerationStatus;
import uz.verifix.jobs.domain.enums.VacancyStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class VacancySpecification {

    private VacancySpecification() {}

    public static Specification<Vacancy> withFilters(
            String city,
            String category,
            BigDecimal salaryFrom,
            BigDecimal salaryTo,
            UUID employerId,
            VacancyStatus status
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only active and approved by default
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                predicates.add(cb.equal(root.get("status"), VacancyStatus.ACTIVE));
                predicates.add(cb.equal(root.get("moderationStatus"), ModerationStatus.APPROVED));
            }

            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(root.get("city"), city));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (salaryFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salaryTo"), salaryFrom));
            }

            if (salaryTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("salaryFrom"), salaryTo));
            }

            if (employerId != null) {
                predicates.add(cb.equal(root.get("employer").get("id"), employerId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
