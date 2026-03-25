"""gRPC servicer for churn prediction."""

import logging
from app.models.churn import ChurnModel
from app.proto import ml_service_pb2, ml_service_pb2_grpc

logger = logging.getLogger(__name__)


class ChurnPredictionServiceServicer(ml_service_pb2_grpc.ChurnPredictionServiceServicer):

    def __init__(self):
        self.model = ChurnModel()
        logger.info("ChurnPredictionService initialized with model version %s", self.model.MODEL_VERSION)

    def PredictChurn(self, request, context):
        prediction = self.model.predict(
            days_since_last_login=request.days_since_last_login,
            days_since_last_application=request.days_since_last_application,
            total_applications=request.total_applications,
            has_complete_profile=request.has_complete_profile,
            notifications_enabled=request.notifications_enabled,
            profile_views_30d=request.profile_views_30d,
            search_count_30d=request.search_count_30d,
        )

        return ml_service_pb2.ChurnPredictionResponse(
            churn_score=prediction.churn_score,
            risk_factors=prediction.risk_factors,
            risk_level=prediction.risk_level,
            recommended_action=prediction.recommended_action,
            model_version=prediction.model_version,
        )

    def BatchPredictChurn(self, request, context):
        predictions = []
        for candidate in request.candidates:
            pred = self.model.predict(
                days_since_last_login=candidate.days_since_last_login,
                days_since_last_application=candidate.days_since_last_application,
                total_applications=candidate.total_applications,
                has_complete_profile=candidate.has_complete_profile,
                notifications_enabled=candidate.notifications_enabled,
                profile_views_30d=candidate.profile_views_30d,
                search_count_30d=candidate.search_count_30d,
            )
            predictions.append(ml_service_pb2.ChurnPredictionResponse(
                churn_score=pred.churn_score,
                risk_factors=pred.risk_factors,
                risk_level=pred.risk_level,
                recommended_action=pred.recommended_action,
                model_version=pred.model_version,
            ))

        return ml_service_pb2.BatchChurnResponse(predictions=predictions)
