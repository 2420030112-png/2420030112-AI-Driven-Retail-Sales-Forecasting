"""
Unit and Integration Test Suite for NEXUS Review-3 Data Pipeline.
Validates data loading, schema integrity, duplicate checks, missing-value treatment,
chronological splitting, and leakage-free feature engineering.
"""

import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

# Add src/ml to module path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src" / "ml"))

from data_loader import load_raw_data, inspect_schema, audit_duplicates_and_keys, merge_datasets
from data_cleaner import audit_missing_values, treat_missing_values, analyze_outliers, evaluate_normality
from time_split import get_chronological_splits
from feature_engineer import (
    construct_calendar_features,
    construct_promotional_features,
    construct_lag_and_rolling_features,
    encode_store_features,
    fit_and_scale_features,
)


@pytest.fixture(scope="module")
def loaded_raw_data():
    """Loads raw dataset once for the test module."""
    train_df, features_df, stores_df, data_dir = load_raw_data()
    return train_df, features_df, stores_df, data_dir


def test_data_loading_and_dimensions(loaded_raw_data):
    """Verifies that dataset files load correctly with expected dimensions."""
    train_df, features_df, stores_df, data_dir = loaded_raw_data

    assert len(train_df) == 421570, "Train row count should be exactly 421,570"
    assert len(features_df) == 8190, "Features row count should be exactly 8,190"
    assert len(stores_df) == 45, "Stores count should be exactly 45"

    assert set(["Store", "Dept", "Date", "Weekly_Sales", "IsHoliday"]).issubset(train_df.columns)
    assert set(["Store", "Date", "Temperature", "Fuel_Price", "CPI", "Unemployment"]).issubset(features_df.columns)
    assert set(["Store", "Type", "Size"]).issubset(stores_df.columns)


def test_primary_key_uniqueness(loaded_raw_data):
    """Verifies zero key collisions across tables."""
    train_df, features_df, stores_df, _ = loaded_raw_data
    audit = audit_duplicates_and_keys(train_df, features_df, stores_df)

    assert audit["train_key_duplicates_store_dept_date"] == 0, "Train must have 0 key duplicates"
    assert audit["features_key_duplicates_store_date"] == 0, "Features must have 0 key duplicates"
    assert audit["stores_key_duplicates_store"] == 0, "Stores master must have 0 key duplicates"
    assert audit["invalid_date_formats_train"] == 0, "Dates in train must parse cleanly"
    assert audit["integrity_status"] == "PASSED"


def test_relational_merge(loaded_raw_data):
    """Verifies that master merge preserves rows and key alignment."""
    train_df, features_df, stores_df, _ = loaded_raw_data
    merged = merge_datasets(train_df, features_df, stores_df)

    assert len(merged) == len(train_df), "Merged row count must equal train row count"
    assert "Weekly_Sales" in merged.columns
    assert "Size" in merged.columns
    assert "CPI" in merged.columns
    assert pd.api.types.is_datetime64_any_dtype(merged["Date"]), "Date must be converted to datetime"


def test_missing_value_treatment(loaded_raw_data):
    """Verifies that MarkDown columns are cleanly imputed to 0.0 with 0 nulls remaining."""
    train_df, features_df, stores_df, _ = loaded_raw_data
    merged = merge_datasets(train_df, features_df, stores_df)

    cleaned, summary = treat_missing_values(merged)

    for i in range(1, 6):
        col = f"MarkDown{i}"
        if col in cleaned.columns:
            assert cleaned[col].isnull().sum() == 0, f"{col} must have 0 nulls post-treatment"

    assert summary["total_nulls_remaining"] == 0, "Cleaned dataset must have 0 remaining nulls"


def test_outlier_and_normality_diagnostics(loaded_raw_data):
    """Verifies outlier detection calculations and statistical test execution."""
    train_df, features_df, stores_df, _ = loaded_raw_data
    merged = merge_datasets(train_df, features_df, stores_df)

    outliers = analyze_outliers(merged)
    assert outliers["negative_sales_analysis"]["negative_sales_count"] == 1285
    assert outliers["descriptive_statistics"]["count"] == 421570
    assert outliers["holiday_surge_investigation"]["holiday_demand_multiplier"] > 1.0

    normality = evaluate_normality(merged, sample_size=1000)
    assert normality["raw_sales_moments"]["skewness"] > 0, "Sales must be right-skewed"
    assert normality["statistical_tests"]["jarque_bera"]["rejected"] is True
    assert normality["statistical_tests"]["shapiro_wilk_sample"]["rejected"] is True
    assert normality["is_gaussian"] is False


def test_chronological_splits_boundaries(loaded_raw_data):
    """Verifies 106w / 18w / 19w partition without temporal leakage."""
    train_df, features_df, stores_df, _ = loaded_raw_data
    merged = merge_datasets(train_df, features_df, stores_df)

    train_p, val_p, test_p, report = get_chronological_splits(merged)

    assert report["train"]["weeks_count"] == 106
    assert report["validation"]["weeks_count"] == 18
    assert report["test"]["weeks_count"] == 19

    train_max = pd.to_datetime(report["boundary_checks"]["train_max_date"])
    val_min = pd.to_datetime(report["boundary_checks"]["val_min_date"])
    val_max = pd.to_datetime(report["boundary_checks"]["val_max_date"])
    test_min = pd.to_datetime(report["boundary_checks"]["test_min_date"])

    assert train_max < val_min, "Train end date must strictly precede validation start date"
    assert val_max < test_min, "Validation end date must strictly precede test start date"
    assert report["boundary_checks"]["leakage_free"] is True

    # Check set disjointness
    train_dates = set(train_p["Date"].unique())
    val_dates = set(val_p["Date"].unique())
    test_dates = set(test_p["Date"].unique())
    assert len(train_dates.intersection(val_dates)) == 0
    assert len(val_dates.intersection(test_dates)) == 0


def test_leakage_free_lag_generation():
    """
    Creates an explicit sequential synthetic series to verify that
    sales_lag_1w and rolling statistics NEVER use current or future observations.
    """
    sample_data = pd.DataFrame({
        "Store": [1, 1, 1, 1, 1],
        "Dept": [1, 1, 1, 1, 1],
        "Date": pd.date_range("2011-01-07", periods=5, freq="7D"),
        "Weekly_Sales": [100.0, 200.0, 300.0, 400.0, 500.0],
    })

    feat, _ = construct_lag_and_rolling_features(sample_data)

    # lag_1w at index 1 (date 2) must equal sales at index 0 (100.0)
    assert feat.loc[1, "sales_lag_1w"] == 100.0
    assert feat.loc[2, "sales_lag_1w"] == 200.0
    assert feat.loc[3, "sales_lag_1w"] == 300.0
    assert feat.loc[4, "sales_lag_1w"] == 400.0

    # Verify that rolling mean at index 2 (date 3) does NOT include current sales (300.0)
    # It must be average of shifted history [100, 200] = 150.0
    assert feat.loc[2, "sales_rolling_mean_4w"] == 150.0


def test_scaler_leakage_audit():
    """
    Verifies that StandardScaler is fit ONLY on training data and
    transforms validation data using the frozen training parameters.
    """
    train_df = pd.DataFrame({
        "Store": [1, 1],
        "Date": pd.to_datetime(["2010-02-05", "2010-02-12"]),
        "Temperature": [40.0, 60.0],  # Mean = 50.0, Std = 10.0
    })
    val_df = pd.DataFrame({
        "Store": [1],
        "Date": pd.to_datetime(["2012-03-02"]),
        "Temperature": [80.0],  # If standardized with train mean=50, std=10 -> z = (80-50)/10 = 3.0
    })
    test_df = val_df.copy()

    train_sc, val_sc, test_sc, scaler, report = fit_and_scale_features(
        train_df, val_df, test_df, ["Temperature"]
    )

    assert scaler.mean_[0] == 50.0, "Scaler mean must be computed strictly on training data"
    assert round(val_sc.loc[0, "Temperature"], 2) == 3.0, "Validation feature must be transformed with training statistics"
    assert report["fitted_on_partition"] == "Training Only (106 Weeks)"
