"""Candidate-Vacancy matching model using gradient boosting."""

import numpy as np
from dataclasses import dataclass, field


@dataclass
class CandidateFeatures:
    city: str = ""
    preferred_categories: list[str] = field(default_factory=list)
    preferred_salary: float = 0.0
    skills: list[str] = field(default_factory=list)
    education_level: str = ""
    myid_verified: bool = False
    total_applications: int = 0
    hired_count: int = 0
    avg_tenure_days: float = 0.0


@dataclass
class VacancyFeatures:
    city: str = ""
    category: str = ""
    salary_from: float = 0.0
    salary_to: float = 0.0
    required_skills: list[str] = field(default_factory=list)
    employment_type: str = ""
    is_mass_hiring: bool = False
    positions_count: int = 1


class MatchingModel:
    """Rule-based matching with weighted scoring.
    Designed to be replaced by CatBoost/XGBoost once training data is available.
    """

    MODEL_VERSION = "rules-v2"

    # Feature weights
    WEIGHTS = {
        "city_match": 0.20,
        "category_match": 0.20,
        "salary_match": 0.15,
        "salary_partial": 0.08,
        "skills_overlap": 0.15,
        "education_bonus": 0.07,
        "myid_verified": 0.05,
        "reliability": 0.10,
    }

    def score(self, candidate: CandidateFeatures, vacancy: VacancyFeatures) -> tuple[float, dict[str, float]]:
        factors: dict[str, float] = {}

        # City match
        if candidate.city and vacancy.city:
            factors["city_match"] = self.WEIGHTS["city_match"] if candidate.city.lower() == vacancy.city.lower() else 0.0

        # Category match
        if vacancy.category and candidate.preferred_categories:
            cat_lower = vacancy.category.lower()
            if any(c.lower() == cat_lower for c in candidate.preferred_categories):
                factors["category_match"] = self.WEIGHTS["category_match"]

        # Salary match
        if candidate.preferred_salary > 0 and (vacancy.salary_from > 0 or vacancy.salary_to > 0):
            sal_from = vacancy.salary_from or 0
            sal_to = vacancy.salary_to or float('inf')
            if sal_from <= candidate.preferred_salary <= sal_to:
                factors["salary_match"] = self.WEIGHTS["salary_match"]
            elif candidate.preferred_salary >= sal_from:
                factors["salary_partial"] = self.WEIGHTS["salary_partial"]

        # Skills overlap
        if candidate.skills and vacancy.required_skills:
            candidate_skills_lower = {s.lower() for s in candidate.skills}
            required_lower = {s.lower() for s in vacancy.required_skills}
            if required_lower:
                overlap = len(candidate_skills_lower & required_lower) / len(required_lower)
                factors["skills_overlap"] = round(overlap * self.WEIGHTS["skills_overlap"], 4)

        # Education bonus
        if candidate.education_level and candidate.education_level not in ("", "PRIMARY"):
            factors["education_bonus"] = self.WEIGHTS["education_bonus"]

        # MyID verified
        if candidate.myid_verified:
            factors["myid_verified"] = self.WEIGHTS["myid_verified"]

        # Reliability score based on hire history
        if candidate.total_applications > 0:
            hire_rate = candidate.hired_count / candidate.total_applications
            tenure_factor = min(candidate.avg_tenure_days / 180.0, 1.0) if candidate.avg_tenure_days > 0 else 0.5
            reliability = (hire_rate * 0.6 + tenure_factor * 0.4)
            factors["reliability"] = round(reliability * self.WEIGHTS["reliability"], 4)

        total_score = min(sum(factors.values()), 1.0)
        return round(total_score, 4), factors

    def batch_score(
        self, candidates: list[CandidateFeatures], vacancy: VacancyFeatures
    ) -> list[tuple[float, dict[str, float]]]:
        return [self.score(c, vacancy) for c in candidates]
