import { describe, it, expect } from 'vitest';
import {
  getRollingBenchmarkLeaderboard,
  getMultiStepBenchmarkLeaderboard,
  getMultiStepVsRollingComparison,
  getModelSelectionJustification,
  getExperimentIntegrityAudit,
  getUncertaintyDiagnostics,
  getBenchmarkPredictions,
  getBenchmarkTestDates,
  isBenchmarkSeries,
  BENCHMARK_COHORT_INFO,
} from '../src/data/resultsLoader';

describe('NEXUS Results Loader & Typed Integration Tests', () => {
  describe('1. Typed Result Parsing & Schema Integrity', () => {
    it('loads exactly 10 audited models in the rolling 1-step benchmark leaderboard', () => {
      const rolling = getRollingBenchmarkLeaderboard();
      expect(rolling).toHaveLength(10);

      // Model rank 1 must be XGBoost
      const xgb = rolling.find((m) => m.model_name === 'Baseline 4: XGBoost');
      expect(xgb).toBeDefined();
      expect(xgb?.test_wape).toBe(9.41);
      expect(xgb?.val_wape).toBe(13.45);
      expect(xgb?.test_mae).toBe(5663.9);
      expect(xgb?.test_rmse).toBe(8663.68);
      expect(xgb?.test_r2).toBe(0.9655);

      // Model rank 2 must be Random Forest
      const rf = rolling.find((m) => m.model_name === 'Baseline 3: Random Forest');
      expect(rf).toBeDefined();
      expect(rf?.test_wape).toBe(9.64);
      expect(rf?.val_wape).toBe(13.02);
      expect(rf?.test_mae).toBe(5802.75);

      // Model rank 3 must be Stacking Ensemble
      const stacking = rolling.find((m) => m.model_name.includes('Stacking Ensemble'));
      expect(stacking).toBeDefined();
      expect(stacking?.test_wape).toBe(9.85);

      // Validation winner is Prophet
      const prophet = rolling.find((m) => m.model_name === 'Baseline 5A: Prophet');
      expect(prophet).toBeDefined();
      expect(prophet?.val_wape).toBe(12.88);
      expect(prophet?.test_wape).toBe(15.09);

      // Check all models have required numeric and string attributes
      rolling.forEach((m) => {
        expect(m.model_name).toBeTruthy();
        expect(m.architecture_type).toMatch(/Baseline|Hybrid/);
        expect(typeof m.test_wape).toBe('number');
        expect(typeof m.val_wape).toBe('number');
        expect(typeof m.test_mae).toBe('number');
        expect(typeof m.test_rmse).toBe('number');
        expect(typeof m.test_r2).toBe('number');
        expect(m.evaluation_protocol).toBeTruthy();
      });
    });

    it('loads exactly 6 baseline models in the fixed-origin recursive multi-step leaderboard', () => {
      const multiStep = getMultiStepBenchmarkLeaderboard();
      expect(multiStep).toHaveLength(6);

      // Multi-step rank 1 is Seasonal Naive (no autoregressive error compounding)
      const naive = multiStep.find((m) => m.model_name === 'Baseline 1: Seasonal Naive');
      expect(naive).toBeDefined();
      expect(naive?.test_wape).toBe(14.28);

      // Multi-step rank 2 is Random Forest (14.54%)
      const rf = multiStep.find((m) => m.model_name === 'Baseline 3: Random Forest');
      expect(rf).toBeDefined();
      expect(rf?.test_wape).toBe(14.54);

      // XGBoost multi-step is 14.94%
      const xgb = multiStep.find((m) => m.model_name === 'Baseline 4: XGBoost');
      expect(xgb).toBeDefined();
      expect(xgb?.test_wape).toBe(14.94);

      // ElasticNet multi-step degrades severely to 36.71%
      const eln = multiStep.find((m) => m.model_name === 'Baseline 2: ElasticNet');
      expect(eln).toBeDefined();
      expect(eln?.test_wape).toBe(36.71);
    });

    it('loads multi-step vs rolling degradation comparison with verified delta metrics', () => {
      const comparison = getMultiStepVsRollingComparison();
      expect(comparison).toBeDefined();
      expect(comparison.description).toBeTruthy();
      expect(comparison.leakage_audit_conclusion).toBeTruthy();

      // Random Forest degradation
      expect(comparison.random_forest.rolling_1step_test_wape).toBe(9.64);
      expect(comparison.random_forest.recursive_multistep_test_wape).toBe(14.54);
      expect(comparison.random_forest.horizon_degradation_wape).toBe(4.9);

      // XGBoost degradation
      expect(comparison.xgboost.rolling_1step_test_wape).toBe(9.41);
      expect(comparison.xgboost.recursive_multistep_test_wape).toBe(14.94);
      expect(comparison.xgboost.horizon_degradation_wape).toBe(5.53);
    });
  });

  describe('2. Explicit Evaluation-Protocol Labeling', () => {
    it('labels models with their specific, explicit evaluation protocols', () => {
      const rolling = getRollingBenchmarkLeaderboard();

      // Lag-dependent 1-step models
      const rf = rolling.find((m) => m.model_name === 'Baseline 3: Random Forest');
      expect(rf?.evaluation_protocol).toBe('1-Step-Ahead Rolling Horizon (Weekly POS Feedback)');

      const xgb = rolling.find((m) => m.model_name === 'Baseline 4: XGBoost');
      expect(xgb?.evaluation_protocol).toBe('1-Step-Ahead Rolling Horizon (Weekly POS Feedback)');

      // Direct models
      const naive = rolling.find((m) => m.model_name === 'Baseline 1: Seasonal Naive');
      expect(naive?.evaluation_protocol).toBe('Fixed-Origin Direct (Pre-Origin 52w Observed Lag)');

      const prophet = rolling.find((m) => m.model_name === 'Baseline 5A: Prophet');
      expect(prophet?.evaluation_protocol).toBe('Fixed-Origin Direct (Annual Fourier + US Holidays)');
    });

    it('labels multi-step leaderboard models with distinct multi-step protocol annotations', () => {
      const multiStep = getMultiStepBenchmarkLeaderboard();
      multiStep.forEach((m) => {
        expect(m.evaluation_protocol).toMatch(/Multi-Step|Direct|Recursive/);
      });
    });
  });

  describe('3. Model Selection Justification & Dual Winners', () => {
    it('transparently identifies Prophet as the validation winner and documents linear baseline improvement', () => {
      const justification = getModelSelectionJustification();

      // Validation winner must be Prophet
      expect(justification.selected_model).toBe('Baseline 5A: Prophet');
      expect(justification.validation_wape).toBe(12.88);
      expect(justification.validation_mae).toBe(8399.21);
      expect(justification.linear_baseline_name).toBe('Baseline 2: ElasticNet');
      expect(justification.linear_baseline_val_wape).toBe(24.34);
      expect(justification.wape_improvement_over_linear).toBe(11.46);
      expect(justification.out_of_time_test_wape).toBe(15.09);
    });

    it('articulates Gauss-Markov normality nuance and dual selection recommendation', () => {
      const justification = getModelSelectionJustification();
      const stats = justification.statistical_and_empirical_justification;

      expect(stats.normality_caveat).toContain('Gauss-Markov');
      expect(stats.normality_caveat).toContain('BLUE');
      expect(stats.empirical_validation_evidence).toContain('Prophet');
      expect(stats.dual_selection_recommendation).toContain('Baseline 5A: Prophet');
      expect(stats.dual_selection_recommendation).toContain('Hybrid D');
    });
  });

  describe('4. Uncertainty Diagnostics & Honest Interval Reporting', () => {
    it('reports empirical coverage of 72.11% against nominal 95% target honestly', () => {
      const diag = getUncertaintyDiagnostics();
      expect(diag.nominal_coverage_intended).toBe(95.0);
      expect(diag.empirical_coverage_picp).toBe(72.11);
      expect(diag.calibration_shortfall).toBe(-22.89);
      expect(diag.mean_interval_width_mpiw).toBe(22926.0);
      expect(diag.root_cause_diagnosis.length).toBeGreaterThan(0);
      expect(diag.academic_recommendation).toContain('uncalibrated heuristic');
    });

    it('reports department-level interval coverage breakdown correctly', () => {
      const diag = getUncertaintyDiagnostics();
      expect(diag.department_coverage_heterogeneity.dept_1_picp).toBe(100.0);
      expect(diag.department_coverage_heterogeneity.dept_7_picp).toBe(78.95);
      expect(diag.department_coverage_heterogeneity.dept_72_picp).toBe(40.0);
      expect(diag.department_coverage_heterogeneity.dept_92_picp).toBe(69.47);
    });

    it('reports store-level interval coverage heterogeneity', () => {
      const diag = getUncertaintyDiagnostics();
      expect(diag.store_coverage_heterogeneity.store_1_picp).toBe(94.74);
      expect(diag.store_coverage_heterogeneity.store_10_picp).toBe(71.05);
      expect(diag.store_coverage_heterogeneity.store_14_picp).toBe(40.79);
      expect(diag.store_coverage_heterogeneity.store_20_picp).toBe(65.79);
      expect(diag.store_coverage_heterogeneity.store_35_picp).toBe(88.16);
    });
  });

  describe('5. Cohort Scope Integrity & Unavailable Prediction Handling', () => {
    it('defines the authentic 20-series cohort scope correctly', () => {
      expect(BENCHMARK_COHORT_INFO.totalSeries).toBe(20);
      expect(BENCHMARK_COHORT_INFO.stores).toEqual([1, 10, 14, 20, 35]);
      expect(BENCHMARK_COHORT_INFO.departments).toEqual([1, 7, 72, 92]);
      expect(BENCHMARK_COHORT_INFO.trainRows).toBe(2120);
      expect(BENCHMARK_COHORT_INFO.valRows).toBe(360);
      expect(BENCHMARK_COHORT_INFO.testRows).toBe(380);
      expect(BENCHMARK_COHORT_INFO.trainWeeks).toBe(106);
      expect(BENCHMARK_COHORT_INFO.validationWeeks).toBe(18);
      expect(BENCHMARK_COHORT_INFO.testWeeks).toBe(19);
    });

    it('correctly identifies benchmark cohort series vs non-benchmark series', () => {
      // In cohort
      expect(isBenchmarkSeries(1, 1)).toBe(true);
      expect(isBenchmarkSeries(10, 7)).toBe(true);
      expect(isBenchmarkSeries(14, 72)).toBe(true);
      expect(isBenchmarkSeries(20, 92)).toBe(true);
      expect(isBenchmarkSeries(35, 1)).toBe(true);

      // Not in cohort
      expect(isBenchmarkSeries(2, 1)).toBe(false);
      expect(isBenchmarkSeries(1, 2)).toBe(false);
      expect(isBenchmarkSeries(45, 81)).toBe(false);
      expect(isBenchmarkSeries(99, 99)).toBe(false);
    });

    it('returns authentic 19 test predictions for in-cohort series with ground truth sales and intervals', () => {
      const preds = getBenchmarkPredictions(1, 1);
      expect(preds).toHaveLength(19);

      preds.forEach((row) => {
        expect(row.store).toBe(1);
        expect(row.dept).toBe(1);
        expect(row.date).toBeDefined();
        expect(typeof row.weeklySales).toBe('number');
        expect(row.weeklySales).toBeGreaterThan(0);
        expect(typeof row.proposedHybrid).toBe('number');
        expect(typeof row.proposedLower).toBe('number');
        expect(typeof row.proposedUpper).toBe('number');
        expect(row.proposedLower).toBeLessThanOrEqual(row.proposedUpper);
      });
    });

    it('returns exactly 19 distinct test dates spanning 2012-06-22 to 2012-10-26', () => {
      const dates = getBenchmarkTestDates();
      expect(dates).toHaveLength(19);
      expect(dates[0]).toBe('2012-06-22');
      expect(dates[dates.length - 1]).toBe('2012-10-26');
    });

    it('returns empty array [] for series outside the benchmark cohort without inventing fallback metrics', () => {
      const nonExistent = getBenchmarkPredictions(2, 3);
      expect(nonExistent).toEqual([]);
      expect(nonExistent).toHaveLength(0);

      const invalidStore = getBenchmarkPredictions(999, 999);
      expect(invalidStore).toEqual([]);
    });
  });

  describe('6. Experiment Integrity Audit Manifest Verification', () => {
    it('contains verified metadata from Phase 2.1 experiment integrity audit', () => {
      const audit = getExperimentIntegrityAudit();
      expect(audit.audit_timestamp).toBeTruthy();
      expect(audit.status).toBe('VERIFIED_AUDITED');
      expect(audit.dataset_manifest.benchmark_cohort.total_series).toBe(20);
      expect(audit.dataset_manifest.benchmark_cohort.stores).toEqual([1, 10, 14, 20, 35]);
      expect(audit.dataset_manifest.benchmark_cohort.departments).toEqual([1, 7, 72, 92]);
      expect(audit.investigation_2_model_comparison_and_leakage_audit.target_row_and_date_alignment.alignment_status).toBe('EXACT_100_PERCENT_MATCH');
      expect(audit.investigation_5_reproducibility_and_verification.test_suite_status).toBe('ALL_18_TESTS_PASSING');
    });
  });
});
