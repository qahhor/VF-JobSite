"""gRPC servicer for salary prediction."""

import logging
from app.models.salary import SalaryModel
from app.proto import ml_service_pb2, ml_service_pb2_grpc

logger = logging.getLogger(__name__)


class SalaryPredictionServiceServicer(ml_service_pb2_grpc.SalaryPredictionServiceServicer):

    def __init__(self):
        self.model = SalaryModel()
        logger.info("SalaryPredictionService initialized with model version %s", self.model.MODEL_VERSION)

    def PredictSalary(self, request, context):
        prediction = self.model.predict(
            category=request.category,
            city=request.city,
            employment_type=request.employment_type,
            education_level=request.education_level,
            experience_years=request.experience_years,
            skills=list(request.skills),
        )

        return ml_service_pb2.SalaryPredictionResponse(
            p25=prediction.p25,
            median=prediction.median,
            p75=prediction.p75,
            sample_size=prediction.sample_size,
            confidence=prediction.confidence,
            model_version=prediction.model_version,
        )
