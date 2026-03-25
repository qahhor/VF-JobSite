"""Tests for ML model implementations."""

import pytest
from app.models.matching import MatchingModel, CandidateFeatures, VacancyFeatures
from app.models.salary import SalaryModel
from app.models.fraud import FraudModel
from app.models.churn import ChurnModel


class TestMatchingModel:
    def setup_method(self):
        self.model = MatchingModel()

    def test_city_match_scores_positive(self):
        candidate = CandidateFeatures(city="Tashkent")
        vacancy = VacancyFeatures(city="Tashkent")
        score, factors = self.model.score(candidate, vacancy)
        assert score > 0
        assert "city_match" in factors

    def test_category_match(self):
        candidate = CandidateFeatures(preferred_categories=["COOK", "DRIVER"])
        vacancy = VacancyFeatures(category="COOK")
        score, factors = self.model.score(candidate, vacancy)
        assert "category_match" in factors

    def test_salary_range_match(self):
        candidate = CandidateFeatures(preferred_salary=4000000)
        vacancy = VacancyFeatures(salary_from=3000000, salary_to=5000000)
        score, factors = self.model.score(candidate, vacancy)
        assert "salary_match" in factors

    def test_skills_overlap(self):
        candidate = CandidateFeatures(skills=["python", "sql", "data"])
        vacancy = VacancyFeatures(required_skills=["python", "sql", "java"])
        score, factors = self.model.score(candidate, vacancy)
        assert "skills_overlap" in factors
        assert factors["skills_overlap"] > 0

    def test_myid_verified_bonus(self):
        candidate = CandidateFeatures(myid_verified=True)
        vacancy = VacancyFeatures()
        score, factors = self.model.score(candidate, vacancy)
        assert "myid_verified" in factors

    def test_score_capped_at_one(self):
        candidate = CandidateFeatures(
            city="Tashkent", preferred_categories=["COOK"],
            preferred_salary=3500000, skills=["a", "b", "c"],
            education_level="BACHELORS", myid_verified=True,
            total_applications=10, hired_count=5, avg_tenure_days=200,
        )
        vacancy = VacancyFeatures(
            city="Tashkent", category="COOK",
            salary_from=3000000, salary_to=5000000,
            required_skills=["a", "b", "c"],
        )
        score, _ = self.model.score(candidate, vacancy)
        assert score <= 1.0

    def test_batch_score(self):
        candidates = [CandidateFeatures(city="Tashkent"), CandidateFeatures(city="Samarkand")]
        vacancy = VacancyFeatures(city="Tashkent")
        results = self.model.batch_score(candidates, vacancy)
        assert len(results) == 2
        assert results[0][0] > results[1][0]  # First should score higher (city match)


class TestSalaryModel:
    def setup_method(self):
        self.model = SalaryModel()

    def test_prediction_returns_valid_range(self):
        pred = self.model.predict("COOK", "Tashkent")
        assert pred.p25 < pred.median < pred.p75
        assert pred.sample_size > 0

    def test_city_multiplier_affects_result(self):
        tashkent = self.model.predict("DRIVER", "Tashkent")
        nukus = self.model.predict("DRIVER", "Nukus")
        assert tashkent.median > nukus.median  # Tashkent should be higher

    def test_education_affects_salary(self):
        secondary = self.model.predict("COOK", "Tashkent", education_level="SECONDARY")
        masters = self.model.predict("COOK", "Tashkent", education_level="MASTERS")
        assert masters.median > secondary.median

    def test_part_time_adjustment(self):
        full_time = self.model.predict("COOK", "Tashkent")
        part_time = self.model.predict("COOK", "Tashkent", employment_type="PART_TIME")
        assert part_time.median < full_time.median

    def test_unknown_category_uses_defaults(self):
        pred = self.model.predict("UNKNOWN_JOB")
        assert pred.median > 0


class TestFraudModel:
    def setup_method(self):
        self.model = FraudModel()

    def test_self_referral_high_score(self):
        result = self.model.check("REFERRAL", is_self_referral=True)
        assert result.score >= 0.8
        assert "SELF_REFERRAL" in result.flags
        assert result.is_fraud

    def test_rapid_fire_detection(self):
        result = self.model.check("APPLICATION", recent_applications_count=15)
        assert "RAPID_FIRE_APPLICATIONS" in result.flags

    def test_new_account_burst(self):
        result = self.model.check("APPLICATION", account_age_days=0.5, recent_applications_count=5)
        assert "NEW_ACCOUNT_BURST" in result.flags

    def test_legitimate_user_low_score(self):
        result = self.model.check("APPLICATION",
            recent_applications_count=2, has_complete_profile=True,
            account_age_days=30, unique_ips_24h=1)
        assert result.score < 0.3
        assert not result.is_fraud

    def test_score_capped_at_one(self):
        result = self.model.check("APPLICATION",
            is_self_referral=True, recent_applications_count=20,
            has_complete_profile=False, account_age_days=0.1, unique_ips_24h=10)
        assert result.score <= 1.0


class TestChurnModel:
    def setup_method(self):
        self.model = ChurnModel()

    def test_inactive_user_high_risk(self):
        pred = self.model.predict(days_since_last_login=90, total_applications=0, notifications_enabled=False)
        assert pred.risk_level in ("HIGH", "CRITICAL")
        assert pred.churn_score >= 0.5

    def test_active_user_low_risk(self):
        pred = self.model.predict(
            days_since_last_login=2, total_applications=5,
            has_complete_profile=True, notifications_enabled=True,
            profile_views_30d=10, search_count_30d=8)
        assert pred.risk_level == "LOW"
        assert pred.churn_score < 0.3

    def test_risk_levels(self):
        critical = self.model.predict(days_since_last_login=90, total_applications=0,
            notifications_enabled=False, has_complete_profile=False)
        assert critical.risk_level == "CRITICAL"
        assert "urgent" in critical.recommended_action.lower() or "re-engagement" in critical.recommended_action.lower()

    def test_score_capped(self):
        pred = self.model.predict(
            days_since_last_login=100, total_applications=0,
            has_complete_profile=False, notifications_enabled=False,
            profile_views_30d=0, search_count_30d=0)
        assert pred.churn_score <= 1.0
