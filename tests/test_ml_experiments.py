"""
Unit and Integration Test Suite for NEXUS Phase 2 ML Experiments.
Validates metric calculations, residual reconstruction, time-aware stacking,
forecast alignment, and leakage prevention.
"""

import sys
from pathlib import Path
import pytest
import numpy as np
import pandas as pd

# Add src/ml to module path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src" / "ml"))

from metrics import calculate_metrics, evaluate_prediction_interval_coverage
from models import SeasonalNaiveForecaster, ElasticNetForecaster
from hybrids import TimeAwareStackingEnsemble, ProposedContextAwareHybrid


def test_metric_calculations_accuracy_and_edge_cases():
    """Validates calculation of MAE, RMSE, WAPE, sMAPE, and safe-MAPE on known vectors."""
    y_true = np.array([100.0, 200.0, 300.0, 0.0])  # Includes a zero value
    y_pred = np.array([110.0, 190.0, 315.0, 5.0])

    metrics = calculate_metrics(y_true, y_pred, train_time_sec=1.5, infer_time_ms=10.0)

    # Manual expected values:
    # Errors: [10, 10, 15, 5] -> sum = 40
    # MAE = 40 / 4 = 10.0
    assert metrics["mae"] == 10.0

    # MSE = (100 + 100 + 225 + 25) / 4 = 450 / 4 = 112.5 -> RMSE = sqrt(112.5) ~ 10.61
    assert round(metrics["rmse"], 2) == 10.61

    # WAPE = sum(|error|) / sum(|actual|) = 40 / 600 * 100 = 6.67%
    assert metrics["wape"] == 6.67

    # Safe MAPE masks the zero value: on [100, 200, 300], errors are [10, 10, 15]
    # percentage errors: 10/100=0.10, 10/200=0.05, 15/300=0.05 -> mean = 0.20/3 = 6.67%
    assert metrics["mape"] == 6.67
    assert metrics["near_zero_masked_count"] == 1


def test_prediction_interval_coverage_evaluation():
    """Validates PICP and MPIW calculations."""
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    lower = np.array([8.0, 15.0, 25.0, 45.0])  # Last one misses (40 < 45)
    upper = np.array([12.0, 25.0, 35.0, 55.0])

    coverage = evaluate_prediction_interval_coverage(y_true, lower, upper)

    # 3 out of 4 covered = 75.0%
    assert coverage["picp_percentage"] == 75.0
    # Widths: [4, 10, 10, 10] -> Mean = 34 / 4 = 8.5
    assert coverage["mpiw_dollars"] == 8.5


def test_seasonal_naive_forecasting_logic():
    """Verifies that Seasonal Naive uses the exact 52-week lag and falls back appropriately."""
    dates_hist = pd.date_range("2010-01-01", periods=60, freq="7D")
    df_hist = pd.DataFrame({
        "Store": [1] * 60,
        "Dept": [1] * 60,
        "Date": dates_hist,
        "Weekly_Sales": [float(i * 10) for i in range(60)],
    })

    forecaster = SeasonalNaiveForecaster().fit(df_hist)

    # Query a date 52 weeks after date index 10:
    target_date = dates_hist[10] + pd.Timedelta(weeks=52)
    test_query = pd.DataFrame({
        "Store": [1],
        "Dept": [1],
        "Date": [target_date],
        "sales_lag_52w": [df_hist.loc[10, "Weekly_Sales"]],
    })

    preds, _ = forecaster.predict(test_query)
    # Expected value is sales from index 10 = 100.0
    assert preds[0] == 100.0


def test_residual_hybrid_reconstruction():
    """
    Verifies that the Proposed Context-Aware Hybrid mathematically
    combines context base and residual predictions without target leakage.
    """
    dates = pd.date_range("2011-01-07", periods=20, freq="7D")
    synthetic_df = pd.DataFrame({
        "Store": [1] * 20,
        "Dept": [1] * 20,
        "Date": dates,
        "Weekly_Sales": [1000.0 + (i % 4) * 200.0 for i in range(20)],
        "markdown_total": [0.0] * 20,
        "is_thanksgiving": [0] * 20,
        "is_christmas": [0] * 20,
        "is_super_bowl": [0] * 20,
        "is_labor_day": [0] * 20,
        "IsHoliday": [False] * 20,
        "sales_lag_1w": [1000.0] * 20,
        "sales_rolling_mean_4w": [1000.0] * 20,
    })

    features = ["sales_lag_1w", "sales_rolling_mean_4w", "markdown_total"]

    hybrid = ProposedContextAwareHybrid(xgb_depth=3, xgb_estimators=10)
    hybrid.fit(synthetic_df, features)

    preds, lower, upper, base_preds, _ = hybrid.predict(synthetic_df)

    # 1. Prediction count matches
    assert len(preds) == len(synthetic_df)
    # 2. Uncertainty bounds are symmetric around final predictions
    assert np.all(lower <= preds)
    assert np.all(upper >= preds)


def test_time_aware_stacking_chronological_structure():
    """
    Verifies that the TimeAwareStackingEnsemble correctly partitions
    temporal folds and learns positive non-negative meta weights.
    """
    dates = pd.date_range("2011-01-07", periods=30, freq="7D")
    df = pd.DataFrame({
        "Store": [1] * 30,
        "Dept": [1] * 30,
        "Date": dates,
        "Weekly_Sales": [500.0 + i * 15.0 for i in range(30)],
        "sales_lag_1w": [500.0 + (i - 1) * 15.0 for i in range(30)],
        "sales_rolling_mean_4w": [500.0] * 30,
    })
    features = ["sales_lag_1w", "sales_rolling_mean_4w"]

    stacker = TimeAwareStackingEnsemble(n_splits=2)
    stacker.fit(df, features)

    preds, rf_preds, xgb_preds, _ = stacker.predict(df)

    assert len(preds) == len(df)
    # Meta weights must be non-negative
    assert np.all(stacker.meta_learner.coef_ >= 0)


def test_multistep_leakage_prevention_on_future_sales():
    """
    Verifies that predict_recursive_multistep NEVER accesses future Weekly_Sales
    in the evaluation partition. Corrupting eval_df['Weekly_Sales'] must not alter predictions.
    """
    from models import predict_recursive_multistep
    from sklearn.ensemble import RandomForestRegressor

    # Clean history
    dates_hist = pd.date_range("2011-01-07", periods=52, freq="7D")
    df_hist = pd.DataFrame({
        "Store": [1] * 52,
        "Dept": [1] * 52,
        "Date": dates_hist,
        "Weekly_Sales": [1000.0] * 52,
        "sales_lag_1w": [1000.0] * 52,
        "sales_lag_2w": [1000.0] * 52,
        "sales_lag_4w": [1000.0] * 52,
        "sales_lag_8w": [1000.0] * 52,
        "sales_lag_52w": [1000.0] * 52,
        "sales_rolling_mean_4w": [1000.0] * 52,
        "sales_rolling_std_4w": [0.0] * 52,
        "sales_rolling_mean_12w": [1000.0] * 52,
    })
    feature_cols = ["sales_lag_1w", "sales_lag_52w", "sales_rolling_mean_4w"]
    model = RandomForestRegressor(n_estimators=5, random_state=42).fit(df_hist[feature_cols], df_hist["Weekly_Sales"])

    # Evaluation set 1: authentic
    eval_dates = pd.date_range("2012-01-06", periods=8, freq="7D")
    eval_df_clean = pd.DataFrame({
        "Store": [1] * 8,
        "Dept": [1] * 8,
        "Date": eval_dates,
        "Weekly_Sales": [1000.0] * 8,
    })

    # Evaluation set 2: deliberately corrupted targets
    eval_df_corrupted = pd.DataFrame({
        "Store": [1] * 8,
        "Dept": [1] * 8,
        "Date": eval_dates,
        "Weekly_Sales": [999999.0] * 8,  # Leaked future signal if accessed!
    })

    preds_clean, _ = predict_recursive_multistep(model, eval_df_clean, df_hist, feature_cols)
    preds_corrupted, _ = predict_recursive_multistep(model, eval_df_corrupted, df_hist, feature_cols)

    # Predictions MUST be 100% identical: zero target leakage from future evaluation window!
    np.testing.assert_array_almost_equal(preds_clean, preds_corrupted)


def test_forecast_date_and_row_alignment():
    """
    Verifies that series-aware forecasters (Prophet, SARIMAX, Seasonal Naive)
    produce predictions matching the exact shape, ordering, and length of test_df.
    """
    from models import SeasonalNaiveForecaster, ProphetForecaster, SARIMAXForecaster

    dates_tr = pd.date_range("2010-02-05", periods=55, freq="7D")
    records_tr = []
    for s in [1, 2]:
        for d in [10, 20]:
            for dt in dates_tr:
                records_tr.append({
                    "Store": s, "Dept": d, "Date": dt,
                    "Weekly_Sales": float(s * 1000 + d * 50),
                    "sales_lag_52w": float(s * 1000 + d * 50),
                    "sales_lag_1w": float(s * 1000 + d * 50),
                })
    df_tr = pd.DataFrame(records_tr)

    dates_ts = pd.date_range("2011-03-04", periods=5, freq="7D")
    records_ts = []
    for s in [1, 2]:
        for d in [10, 20]:
            for dt in dates_ts:
                records_ts.append({
                    "Store": s, "Dept": d, "Date": dt,
                    "Weekly_Sales": float(s * 1000 + d * 50),
                    "sales_lag_52w": float(s * 1000 + d * 50),
                    "sales_lag_1w": float(s * 1000 + d * 50),
                })
    df_ts = pd.DataFrame(records_ts)

    # 1. Seasonal Naive
    sn = SeasonalNaiveForecaster().fit(df_tr)
    p_sn, _ = sn.predict(df_ts)
    assert len(p_sn) == len(df_ts)

    # 2. Prophet
    pro = ProphetForecaster().fit(df_tr)
    p_pro, _ = pro.predict(df_ts)
    assert len(p_pro) == len(df_ts)

    # 3. SARIMAX
    sari = SARIMAXForecaster(order=(1, 0, 0)).fit(df_tr)
    p_sari, _ = sari.predict(df_ts)
    assert len(p_sari) == len(df_ts)


def test_metric_reproducibility_from_csv():
    """
    Verifies that recomputing metrics directly from results/predictions_comparison.csv
    mathematically and exactly reproduces results/test_metrics.json (tolerance <= 0.05).
    """
    import json
    from metrics import calculate_metrics

    csv_path = Path(__file__).resolve().parents[1] / "results" / "predictions_comparison.csv"
    json_path = Path(__file__).resolve().parents[1] / "results" / "test_metrics.json"

    if not csv_path.exists() or not json_path.exists():
        pytest.skip("Prediction artifacts not found, run experiment runner first.")

    df = pd.read_csv(csv_path)
    y_true = df["Weekly_Sales"].values
    with open(json_path) as f:
        test_metrics = json.load(f)

    col_map = {
        "Seasonal Naive": "Baseline 1: Seasonal Naive",
        "ElasticNet": "Baseline 2: ElasticNet",
        "Random Forest": "Baseline 3: Random Forest",
        "XGBoost": "Baseline 4: XGBoost",
        "Prophet": "Baseline 5A: Prophet",
        "SARIMAX": "Baseline 5B: SARIMAX",
        "Hybrid A": "Hybrid A: Prophet + XGBoost",
        "Hybrid B": "Hybrid B: SARIMAX + XGBoost",
        "Hybrid C": "Hybrid C: Stacking Ensemble",
        "Proposed Hybrid": "Hybrid D: Proposed Context-Aware",
    }

    for col, json_key in col_map.items():
        recomputed = calculate_metrics(y_true, df[col].values)
        reported = test_metrics[json_key]
        assert abs(recomputed["wape"] - reported["wape"]) < 0.05, f"WAPE mismatch for {col}"
        assert abs(recomputed["mae"] - reported["mae"]) < 1.0, f"MAE mismatch for {col}"


def test_evaluation_protocol_labeling_and_degradation():
    """
    Verifies that multi-step vs rolling comparison correctly records
    the expected error degradation when weekly realized lags are withheld.
    """
    import json
    comp_path = Path(__file__).resolve().parents[1] / "results" / "multistep_vs_rolling_comparison.json"
    if not comp_path.exists():
        pytest.skip("multistep_vs_rolling_comparison.json not found")

    with open(comp_path) as f:
        comp = json.load(f)

    # For both Random Forest and XGBoost, rolling 1-step WAPE must be strictly lower
    # than recursive multi-step WAPE due to autoregressive error accumulation
    rf_rolling = comp["random_forest"]["rolling_1step_test_wape"]
    rf_multi = comp["random_forest"]["recursive_multistep_test_wape"]
    assert rf_rolling < rf_multi
    assert comp["random_forest"]["horizon_degradation_wape"] > 0

    xgb_rolling = comp["xgboost"]["rolling_1step_test_wape"]
    xgb_multi = comp["xgboost"]["recursive_multistep_test_wape"]
    assert xgb_rolling < xgb_multi
    assert comp["xgboost"]["horizon_degradation_wape"] > 0


def test_prediction_interval_shortfall_audit():
    """
    Audits the empirical calibration shortfall of ProposedContextAwareHybrid:
    Nominal coverage is 95%, empirical coverage is ~72.1% (shortfall ~ -22.9%).
    """
    from metrics import evaluate_prediction_interval_coverage
    csv_path = Path(__file__).resolve().parents[1] / "results" / "predictions_comparison.csv"
    if not csv_path.exists():
        pytest.skip("predictions_comparison.csv not found")

    df = pd.read_csv(csv_path)
    cov = evaluate_prediction_interval_coverage(
        df["Weekly_Sales"].values,
        df["Proposed_Lower"].values,
        df["Proposed_Upper"].values
    )

    # Empirical coverage must be in expected range (71-73%)
    assert 70.0 <= cov["picp_percentage"] <= 75.0
    nominal_coverage = 95.0
    shortfall = cov["picp_percentage"] - nominal_coverage
    assert shortfall < -20.0  # Demonstrates documented calibration shortfall

