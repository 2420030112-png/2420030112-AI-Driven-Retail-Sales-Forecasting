"""
Model Registry Service for NEXUS FastAPI Backend.
Loads, manages, and caches trained model artifacts and datasets with zero leakage.
"""

import sys
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import joblib
import pandas as pd

# Add src/ml to module path if not present
current_dir = Path(__file__).resolve().parent
repo_root = current_dir.parents[1]
ml_dir = repo_root / "src" / "ml"
if str(ml_dir) not in sys.path:
    sys.path.insert(0, str(ml_dir))
from .config import NEXUS_ARTIFACTS_DIR

BENCHMARK_STORES_META = {
    1: {"name": "Store 01 — Rogers Metro", "type": "Supercenter (Type A)", "region": "Ozark District"},
    10: {"name": "Store 10 — Phoenix Supercenter", "type": "Supercenter (Type B)", "region": "Southwest"},
    14: {"name": "Store 14 — Pittsburgh Suburban", "type": "Suburban (Type A)", "region": "Northeast"},
    20: {"name": "Store 20 — Philadelphia Metro", "type": "Supercenter (Type A)", "region": "Mid-Atlantic"},
    35: {"name": "Store 35 — Richmond Compact", "type": "Compact (Type C)", "region": "Mid-Atlantic"},
}

BENCHMARK_DEPTS_META = {
    1: {"name": "Dept 01 — Candy & Seasonal", "category": "High Seasonal Turn"},
    7: {"name": "Dept 07 — Sporting Goods", "category": "General Merchandise"},
    72: {"name": "Dept 72 — Electronics", "category": "Holiday Surge Volatile"},
    92: {"name": "Dept 92 — Grocery Staples", "category": "High Volume Staple"},
}

MODEL_ID_MAP = {
    "proposed-hybrid": "proposed_hybrid.joblib",
    "xgboost-v2": "xgboost.joblib",
    "random-forest": "random_forest.joblib",
    "prophet": "prophet.joblib",
    "seasonal-naive": "seasonal_naive.joblib",
    "linear-regression": "elastic_net.joblib",
    "arima": "sarimax.joblib",
    "hybrid-stacking": "stacking_ensemble.joblib",
    "hybrid-prophet-xgb": "hybrid_a.joblib",
    "hybrid-arima-xgb": "hybrid_b.joblib",
}


class ModelRegistry:
    """
    Singleton service managing model artifact loading and cohort validation.
    """
    _instance: Optional["ModelRegistry"] = None

    def __init__(self, artifacts_dir: Optional[Path] = None):
        self.artifacts_dir = artifacts_dir or NEXUS_ARTIFACTS_DIR
        self.manifest: Dict[str, Any] = {}
        self.feature_columns: List[str] = []
        self.historical_context: Optional[pd.DataFrame] = None
        self.test_covariates: Optional[pd.DataFrame] = None
        self.test_actuals: Optional[pd.DataFrame] = None
        self.scaler: Any = None
        self._loaded_models: Dict[str, Any] = {}
        self.initialize()

    @classmethod
    def get_instance(cls, artifacts_dir: Optional[Path] = None) -> "ModelRegistry":
        if cls._instance is None:
            cls._instance = cls(artifacts_dir)
        return cls._instance

    def initialize(self):
        """Loads manifest, metadata and feature definitions."""
        if not self.artifacts_dir.exists():
            return

        manifest_path = self.artifacts_dir / "manifest.json"
        if manifest_path.exists():
            with open(manifest_path, "r") as f:
                self.manifest = json.load(f)

        fc_path = self.artifacts_dir / "feature_columns.json"
        if fc_path.exists():
            with open(fc_path, "r") as f:
                self.feature_columns = json.load(f)

        scaler_path = self.artifacts_dir / "scaler.joblib"
        if scaler_path.exists():
            self.scaler = joblib.load(scaler_path)

        hist_path = self.artifacts_dir / "historical_context.csv"
        if hist_path.exists():
            self.historical_context = pd.read_csv(hist_path)
            self.historical_context["Date"] = pd.to_datetime(self.historical_context["Date"])

        test_cov_path = self.artifacts_dir / "test_covariates.csv"
        if test_cov_path.exists():
            self.test_covariates = pd.read_csv(test_cov_path)
            self.test_covariates["Date"] = pd.to_datetime(self.test_covariates["Date"])

        test_act_path = self.artifacts_dir / "test_actuals.csv"
        if test_act_path.exists():
            self.test_actuals = pd.read_csv(test_act_path)
            self.test_actuals["Date"] = pd.to_datetime(self.test_actuals["Date"])

    def is_benchmark_cohort(self, store_id: int, dept_id: int) -> bool:
        """Validates whether (store_id, dept_id) is in the evaluated 20-series cohort."""
        return store_id in BENCHMARK_STORES_META and dept_id in BENCHMARK_DEPTS_META

    def get_store_meta(self, store_id: int) -> Dict[str, Any]:
        return BENCHMARK_STORES_META.get(
            store_id,
            {"name": f"Store {store_id}", "type": "Unknown", "region": "Network"}
        )

    def get_dept_meta(self, dept_id: int) -> Dict[str, Any]:
        return BENCHMARK_DEPTS_META.get(
            dept_id,
            {"name": f"Dept {dept_id}", "category": "Merchandise"}
        )

    def get_model(self, model_id: str) -> Any:
        """
        Retrieves a trained model instance, lazy-loading if necessary.
        """
        # Alias normalization
        norm_id = model_id.lower().strip()
        if norm_id in ["proposed", "recommended", "hybrid-d"]:
            norm_id = "proposed-hybrid"
        elif norm_id in ["xgboost", "xgb"]:
            norm_id = "xgboost-v2"
        elif norm_id in ["rf"]:
            norm_id = "random-forest"
        elif norm_id in ["elasticnet", "elastic-net", "linear"]:
            norm_id = "linear-regression"
        elif norm_id in ["sarimax"]:
            norm_id = "arima"
        elif norm_id in ["stacking"]:
            norm_id = "hybrid-stacking"

        if norm_id not in MODEL_ID_MAP:
            raise ValueError(f"Unknown model identifier '{model_id}'. Supported models: {list(MODEL_ID_MAP.keys())}")

        if norm_id in self._loaded_models:
            return self._loaded_models[norm_id], norm_id

        artifact_filename = MODEL_ID_MAP[norm_id]
        artifact_path = self.artifacts_dir / artifact_filename
        if not artifact_path.exists():
            raise FileNotFoundError(
                f"Model artifact '{artifact_filename}' not found at {artifact_path}. "
                "Ensure train_and_save_artifacts.py has been executed."
            )

        model = joblib.load(artifact_path)
        self._loaded_models[norm_id] = model
        return model, norm_id

    def check_health(self) -> Dict[str, Any]:
        """Audits the availability of all model artifacts and datasets."""
        artifacts_status = {}
        for mid, fname in MODEL_ID_MAP.items():
            artifacts_status[mid] = (self.artifacts_dir / fname).exists()

        artifacts_status["scaler.joblib"] = (self.artifacts_dir / "scaler.joblib").exists()
        artifacts_status["feature_columns.json"] = (self.artifacts_dir / "feature_columns.json").exists()
        artifacts_status["historical_context.csv"] = (self.artifacts_dir / "historical_context.csv").exists()
        artifacts_status["test_covariates.csv"] = (self.artifacts_dir / "test_covariates.csv").exists()
        artifacts_status["manifest.json"] = (self.artifacts_dir / "manifest.json").exists()

        all_present = all(artifacts_status.values())
        status = "healthy" if all_present else "degraded" if any(artifacts_status.values()) else "unavailable"

        return {
            "status": status,
            "artifacts_directory": str(self.artifacts_dir),
            "artifacts_present": artifacts_status,
            "loaded_models": list(self._loaded_models.keys()),
            "benchmark_cohort_series_count": len(BENCHMARK_STORES_META) * len(BENCHMARK_DEPTS_META),
            "forecast_origin_date": self.manifest.get("forecast_origin_date", "2012-06-15"),
        }
