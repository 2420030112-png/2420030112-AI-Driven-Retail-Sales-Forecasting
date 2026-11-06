"""
Forecast Generation endpoints for NEXUS Backend.
"""

from fastapi import APIRouter, HTTPException, status
from ..schemas import ForecastRequest, ForecastResponse
from ..inference_service import InferenceService

router = APIRouter(prefix="/api/forecast", tags=["Forecasting"])
inference_service = InferenceService()


@router.post("/generate", response_model=ForecastResponse)
def generate_forecast(req: ForecastRequest):
    """
    Executes real forecast inference on the trained benchmark models.
    Supports:
    - Fixed-Origin Recursive Multi-Step (zero target leakage)
    - 1-Step-Ahead Rolling Horizon (simulated weekly POS feedback)
    """
    try:
        response = inference_service.generate_forecast(req)
        return response
    except ValueError as e:
        # Client input validation error (unsupported series, horizon bounds, unknown model)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid Forecast Request",
                "message": str(e),
                "store_id": req.store_id,
                "dept_id": req.dept_id,
                "horizon_weeks": req.horizon_weeks,
                "model_id": req.model_id,
            }
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Model Artifact Unavailable",
                "message": str(e),
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Inference Execution Failure",
                "message": str(e)
            }
        )
