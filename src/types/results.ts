/**
 * NEXUS Machine-Generated ML Results & Audit Types
 * Strictly typed interfaces for verified, reproducible Phase 1, Phase 2, and Phase 2.1 outputs.
 */

export type ForecastingProtocol =
  | '1-Step-Ahead Rolling Horizon (Weekly POS Feedback)'
  | 'Fixed-Origin Recursive Multi-Step (Autoregressive Roll-Forward)'
  | 'Fixed-Origin Direct (Pre-Origin 52w Observed Lag)'
  | 'Fixed-Origin Direct (Annual Fourier + US Holidays)'
  | 'Fixed-Origin Direct Multi-Step (Pre-Origin 52w Observed Lag)'
  | 'Fixed-Origin Direct Multi-Step (Annual Fourier Harmonics + Holidays)'
  | 'Fixed-Origin State-Space (Kalman Filter)'
  | 'Fixed-Origin State-Space Multi-Step (Kalman Filtered Forecast)'
  | 'Fixed-Origin Recursive Multi-Step (Linear Autoregressive Roll-Forward)'
  | '1-Step-Ahead Rolling Residual Hybrid'
  | '1-Step-Ahead Rolling Stacking (RF + XGB + Ridge)'
  | '1-Step-Ahead Rolling Multi-Stage Context Hybrid'

export type ModelArchitectureType = 'Baseline' | 'Hybrid'

export interface BenchmarkModelResult {
  model_name: string
  architecture_type: ModelArchitectureType
  evaluation_protocol: string
  forecast_horizon: string
  val_mae: number
  val_rmse: number
  val_wape: number
  val_mape: number
  val_r2: number
  test_mae: number
  test_rmse: number
  test_wape: number
  test_mape: number
  test_r2: number
  recursive_multistep_test_wape?: number
  train_time_sec: number
  infer_time_ms: number
  status: string
}

export interface BenchmarkMultiStepModelResult {
  model_name: string
  architecture_type: ModelArchitectureType
  evaluation_protocol: string
  forecast_horizon: string
  val_mae: number
  val_rmse: number
  val_wape: number
  test_mae: number
  test_rmse: number
  test_wape: number
  status: string
}

export interface DegradationModelMetrics {
  rolling_1step_test_wape: number
  recursive_multistep_test_wape: number
  recursive_multistep_test_mae: number
  horizon_degradation_wape: number
}

export interface MultiStepVsRollingComparison {
  description: string
  random_forest: DegradationModelMetrics
  xgboost: DegradationModelMetrics
  leakage_audit_conclusion: string
}

export interface ModelSelectionJustification {
  selected_model: string
  selection_basis: string
  validation_wape: number
  validation_mae: number
  validation_rmse: number
  linear_baseline_name: string
  linear_baseline_val_wape: number
  wape_improvement_over_linear: number
  percentage_error_reduction_over_linear: number
  out_of_time_test_wape: number
  out_of_time_test_mae: number
  statistical_and_empirical_justification: {
    normality_caveat: string
    empirical_validation_evidence: string
    residual_diagnostics_evidence: string
    dual_selection_recommendation: string
  }
}

export interface RawPredictionRow {
  Store: number
  Dept: number
  Date: string
  Weekly_Sales: number
  'Seasonal Naive': number
  ElasticNet: number
  'Random Forest': number
  XGBoost: number
  Prophet: number
  SARIMAX: number
  'Hybrid A': number
  'Hybrid B': number
  'Hybrid C': number
  'Proposed Hybrid': number
  Proposed_Lower: number
  Proposed_Upper: number
}

export interface PredictionRecord {
  store: number
  dept: number
  date: string
  weeklySales: number
  seasonalNaive: number
  elasticNet: number
  randomForest: number
  xgboost: number
  prophet: number
  sarimax: number
  hybridA: number
  hybridB: number
  hybridC: number
  proposedHybrid: number
  proposedLower: number
  proposedUpper: number
}

export interface UncertaintyDiagnostics {
  model_evaluated: string
  nominal_coverage_intended: number
  empirical_coverage_picp: number
  calibration_shortfall: number
  mean_interval_width_mpiw: number
  department_coverage_heterogeneity: {
    dept_1_picp: number
    dept_7_picp: number
    dept_72_picp: number
    dept_92_picp: number
  }
  store_coverage_heterogeneity: {
    store_1_picp: number
    store_10_picp: number
    store_14_picp: number
    store_20_picp: number
    store_35_picp: number
  }
  root_cause_diagnosis: string[]
  academic_recommendation: string
}

export interface IntegrityAuditManifest {
  audit_name: string
  audit_timestamp: string
  status: string
  dataset_manifest: {
    source: string
    training_partition: string
    validation_partition: string
    test_partition: string
    benchmark_cohort: {
      stores: number[]
      store_types: string[]
      departments: number[]
      department_categories: string[]
      total_series: number
    }
  }
  investigation_1_evaluation_protocol_consistency: {
    finding: string
    protocol_a_rolling_one_step: {
      definition: string
      operational_use_case: string
      feature_construction: string
      random_forest_test_wape: number
      random_forest_test_mae: number
      xgboost_test_wape: number
      xgboost_test_mae: number
      code_location: string
    }
    protocol_b_recursive_multi_step: {
      definition: string
      operational_use_case: string
      feature_construction: string
      random_forest_test_wape: number
      random_forest_test_mae: number
      xgboost_test_wape: number
      xgboost_test_mae: number
      elasticnet_test_wape: number
      elasticnet_test_mae: number
      code_location: string
    }
    horizon_degradation_analysis: {
      random_forest_degradation_wape: number
      xgboost_degradation_wape: number
      elasticnet_degradation_wape: number
      conclusion: string
    }
  }
  investigation_2_model_comparison_and_leakage_audit: {
    target_row_and_date_alignment: {
      validation_target_rows: number
      test_target_rows: number
      alignment_status: string
      verification: string
    }
    leaderboard_entry_count_explanation: {
      nominal_specification: string
      actual_leaderboard_entries: number
      explanation: string
    }
    leakage_prevention_verification: {
      residual_models_audit: string
      time_aware_stacking_audit: string
    }
  }
  investigation_3_model_selection_and_validation_divergence: {
    selection_protocol: string
    validation_rankings: Array<{
      rank: number
      model: string
      val_wape: number
      status: string
    }>
    validation_vs_test_divergence_analysis: {
      validation_winner: string
      test_winner: string
      reason_for_divergence: string
      academic_conclusion: string
    }
    department_level_breakdown_test_wape: Record<string, Record<string, number>>
    store_level_breakdown_test_wape: Record<string, Record<string, number>>
  }
  investigation_4_prediction_intervals_and_calibration_shortfall: UncertaintyDiagnostics
  investigation_5_reproducibility_and_verification: {
    test_suite_status: string
    execution_time_seconds: number
    csv_to_json_metric_parity: string
    verified_command: string
  }
}

export interface NormalityAndStatisticsReport {
  raw_sales_moments: {
    skewness: number
    excess_kurtosis: number
    skewness_classification: string
    kurtosis_classification: string
  }
  log_transformed_moments: {
    skewness: number
    excess_kurtosis: number
    transformation_effect: string
  }
  statistical_tests: {
    jarque_bera: {
      statistic: number
      p_value: number
      null_hypothesis: string
      rejected: boolean
    }
    dagostino_pearson: {
      statistic: number
      p_value: number
      null_hypothesis: string
      rejected: boolean
    }
    shapiro_wilk_sample: {
      sample_size: number
      statistic: number
      p_value: number
      null_hypothesis: string
      rejected: boolean
    }
  }
  conclusion: string
  is_gaussian: boolean
}
