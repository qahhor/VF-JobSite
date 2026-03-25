"""gRPC servicer for fraud detection."""

import logging
from app.models.fraud import FraudModel
from app.proto import ml_service_pb2, ml_service_pb2_grpc

logger = logging.getLogger(__name__)


class FraudDetectionServiceServicer(ml_service_pb2_grpc.FraudDetectionServiceServicer):

    def __init__(self):
        self.model = FraudModel()
        logger.info("FraudDetectionService initialized with model version %s", self.model.MODEL_VERSION)

    def CheckFraud(self, request, context):
        result = self.model.check(
            entity_type=request.entity_type,
            recent_applications_count=request.recent_applications_count,
            has_complete_profile=request.has_complete_profile,
            is_self_referral=request.is_self_referral,
            duplicate_employer_applications=request.duplicate_employer_applications,
            account_age_days=request.account_age_days,
            unique_ips_24h=request.unique_ips_24h,
        )

        return ml_service_pb2.FraudCheckResponse(
            score=result.score,
            flags=result.flags,
            is_fraud=result.is_fraud,
            model_version=result.model_version,
        )
