"""Embedding service for semantic search using sentence-transformers."""

import hashlib
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

# Lazy-load model to avoid startup delay
_model = None

def get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer('all-MiniLM-L6-v2')  # 384 dimensions, fast
            logger.info("Embedding model loaded: all-MiniLM-L6-v2")
        except ImportError:
            logger.warning("sentence-transformers not installed, using random embeddings")
            _model = "fallback"
    return _model


def generate_embedding(text: str) -> list[float]:
    """Generate 384-dim embedding for text."""
    model = get_model()
    if model == "fallback":
        import numpy as np
        np.random.seed(hash(text) % 2**32)
        return np.random.randn(384).tolist()
    return model.encode(text).tolist()


def text_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def build_vacancy_text(title: str, description: str = "", category: str = "", city: str = "") -> str:
    """Build searchable text from vacancy fields."""
    parts = [title]
    if category:
        parts.append(category)
    if city:
        parts.append(city)
    if description:
        parts.append(description[:500])
    return " ".join(parts)


def build_candidate_text(name: str = "", skills: list[str] = None, city: str = "", categories: list[str] = None) -> str:
    """Build searchable text from candidate profile."""
    parts = []
    if name:
        parts.append(name)
    if city:
        parts.append(city)
    if skills:
        parts.append(" ".join(skills))
    if categories:
        parts.append(" ".join(categories))
    return " ".join(parts) if parts else "candidate"
