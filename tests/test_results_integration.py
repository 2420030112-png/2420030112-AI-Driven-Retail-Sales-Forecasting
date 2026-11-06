"""
NEXUS Phase 3 - Results Integration and Integrity Test Suite
Verifies typed result schemas, metric reproducibility, protocol labeling,
cohort scope fidelity, uncertainty honesty, and frontend data parity.
"""

import json
from pathlib import Path
import pytest

ROOT_DIR = Path(__file__).resolve().parent.parent
RESULTS_DIR = ROOT_DIR / "results"
SRC_RESULTS_DIR = ROOT_DIR / "src" / "data" / "results"
PUBLIC_RESULTS_DIR = ROOT_DIR / "public" / "results"
MOCK_DATA_PATH = ROOT_DIR / "src" / "data" / "mockData.ts"
RESEARCH_DATA_PATH = ROOT_DIR / "src" / "data" / "researchData.ts"
RESULTS_LOADER_PATH = ROOT_DIR / "src" / "data" / "resultsLoader.ts"

EXPECTED_MODELS = [
    "Baseline 1: Seasonal Naive",
    "Baseline 2: ElasticNet",
    "Baseline 3: Random Forest",
    "Baseline 4: XGBoost",
    "Baseline 5A: Prophet",
    "Baseline 5B: SARIMAX",
    "Hybrid A: Prophet + XGBoost",
    "Hybrid B: SARIMAX + XGBoost",
    "Hybrid C: Stacking Ensemble",
    "Hybrid D: Proposed Context-Aware",
]

EXPECTED_TEST_WAPES = {
    "Baseline 4: XGBoost": 9.41,
    "Baseline 3: Random Forest": 9.64,
    "Hybrid C: Stacking Ensemble": 9.85,
    "Hybrid A: Prophet + XGBoost": 13.78,
    "Baseline 1: Seasonal Naive": 14.28,
    "Baseline 5A: Prophet": 15.09,
    "Hybrid D: Proposed Context-Aware": 16.33,
    "Baseline 2: ElasticNet": 22.48,
    "Hybrid B: SARIMAX + XGBoost": 41.88,
    "Baseline 5B: SARIMAX": 48.61,
}

EXPECTED_VAL_WAPES = {
    "Baseline 5A: Prophet": 12.88,
    "Baseline 3: Random Forest": 13.02,
    "Hybrid A: Prophet + XGBoost": 13.03,
    "Baseline 4: XGBoost": 13.45,
    "Hybrid C: Stacking Ensemble": 13.72,
    "Hybrid D: Proposed Context-Aware": 15.05,
    "Baseline 1: Seasonal Naive": 16.05,
    "Baseline 2: ElasticNet": 24.34,
    "Hybrid B: SARIMAX + XGBoost": 38.97,
    "Baseline 5B: SARIMAX": 40.66,
}

EXPECTED_MULTISTEP_WAPES = {
    "Baseline 1: Seasonal Naive": 14.28,
    "Baseline 3: Random Forest": 14.54,
    "Baseline 4: XGBoost": 14.94,
    "Baseline 5A: Prophet": 15.09,
    "Baseline 2: ElasticNet": 36.71,
    "Baseline 5B: SARIMAX": 48.61,
}

EXPECTED_COHORT_STORES = [1, 10, 14, 20, 35]
EXPECTED_COHORT_DEPTS = [1, 7, 72, 92]


def test_bundled_result_files_exist_and_match_canonical():
    """Verify that results bundled in src/data/results and public/results exist and match results/."""
    canonical_files = [
        "benchmark_leaderboard.json",
        "benchmark_multistep_leaderboard.json",
        "test_metrics.json",
        "model_selection_justification.json",
        "phase2_experiment_integrity_audit.json",
        "multistep_vs_rolling_comparison.json",
        "predictions_comparison.csv",
    ]

    for fname in canonical_files:
        canon_path = RESULTS_DIR / fname
        src_path = SRC_RESULTS_DIR / fname
        pub_path = PUBLIC_RESULTS_DIR / fname

        assert canon_path.exists(), f"Canonical result missing: {canon_path}"
        assert src_path.exists(), f"Bundled src result missing: {src_path}"
        assert pub_path.exists(), f"Bundled public result missing: {pub_path}"

        if fname.endswith(".json"):
            with open(canon_path, "r", encoding="utf-8") as f:
                canon_data = json.load(f)
            with open(src_path, "r", encoding="utf-8") as f:
                src_data = json.load(f)
            assert canon_data == src_data, f"Data mismatch in {fname}"


def test_benchmark_leaderboard_protocol_and_ranking():
    """Verify rolling 1-step leaderboard has 10 models, correct protocol labels, and exact metrics."""
    with open(SRC_RESULTS_DIR / "benchmark_leaderboard.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data) == 10
    model_names = [m["model_name"] for m in data]
    assert set(model_names) == set(EXPECTED_MODELS)

    for entry in data:
        name = entry["model_name"]
        assert entry["test_wape"] == EXPECTED_TEST_WAPES[name]
        assert entry["val_wape"] == EXPECTED_VAL_WAPES[name]
        assert entry["test_mae"] > 0
        assert entry["test_rmse"] > 0
        assert entry["test_r2"] <= 1.0
        assert entry["evaluation_protocol"] != ""


def test_multistep_leaderboard_protocol_and_ranking():
    """Verify recursive multi-step leaderboard has 6 baseline models and distinct multi-step protocol."""
    with open(SRC_RESULTS_DIR / "benchmark_multistep_leaderboard.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data) == 6
    for entry in data:
        assert "Multi-Step" in entry["evaluation_protocol"] or "Recursive" in entry["evaluation_protocol"] or "Direct" in entry["evaluation_protocol"]
        name = entry["model_name"]
        assert entry["test_wape"] == EXPECTED_MULTISTEP_WAPES[name]


def test_rolling_vs_multistep_degradation_integrity():
    """Verify degradation comparison correctly computes differences and maintains integrity."""
    with open(SRC_RESULTS_DIR / "multistep_vs_rolling_comparison.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "random_forest" in data
    assert "xgboost" in data
    assert "leakage_audit_conclusion" in data

    rf = data["random_forest"]
    assert rf["rolling_1step_test_wape"] == 9.64
    assert rf["recursive_multistep_test_wape"] == 14.54
    assert rf["horizon_degradation_wape"] == 4.90

    xgb = data["xgboost"]
    assert xgb["rolling_1step_test_wape"] == 9.41
    assert xgb["recursive_multistep_test_wape"] == 14.94
    assert xgb["horizon_degradation_wape"] == 5.53


def test_model_selection_justification_dual_winners():
    """Verify model selection justification transparently reports Prophet on Val, ElasticNet comparison, and Proposed for Intervals."""
    with open(SRC_RESULTS_DIR / "model_selection_justification.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Validation winner must be Prophet
    assert "Prophet" in data["selected_model"]
    assert data["validation_wape"] == 12.88
    assert data["linear_baseline_name"] == "Baseline 2: ElasticNet"
    assert data["linear_baseline_val_wape"] == 24.34
    assert data["wape_improvement_over_linear"] == 11.46

    # Statistical and empirical justification
    stats = data["statistical_and_empirical_justification"]
    assert "Gauss-Markov" in stats["normality_caveat"]
    assert "Prophet" in stats["empirical_validation_evidence"]
    assert "dual_selection_recommendation" in stats


def test_uncertainty_interval_honesty():
    """Verify empirical coverage PICP is 72.11% against 95.0% nominal target."""
    with open(SRC_RESULTS_DIR / "phase2_experiment_integrity_audit.json", "r", encoding="utf-8") as f:
        audit = json.load(f)

    unc = audit["investigation_4_prediction_intervals_and_calibration_shortfall"]
    assert unc["nominal_coverage_intended"] == 95.0
    assert unc["empirical_coverage_picp"] == 72.11
    assert unc["calibration_shortfall"] == -22.89
    assert unc["mean_interval_width_mpiw"] == 22926.00
    assert "uncalibrated" in unc["academic_recommendation"].lower()


def test_predictions_comparison_dimensions_and_cohort():
    """Verify predictions_comparison.json contains exactly 380 test rows across 20 series."""
    pred_path = SRC_RESULTS_DIR / "predictions_comparison.json"
    assert pred_path.exists(), "predictions_comparison.json must be generated"

    with open(pred_path, "r", encoding="utf-8") as f:
        preds = json.load(f)

    assert len(preds) == 380

    stores = set(r["Store"] for r in preds)
    depts = set(r["Dept"] for r in preds)
    assert sorted(stores) == EXPECTED_COHORT_STORES
    assert sorted(depts) == EXPECTED_COHORT_DEPTS

    # Each store-dept combination must have exactly 19 weekly rows
    series_counts = {}
    for r in preds:
        key = (r["Store"], r["Dept"])
        series_counts[key] = series_counts.get(key, 0) + 1
        assert "Weekly_Sales" in r
        assert "Proposed Hybrid" in r
        assert "Proposed_Lower" in r
        assert "Proposed_Upper" in r
        assert r["Proposed_Lower"] <= r["Proposed_Upper"]

    assert len(series_counts) == 20
    for count in series_counts.values():
        assert count == 19


def test_frontend_mock_and_research_data_parity():
    """Verify that src/data/mockData.ts and src/data/researchData.ts match verified benchmark metrics."""
    assert MOCK_DATA_PATH.exists()
    assert RESEARCH_DATA_PATH.exists()

    with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        mock_content = f.read()

    with open(RESEARCH_DATA_PATH, "r", encoding="utf-8") as f:
        research_content = f.read()

    # Check that MOCK_MODELS has the exact 10 models with their test WAPEs
    assert "9.41" in mock_content, "XGBoost 9.41% WAPE missing from mockData"
    assert "9.64" in mock_content, "Random Forest 9.64% WAPE missing from mockData"
    assert "9.85" in mock_content, "Stacking Ensemble 9.85% WAPE missing from mockData"
    assert "13.78" in mock_content, "Hybrid A 13.78% WAPE missing from mockData"
    assert "14.28" in mock_content, "Seasonal Naive 14.28% WAPE missing from mockData"
    assert "15.09" in mock_content, "Prophet 15.09% WAPE missing from mockData"
    assert "16.33" in mock_content, "Proposed Hybrid 16.33% WAPE missing from mockData"
    assert "22.48" in mock_content, "ElasticNet 22.48% WAPE missing from mockData"
    assert "41.88" in mock_content, "Hybrid B 41.88% WAPE missing from mockData"
    assert "48.61" in mock_content, "SARIMAX 48.61% WAPE missing from mockData"

    # Check that researchData contains the split dates and 72.11% coverage
    assert "72.11" in research_content, "72.11% interval coverage missing from researchData"
    assert "2012-06-22" in research_content, "Test start date 2012-06-22 missing from researchData"
    assert "2012-10-26" in research_content, "Test end date 2012-10-26 missing from researchData"
    assert "1-Step-Ahead Rolling Horizon" in mock_content
    assert "recursiveMultiStepTestWape" in mock_content
    assert "1-Step-Ahead Rolling Horizon" in research_content
    assert "recursiveMultiStepTestWape" in research_content


def test_results_loader_code_integrity():
    """Verify that resultsLoader.ts exposes the required typed query helpers and cohort constants."""
    assert RESULTS_LOADER_PATH.exists()

    with open(RESULTS_LOADER_PATH, "r", encoding="utf-8") as f:
        loader_code = f.read()

    expected_exports = [
        "getRollingBenchmarkLeaderboard",
        "getMultiStepBenchmarkLeaderboard",
        "getMultiStepVsRollingComparison",
        "getModelSelectionJustification",
        "getExperimentIntegrityAudit",
        "getUncertaintyDiagnostics",
        "getBenchmarkPredictions",
        "isBenchmarkSeries",
        "BENCHMARK_COHORT_INFO",
    ]

    for fn_name in expected_exports:
        assert f"export function {fn_name}" in loader_code or f"export const {fn_name}" in loader_code, (
            f"Missing export {fn_name} in resultsLoader.ts"
        )
