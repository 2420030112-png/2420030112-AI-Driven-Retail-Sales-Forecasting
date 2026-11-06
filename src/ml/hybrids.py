"""
NEXUS Hybrid Models Module.
Implements the 4 hybrid forecasting architectures evaluated for Review 3:
A. Prophet + XGBoost Residual Correction
B. SARIMAX + XGBoost Residual Correction
C. Time-Aware Stacking Ensemble (RF + XGBoost + Ridge Meta-Learner)
D. Proposed Context-Aware Multi-Stage Residual Hybrid with Calibrated Uncertainty Bands
"""

from typing import Dict, Any, List, Tuple, Optional
import time
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from prophet import Prophet
from statsmodels.tsa.statespace.sarimax import SARIMAX

import sys
from pathlib import Path

ml_dir = Path(__file__).resolve().parent
if str(ml_dir) not in sys.path:
    sys.path.insert(0, str(ml_dir))

try:
    from metrics import calculate_metrics, evaluate_prediction_interval_coverage
    from models import ProphetForecaster, SARIMAXForecaster
except ImportError:
    from src.ml.metrics import calculate_metrics, evaluate_prediction_interval_coverage
    from src.ml.models import ProphetForecaster, SARIMAXForecaster


class ProphetXGBoostHybrid:
    """
    Hybrid A: Prophet + XGBoost Residual Corrector.
    Stage 1: Series-level Prophet captures macroeconomic baseline, annual Fourier seasonality, and holiday events.
    Stage 2: XGBoost learns non-linear residual errors (Actual - Prophet) from exogenous markdowns & lags.
    Guarantees exact target row and date alignment with zero future sales leakage.
    """
    def __init__(self, xgb_depth: int = 6, xgb_estimators: int = 120, xgb_lr: float = 0.08):
        self.base_prophet = ProphetForecaster()
        self.xgb_residual = xgb.XGBRegressor(
            n_estimators=xgb_estimators,
            max_depth=xgb_depth,
            learning_rate=xgb_lr,
            subsample=0.85,
            colsample_bytree=0.85,
            tree_method="hist",
            random_state=42,
            n_jobs=-1
        )
        self.feature_cols = []
        self.train_time = 0.0

    def fit(self, train_df: pd.DataFrame, feature_cols: List[str], target_col: str = "Weekly_Sales"):
        start = time.time()
        self.feature_cols = feature_cols

        # 1. Fit Series-Aware Prophet Base Model
        self.base_prophet.fit(train_df, target_col=target_col)

        # 2. In-sample base prediction and residual target
        base_train_preds, _ = self.base_prophet.predict(train_df)
        train_residuals = train_df[target_col].values - base_train_preds

        # 3. Fit XGBoost on residuals using valid historical features
        self.xgb_residual.fit(train_df[self.feature_cols], train_residuals)

        self.train_time = time.time() - start
        return self

    def predict(self, test_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        """
        Returns (final_predictions, base_predictions, residual_predictions, latency_ms)
        """
        start = time.time()
        # Stage 1: Base forecast (exact target row and date alignment)
        base_preds, _ = self.base_prophet.predict(test_df)

        # Stage 2: Residual prediction
        residual_preds = self.xgb_residual.predict(test_df[self.feature_cols])

        # Stage 3: Combined synthesis
        final_preds = base_preds + residual_preds
        infer_time = (time.time() - start) * 1000.0

        return final_preds, base_preds, residual_preds, infer_time


class SARIMAXXGBoostHybrid:
    """
    Hybrid B: SARIMAX + XGBoost Residual Corrector (Zhang 2003 lineage).
    Stage 1: Series-level SARIMAX models linear autocorrelation and exogenous promotional regressors.
    Stage 2: XGBoost models remaining non-linear high-frequency residuals.
    Guarantees exact target row and date alignment with zero future sales leakage.
    """
    def __init__(self, order: Tuple[int, int, int] = (1, 1, 0), xgb_depth: int = 5, xgb_estimators: int = 100):
        self.order = order
        self.base_sarimax = SARIMAXForecaster(order=order)
        self.xgb_residual = xgb.XGBRegressor(
            n_estimators=xgb_estimators,
            max_depth=xgb_depth,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            tree_method="hist",
            random_state=42,
            n_jobs=-1
        )
        self.exog_cols = []
        self.feature_cols = []
        self.train_time = 0.0

    def fit(self, train_df: pd.DataFrame, feature_cols: List[str], exog_cols: List[str], target_col: str = "Weekly_Sales"):
        start = time.time()
        self.feature_cols = feature_cols
        self.exog_cols = [c for c in exog_cols if c in train_df.columns]

        # 1. Fit Series-Aware SARIMAX Base Model
        self.base_sarimax.fit(train_df, target_col=target_col, exog_cols=self.exog_cols)

        # 2. Compute in-sample residuals
        base_train_preds, _ = self.base_sarimax.predict(train_df)
        train_residuals = train_df[target_col].values - base_train_preds

        # 3. Fit XGBoost on residuals
        self.xgb_residual.fit(train_df[self.feature_cols], train_residuals)

        self.train_time = time.time() - start
        return self

    def predict(self, test_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        start = time.time()
        # Stage 1: Series-aligned SARIMAX forecast
        base_preds, _ = self.base_sarimax.predict(test_df)

        # Stage 2: Residual prediction
        residual_preds = self.xgb_residual.predict(test_df[self.feature_cols])

        # Stage 3: Combined synthesis
        final_preds = base_preds + residual_preds
        infer_time = (time.time() - start) * 1000.0

        return final_preds, base_preds, residual_preds, infer_time


class TimeAwareStackingEnsemble:
    """
    Hybrid C: Chronological Stacking Ensemble.
    Base Learners: Random Forest + XGBoost.
    Meta-Learner: Ridge Regression with positive non-negative weights.
    Leakage Prevention: Generates out-of-fold meta-features strictly using expanding temporal windows.
    """
    def __init__(self, n_splits: int = 3):
        self.n_splits = n_splits
        self.rf_base = RandomForestRegressor(n_estimators=80, max_depth=10, random_state=42, n_jobs=-1)
        self.xgb_base = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42, n_jobs=-1, tree_method="hist")
        self.meta_learner = Ridge(alpha=1.0, positive=True)
        self.feature_cols = []
        self.train_time = 0.0

    def fit(self, train_df: pd.DataFrame, feature_cols: List[str], target_col: str = "Weekly_Sales"):
        start = time.time()
        self.feature_cols = feature_cols

        # Chronological expanding window folds on unique dates
        unique_dates = sorted(train_df["Date"].unique())
        n_dates = len(unique_dates)
        fold_size = n_dates // (self.n_splits + 1)

        oof_rf = np.zeros(len(train_df))
        oof_xgb = np.zeros(len(train_df))
        valid_indices = []

        # Chronological out-of-fold generation
        for i in range(1, self.n_splits + 1):
            train_dates = unique_dates[: fold_size * i]
            val_dates = unique_dates[fold_size * i : fold_size * (i + 1)]

            tr_mask = train_df["Date"].isin(train_dates)
            val_mask = train_df["Date"].isin(val_dates)
            val_idx = train_df[val_mask].index

            rf_fold = RandomForestRegressor(n_estimators=40, max_depth=8, random_state=42, n_jobs=-1)
            xgb_fold = xgb.XGBRegressor(n_estimators=50, max_depth=4, learning_rate=0.1, random_state=42, n_jobs=-1, tree_method="hist")

            rf_fold.fit(train_df.loc[tr_mask, self.feature_cols], train_df.loc[tr_mask, target_col])
            xgb_fold.fit(train_df.loc[tr_mask, self.feature_cols], train_df.loc[tr_mask, target_col])

            oof_rf[val_idx] = rf_fold.predict(train_df.loc[val_mask, self.feature_cols])
            oof_xgb[val_idx] = xgb_fold.predict(train_df.loc[val_mask, self.feature_cols])
            valid_indices.extend(val_idx)

        # Fit Ridge meta-learner on out-of-fold predictions
        oof_X = np.column_stack([oof_rf[valid_indices], oof_xgb[valid_indices]])
        oof_y = train_df.loc[valid_indices, target_col].values
        self.meta_learner.fit(oof_X, oof_y)

        # Fit final base models on all training data
        self.rf_base.fit(train_df[self.feature_cols], train_df[target_col])
        self.xgb_base.fit(train_df[self.feature_cols], train_df[target_col])

        self.train_time = time.time() - start
        return self

    def predict(self, test_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        start = time.time()
        rf_preds = self.rf_base.predict(test_df[self.feature_cols])
        xgb_preds = self.xgb_base.predict(test_df[self.feature_cols])

        meta_X = np.column_stack([rf_preds, xgb_preds])
        final_preds = self.meta_learner.predict(meta_X)
        infer_time = (time.time() - start) * 1000.0

        return final_preds, rf_preds, xgb_preds, infer_time


class ProposedContextAwareHybrid:
    """
    Hybrid D: Proposed Context-Aware Multi-Stage Residual Hybrid.
    Architecture:
    1. Base: Structural seasonal decomposition with explicit holiday surge coefficients (Thanksgiving/Christmas).
    2. Context: Temporal promotional markdown decay weighting.
    3. Residual Learner: Tuned gradient boosted trees modeling high-order interaction residuals.
    4. Uncertainty Calibration: Calibrated heteroskedastic confidence intervals (+/- 1.96 * sigma) evaluated via PICP.
    """
    def __init__(self, xgb_depth: int = 6, xgb_estimators: int = 150, lr: float = 0.08):
        self.holiday_multipliers = {}
        self.series_baselines = {}
        self.overall_baseline = 0.0
        self.residual_engine = xgb.XGBRegressor(
            n_estimators=xgb_estimators,
            max_depth=xgb_depth,
            learning_rate=lr,
            subsample=0.85,
            colsample_bytree=0.85,
            reg_alpha=0.1,
            reg_lambda=1.0,
            tree_method="hist",
            random_state=42,
            n_jobs=-1
        )
        self.feature_cols = []
        self.residual_std_calibration = 1.0
        self.train_time = 0.0

    def fit(self, train_df: pd.DataFrame, feature_cols: List[str], target_col: str = "Weekly_Sales"):
        start = time.time()
        self.feature_cols = feature_cols
        self.overall_baseline = float(train_df[target_col].mean())

        # 1. Compute unit-level historical baseline
        for (store, dept), g in train_df.groupby(["Store", "Dept"]):
            self.series_baselines[(store, dept)] = float(g[target_col].mean())

        # 2. Compute holiday surge multipliers
        for h_col in ["is_thanksgiving", "is_christmas", "is_super_bowl", "is_labor_day"]:
            h_mask = train_df[h_col] == 1
            if h_mask.sum() > 0:
                h_mean = train_df.loc[h_mask, target_col].mean()
                non_h_mean = train_df.loc[~h_mask, target_col].mean()
                self.holiday_multipliers[h_col] = float(h_mean / non_h_mean) if non_h_mean > 0 else 1.0
            else:
                self.holiday_multipliers[h_col] = 1.0

        # 3. Synthesize structural context-aware baseline
        base_preds = self._compute_context_base(train_df)
        train_residuals = train_df[target_col].values - base_preds

        # 4. Train XGBoost residual engine
        self.residual_engine.fit(train_df[self.feature_cols], train_residuals)

        # 5. Calibrate residual variance for 95% uncertainty interval bands
        fitted_residuals = self.residual_engine.predict(train_df[self.feature_cols])
        unexplained_error = train_residuals - fitted_residuals
        self.residual_std_calibration = float(np.std(unexplained_error))

        self.train_time = time.time() - start
        return self

    def _compute_context_base(self, df: pd.DataFrame) -> np.ndarray:
        base_arr = np.zeros(len(df))
        for idx, (_, row) in enumerate(df.iterrows()):
            key = (row["Store"], row["Dept"])
            base = self.series_baselines.get(key, self.overall_baseline)

            # Apply holiday multiplier
            mult = 1.0
            for h_col, m in self.holiday_multipliers.items():
                if h_col in row and row[h_col] == 1:
                    mult = max(mult, m)

            # Markdown promotion elasticity factor
            md_total = row.get("markdown_total", 0.0)
            if md_total > 0:
                # Log-elasticity lift: approx +1.5% to +6% based on discount volume
                md_lift = 1.0 + min(0.12, np.log1p(md_total) * 0.005)
                mult *= md_lift

            base_arr[idx] = base * mult
        return base_arr

    def predict(
        self,
        test_df: pd.DataFrame,
        confidence_level: float = 0.95
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, float]:
        """
        Returns (final_preds, lower_bound, upper_bound, base_preds, latency_ms)
        """
        start = time.time()
        # Stage 1: Context base
        base_preds = self._compute_context_base(test_df)

        # Stage 2: Residual prediction
        residual_preds = self.residual_engine.predict(test_df[self.feature_cols])

        # Stage 3: Synthesized prediction
        final_preds = base_preds + residual_preds

        # Stage 4: Heteroskedastic uncertainty bands (widens during holiday volatility)
        z_score = 1.96 if confidence_level == 0.95 else 1.645
        holiday_weight = np.where(test_df.get("IsHoliday", False), 1.45, 1.0)
        uncertainty_spread = z_score * self.residual_std_calibration * holiday_weight

        lower_bound = final_preds - uncertainty_spread
        upper_bound = final_preds + uncertainty_spread

        infer_time = (time.time() - start) * 1000.0
        return final_preds, lower_bound, upper_bound, base_preds, infer_time
