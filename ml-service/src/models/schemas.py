"""
MATIEO ML Service — Pydantic Schemas
Request/response models for all ML endpoints
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# ── Predictions ─────────────────────────────────────────────────────────────

class TrendPredictionRequest(BaseModel):
    country: str
    cause_of_death: Optional[str] = None
    age_group: Optional[str] = None
    years_ahead: int = 3


class TrendPredictionResponse(BaseModel):
    country: str
    cause_of_death: Optional[str]
    predictions: List[Dict[str, Any]]   # [{ year, predicted_deaths, confidence }]
    model_version: str


# ── Clustering ───────────────────────────────────────────────────────────────

class ClusterRequest(BaseModel):
    country: Optional[str] = None
    year: Optional[int] = None
    n_clusters: int = 5


class ClusterResponse(BaseModel):
    clusters: List[Dict[str, Any]]      # [{ cluster_id, causes, centroid, size }]
    silhouette_score: float
    model_version: str


# ── NLP ──────────────────────────────────────────────────────────────────────

class BiographyNLPRequest(BaseModel):
    biography: str
    tribute_message: Optional[str] = None


class BiographyNLPResponse(BaseModel):
    themes: List[str]                   # e.g., ["family", "career", "faith"]
    sentiment: str                      # "positive", "reflective", "mixed"
    sentiment_score: float              # 0.0 - 1.0
    key_phrases: List[str]
    suggested_tags: List[str]


# ── Health ───────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    environment: str
    models_loaded: Dict[str, bool]
