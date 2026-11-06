"""
NEXUS Evaluation Metrics Module.
Calculates rigorous, scientifically sound time-series demand forecasting metrics:
MAE, RMSE, Safe-MAPE, WAPE, sMAPE, R-squared, training duration, and inference latency.
Handles zero and negative sales explicitly.
"""

from typing import Dict, Any, Union
import time
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def calculate_metrics(
    y_true: Union[np.ndarray, pd.Series],
    y_pred: Union[np.ndarray, pd.Series],
    train_time_sec: float = 0.0,
    infer_time_ms: float = 0.0,
    near_zero_threshold: float = 10.0
) -> Dict[str, Any]:
    """
    Computes all standard and robust forecasting accuracy metrics.
    
    Args:
        y_true: Ground truth actual sales.
        y_pred: Model predictions.
        train_time_sec: Model training duration in seconds.
        infer_time_ms: Inference execution time in milliseconds.
        near_zero_threshold: Threshold below which actual sales are masked for safe MAPE.
    """
    y_t = np.asarray(y_true, dtype=float)
    y_p = np.asarray(y_pred, dtype=float)

    if len(y_t) != len(y_p):
        raise ValueError(f"Length mismatch: y_true has {len(y_t)}, y_pred has {len(y_p)}")

    # 1. Scale-dependent metrics
    mae = mean_absolute_error(y_t, y_p)
    rmse = np.sqrt(mean_squared_error(y_t, y_p))

    # 2. Weighted Absolute Percentage Error (WAPE) - Robust to individual near-zero values
    sum_actual = np.sum(np.abs(y_t))
    wape = (np.sum(np.abs(y_t - y_p)) / sum_actual * 100.0) if sum_actual > 0 else 0.0

    # 3. Symmetric Mean Absolute Percentage Error (sMAPE)
    denominator = (np.abs(y_t) + np.abs(y_p)) / 2.0
    valid_denom_mask = denominator > 1e-5
    if np.sum(valid_denom_mask) > 0:
        smape = np.mean(np.abs(y_t[valid_denom_mask] - y_p[valid_denom_mask]) / denominator[valid_denom_mask]) * 100.0
    else:
        smape = 0.0

    # 4. Safe MAPE: Mask zero or near-zero observations (|y| < threshold)
    # Retail returns / negative sales can cause division-by-zero or extreme ratios
    non_zero_mask = np.abs(y_t) >= near_zero_threshold
    masked_count = int(np.sum(~non_zero_mask))
    if np.sum(non_zero_mask) > 0:
        safe_mape = np.mean(np.abs((y_t[non_zero_mask] - y_p[non_zero_mask]) / y_t[non_zero_mask])) * 100.0
    else:
        safe_mape = wape

    # 5. R-squared (variance explained)
    try:
        r2 = r2_score(y_t, y_p)
    except Exception:
        r2 = 0.0

    return {
        "mae": round(float(mae), 2),
        "rmse": round(float(rmse), 2),
        "wape": round(float(wape), 2),
        "smape": round(float(smape), 2),
        "mape": round(float(safe_mape), 2),
        "r2": round(float(r2), 4),
        "train_time_sec": round(float(train_time_sec), 3),
        "infer_time_ms": round(float(infer_time_ms), 3),
        "sample_count": len(y_t),
        "near_zero_masked_count": masked_count,
    }


def evaluate_prediction_interval_coverage(
    y_true: np.ndarray,
    lower_bound: np.ndarray,
    upper_bound: np.ndarray
) -> Dict[str, Any]:
    """
    Evaluates empirical prediction interval coverage probability (PICP)
    and mean prediction interval width (MPIW).
    """
    y_t = np.asarray(y_true, dtype=float)
    lb = np.asarray(lower_bound, dtype=float)
    ub = np.asarray(upper_bound, dtype=float)

    is_covered = (y_t >= lb) & (y_t <= ub)
    picp = float(np.mean(is_covered) * 100.0)
    mpiw = float(np.mean(ub - lb))

    return {
        "picp_percentage": round(picp, 2),
        "mpiw_dollars": round(mpiw, 2),
        "target_confidence": 95.0,
        "is_calibrated": (picp >= 90.0) and (picp <= 98.0),
    }
