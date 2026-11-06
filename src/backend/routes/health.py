"""
Health and Diagnostic endpoints for NEXUS Backend.
"""

from datetime import datetime
from fastapi import APIRouter
from ..model_registry import ModelRegistry
from ..schemas import ModelHealthResponse

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health", response_model=ModelHealthResponse)
def get_health():
    """
    Returns deployment health status, verified artifact files, and benchmark cohort metadata.
    """
    registry = ModelRegistry.get_instance()
    audit = registry.check_health()

    return ModelHealthResponse(
        status=audit["status"],
        artifacts_directory=audit["artifacts_directory"],
        artifacts_present=audit["artifacts_present"],
        loaded_models=audit["loaded_models"],
        benchmark_cohort_series_count=audit["benchmark_cohort_series_count"],
        forecast_origin_date=audit["forecast_origin_date"],
        server_time=datetime.now().isoformat()
    )
