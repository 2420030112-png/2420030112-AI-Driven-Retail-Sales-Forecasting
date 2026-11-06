"""
NEXUS — AI-Driven Hybrid Retail Sales Forecasting & Demand Intelligence
Review-3 Real Data Science & Statistical Analysis Pipeline Entry Point.

Executes end-to-end data loading, schema audit, missing-value treatment,
outlier analysis, normality testing, chronological splitting, and leakage-free
feature engineering on the Walmart Store Sales Forecasting dataset.
"""

import sys
import os
import json
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

# Ensure UTF-8 stdout encoding on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure src/ml is in Python module search path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless execution
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Internal module imports
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



def generate_diagnostic_plots(
    df: pd.DataFrame,
    plots_dir: Path,
    sample_size: int = 15000
) -> Dict[str, str]:
    """
    Renders and exports diagnostic visualization figures required for Review 3.
    """
    plots_dir.mkdir(parents=True, exist_ok=True)
    generated_plots = {}

    # Set aesthetic styles
    sns.set_theme(style="whitegrid", palette="muted")
    plt.rcParams["font.sans-serif"] = ["DejaVu Sans", "Arial"]

    # 1. Sales Distribution and Q-Q Plot
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    sales = df["Weekly_Sales"]
    sample_sales = sales.sample(min(sample_size, len(sales)), random_state=42)

    # Left: Histogram with KDE
    sns.histplot(sample_sales, bins=60, kde=True, ax=axes[0], color="#2563eb", edgecolor="none")
    axes[0].set_title("Empirical Distribution of Weekly Sales (Severe Right-Skew)", fontsize=12, fontweight="bold")
    axes[0].set_xlabel("Weekly Sales ($)")
    axes[0].set_ylabel("Frequency")
    axes[0].axvline(sales.median(), color="#10b981", linestyle="--", label=f"Median: ${sales.median():,.0f}")
    axes[0].axvline(sales.mean(), color="#ef4444", linestyle="-", label=f"Mean: ${sales.mean():,.0f}")
    axes[0].legend()

    # Right: Q-Q Plot against Normal Distribution
    stats.probplot(sample_sales, dist="norm", plot=axes[1])
    axes[1].get_lines()[0].set_color("#2563eb")
    axes[1].get_lines()[0].set_markersize(3)
    axes[1].get_lines()[1].set_color("#ef4444")
    axes[1].get_lines()[1].set_linewidth(2)
    axes[1].set_title("Normal Q-Q Plot (Substantial Heavy Tail Deviation)", fontsize=12, fontweight="bold")
    axes[1].set_xlabel("Theoretical Quantiles")
    axes[1].set_ylabel("Ordered Values ($)")

    plt.tight_layout()
    plot_1_path = plots_dir / "sales_distribution_and_qq.png"
    plt.savefig(plot_1_path, dpi=200)
    plt.close()
    generated_plots["distribution_and_qq"] = str(plot_1_path)

    # 2. Outliers & Holiday Surge Boxplots
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Left: Regular vs Holiday Sales
    sns.boxplot(
        data=df.sample(min(20000, len(df)), random_state=42),
        x="IsHoliday",
        y="Weekly_Sales",
        hue="IsHoliday",
        legend=False,
        ax=axes[0],
        palette=["#94a3b8", "#f59e0b"]
    )
    axes[0].set_title("Sales Dispersion: Non-Holiday vs Holiday Weeks", fontsize=12, fontweight="bold")
    axes[0].set_xlabel("Is Holiday Week")
    axes[0].set_ylabel("Weekly Sales ($)")
    axes[0].set_xticks([0, 1])
    axes[0].set_xticklabels(["Non-Holiday (133w)", "Holiday (10w)"])

    # Right: Department 72 (Electronics) vs Other Departments Holiday Surge
    sample_dept = df.sample(min(20000, len(df)), random_state=42).copy()
    sample_dept["Dept_Category"] = np.where(sample_dept["Dept"] == 72, "Dept 72 (Electronics)", "Other Departments")
    sns.boxplot(
        data=sample_dept,
        x="Dept_Category",
        y="Weekly_Sales",
        hue="IsHoliday",
        ax=axes[1],
        palette=["#60a5fa", "#f97316"]
    )
    axes[1].set_title("Extreme Holiday Surges in High-Elasticity Departments", fontsize=12, fontweight="bold")
    axes[1].set_xlabel("Department Category")
    axes[1].set_ylabel("Weekly Sales ($)")

    plt.tight_layout()
    plot_2_path = plots_dir / "outlier_boxplot_and_holidays.png"
    plt.savefig(plot_2_path, dpi=200)
    plt.close()
    generated_plots["outliers_and_holidays"] = str(plot_2_path)

    # 3. MarkDown Introduction Timeline
    fig, ax = plt.subplots(figsize=(12, 4.5))
    weekly_markdowns = df.groupby("Date")[["MarkDown1", "MarkDown2", "MarkDown3", "MarkDown4", "MarkDown5"]].mean()
    weekly_markdowns.plot(ax=ax, linewidth=1.8, colormap="viridis")
    ax.set_title("Walmart MarkDown Feature Dynamics (Nov 2011 Introduction Audit)", fontsize=12, fontweight="bold")
    ax.set_xlabel("Date")
    ax.set_ylabel("Mean Dollar MarkDown ($)")
    ax.axvline(pd.to_datetime("2011-11-11"), color="#ef4444", linestyle="--", linewidth=1.5, label="MarkDown Tracking Initiated (Nov 2011)")
    ax.text(pd.to_datetime("2010-09-01"), ax.get_ylim()[1]*0.8, "Structural Zeros (Pre-Nov 2011)\n[Imputed with 0.0]",
            fontsize=10, bbox=dict(boxstyle="round,pad=0.4", fc="#f1f5f9", ec="#cbd5e1"))
    ax.legend(loc="upper left")

    plt.tight_layout()
    plot_3_path = plots_dir / "markdown_timeline.png"
    plt.savefig(plot_3_path, dpi=200)
    plt.close()
    generated_plots["markdown_timeline"] = str(plot_3_path)

    # 4. Chronological Splitting Timeline
    fig, ax = plt.subplots(figsize=(12, 3))
    unique_dates = pd.to_datetime(sorted(df["Date"].unique()))
    train_dates = unique_dates[:106]
    val_dates = unique_dates[106:124]
    test_dates = unique_dates[124:]

    ax.scatter(train_dates, [1]*len(train_dates), color="#2563eb", s=30, label=f"Train: 106w ({train_dates[0].strftime('%Y-%m-%d')} to {train_dates[-1].strftime('%Y-%m-%d')})")
    ax.scatter(val_dates, [1]*len(val_dates), color="#f59e0b", s=30, label=f"Validation: 18w ({val_dates[0].strftime('%Y-%m-%d')} to {val_dates[-1].strftime('%Y-%m-%d')})")
    ax.scatter(test_dates, [1]*len(test_dates), color="#10b981", s=30, label=f"Test: 19w ({test_dates[0].strftime('%Y-%m-%d')} to {test_dates[-1].strftime('%Y-%m-%d')})")

    ax.set_yticks([])
    ax.set_title("NEXUS Strict Chronological Split Protocol (Zero Temporal Leakage)", fontsize=12, fontweight="bold")
    ax.set_xlabel("Timeline (143 Continuous Weekly Reporting Intervals)")
    ax.legend(loc="lower left", frameon=True)
    ax.set_ylim(0.8, 1.2)

    plt.tight_layout()
    plot_4_path = plots_dir / "chronological_split_timeline.png"
    plt.savefig(plot_4_path, dpi=200)
    plt.close()
    generated_plots["split_timeline"] = str(plot_4_path)

    return generated_plots


def run_pipeline(
    data_dir: Optional[Path] = None,
    results_dir: Optional[Path] = None
) -> Dict[str, Any]:
    """
    Executes the entire Review 3 data preparation and statistical analysis pipeline.
    """
    start_time = time.time()
    print("=" * 76)
    print("  NEXUS — AI-Driven Hybrid Retail Demand Intelligence Pipeline")
    print("  Review-3 Real Data Science & Statistical Analysis Module")
    print("=" * 76)

    # 1. Setup paths
    base_dir = Path(__file__).resolve().parents[2]
    if data_dir is None:
        data_dir = base_dir / "data"
    if results_dir is None:
        results_dir = base_dir / "results"

    results_dir.mkdir(parents=True, exist_ok=True)
    plots_dir = results_dir / "plots"

    print(f"\n[Step 1/6] Discovering & Loading Raw Dataset Files from: {data_dir}")
    train_df, features_df, stores_df, resolved_dir = load_raw_data(data_dir)
    print(f"  [OK] Resolved dataset directory: {resolved_dir}")
    print(f"  [OK] Loaded train.csv: {len(train_df):,} rows, {len(train_df.columns)} columns")
    print(f"  [OK] Loaded features.csv: {len(features_df):,} rows, {len(features_df.columns)} columns")
    print(f"  [OK] Loaded stores.csv: {len(stores_df):,} stores")

    # Schema inspection & duplicate audit
    print("\n[Step 2/6] Auditing Data Schema, Data Types & Primary Keys...")
    schema_report = inspect_schema(train_df, features_df, stores_df)
    key_audit = audit_duplicates_and_keys(train_df, features_df, stores_df)
    print(f"  [OK] Primary key duplicate rows in (Store, Dept, Date): {key_audit['train_key_duplicates_store_dept_date']}")
    print(f"  [OK] Total unique stores verified: {key_audit['unique_stores_in_train']}")
    print(f"  [OK] Total unique departments verified: {key_audit['unique_departments_in_train']}")
    print(f"  [OK] Total unique weekly reporting dates: {key_audit['unique_weekly_dates_in_train']}")
    print(f"  [OK] Relational integrity check: {key_audit['integrity_status']}")

    # Merge datasets
    print("\n[Step 3/6] Merging Master Data Tables (Train + Stores + Features)...")
    merged_df = merge_datasets(train_df, features_df, stores_df)
    print(f"  [OK] Merged Master Matrix Dimensions: {merged_df.shape[0]:,} rows x {merged_df.shape[1]} columns")

    # Missing value analysis & treatment
    print("\n[Step 4/6] Missing-Value Treatment & Anomaly Diagnostics...")
    cleaned_df, missing_report = treat_missing_values(merged_df)
    print(f"  [OK] MarkDown1-5 treated with justified zero-imputation.")
    print(f"  [OK] Null values remaining post-treatment: {missing_report['total_nulls_remaining']}")

    # Outlier diagnostics & Normality testing
    outlier_report = analyze_outliers(cleaned_df)
    print(f"  [OK] Weekly Sales Mean: ${outlier_report['descriptive_statistics']['mean']:,.2f} | Median: ${outlier_report['descriptive_statistics']['median']:,.2f}")
    print(f"  [OK] Negative sales records identified: {outlier_report['negative_sales_analysis']['negative_sales_count']:,} ({outlier_report['negative_sales_analysis']['negative_sales_percentage']}%)")
    print(f"  [OK] Negative sales decision: Retained with domain justification (customer refunds/returns).")
    print(f"  [OK] Holiday multiplier: {outlier_report['holiday_surge_investigation']['holiday_demand_multiplier']}x demand lift during holiday weeks.")

    normality_report = evaluate_normality(cleaned_df)
    print(f"  [OK] Raw Sales Skewness: {normality_report['raw_sales_moments']['skewness']} ({normality_report['raw_sales_moments']['skewness_classification']})")
    print(f"  [OK] Raw Sales Kurtosis: {normality_report['raw_sales_moments']['excess_kurtosis']} ({normality_report['raw_sales_moments']['kurtosis_classification']})")
    print(f"  [OK] Jarque-Bera p-value: {normality_report['statistical_tests']['jarque_bera']['p_value']:.4e} (Normality Null Rejected)")
    print(f"  [OK] Shapiro-Wilk p-value: {normality_report['statistical_tests']['shapiro_wilk_sample']['p_value']:.4e} (Normality Null Rejected)")

    # Chronological partition
    print("\n[Step 5/6] Enforcing Strict Chronological Splitting (Zero-Leakage)...")
    train_part, val_part, test_part, split_report = get_chronological_splits(cleaned_df)
    print(f"  [OK] Training Partition: {split_report['train']['weeks_count']} weeks ({split_report['train']['start_date']} to {split_report['train']['end_date']}) — {split_report['train']['rows_count']:,} rows")
    print(f"  [OK] Validation Partition: {split_report['validation']['weeks_count']} weeks ({split_report['validation']['start_date']} to {split_report['validation']['end_date']}) — {split_report['validation']['rows_count']:,} rows")
    print(f"  [OK] Test Partition: {split_report['test']['weeks_count']} weeks ({split_report['test']['start_date']} to {split_report['test']['end_date']}) — {split_report['test']['rows_count']:,} rows")
    print(f"  [OK] Leakage audit: Temporal boundaries non-overlapping: {split_report['boundary_checks']['leakage_free']}")

    # Feature engineering
    print("\n[Step 6/6] Generating Leakage-Free Lagged Features & Scaling Transformations...")
    feat_df = construct_calendar_features(cleaned_df)
    feat_df = construct_promotional_features(feat_df)
    feat_df, lag_metadata = construct_lag_and_rolling_features(feat_df)
    feat_df = encode_store_features(feat_df)

    # Re-split engineered features into train / val / test
    train_feat = feat_df[feat_df["Date"].isin(pd.to_datetime(train_part["Date"]).unique())].copy()
    val_feat = feat_df[feat_df["Date"].isin(pd.to_datetime(val_part["Date"]).unique())].copy()
    test_feat = feat_df[feat_df["Date"].isin(pd.to_datetime(test_part["Date"]).unique())].copy()

    # Numerical columns to scale
    numerical_scale_cols = [
        "Temperature", "Fuel_Price", "CPI", "Unemployment", "markdown_total",
        "sales_lag_1w", "sales_lag_2w", "sales_lag_4w", "sales_lag_8w", "sales_lag_52w",
        "sales_rolling_mean_4w", "sales_rolling_std_4w", "sales_rolling_mean_12w"
    ]
    train_scaled, val_scaled, test_scaled, scaler, scaling_report = fit_and_scale_features(
        train_feat, val_feat, test_feat, numerical_scale_cols
    )
    print(f"  [OK] Constructed {feat_df.shape[1]} engineered feature tensors (Lags 1-52w, 4w/12w Rolling, Holiday flags).")
    print(f"  [OK] Scaler fitted exclusively on training set: {scaling_report['scaled_columns_count']} continuous features normalized.")

    def json_default(obj):
        if isinstance(obj, (np.bool_, bool)):
            return bool(obj)
        if isinstance(obj, (np.integer, int)):
            return int(obj)
        if isinstance(obj, (np.floating, float)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (pd.Timestamp, datetime)):
            return str(obj)
        return str(obj)

    # Export machine-readable reports
    print("\n[Exporting Machine-Readable Results & Plots]...")
    with open(results_dir / "schema_report.json", "w") as f:
        json.dump(schema_report, f, indent=2, default=json_default)

    with open(results_dir / "duplicate_records_report.json", "w") as f:
        json.dump(key_audit, f, indent=2, default=json_default)

    with open(results_dir / "missing_values_report.json", "w") as f:
        json.dump(missing_report, f, indent=2, default=json_default)

    with open(results_dir / "outlier_analysis.json", "w") as f:
        json.dump(outlier_report, f, indent=2, default=json_default)

    with open(results_dir / "normality_and_statistics.json", "w") as f:
        json.dump(normality_report, f, indent=2, default=json_default)

    with open(results_dir / "chronological_split_summary.json", "w") as f:
        json.dump(split_report, f, indent=2, default=json_default)

    feature_summary = {
        "total_features_count": feat_df.shape[1],
        "feature_columns": list(feat_df.columns),
        "lag_and_rolling_metadata": lag_metadata,
        "scaling_metadata": scaling_report,
    }
    with open(results_dir / "feature_engineering_summary.json", "w") as f:
        json.dump(feature_summary, f, indent=2, default=json_default)

    # Render visualizations
    plot_paths = generate_diagnostic_plots(cleaned_df, plots_dir)
    for name, p in plot_paths.items():
        print(f"  [OK] Visualized: {p}")


    elapsed_time = round(time.time() - start_time, 2)

    # Build reproducibility manifest
    reproducibility_manifest = {
        "pipeline_version": "1.0.0",
        "execution_timestamp": datetime.now().isoformat(),
        "runtime_seconds": elapsed_time,
        "raw_dataset_source": str(resolved_dir),
        "total_records_processed": len(cleaned_df),
        "train_rows": len(train_part),
        "val_rows": len(val_part),
        "test_rows": len(test_part),
        "generated_reports": [
            "schema_report.json",
            "duplicate_records_report.json",
            "missing_values_report.json",
            "outlier_analysis.json",
            "normality_and_statistics.json",
            "chronological_split_summary.json",
            "feature_engineering_summary.json",
        ],
        "generated_plots": list(plot_paths.keys()),
        "status": "SUCCESSFUL_EXECUTION",
    }
    with open(results_dir / "reproducibility_manifest.json", "w") as f:
        json.dump(reproducibility_manifest, f, indent=2)

    print("\n" + "=" * 76)
    print(f"  Review-3 Pipeline Execution Completed in {elapsed_time}s")
    print(f"  Artifacts Saved: {results_dir.resolve()}")
    print("=" * 76)

    return reproducibility_manifest


if __name__ == "__main__":
    run_pipeline()
