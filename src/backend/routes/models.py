"""
Model catalog endpoints for NEXUS Backend.
"""

from typing import List
from fastapi import APIRouter, HTTPException
from ..model_registry import ModelRegistry
from ..schemas import ModelInfo

router = APIRouter(prefix="/api", tags=["Models"])


@router.get("/models", response_model=List[ModelInfo])
def list_models():
    """
    Returns list of all 10 supported forecasting models with validation/test metrics and capabilities.
    """
    registry = ModelRegistry.get_instance()
    manifest_models = registry.manifest.get("models", {})

    models_list = []
    for mid, meta in manifest_models.items():
        supported_protocols = []
        if meta.get("supports_recursive_multistep", True):
            supported_protocols.append("recursive_multistep")
        if meta.get("supports_rolling_onestep", True):
            supported_protocols.append("rolling_onestep")

        status = "Selected" if meta.get("best_point_forecaster") or meta.get("validation_tournament_winner") or mid == "proposed-hybrid" else "Challenger"

        models_list.append(
            ModelInfo(
                id=mid,
                name=meta.get("name", mid),
                family=meta.get("family", "Statistical/ML"),
                version="1.0.0",
                description=meta.get("uncertainty_notice", f"{meta.get('family')} forecasting model."),
                supported_protocols=supported_protocols,
                supports_uncertainty=meta.get("supports_uncertainty", False),
                val_wape=meta.get("val_wape"),
                test_wape=meta.get("test_wape"),
                status=status
            )
        )
    return models_list


@router.get("/models/{model_id}", response_model=ModelInfo)
def get_model_detail(model_id: str):
    """
    Returns metadata and capabilities for a specific model identifier.
    """
    registry = ModelRegistry.get_instance()
    try:
        _, resolved_id = registry.get_model(model_id)
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))

    meta = registry.manifest.get("models", {}).get(resolved_id, {})
    supported_protocols = []
    if meta.get("supports_recursive_multistep", True):
        supported_protocols.append("recursive_multistep")
    if meta.get("supports_rolling_onestep", True):
        supported_protocols.append("rolling_onestep")

    return ModelInfo(
        id=resolved_id,
        name=meta.get("name", resolved_id),
        family=meta.get("family", "Statistical/ML"),
        version="1.0.0",
        description=meta.get("uncertainty_notice", f"{meta.get('family')} forecasting model."),
        supported_protocols=supported_protocols,
        supports_uncertainty=meta.get("supports_uncertainty", False),
        val_wape=meta.get("val_wape"),
        test_wape=meta.get("test_wape"),
        status="Selected" if meta.get("best_point_forecaster") or resolved_id == "proposed-hybrid" else "Challenger"
    )
