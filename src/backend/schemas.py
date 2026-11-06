"""
Pydantic V2 schemas for NEXUS FastAPI Backend.
Strict validation of forecast parameters, model identifiers, and protocols.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator, model_validator


class ForecastRequest(BaseModel):
    """
    Inference request payload for generating real forecasts.
    """
    @model_validator(mode="before")
    @classmethod
    def handle_department_alias(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "dept_id" not in data and "department_id" in data:
                data["dept_id"] = data["department_id"]
        return data

    store_id: int = Field(
        ...,
        description="Store identifier. Must belong to the trained benchmark cohort (1, 10, 14, 20, 35) or a validated supported series.",
        examples=[20]
    )
    dept_id: int = Field(
        ...,
        description="Department identifier. Must belong to the trained benchmark cohort (1, 7, 72, 92) or a validated supported series.",
        examples=[72]
    )
    horizon_weeks: int = Field(
        ...,
        ge=1,
        le=19,
        description="Forecast horizon in weeks. Supported values: 1 through 19 (standard UI presets: 4, 8, 12).",
        examples=[12]
    )
    protocol: Literal["recursive_multistep", "rolling_onestep"] = Field(
        default="recursive_multistep",
        description=(
            "Forecasting protocol: "
            "'recursive_multistep' (fixed-origin zero future target leakage, rolling model predictions forward) or "
            "'rolling_onestep' (1-step-ahead rolling horizon simulating weekly POS feedback)."
        ),
        examples=["recursive_multistep"]
    )
    model_id: str = Field(
        default="proposed-hybrid",
        description=(
            "Model algorithm identifier. Options include: "
            "'proposed-hybrid', 'xgboost-v2', 'random-forest', 'prophet', 'seasonal-naive', "
            "'linear-regression', 'arima', 'hybrid-stacking', 'hybrid-prophet-xgb', 'hybrid-arima-xgb'."
        ),
        examples=["proposed-hybrid"]
    )
    confidence_interval: float = Field(
        default=0.95,
        ge=0.50,
        le=0.99,
        description="Target nominal confidence interval (e.g., 0.90, 0.95, 0.99). Returned as labeled uncalibrated heuristic intervals.",
        examples=[0.95]
    )

    @field_validator("horizon_weeks")
    @classmethod
    def validate_horizon(cls, v: int) -> int:
        if v < 1 or v > 19:
            raise ValueError(f"Forecast horizon must be between 1 and 19 weeks. Received: {v}")
        return v


class PredictionItem(BaseModel):
    """Individual forecast trajectory step."""
    date: str = Field(..., description="Forecast Friday date (YYYY-MM-DD)")
    predicted_sales: float = Field(..., description="Model-generated weekly sales forecast ($)")
    lower_bound: Optional[float] = Field(None, description="Lower prediction bound ($) if uncertainty supported")
    upper_bound: Optional[float] = Field(None, description="Upper prediction bound ($) if uncertainty supported")
    is_holiday: bool = Field(False, description="Whether this week contains a major retail holiday")
    holiday_name: Optional[str] = Field(None, description="Holiday name if applicable")
    actual_sales: Optional[float] = Field(None, description="Ground truth out-of-time sales ($) for test-set evaluation")


class HistoricalPoint(BaseModel):
    """Historical point prior to forecast origin for context display."""
    date: str
    sales: float
    is_holiday: bool = False


class UncertaintyMetadata(BaseModel):
    """Explicitly documented uncertainty information preventing false calibration claims."""
    is_supported: bool = Field(..., description="Whether the selected model supports uncertainty interval generation")
    calibrated: bool = Field(False, description="Whether intervals are empirically calibrated (False per Phase 2.1 audit)")
    empirical_coverage_picp: Optional[float] = Field(None, description="Empirical PICP coverage percentage (e.g. 72.11%)")
    nominal_coverage_target: Optional[float] = Field(None, description="Nominal confidence target (e.g. 95.0%)")
    mpiw_dollars: Optional[float] = Field(None, description="Mean Prediction Interval Width ($)")
    method: Optional[str] = Field(None, description="Methodology used to compute interval bounds")
    warning: str = Field(..., description="Clear disclosure regarding calibration limitations")


class ForecastResponse(BaseModel):
    """Complete forecast execution payload returned to client."""
    forecast_id: str
    store_id: int
    store_name: str
    dept_id: int
    dept_name: str
    model_id: str
    model_name: str
    protocol: Literal["recursive_multistep", "rolling_onestep"]
    horizon_weeks: int
    forecast_origin_date: str
    predictions: List[PredictionItem]
    historical_context: List[HistoricalPoint]
    projected_total_sales: float
    historical_baseline_total: float
    weekly_baseline_average: float
    change_percent: float
    uncertainty: UncertaintyMetadata
    metrics: Dict[str, Any]
    latency_ms: float
    status: str = "Completed"


class ModelInfo(BaseModel):
    """Metadata for a registered model."""
    id: str
    name: str
    family: str
    version: str
    description: str
    supported_protocols: List[str]
    supports_uncertainty: bool
    val_wape: Optional[float] = None
    test_wape: Optional[float] = None
    test_mae: Optional[float] = None
    test_rmse: Optional[float] = None
    test_r2: Optional[float] = None
    training_time_sec: Optional[float] = None
    status: str


class ModelHealthResponse(BaseModel):
    """Health check response detailing loaded artifacts and backend status."""
    status: str
    artifacts_directory: str
    artifacts_present: Dict[str, bool]
    loaded_models: List[str]
    benchmark_cohort_series_count: int
    forecast_origin_date: str
    server_time: str


class StoreInfo(BaseModel):
    id: int
    name: str
    type: str
    region: str


class DeptInfo(BaseModel):
    id: int
    name: str
    category: str


class BenchmarkSeriesResponse(BaseModel):
    """Supported benchmark series metadata."""
    supported_stores: List[StoreInfo]
    supported_departments: List[DeptInfo]
    benchmark_pairs: List[Dict[str, int]]
    disclaimer: str
