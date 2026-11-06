"""
NEXUS Chronological Split & Leakage Prevention Module.
Implements strict temporal partitioning into 106-week training, 18-week validation,
and 19-week out-of-time test sets with zero future data leakage.
"""

from typing import Dict, Any, Tuple
import pandas as pd


def get_chronological_splits(
    df: pd.DataFrame,
    train_weeks: int = 106,
    val_weeks: int = 18,
    test_weeks: int = 19
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Partitions the dataset chronologically using unique dates to prevent temporal leakage.
    Enforces Train (106w) -> Validation (18w) -> Test (19w) alignment.
    """
    unique_dates = sorted(df["Date"].unique())
    total_weeks = len(unique_dates)

    if total_weeks != (train_weeks + val_weeks + test_weeks):
        # Dynamically adjust or notify if unique dates differ
        actual_train = min(train_weeks, int(total_weeks * 0.74))
        actual_val = min(val_weeks, int(total_weeks * 0.13))
        actual_test = total_weeks - actual_train - actual_val
    else:
        actual_train = train_weeks
        actual_val = val_weeks
        actual_test = test_weeks

    train_dates = unique_dates[:actual_train]
    val_dates = unique_dates[actual_train : actual_train + actual_val]
    test_dates = unique_dates[actual_train + actual_val :]

    train_df = df[df["Date"].isin(train_dates)].copy().reset_index(drop=True)
    val_df = df[df["Date"].isin(val_dates)].copy().reset_index(drop=True)
    test_df = df[df["Date"].isin(test_dates)].copy().reset_index(drop=True)

    # Leakage boundary verification
    train_max = pd.to_datetime(train_df["Date"].max())
    val_min = pd.to_datetime(val_df["Date"].min())
    val_max = pd.to_datetime(val_df["Date"].max())
    test_min = pd.to_datetime(test_df["Date"].min())
    test_max = pd.to_datetime(test_df["Date"].max())

    is_leakage_free = (train_max < val_min) and (val_max < test_min)

    split_manifest = {
        "total_unique_weeks": total_weeks,
        "total_rows": len(df),
        "protocol": "Strict Chronological Partition (Zero-Shuffle)",
        "train": {
            "weeks_count": len(train_dates),
            "percentage_weeks": round(len(train_dates) / total_weeks * 100, 2),
            "start_date": str(pd.to_datetime(train_df["Date"].min()).date()),
            "end_date": str(train_max.date()),
            "rows_count": len(train_df),
            "rows_percentage": round(len(train_df) / len(df) * 100, 2),
            "purpose": "Model training, coefficient learning, and transformer fitting only",
        },
        "validation": {
            "weeks_count": len(val_dates),
            "percentage_weeks": round(len(val_dates) / total_weeks * 100, 2),
            "start_date": str(val_min.date()),
            "end_date": str(val_max.date()),
            "rows_count": len(val_df),
            "rows_percentage": round(len(val_df) / len(df) * 100, 2),
            "purpose": "Hyperparameter tuning, tree-depth search, and residual error calibration",
        },
        "test": {
            "weeks_count": len(test_dates),
            "percentage_weeks": round(len(test_dates) / total_weeks * 100, 2),
            "start_date": str(test_min.date()),
            "end_date": str(test_max.date()),
            "rows_count": len(test_df),
            "rows_percentage": round(len(test_df) / len(df) * 100, 2),
            "purpose": "Unbiased final model benchmarking and out-of-time evaluation",
        },
        "boundary_checks": {
            "train_max_date": str(train_max.date()),
            "val_min_date": str(val_min.date()),
            "val_max_date": str(val_max.date()),
            "test_min_date": str(test_min.date()),
            "train_val_gap_days": int((val_min - train_max).days),
            "val_test_gap_days": int((test_min - val_max).days),
            "leakage_free": is_leakage_free,
        },
    }

    return train_df, val_df, test_df, split_manifest
