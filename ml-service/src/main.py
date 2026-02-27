"""
MATIEO ML Service — FastAPI entry point
Handles: mortality predictions, cause clustering, biography NLP
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.config import settings
from src.routers import health, predictions, clustering, nlp


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load ML models into memory
    print(f"🚀 MATIEO ML Service starting ({settings.environment})")
    # TODO: pre-load scikit-learn models here
    yield
    # Shutdown
    print("ML Service shutting down")


app = FastAPI(
    title="MATIEO ML Service",
    description="AI/ML features: mortality predictions, clustering, NLP",
    version="0.1.0",
    lifespan=lifespan,
    # Only expose docs in non-production
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
)

# CORS — only allow requests from Node API (internal Render URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Routers
app.include_router(health.router)
app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(clustering.router, prefix="/clustering", tags=["clustering"])
app.include_router(nlp.router, prefix="/nlp", tags=["nlp"])
