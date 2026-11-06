/**
 * Typed Results Loader & Adapter Layer
 * Ingests machine-generated JSON/CSV artifacts from Phase 1, Phase 2, and Phase 2.1.
 * Guarantees zero fabricated metrics and strict separation between rolling 1-step and recursive multi-step forecasting protocols.
 */

import {
  BenchmarkModelResult,
  BenchmarkMultiStepModelResult,
  MultiStepVsRollingComparison,
  ModelSelectionJustification,
  IntegrityAuditManifest,
  RawPredictionRow,
  PredictionRecord,
  UncertaintyDiagnostics,
  NormalityAndStatisticsReport,
} from '../types/results'

// Import static JSON results bundled at build time by Vite
import benchmarkLeaderboardJson from './results/benchmark_leaderboard.json'
import benchmarkMultiStepLeaderboardJson from './results/benchmark_multistep_leaderboard.json'
import multiStepVsRollingJson from './results/multistep_vs_rolling_comparison.json'
import modelSelectionJson from './results/model_selection_justification.json'
import integrityAuditJson from './results/phase2_experiment_integrity_audit.json'
import normalityJson from './results/normality_and_statistics.json'
import predictionsComparisonJson from './results/predictions_comparison.json'
import testMetricsJson from './results/test_metrics.json'
import validationMetricsJson from './results/validation_metrics.json'

/**
 * Standardized Benchmark Cohort Scope Metadata
 * 20 series across 5 stores and 4 departments (380 test rows).
 */
export const BENCHMARK_COHORT_INFO = {
  stores: [1, 10, 14, 20, 35],
  storeDetails: [
    { id: 1, name: 'Store 1', type: 'Supercenter (Type A)', region: 'Ozark Metro' },
    { id: 10, name: 'Store 10', type: 'Supercenter (Type B)', region: 'Southwest' },
    { id: 14, name: 'Store 14', type: 'Suburban (Type A)', region: 'Northeast' },
    { id: 20, name: 'Store 20', type: 'Supercenter (Type A)', region: 'Northeast' },
    { id: 35, name: 'Store 35', type: 'Compact (Type C)', region: 'Mid-Atlantic' },
  ],
  departments: [1, 7, 72, 92],
  departmentDetails: [
    { id: 1, name: 'Candy / Seasonal', category: 'High Seasonal Turn' },
    { id: 7, name: 'Sporting Goods', category: 'General Merchandise' },
    { id: 72, name: 'Electronics', category: 'Holiday Surge Volatile' },
    { id: 92, name: 'Groceries / Pantry', category: 'High Volume Staple' },
  ],
  totalSeries: 20,
  trainWeeks: 106,
  validationWeeks: 18,
  testWeeks: 19,
  trainRows: 2120,
  valRows: 360,
  testRows: 380,
  scopeDisclaimer:
    'ML benchmark models were trained and rigorously evaluated on the standardized 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows). Do not extrapolate benchmark rankings to non-evaluated network nodes without validation.',
}

/**
 * Check if a store and department combination belongs to the evaluated benchmark cohort
 */
export function isBenchmarkSeries(storeId: number, deptId: number): boolean {
  return (
    BENCHMARK_COHORT_INFO.stores.includes(storeId) &&
    BENCHMARK_COHORT_INFO.departments.includes(deptId)
  )
}

/**
 * Retrieve verified 1-step rolling horizon benchmark leaderboard (10 models)
 */
export function getRollingBenchmarkLeaderboard(): BenchmarkModelResult[] {
  if (!Array.isArray(benchmarkLeaderboardJson)) {
    throw new Error('Malformed benchmark_leaderboard.json: expected array')
  }
  return benchmarkLeaderboardJson as BenchmarkModelResult[]
}

/**
 * Retrieve verified fixed-origin recursive multi-step benchmark leaderboard (6 models)
 */
export function getMultiStepBenchmarkLeaderboard(): BenchmarkMultiStepModelResult[] {
  if (!Array.isArray(benchmarkMultiStepLeaderboardJson)) {
    throw new Error('Malformed benchmark_multistep_leaderboard.json: expected array')
  }
  return benchmarkMultiStepLeaderboardJson as BenchmarkMultiStepModelResult[]
}

/**
 * Retrieve verified error accumulation degradation comparison
 */
export function getMultiStepVsRollingComparison(): MultiStepVsRollingComparison {
  return multiStepVsRollingJson as unknown as MultiStepVsRollingComparison
}

/**
 * Retrieve verified model selection justification and statistical evidence
 */
export function getModelSelectionJustification(): ModelSelectionJustification {
  return modelSelectionJson as unknown as ModelSelectionJustification
}

/**
 * Retrieve complete Phase 2.1 forensic experiment integrity audit
 */
export function getExperimentIntegrityAudit(): IntegrityAuditManifest {
  return integrityAuditJson as unknown as IntegrityAuditManifest
}

/**
 * Retrieve normality and statistical tests report
 */
export function getNormalityReport(): NormalityAndStatisticsReport {
  return normalityJson as unknown as NormalityAndStatisticsReport
}

/**
 * Retrieve raw test metrics map
 */
export function getTestMetricsMap(): Record<string, Record<string, number>> {
  return testMetricsJson as Record<string, Record<string, number>>
}

/**
 * Retrieve raw validation metrics map
 */
export function getValidationMetricsMap(): Record<string, Record<string, number>> {
  return validationMetricsJson as Record<string, Record<string, number>>
}

/**
 * Retrieve uncertainty and prediction interval diagnostics
 */
export function getUncertaintyDiagnostics(): UncertaintyDiagnostics {
  const audit = getExperimentIntegrityAudit()
  return audit.investigation_4_prediction_intervals_and_calibration_shortfall
}

/**
 * Map raw prediction row to clean camelCase interface
 */
function mapRawPredictionRow(row: RawPredictionRow): PredictionRecord {
  return {
    store: row.Store,
    dept: row.Dept,
    date: row.Date,
    weeklySales: row.Weekly_Sales,
    seasonalNaive: row['Seasonal Naive'],
    elasticNet: row.ElasticNet,
    randomForest: row['Random Forest'],
    xgboost: row.XGBoost,
    prophet: row.Prophet,
    sarimax: row.SARIMAX,
    hybridA: row['Hybrid A'],
    hybridB: row['Hybrid B'],
    hybridC: row['Hybrid C'],
    proposedHybrid: row['Proposed Hybrid'],
    proposedLower: row.Proposed_Lower,
    proposedUpper: row.Proposed_Upper,
  }
}

/**
 * Retrieve authentic test predictions from predictions_comparison.csv
 * Optional filters by store and department.
 */
export function getBenchmarkPredictions(storeId?: number, deptId?: number): PredictionRecord[] {
  const rawRows = predictionsComparisonJson as RawPredictionRow[]
  let filtered = rawRows

  if (storeId !== undefined) {
    filtered = filtered.filter((r) => r.Store === storeId)
  }
  if (deptId !== undefined) {
    filtered = filtered.filter((r) => r.Dept === deptId)
  }

  return filtered.map(mapRawPredictionRow)
}

/**
 * Get distinct available dates in the test partition (19 weeks)
 */
export function getBenchmarkTestDates(): string[] {
  const rawRows = predictionsComparisonJson as RawPredictionRow[]
  const dateSet = new Set<string>()
  rawRows.forEach((r) => dateSet.add(r.Date))
  return Array.from(dateSet).sort()
}
