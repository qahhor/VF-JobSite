from app.services.matching_service import MatchingServiceServicer
from app.services.salary_service import SalaryPredictionServiceServicer
from app.services.fraud_service import FraudDetectionServiceServicer
from app.services.churn_service import ChurnPredictionServiceServicer

__all__ = [
    "MatchingServiceServicer",
    "SalaryPredictionServiceServicer",
    "FraudDetectionServiceServicer",
    "ChurnPredictionServiceServicer",
]
