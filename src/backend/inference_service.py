"""
Inference Service for NEXUS FastAPI Backend.
Executes real forecast generation under strict Zero-Leakage protocols:
1. Fixed-Origin Recursive Multi-Step Forecasting (zero future target leakage)
2. 1-Step-Ahead Rolling Horizon Forecasting (simulated weekly POS feedback)
"""

import time
import uuid
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd

from .model_registry import ModelRegistry
from .schemas import (
    ForecastRequest,
    ForecastResponse,
    PredictionItem,
    HistoricalPoint,
    UncertaintyMetadata,
)


class InferenceService:
    """
    Executes real inference pipelines using serialized model artifacts.
    """

    def __init__(self, registry: Optional[ModelRegistry] = None):
        self.registry = registry or ModelRegistry.get_instance()

    def generate_forecast(self, req: ForecastRequest) -> ForecastResponse:
        """
        Validates input, prepares features strictly from forecast origin T0 = 2012-06-15,
        and executes real model prediction.
        """
        start_time = time.time()

        # 1. Validation: Series must belong to the trained benchmark cohort
        if not self.registry.is_benchmark_cohort(req.store_id, req.dept_id):
            raise ValueError(
                f"Store {req.store_id} — Dept {req.dept_id} is outside the trained 20-series benchmark cohort. "
                "Supported Stores: [1, 10, 14, 20, 35]. Supported Departments: [1, 7, 72, 92]."
            )

        # 2. Validation: Horizon bounds
        if req.horizon_weeks < 1 or req.horizon_weeks > 19:
            raise ValueError(
                f"Requested horizon of {req.horizon_weeks} weeks is unsupported. Must be between 1 and 19 weeks."
            )

        # 3. Retrieve model artifact
        model, resolved_id = self.registry.get_model(req.model_id)
        model_meta = self.registry.manifest.get("models", {}).get(resolved_id, {})
        model_display_name = model_meta.get("name", resolved_id)

        store_meta = self.registry.get_store_meta(req.store_id)
        dept_meta = self.registry.get_dept_meta(req.dept_id)

        # 4. Historical context prior to origin T0 = 2012-06-15
        hist_df = self.registry.historical_context
        if hist_df is None or hist_df.empty:
            raise RuntimeError("Historical context artifact not loaded in registry.")

        series_hist = hist_df[
            (hist_df["Store"] == req.store_id) & (hist_df["Dept"] == req.dept_id)
        ].sort_values("Date").reset_index(drop=True)

        if series_hist.empty:
            raise ValueError(f"No historical records found for Store {req.store_id} — Dept {req.dept_id}.")

        sales_history = list(series_hist["Weekly_Sales"].values)
        dates_history = list(series_hist["Date"].dt.strftime("%Y-%m-%d").values)
        historical_weekly_baseline = float(np.mean(sales_history))
        historical_baseline_total = round(historical_weekly_baseline * req.horizon_weeks, 2)

        # Construct historical display points (last 16 weeks prior to origin)
        last_n = min(16, len(series_hist))
        hist_points = [
            HistoricalPoint(
                date=dates_history[-i],
                sales=float(round(sales_history[-i], 2)),
                is_holiday=bool(series_hist["IsHoliday"].iloc[-i])
            )
            for i in range(last_n, 0, -1)
        ]

        # 5. Future test covariates (exogenous indicators, zero target actuals)
        test_cov = self.registry.test_covariates
        if test_cov is None or test_cov.empty:
            raise RuntimeError("Test covariates artifact not loaded in registry.")

        series_test = test_cov[
            (test_cov["Store"] == req.store_id) & (test_cov["Dept"] == req.dept_id)
        ].sort_values("Date").reset_index(drop=True)

        horizon_cov = series_test.iloc[:req.horizon_weeks].copy()
        if len(horizon_cov) < req.horizon_weeks:
            raise ValueError(
                f"Available test weeks ({len(horizon_cov)}) is less than requested horizon ({req.horizon_weeks})."
            )

        # Ground truth test actuals for evaluation comparison (if present)
        test_acts = self.registry.test_actuals
        test_actual_map = {}
        if test_acts is not None and not test_acts.empty:
            acts_slice = test_acts[
                (test_acts["Store"] == req.store_id) & (test_acts["Dept"] == req.dept_id)
            ]
            for _, r in acts_slice.iterrows():
                d_str = r["Date"].strftime("%Y-%m-%d") if isinstance(r["Date"], pd.Timestamp) else str(r["Date"])[:10]
                test_actual_map[d_str] = float(r["Weekly_Sales"])

        # 6. Execute predictions
        feature_cols = self.registry.feature_columns
        predictions: List[PredictionItem] = []

        if req.protocol == "recursive_multistep":
            preds, lower_b, upper_b = self._predict_recursive(
                model=model,
                model_id=resolved_id,
                horizon_df=horizon_cov,
                sales_history=sales_history.copy(),
                series_hist_df=series_hist,
                feature_cols=feature_cols,
                confidence_interval=req.confidence_interval
            )
        else:  # rolling_onestep
            preds, lower_b, upper_b = self._predict_rolling_onestep(
                model=model,
                model_id=resolved_id,
                horizon_df=horizon_cov,
                sales_history=sales_history.copy(),
                series_hist_df=series_hist,
                test_actual_map=test_actual_map,
                feature_cols=feature_cols,
                confidence_interval=req.confidence_interval
            )

        # Format prediction items
        for i, (_, row) in enumerate(horizon_cov.iterrows()):
            d_str = row["Date"].strftime("%Y-%m-%d") if isinstance(row["Date"], pd.Timestamp) else str(row["Date"])[:10]
            holiday_name = None
            if row.get("is_thanksgiving") == 1:
                holiday_name = "Thanksgiving Surge"
            elif row.get("is_christmas") == 1:
                holiday_name = "Christmas Surge"
            elif row.get("is_super_bowl") == 1:
                holiday_name = "Super Bowl Weekend"
            elif row.get("is_labor_day") == 1:
                holiday_name = "Labor Day Surge"

            predictions.append(
                PredictionItem(
                    date=d_str,
                    predicted_sales=round(float(preds[i]), 2),
                    lower_bound=round(float(lower_b[i]), 2) if lower_b is not None else None,
                    upper_bound=round(float(upper_b[i]), 2) if upper_b is not None else None,
                    is_holiday=bool(row.get("IsHoliday", False)),
                    holiday_name=holiday_name,
                    actual_sales=test_actual_map.get(d_str)
                )
            )

        # 7. Uncertainty Metadata
        if resolved_id == "proposed-hybrid":
            uncertainty_info = UncertaintyMetadata(
                is_supported=True,
                calibrated=False,
                empirical_coverage_picp=72.11,
                nominal_coverage_target=round(req.confidence_interval * 100, 1),
                mpiw_dollars=22926.0,
                method="Heteroskedastic Residual Dispersion (+/- 1.96 * sigma_holiday)",
                warning="Uncalibrated heuristic intervals with empirical 72.11% coverage against 95% nominal target."
            )
        else:
            uncertainty_info = UncertaintyMetadata(
                is_supported=False,
                calibrated=False,
                empirical_coverage_picp=None,
                nominal_coverage_target=None,
                mpiw_dollars=None,
                method=None,
                warning=f"Selected model '{model_display_name}' does not compute uncertainty intervals."
            )

        # 8. Summary statistics
        projected_total = round(float(sum(preds)), 2)
        change_pct = round(
            ((projected_total - historical_baseline_total) / historical_baseline_total) * 100.0, 2
        ) if historical_baseline_total > 0 else 0.0

        latency_ms = round((time.time() - start_time) * 1000.0, 2)

        return ForecastResponse(
            forecast_id=f"fc-real-{uuid.uuid4().hex[:6]}",
            store_id=req.store_id,
            store_name=store_meta["name"],
            dept_id=req.dept_id,
            dept_name=dept_meta["name"],
            model_id=resolved_id,
            model_name=model_display_name,
            protocol=req.protocol,
            horizon_weeks=req.horizon_weeks,
            forecast_origin_date=self.registry.manifest.get("forecast_origin_date", "2012-06-15"),
            predictions=predictions,
            historical_context=hist_points,
            projected_total_sales=projected_total,
            historical_baseline_total=historical_baseline_total,
            weekly_baseline_average=round(historical_weekly_baseline, 2),
            change_percent=change_pct,
            uncertainty=uncertainty_info,
            metrics={
                "val_wape": model_meta.get("val_wape"),
                "test_wape": model_meta.get("test_wape"),
                "protocol": req.protocol,
            },
            latency_ms=latency_ms,
            status="Completed"
        )

    def _predict_recursive(
        self,
        model: Any,
        model_id: str,
        horizon_df: pd.DataFrame,
        sales_history: List[float],
        series_hist_df: pd.DataFrame,
        feature_cols: List[str],
        confidence_interval: float
    ) -> Tuple[np.ndarray, Optional[np.ndarray], Optional[np.ndarray]]:
        """
        Recursive multi-step forecast:
        At each forward step, future actual sales are withheld.
        The model rolls its own prior step prediction forward into autoregressive lags.
        """
        # Specialized direct models
        if model_id == "seasonal-naive":
            preds, _ = model.predict(horizon_df)
            return preds, None, None

        if model_id == "prophet":
            preds, _ = model.predict(horizon_df)
            return preds, None, None

        if model_id == "arima":
            preds, _ = model.predict(horizon_df)
            return preds, None, None

        series_mean = float(np.mean(sales_history))
        step_preds = []
        lower_bounds = []
        upper_bounds = []

        # Autoregressive recursive stepping
        for _, row in horizon_df.iterrows():
            row_dict = row.to_dict()
            n_hist = len(sales_history)

            # Autoregressive short lags from dynamic prediction history
            row_dict["sales_lag_1w"] = sales_history[-1] if n_hist >= 1 else series_mean
            row_dict["sales_lag_2w"] = sales_history[-2] if n_hist >= 2 else series_mean
            row_dict["sales_lag_4w"] = sales_history[-4] if n_hist >= 4 else series_mean
            row_dict["sales_lag_8w"] = sales_history[-8] if n_hist >= 8 else series_mean

            # Long 52w lag from pre-origin 2011 observed data
            row_dict["sales_lag_52w"] = sales_history[-52] if n_hist >= 52 else series_mean

            # Dynamic rolling statistics
            w4 = sales_history[-4:] if n_hist >= 4 else sales_history
            w12 = sales_history[-12:] if n_hist >= 12 else sales_history
            row_dict["sales_rolling_mean_4w"] = float(np.mean(w4))
            row_dict["sales_rolling_std_4w"] = float(np.std(w4)) if len(w4) > 1 else 0.0
            row_dict["sales_rolling_mean_12w"] = float(np.mean(w12))

            row_feat_df = pd.DataFrame([row_dict])

            if model_id == "proposed-hybrid":
                p_out, lb, ub, _, _ = model.predict(row_feat_df, confidence_level=confidence_interval)
                y_hat = float(p_out[0])
                lower_bounds.append(float(lb[0]))
                upper_bounds.append(float(ub[0]))
            elif model_id in ["hybrid-prophet-xgb", "hybrid-arima-xgb", "hybrid-stacking"]:
                p_out, _, _, _ = model.predict(row_feat_df)
                y_hat = float(p_out[0])
            else:
                p_out, _ = model.predict(row_feat_df)
                y_hat = float(p_out[0])

            step_preds.append(y_hat)
            sales_history.append(y_hat)

        preds_arr = np.array(step_preds, dtype=float)
        lb_arr = np.array(lower_bounds, dtype=float) if lower_bounds else None
        ub_arr = np.array(upper_bounds, dtype=float) if upper_bounds else None

        return preds_arr, lb_arr, ub_arr

    def _predict_rolling_onestep(
        self,
        model: Any,
        model_id: str,
        horizon_df: pd.DataFrame,
        sales_history: List[float],
        series_hist_df: pd.DataFrame,
        test_actual_map: Dict[str, float],
        feature_cols: List[str],
        confidence_interval: float
    ) -> Tuple[np.ndarray, Optional[np.ndarray], Optional[np.ndarray]]:
        """
        1-Step Rolling Horizon Forecast:
        At each forward step, simulates weekly replenishment where ground truth
        from week t-1 is observed as POS feedback for predicting week t.
        """
        if model_id == "seasonal-naive":
            preds, _ = model.predict(horizon_df)
            return preds, None, None

        if model_id == "prophet":
            preds, _ = model.predict(horizon_df)
            return preds, None, None

        if model_id == "arima":
            preds, _ = model.predict(horizon_df)
            return preds, None, None

        series_mean = float(np.mean(sales_history))
        step_preds = []
        lower_bounds = []
        upper_bounds = []

        for _, row in horizon_df.iterrows():
            d_str = row["Date"].strftime("%Y-%m-%d") if isinstance(row["Date"], pd.Timestamp) else str(row["Date"])[:10]
            row_dict = row.to_dict()
            n_hist = len(sales_history)

            # Lags constructed from observed history up to t-1
            row_dict["sales_lag_1w"] = sales_history[-1] if n_hist >= 1 else series_mean
            row_dict["sales_lag_2w"] = sales_history[-2] if n_hist >= 2 else series_mean
            row_dict["sales_lag_4w"] = sales_history[-4] if n_hist >= 4 else series_mean
            row_dict["sales_lag_8w"] = sales_history[-8] if n_hist >= 8 else series_mean
            row_dict["sales_lag_52w"] = sales_history[-52] if n_hist >= 52 else series_mean

            w4 = sales_history[-4:] if n_hist >= 4 else sales_history
            w12 = sales_history[-12:] if n_hist >= 12 else sales_history
            row_dict["sales_rolling_mean_4w"] = float(np.mean(w4))
            row_dict["sales_rolling_std_4w"] = float(np.std(w4)) if len(w4) > 1 else 0.0
            row_dict["sales_rolling_mean_12w"] = float(np.mean(w12))

            row_feat_df = pd.DataFrame([row_dict])

            if model_id == "proposed-hybrid":
                p_out, lb, ub, _, _ = model.predict(row_feat_df, confidence_level=confidence_interval)
                y_hat = float(p_out[0])
                lower_bounds.append(float(lb[0]))
                upper_bounds.append(float(ub[0]))
            elif model_id in ["hybrid-prophet-xgb", "hybrid-arima-xgb", "hybrid-stacking"]:
                p_out, _, _, _ = model.predict(row_feat_df)
                y_hat = float(p_out[0])
            else:
                p_out, _ = model.predict(row_feat_df)
                y_hat = float(p_out[0])

            step_preds.append(y_hat)

            # In 1-step rolling simulation, ground truth sales for week t (if available in POS)
            # is made available as the realized t-1 lag for week t+1
            actual_t = test_actual_map.get(d_str, y_hat)
            sales_history.append(actual_t)

        preds_arr = np.array(step_preds, dtype=float)
        lb_arr = np.array(lower_bounds, dtype=float) if lower_bounds else None
        ub_arr = np.array(upper_bounds, dtype=float) if upper_bounds else None

        return preds_arr, lb_arr, ub_arr
