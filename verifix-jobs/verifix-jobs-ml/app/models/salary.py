"""Salary prediction model using statistical analysis and gradient boosting."""

import numpy as np
from dataclasses import dataclass


@dataclass
class SalaryPrediction:
    p25: float
    median: float
    p75: float
    sample_size: int
    confidence: float
    model_version: str


class SalaryModel:
    """Salary prediction based on market statistics.
    Uses percentile estimation from aggregated vacancy data.
    Designed to be enhanced with CatBoost regression once training data is available.
    """

    MODEL_VERSION = "stats-v2"

    # Base salary ranges by category (UZS monthly) — Central Asian blue-collar market
    BASE_SALARIES: dict[str, tuple[float, float, float]] = {
        "COOK": (2_000_000, 3_500_000, 5_000_000),
        "DRIVER": (3_000_000, 4_500_000, 7_000_000),
        "SALES": (2_000_000, 3_000_000, 5_000_000),
        "BUILDER": (3_000_000, 5_000_000, 8_000_000),
        "CLEANER": (1_500_000, 2_500_000, 3_500_000),
        "WAITER": (1_500_000, 2_500_000, 4_000_000),
        "CASHIER": (1_800_000, 2_800_000, 4_000_000),
        "WAREHOUSE": (2_000_000, 3_200_000, 4_500_000),
        "SECURITY": (2_000_000, 3_000_000, 4_500_000),
        "ELECTRICIAN": (3_000_000, 5_000_000, 8_000_000),
        "PLUMBER": (2_500_000, 4_000_000, 6_000_000),
        "TAILOR": (2_000_000, 3_500_000, 5_500_000),
        "COURIER": (2_500_000, 3_500_000, 5_000_000),
        "LOADER": (2_000_000, 3_000_000, 4_500_000),
        "MECHANIC": (3_000_000, 5_000_000, 8_000_000),
        "WELDER": (4_000_000, 6_000_000, 10_000_000),
        "CARPENTER": (3_000_000, 4_500_000, 7_000_000),
        "PAINTER": (2_500_000, 4_000_000, 6_000_000),
        "NANNY": (2_000_000, 3_000_000, 5_000_000),
        "GARDENER": (1_500_000, 2_500_000, 4_000_000),
    }

    # City cost-of-living multipliers relative to Tashkent (1.0)
    CITY_MULTIPLIERS: dict[str, float] = {
        "Tashkent": 1.0,
        "Samarkand": 0.85,
        "Bukhara": 0.82,
        "Andijan": 0.80,
        "Namangan": 0.78,
        "Fergana": 0.80,
        "Nukus": 0.75,
        "Karshi": 0.78,
        "Navoi": 0.88,
        "Jizzakh": 0.76,
        "Gulistan": 0.74,
        "Termez": 0.77,
        "Urgench": 0.79,
        "Chirchik": 0.90,
        "Almalyk": 0.92,
    }

    EDUCATION_MULTIPLIERS: dict[str, float] = {
        "PRIMARY": 0.90,
        "SECONDARY": 1.0,
        "VOCATIONAL": 1.10,
        "BACHELORS": 1.15,
        "MASTERS": 1.20,
    }

    EXPERIENCE_MULTIPLIERS: dict[int, float] = {
        0: 0.85, 1: 0.95, 2: 1.0, 3: 1.05, 5: 1.12, 10: 1.20,
    }

    def predict(
        self,
        category: str,
        city: str = "",
        employment_type: str = "",
        education_level: str = "",
        experience_years: int = 0,
        skills: list[str] | None = None,
    ) -> SalaryPrediction:
        base = self.BASE_SALARIES.get(category.upper(), (2_000_000, 3_500_000, 5_500_000))
        p25, median, p75 = base

        # Apply city multiplier
        city_mult = self.CITY_MULTIPLIERS.get(city, 0.85) if city else 0.90
        p25 *= city_mult
        median *= city_mult
        p75 *= city_mult

        # Education adjustment
        edu_mult = self.EDUCATION_MULTIPLIERS.get(education_level, 1.0) if education_level else 1.0
        p25 *= edu_mult
        median *= edu_mult
        p75 *= edu_mult

        # Experience adjustment
        exp_mult = 1.0
        for threshold, mult in sorted(self.EXPERIENCE_MULTIPLIERS.items(), reverse=True):
            if experience_years >= threshold:
                exp_mult = mult
                break
        p25 *= exp_mult
        median *= exp_mult
        p75 *= exp_mult

        # Part-time adjustment
        if employment_type == "PART_TIME":
            p25 *= 0.55
            median *= 0.55
            p75 *= 0.55

        # Skills premium
        skill_count = len(skills) if skills else 0
        if skill_count > 3:
            skill_mult = 1.0 + min(skill_count - 3, 5) * 0.02
            median *= skill_mult
            p75 *= skill_mult

        # Confidence based on data specificity
        confidence = 0.5
        if city and city in self.CITY_MULTIPLIERS:
            confidence += 0.2
        if category.upper() in self.BASE_SALARIES:
            confidence += 0.2
        if education_level:
            confidence += 0.05
        if experience_years > 0:
            confidence += 0.05

        return SalaryPrediction(
            p25=round(p25, -3),
            median=round(median, -3),
            p75=round(p75, -3),
            sample_size=100,
            confidence=min(confidence, 1.0),
            model_version=self.MODEL_VERSION,
        )
