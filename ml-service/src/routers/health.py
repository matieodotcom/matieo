from fastapi import APIRouter
from src.models.schemas import HealthResponse
from src.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        environment=settings.environment,
        models_loaded={
            "mortality_predictor": False,   # Update to True when model is loaded
            "cluster_model": False,
            "nlp_pipeline": False,
        }
    )
