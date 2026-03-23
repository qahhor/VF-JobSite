package uz.verifix.jobs.domain.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import uz.verifix.jobs.domain.entity.Candidate;
import uz.verifix.jobs.domain.enums.EducationLevel;
import uz.verifix.jobs.domain.enums.Gender;
import uz.verifix.jobs.domain.enums.MyIdStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CandidateSpecification {

    public static Specification<Candidate> withFilters(String city, String[] skills, String category,
                                                        BigDecimal minSalary, BigDecimal maxSalary,
                                                        EducationLevel educationLevel, Gender gender,
                                                        Boolean myidVerified) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only non-deleted
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.toLowerCase()));
            }

            if (skills != null && skills.length > 0) {
                // Match ANY skill using native array overlap
                for (String skill : skills) {
                    predicates.add(cb.like(
                            cb.function("array_to_string", String.class, root.get("skills"), cb.literal(",")),
                            "%" + skill + "%"
                    ));
                }
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.like(
                        cb.function("array_to_string", String.class, root.get("preferredCategories"), cb.literal(",")),
                        "%" + category + "%"
                ));
            }

            if (minSalary != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("preferredSalary"), minSalary));
            }

            if (maxSalary != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("preferredSalary"), maxSalary));
            }

            if (educationLevel != null) {
                predicates.add(cb.equal(root.get("educationLevel"), educationLevel));
            }

            if (gender != null) {
                predicates.add(cb.equal(root.get("gender"), gender));
            }

            if (Boolean.TRUE.equals(myidVerified)) {
                predicates.add(cb.equal(root.get("myidStatus"), MyIdStatus.VERIFIED));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
