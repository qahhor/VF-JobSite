from app.models.matching import MatchingModel, CandidateFeatures, VacancyFeatures
from app.models.salary import SalaryModel, SalaryPrediction
from app.models.fraud import FraudModel, FraudResult
from app.models.churn import ChurnModel, ChurnPrediction

__all__ = [
    "MatchingModel", "CandidateFeatures", "VacancyFeatures",
    "SalaryModel", "SalaryPrediction",
    "FraudModel", "FraudResult",
    "ChurnModel", "ChurnPrediction",
]
