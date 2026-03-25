"""gRPC servicer for candidate-vacancy matching."""

import logging
from app.models.matching import MatchingModel, CandidateFeatures, VacancyFeatures
from app.proto import ml_service_pb2, ml_service_pb2_grpc

logger = logging.getLogger(__name__)


class MatchingServiceServicer(ml_service_pb2_grpc.MatchingServiceServicer):

    def __init__(self):
        self.model = MatchingModel()
        logger.info("MatchingService initialized with model version %s", self.model.MODEL_VERSION)

    def ScoreCandidate(self, request, context):
        candidate = self._to_candidate(request.candidate)
        vacancy = self._to_vacancy(request.vacancy)

        score, factors = self.model.score(candidate, vacancy)

        return ml_service_pb2.ScoreCandidateResponse(
            match_score=score,
            factors=factors,
            model_version=self.model.MODEL_VERSION,
        )

    def BatchScore(self, request, context):
        vacancy = self._to_vacancy(request.vacancy)
        candidates = [self._to_candidate(c) for c in request.candidates]
        results = self.model.batch_score(candidates, vacancy)

        responses = []
        for score, factors in results:
            responses.append(ml_service_pb2.ScoreCandidateResponse(
                match_score=score,
                factors=factors,
                model_version=self.model.MODEL_VERSION,
            ))

        return ml_service_pb2.BatchScoreResponse(scores=responses)

    @staticmethod
    def _to_candidate(proto) -> CandidateFeatures:
        return CandidateFeatures(
            city=proto.city,
            preferred_categories=list(proto.preferred_categories),
            preferred_salary=proto.preferred_salary,
            skills=list(proto.skills),
            education_level=proto.education_level,
            myid_verified=proto.myid_verified,
            total_applications=proto.total_applications,
            hired_count=proto.hired_count,
            avg_tenure_days=proto.avg_tenure_days,
        )

    @staticmethod
    def _to_vacancy(proto) -> VacancyFeatures:
        return VacancyFeatures(
            city=proto.city,
            category=proto.category,
            salary_from=proto.salary_from,
            salary_to=proto.salary_to,
            required_skills=list(proto.required_skills),
            employment_type=proto.employment_type,
            is_mass_hiring=proto.is_mass_hiring,
            positions_count=proto.positions_count,
        )
