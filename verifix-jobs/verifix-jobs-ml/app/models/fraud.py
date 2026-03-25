"""Fraud detection model using rule-based scoring with ML-ready features."""

from dataclasses import dataclass, field


@dataclass
class FraudResult:
    score: float
    flags: list[str]
    is_fraud: bool
    model_version: str


class FraudModel:
    """Fraud detection for applications and referrals.
    Rule-based scoring designed to be enhanced with XGBoost classifier.
    """

    MODEL_VERSION = "rules-v2"
    FRAUD_THRESHOLD = 0.3

    def check(
        self,
        entity_type: str,
        recent_applications_count: int = 0,
        has_complete_profile: bool = True,
        is_self_referral: bool = False,
        duplicate_employer_applications: int = 0,
        account_age_days: float = 30.0,
        unique_ips_24h: int = 1,
    ) -> FraudResult:
        score = 0.0
        flags: list[str] = []

        # Self-referral check
        if is_self_referral:
            score += 0.8
            flags.append("SELF_REFERRAL")

        # Rapid-fire applications (>10 in last hour)
        if recent_applications_count > 10:
            score += 0.4
            flags.append("RAPID_FIRE_APPLICATIONS")
        elif recent_applications_count > 5:
            score += 0.2
            flags.append("HIGH_APPLICATION_RATE")

        # Incomplete profile (bot indicator)
        if not has_complete_profile:
            score += 0.2
            flags.append("INCOMPLETE_PROFILE")

        # Duplicate employer applications
        if duplicate_employer_applications > 3:
            score += 0.15
            flags.append("DUPLICATE_EMPLOYER_APPLICATIONS")
        elif duplicate_employer_applications > 0:
            score += 0.1
            flags.append("REPEAT_EMPLOYER_APPLICATION")

        # New account suspicious activity
        if account_age_days < 1 and recent_applications_count > 3:
            score += 0.3
            flags.append("NEW_ACCOUNT_BURST")
        elif account_age_days < 7 and recent_applications_count > 5:
            score += 0.15
            flags.append("YOUNG_ACCOUNT_HIGH_ACTIVITY")

        # Multiple IPs
        if unique_ips_24h > 5:
            score += 0.2
            flags.append("MULTIPLE_IPS")
        elif unique_ips_24h > 3:
            score += 0.1
            flags.append("SUSPICIOUS_IP_PATTERN")

        score = min(score, 1.0)
        return FraudResult(
            score=round(score, 4),
            flags=flags,
            is_fraud=score >= self.FRAUD_THRESHOLD,
            model_version=self.MODEL_VERSION,
        )
