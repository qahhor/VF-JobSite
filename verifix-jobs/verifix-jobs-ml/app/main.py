import asyncio
import logging
from contextlib import asynccontextmanager

import grpc
from concurrent import futures
from fastapi import FastAPI
from pydantic import BaseModel

from app.services.matching_service import MatchingServiceServicer
from app.services.salary_service import SalaryPredictionServiceServicer
from app.services.fraud_service import FraudDetectionServiceServicer
from app.services.churn_service import ChurnPredictionServiceServicer
from app.services.embedding_service import generate_embedding, build_vacancy_text, build_candidate_text, text_hash
from app.proto import ml_service_pb2_grpc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

grpc_server = None


def start_grpc_server():
    global grpc_server
    grpc_server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ml_service_pb2_grpc.add_MatchingServiceServicer_to_server(MatchingServiceServicer(), grpc_server)
    ml_service_pb2_grpc.add_SalaryPredictionServiceServicer_to_server(SalaryPredictionServiceServicer(), grpc_server)
    ml_service_pb2_grpc.add_FraudDetectionServiceServicer_to_server(FraudDetectionServiceServicer(), grpc_server)
    ml_service_pb2_grpc.add_ChurnPredictionServiceServicer_to_server(ChurnPredictionServiceServicer(), grpc_server)
    grpc_server.add_insecure_port("[::]:50051")
    grpc_server.start()
    logger.info("gRPC server started on port 50051")


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_grpc_server()
    yield
    if grpc_server:
        grpc_server.stop(grace=5)


app = FastAPI(title="Verifix Jobs ML", version="1.1.0", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "grpc": "running", "version": "1.1.0"}


# ==================== Embedding API ====================

class EmbeddingRequest(BaseModel):
    text: str

class VacancyEmbeddingRequest(BaseModel):
    title: str
    description: str = ""
    category: str = ""
    city: str = ""

class CandidateEmbeddingRequest(BaseModel):
    name: str = ""
    skills: list[str] = []
    city: str = ""
    categories: list[str] = []

class EmbeddingResponse(BaseModel):
    embedding: list[float]
    dimensions: int
    text_hash: str

@app.post("/api/v1/embeddings/text", response_model=EmbeddingResponse)
def embed_text(req: EmbeddingRequest):
    emb = generate_embedding(req.text)
    return EmbeddingResponse(embedding=emb, dimensions=len(emb), text_hash=text_hash(req.text))

@app.post("/api/v1/embeddings/vacancy", response_model=EmbeddingResponse)
def embed_vacancy(req: VacancyEmbeddingRequest):
    text = build_vacancy_text(req.title, req.description, req.category, req.city)
    emb = generate_embedding(text)
    return EmbeddingResponse(embedding=emb, dimensions=len(emb), text_hash=text_hash(text))

@app.post("/api/v1/embeddings/candidate", response_model=EmbeddingResponse)
def embed_candidate(req: CandidateEmbeddingRequest):
    text = build_candidate_text(req.name, req.skills, req.city, req.categories)
    emb = generate_embedding(text)
    return EmbeddingResponse(embedding=emb, dimensions=len(emb), text_hash=text_hash(text))

@app.post("/api/v1/search/semantic")
def semantic_search(req: EmbeddingRequest):
    """Generate query embedding for semantic search — client uses this with pgvector <=> operator."""
    emb = generate_embedding(req.text)
    return {"query_embedding": emb, "dimensions": len(emb)}
