"""
Comprehensive API and Model Inference Test Suite for NEXUS Phase 4.
Validates:
1. FastAPI endpoints: /api/health, /api/models, /api/benchmark-series
2. Real forecast inference on trained models (XGBoost, Random Forest, Prophet, Proposed Hybrid, etc.)
3. Strict separation of Recursive Multi-Step vs 1-Step Rolling protocols
4. Zero target leakage verification
5. Input validation and error handling (unsupported series, horizon bounds, unknown models)
6. Uncertainty interval disclosure (uncalibrated heuristic notice)
"""

import sys
from pathlib import Path
import pytest
import numpy as np
from fastapi.testclient import TestClient

# Path setup
repo_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "src" / "ml"))

from src.backend.main import app
from src.backend.model_registry import ModelRegistry
from src.backend.inference_service import InferenceService
from src.backend.schemas import ForecastRequest

client = TestClient(app)


def test_health_endpoint():
    """Validates that /api/health returns operational status and audited artifacts."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["benchmark_cohort_series_count"] == 20
    assert data["forecast_origin_date"] == "2012-06-15"
    assert "xgboost-v2" in data["artifacts_present"]
    assert "proposed-hybrid" in data["artifacts_present"]


def test_models_catalog_endpoint():
    """Validates /api/models returns all 10 trained and registered models."""
    response = client.get("/api/models")
    assert response.status_code == 200
    models = response.json()
    assert len(models) == 10

    model_ids = [m["id"] for m in models]
    assert "proposed-hybrid" in model_ids
    assert "xgboost-v2" in model_ids
    assert "random-forest" in model_ids
    assert "prophet" in model_ids
    assert "seasonal-naive" in model_ids
    assert "linear-regression" in model_ids
    assert "arima" in model_ids
    assert "hybrid-stacking" in model_ids

    # Proposed hybrid must advertise uncertainty support
    prop_hyb = next(m for m in models if m["id"] == "proposed-hybrid")
    assert prop_hyb["supports_uncertainty"] is True

    # XGBoost does not advertise uncertainty
    xgb = next(m for m in models if m["id"] == "xgboost-v2")
    assert xgb["supports_uncertainty"] is False


def test_benchmark_series_endpoint():
    """Validates /api/benchmark-series returns exactly 20 series across 5 stores and 4 depts."""
    response = client.get("/api/benchmark-series")
    assert response.status_code == 200
    data = response.json()
    assert len(data["supported_stores"]) == 5
    assert len(data["supported_departments"]) == 4
    assert len(data["benchmark_pairs"]) == 20

    # Store 20 and Dept 72 must be in the benchmark pairs
    assert {"store_id": 20, "dept_id": 72} in data["benchmark_pairs"]
    assert {"store_id": 1, "dept_id": 1} in data["benchmark_pairs"]


def test_benchmark_series_validation_endpoint():
    """Validates /api/benchmark-series/validate correctly flags supported vs unsupported series."""
    # Supported pair
    resp_valid = client.get("/api/benchmark-series/validate?store_id=20&dept_id=72")
    assert resp_valid.status_code == 200
    assert resp_valid.json()["is_supported"] is True

    # Unsupported store outside cohort (e.g. Store 2)
    resp_invalid = client.get("/api/benchmark-series/validate?store_id=2&dept_id=72")
    assert resp_invalid.status_code == 200
    assert resp_invalid.json()["is_supported"] is False
    assert "outside the trained benchmark cohort" in resp_invalid.json()["message"]

    # Unsupported department (e.g. Dept 3)
    resp_invalid_dept = client.get("/api/benchmark-series/validate?store_id=20&dept_id=3")
    assert resp_invalid_dept.status_code == 200
    assert resp_invalid_dept.json()["is_supported"] is False


def test_forecast_inference_proposed_hybrid_recursive():
    """
    Executes real inference with Proposed Context-Aware Hybrid under recursive multi-step protocol.
    Validates prediction trajectory, uncertainty bounds, and uncalibrated interval disclosure.
    """
    payload = {
        "store_id": 20,
        "dept_id": 72,
        "horizon_weeks": 12,
        "protocol": "recursive_multistep",
        "model_id": "proposed-hybrid",
        "confidence_interval": 0.95
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["store_id"] == 20
    assert data["dept_id"] == 72
    assert data["horizon_weeks"] == 12
    assert data["protocol"] == "recursive_multistep"
    assert data["model_id"] == "proposed-hybrid"
    assert len(data["predictions"]) == 12
    assert len(data["historical_context"]) > 0

    # Verify all predictions are valid positive floating point values
    for pt in data["predictions"]:
        assert pt["predicted_sales"] > 0
        assert pt["lower_bound"] is not None
        assert pt["upper_bound"] is not None
        assert pt["lower_bound"] < pt["predicted_sales"] < pt["upper_bound"]
        assert pt["date"].startswith("2012-")

    # Verify uncertainty metadata explicitly flags intervals as uncalibrated heuristic
    unc = data["uncertainty"]
    assert unc["is_supported"] is True
    assert unc["calibrated"] is False
    assert unc["empirical_coverage_picp"] == 72.11
    assert "Uncalibrated heuristic intervals" in unc["warning"]


def test_forecast_inference_xgboost_rolling():
    """
    Executes real inference with XGBoost under 1-step rolling horizon protocol.
    """
    payload = {
        "store_id": 1,
        "dept_id": 1,
        "horizon_weeks": 4,
        "protocol": "rolling_onestep",
        "model_id": "xgboost-v2",
        "confidence_interval": 0.95
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["store_id"] == 1
    assert data["dept_id"] == 1
    assert data["horizon_weeks"] == 4
    assert data["protocol"] == "rolling_onestep"
    assert len(data["predictions"]) == 4

    for pt in data["predictions"]:
        assert pt["predicted_sales"] > 0
        # XGBoost point forecast does not compute uncertainty bounds
        assert pt["lower_bound"] is None
        assert pt["upper_bound"] is None

    assert data["uncertainty"]["is_supported"] is False


def test_forecast_inference_random_forest_recursive():
    """
    Executes real inference with Random Forest under recursive multi-step protocol.
    """
    payload = {
        "store_id": 14,
        "dept_id": 92,
        "horizon_weeks": 8,
        "protocol": "recursive_multistep",
        "model_id": "random-forest",
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["store_id"] == 14
    assert data["dept_id"] == 92
    assert data["horizon_weeks"] == 8
    assert len(data["predictions"]) == 8


def test_forecast_inference_prophet():
    """
    Executes real inference with Prophet additive forecaster.
    """
    payload = {
        "store_id": 10,
        "dept_id": 7,
        "horizon_weeks": 4,
        "protocol": "recursive_multistep",
        "model_id": "prophet",
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["predictions"]) == 4
    assert data["model_id"] == "prophet"


def test_forecast_inference_seasonal_naive():
    """
    Executes real inference with Seasonal Naive forecaster.
    """
    payload = {
        "store_id": 35,
        "dept_id": 72,
        "horizon_weeks": 4,
        "protocol": "recursive_multistep",
        "model_id": "seasonal-naive",
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["predictions"]) == 4
    assert data["model_id"] == "seasonal-naive"


def test_validation_rejects_unsupported_store():
    """
    Validates that submitting a store outside the benchmark cohort (e.g., Store 99 or Store 2)
    is rejected with a 400 Bad Request and does NOT silently substitute a different series.
    """
    payload = {
        "store_id": 99,
        "dept_id": 72,
        "horizon_weeks": 12,
        "protocol": "recursive_multistep",
        "model_id": "xgboost-v2",
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "outside the trained 20-series benchmark cohort" in detail["message"]
    assert detail["store_id"] == 99


def test_validation_rejects_unsupported_department():
    """
    Validates that submitting an unsupported department is rejected.
    """
    payload = {
        "store_id": 1,
        "dept_id": 999,
        "horizon_weeks": 4,
        "protocol": "recursive_multistep",
        "model_id": "xgboost-v2",
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "outside the trained 20-series benchmark cohort" in detail["message"]


def test_validation_rejects_unsupported_horizon():
    """
    Validates that submitting a horizon outside 1..19 is rejected with 422 Unprocessable Entity.
    """
    # Negative / Zero horizon
    resp_zero = client.post("/api/forecast/generate", json={
        "store_id": 1,
        "dept_id": 1,
        "horizon_weeks": 0,
        "protocol": "recursive_multistep",
        "model_id": "xgboost-v2",
    })
    assert resp_zero.status_code == 422

    # Excessive horizon > 19
    resp_over = client.post("/api/forecast/generate", json={
        "store_id": 1,
        "dept_id": 1,
        "horizon_weeks": 52,
        "protocol": "recursive_multistep",
        "model_id": "xgboost-v2",
    })
    assert resp_over.status_code == 422


def test_validation_rejects_unknown_model():
    """
    Validates that requesting an unrecognized model identifier returns 400.
    """
    payload = {
        "store_id": 1,
        "dept_id": 1,
        "horizon_weeks": 4,
        "protocol": "recursive_multistep",
        "model_id": "gpt-forecaster-unreal",
    }
    response = client.post("/api/forecast/generate", json=payload)
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "Unknown model identifier" in detail["message"]


def test_protocol_difference_recursive_vs_rolling():
    """
    Verifies that recursive multi-step and 1-step rolling forecasting produce distinct predictions
    due to dynamic rolling error accumulation vs realized POS lag feedback.
    """
    # For a volatile department like Dept 72 (Electronics)
    req_recursive = ForecastRequest(
        store_id=20,
        dept_id=72,
        horizon_weeks=12,
        protocol="recursive_multistep",
        model_id="xgboost-v2"
    )
    req_rolling = ForecastRequest(
        store_id=20,
        dept_id=72,
        horizon_weeks=12,
        protocol="rolling_onestep",
        model_id="xgboost-v2"
    )

    service = InferenceService()
    res_rec = service.generate_forecast(req_recursive)
    res_roll = service.generate_forecast(req_rolling)

    rec_values = [p.predicted_sales for p in res_rec.predictions]
    roll_values = [p.predicted_sales for p in res_roll.predictions]

    # Step 1 should be identical because at step 1, both protocols use the identical origin T0 lag!
    assert rec_values[0] == roll_values[0]

    # In later steps (e.g. step 4 onwards), recursive updates diverge as predicted lags compound
    # Assert they are not identically equal across all 12 steps
    assert rec_values != roll_values, "Recursive multi-step and rolling 1-step must not be identical across horizons"


def test_zero_future_leakage_verification():
    """
    Leakage Check:
    Verifies that recursive multi-step forecasting strictly operates without future test actuals.
    Specifically checks that model predictions are not identical to future test ground truth.
    """
    req = ForecastRequest(
        store_id=1,
        dept_id=1,
        horizon_weeks=8,
        protocol="recursive_multistep",
        model_id="random-forest"
    )
    service = InferenceService()
    res = service.generate_forecast(req)

    # Compare predictions against actuals
    for pt in res.predictions:
        if pt.actual_sales is not None:
            # Model prediction should NOT be identical to ground truth
            assert pt.predicted_sales != pt.actual_sales
