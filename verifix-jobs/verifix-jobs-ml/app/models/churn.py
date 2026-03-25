"""Churn prediction model for candidate retention."""

from dataclasses import dataclass, field


@dataclass
class ChurnPrediction:
    churn_score: float
    risk_factors: list[str]
    risk_level: str
    recommended_action: str
    model_version: str


class ChurnModel:
    """Churn prediction using rule-based scoring.
    Designed to be replaced by CatBoost classifier once training data is available.
    """

    MODEL_VERSION = "rules-v2"

    def predict(
        self,
        days_since_last_login: int = 0,
        days_since_last_application: int = 0,
        total_applications: int = 0,
        has_complete_profile: bool = True,
        notifications_enabled: bool = True,
        profile_views_30d: int = 0,
        search_count_30d: int = 0,
    ) -> ChurnPrediction:
        score = 0.0
        factors: list[str] = []

        # Inactivity signals
        if days_since_last_login > 60:
            score += 0.35
            factors.append("INACTIVE_60_DAYS")
        elif days_since_last_login > 30:
            score += 0.20
            factors.append("INACTIVE_30_DAYS")
        elif days_since_last_login > 14:
            score += 0.10
            factors.append("INACTIVE_14_DAYS")

        # No applications ever
        if total_applications == 0:
            score += 0.25
            factors.append("NO_APPLICATIONS")
        elif days_since_last_application > 30:
            score += 0.15
            factors.append("NO_RECENT_APPLICATIONS")

        # Profile completeness
        if not has_complete_profile:
            score += 0.15
            factors.append("INCOMPLETE_PROFILE")

        # Notifications disabled
        if not notifications_enabled:
            score += 0.10
            factors.append("NOTIFICATIONS_DISABLED")

        # Low engagement
        if profile_views_30d == 0 and search_count_30d == 0:
            score += 0.15
            factors.append("ZERO_ENGAGEMENT_30D")
        elif profile_views_30d < 3 and search_count_30d < 3:
            score += 0.05
            factors.append("LOW_ENGAGEMENT_30D")

        score = min(score, 1.0)

        # Determine risk level
        if score >= 0.7:
            risk_level = "CRITICAL"
            action = "Send urgent re-engagement notification with personalized job matches"
        elif score >= 0.5:
            risk_level = "HIGH"
            action = "Send re-engagement digest with best matching vacancies"
        elif score >= 0.3:
            risk_level = "MEDIUM"
            action = "Include in weekly digest with highlighted new opportunities"
        else:
            risk_level = "LOW"
            action = "Standard engagement — no special action needed"

        return ChurnPrediction(
            churn_score=round(score, 4),
            risk_factors=factors,
            risk_level=risk_level,
            recommended_action=action,
            model_version=self.MODEL_VERSION,
        )
