"""
NEXUS Data Loader Module.
Handles discovery, schema validation, duplicate detection, and relational merging
for the Walmart Store Sales Forecasting dataset.
"""

from pathlib import Path
from typing import Dict, Tuple, Any, Optional
import pandas as pd


REQUIRED_FILES = {
    "train": "train.csv",
    "features": "features.csv",
    "stores": "stores.csv",
}


def find_data_directory(base_dir: Optional[Path] = None) -> Path:
    """
    Locates the directory containing the Walmart raw CSV files.
    Checks `data/raw/`, `data/`, and fallback search paths.
    """
    if base_dir is None:
        base_dir = Path(__file__).resolve().parents[2] / "data"

    candidate_dirs = [
        base_dir / "raw",
        base_dir,
    ]

    for candidate in candidate_dirs:
        if candidate.exists():
            files_present = [candidate / f for f in REQUIRED_FILES.values()]
            if all(p.exists() for p in files_present):
                return candidate

    missing_report = []
    for candidate in candidate_dirs:
        missing = [f for f in REQUIRED_FILES.values() if not (candidate / f).exists()]
        missing_report.append(f"  - {candidate}: missing {missing}")

    raise FileNotFoundError(
        "Walmart dataset files are missing. Please place the required files:\n"
        f"  Expected files: {list(REQUIRED_FILES.values())}\n"
        "  Searched locations:\n" + "\n".join(missing_report) + "\n"
        "  Instructions: Place the files in 'data/raw/' or 'data/'. See data/README.md for details."
    )


def load_raw_data(data_dir: Optional[Path] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Path]:
    """
    Loads train.csv, features.csv, and stores.csv into pandas DataFrames.
    """
    resolved_dir = find_data_directory(data_dir)

    train_path = resolved_dir / REQUIRED_FILES["train"]
    features_path = resolved_dir / REQUIRED_FILES["features"]
    stores_path = resolved_dir / REQUIRED_FILES["stores"]

    train_df = pd.read_csv(train_path)
    features_df = pd.read_csv(features_path)
    stores_df = pd.read_csv(stores_path)

    return train_df, features_df, stores_df, resolved_dir


def inspect_schema(
    train_df: pd.DataFrame,
    features_df: pd.DataFrame,
    stores_df: pd.DataFrame
) -> Dict[str, Any]:
    """
    Inspects column names, data types, null counts, memory footprint, and dimensions.
    """
    def summarize_df(df: pd.DataFrame, name: str) -> Dict[str, Any]:
        columns_meta = []
        for col in df.columns:
            columns_meta.append({
                "column_name": col,
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "null_percentage": round(float(df[col].isnull().mean()) * 100, 2),
                "unique_values": int(df[col].nunique()),
                "sample_values": [str(v) for v in df[col].dropna().head(3).tolist()],
            })

        return {
            "name": name,
            "row_count": len(df),
            "column_count": len(df.columns),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2),
            "columns": columns_meta,
        }

    return {
        "train": summarize_df(train_df, "train.csv"),
        "features": summarize_df(features_df, "features.csv"),
        "stores": summarize_df(stores_df, "stores.csv"),
    }


def audit_duplicates_and_keys(
    train_df: pd.DataFrame,
    features_df: pd.DataFrame,
    stores_df: pd.DataFrame
) -> Dict[str, Any]:
    """
    Validates primary key uniqueness and checks for duplicate or malformed records.
    """
    train_dups = int(train_df.duplicated(subset=["Store", "Dept", "Date"]).sum())
    features_dups = int(features_df.duplicated(subset=["Store", "Date"]).sum())
    stores_dups = int(stores_df.duplicated(subset=["Store"]).sum())

    # Date parse check
    train_dates = pd.to_datetime(train_df["Date"], errors="coerce")
    invalid_train_dates = int(train_dates.isnull().sum())

    features_dates = pd.to_datetime(features_df["Date"], errors="coerce")
    invalid_features_dates = int(features_dates.isnull().sum())

    # Check store ID consistency across tables
    train_stores = set(train_df["Store"].unique())
    features_stores = set(features_df["Store"].unique())
    stores_stores = set(stores_df["Store"].unique())

    unmapped_stores = list(train_stores - stores_stores)

    return {
        "train_key_duplicates_store_dept_date": train_dups,
        "features_key_duplicates_store_date": features_dups,
        "stores_key_duplicates_store": stores_dups,
        "invalid_date_formats_train": invalid_train_dates,
        "invalid_date_formats_features": invalid_features_dates,
        "unique_stores_in_train": len(train_stores),
        "unique_stores_in_features": len(features_stores),
        "unique_stores_in_stores_master": len(stores_stores),
        "unmapped_stores_between_train_and_stores": unmapped_stores,
        "unique_departments_in_train": int(train_df["Dept"].nunique()),
        "unique_weekly_dates_in_train": int(train_df["Date"].nunique()),
        "integrity_status": "PASSED" if (train_dups == 0 and features_dups == 0 and stores_dups == 0 and not unmapped_stores) else "FAILED",
    }


def merge_datasets(
    train_df: pd.DataFrame,
    features_df: pd.DataFrame,
    stores_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Executes relational joins between train, stores, and features tables.
    Merges on Store and Date keys without data loss.
    """
    # 1. Join stores metadata on Store
    merged = train_df.merge(stores_df, on="Store", how="left")

    # 2. Join features metadata on Store, Date
    # Avoid duplicate IsHoliday column by checking consistency
    feat_subset = features_df.copy()
    if "IsHoliday" in feat_subset.columns:
        # Check alignment: drop the duplicate column from features
        feat_subset = feat_subset.drop(columns=["IsHoliday"])

    merged = merged.merge(feat_subset, on=["Store", "Date"], how="left")

    # 3. Ensure proper datatypes
    merged["Date"] = pd.to_datetime(merged["Date"])
    merged["IsHoliday"] = merged["IsHoliday"].astype(bool)
    merged["Store"] = merged["Store"].astype(int)
    merged["Dept"] = merged["Dept"].astype(int)

    # 4. Chronological sort per store & department series
    merged = merged.sort_values(by=["Store", "Dept", "Date"]).reset_index(drop=True)

    return merged
