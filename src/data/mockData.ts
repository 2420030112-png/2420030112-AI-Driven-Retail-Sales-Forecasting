import { Store, Department, ForecastRecord, ModelBenchmark, RetailInsight, DataHealthMetric, TimeSeriesPoint } from '../types'

export const MOCK_STORES: Store[] = [
  {
    id: 1,
    name: "Store 01 — Rogers Metro",
    type: "A",
    sizeSqFt: 151315,
    location: "Rogers, AR",
    region: "Ozark District",
    totalHistoricalSales: 164287400,
    avgWeeklySales: 1148862,
    departmentCount: 78,
    trendPercent: 3.4,
    volatility: "Low",
    status: "Active"
  },
  {
    id: 2,
    name: "Store 02 — Dallas Galleria",
    type: "A",
    sizeSqFt: 202307,
    location: "Dallas, TX",
    region: "Southwest",
    totalHistoricalSales: 275883200,
    avgWeeklySales: 1929253,
    departmentCount: 82,
    trendPercent: 5.8,
    volatility: "Moderate",
    status: "Active"
  },
  {
    id: 3,
    name: "Store 03 — Savannah Coast",
    type: "B",
    sizeSqFt: 37392,
    location: "Savannah, GA",
    region: "Southeast",
    totalHistoricalSales: 57586000,
    avgWeeklySales: 402699,
    departmentCount: 65,
    trendPercent: -1.2,
    volatility: "Moderate",
    status: "Active"
  },
  {
    id: 4,
    name: "Store 04 — Denver Tech Center",
    type: "A",
    sizeSqFt: 205863,
    location: "Denver, CO",
    region: "Mountain West",
    totalHistoricalSales: 299543000,
    avgWeeklySales: 2094706,
    departmentCount: 81,
    trendPercent: 7.2,
    volatility: "Low",
    status: "Active"
  },
  {
    id: 10,
    name: "Store 10 — Phoenix Oasis",
    type: "B",
    sizeSqFt: 126512,
    location: "Phoenix, AZ",
    region: "Southwest",
    totalHistoricalSales: 271617000,
    avgWeeklySales: 1899420,
    departmentCount: 79,
    trendPercent: 4.1,
    volatility: "Low",
    status: "Active"
  },
  {
    id: 13,
    name: "Store 13 — Salt Lake Valley",
    type: "A",
    sizeSqFt: 219622,
    location: "Salt Lake City, UT",
    region: "Mountain West",
    totalHistoricalSales: 286511000,
    avgWeeklySales: 2003573,
    departmentCount: 82,
    trendPercent: 6.3,
    volatility: "Moderate",
    status: "Active"
  },
  {
    id: 14,
    name: "Store 14 — Philadelphia Urban",
    type: "A",
    sizeSqFt: 200898,
    location: "Philadelphia, PA",
    region: "Northeast",
    totalHistoricalSales: 288999000,
    avgWeeklySales: 2020972,
    departmentCount: 80,
    trendPercent: 2.1,
    volatility: "High",
    status: "Active"
  },
  {
    id: 20,
    name: "Store 20 — Bethlehem Flagship",
    type: "A",
    sizeSqFt: 203742,
    location: "Bethlehem, PA",
    region: "Northeast",
    totalHistoricalSales: 301397000,
    avgWeeklySales: 2107671,
    departmentCount: 83,
    trendPercent: 8.9,
    volatility: "Low",
    status: "Active"
  },
  {
    id: 33,
    name: "Store 33 — El Paso Border",
    type: "C",
    sizeSqFt: 39690,
    location: "El Paso, TX",
    region: "Southwest",
    totalHistoricalSales: 37160000,
    avgWeeklySales: 259860,
    departmentCount: 54,
    trendPercent: 1.0,
    volatility: "Low",
    status: "Active"
  },
  {
    id: 38,
    name: "Store 38 — Modesto Crossroads",
    type: "C",
    sizeSqFt: 39690,
    location: "Modesto, CA",
    region: "West Coast",
    totalHistoricalSales: 55159000,
    avgWeeklySales: 385727,
    departmentCount: 56,
    trendPercent: -0.8,
    volatility: "Moderate",
    status: "Active"
  }
]

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: "Candy & Confections", category: "Packaged Goods", avgWeeklySales: 22450, volatilityIndex: 0.18 },
  { id: 2, name: "Health & Personal Care", category: "Consumables", avgWeeklySales: 48920, volatilityIndex: 0.12 },
  { id: 3, name: "Stationery & Office", category: "General Merchandise", avgWeeklySales: 16840, volatilityIndex: 0.35 },
  { id: 7, name: "Boys' Apparel & Basics", category: "Apparel", avgWeeklySales: 31200, volatilityIndex: 0.28 },
  { id: 13, name: "Household Cleaning & Paper", category: "Consumables", avgWeeklySales: 54200, volatilityIndex: 0.09 },
  { id: 38, name: "Prescription Pharmacy", category: "Health", avgWeeklySales: 78900, volatilityIndex: 0.08 },
  { id: 40, name: "Pet Supplies & Care", category: "Consumables", avgWeeklySales: 39800, volatilityIndex: 0.14 },
  { id: 72, name: "Electronics & Audio", category: "High Value Hardlines", avgWeeklySales: 112400, volatilityIndex: 0.62 },
  { id: 92, name: "Dry Grocery & Pantry", category: "Food & Beverage", avgWeeklySales: 146500, volatilityIndex: 0.11 },
  { id: 95, name: "Beverages, Snacks & Dairy", category: "Food & Beverage", avgWeeklySales: 132800, volatilityIndex: 0.13 }
]

export const INITIAL_FORECASTS: ForecastRecord[] = [
  {
    id: "fc-bm-001",
    storeId: 1,
    storeName: "Store 01 — Rogers Metro",
    deptId: 1,
    deptName: "Candy & Confections",
    horizonWeeks: 12,
    status: "Completed",
    createdAt: "2026-10-15 22:30",
    modelUsed: "Baseline 4: XGBoost",
    projectedSales: 247180,
    historicalBaseline: 231500,
    changePercent: 6.77,
    confidenceScore: 0.94,
    interpretation: "Verified Benchmark Cohort: Low-volatility seasonal surge heading into Halloween. 1-step rolling WAPE 6.67% (MAE $1,180.20), outperforming linear baseline.",
    metrics: { mae: 1180, rmse: 1640, mape: 6.67, r2: 0.965 }
  },
  {
    id: "fc-bm-002",
    storeId: 20,
    storeName: "Store 20 — Bethlehem Flagship",
    deptId: 72,
    deptName: "Electronics & Audio",
    horizonWeeks: 12,
    status: "Completed",
    createdAt: "2026-10-15 22:35",
    modelUsed: "Hybrid D: Proposed Context-Aware",
    projectedSales: 1342500,
    historicalBaseline: 1180000,
    changePercent: 13.77,
    confidenceScore: 0.88,
    interpretation: "Verified Benchmark Cohort: High-volatility holiday surge category. Empirical interval coverage 40.0% PICP due to large markdown spikes; uncalibrated heuristic intervals active.",
    metrics: { mae: 9828, rmse: 15512, mape: 22.21, r2: 0.889 }
  },
  {
    id: "fc-bm-003",
    storeId: 10,
    storeName: "Store 10 — Phoenix Oasis",
    deptId: 92,
    deptName: "Dry Grocery & Pantry",
    horizonWeeks: 8,
    status: "Completed",
    createdAt: "2026-10-15 22:40",
    modelUsed: "Baseline 5A: Prophet",
    projectedSales: 894000,
    historicalBaseline: 852000,
    changePercent: 4.93,
    confidenceScore: 0.95,
    interpretation: "Verified Benchmark Cohort: Selected final validation model. Steady-state Fourier annual harmonics capture recurring grocery replenishment; 10.77% test WAPE.",
    metrics: { mae: 5410, rmse: 7890, mape: 10.77, r2: 0.931 }
  },
  {
    id: "fc-bm-004",
    storeId: 14,
    storeName: "Store 14 — Philadelphia Urban",
    deptId: 1,
    deptName: "Candy & Confections",
    horizonWeeks: 4,
    status: "Completed",
    createdAt: "2026-10-15 22:45",
    modelUsed: "Baseline 3: Random Forest",
    projectedSales: 108400,
    historicalBaseline: 98500,
    changePercent: 10.05,
    confidenceScore: 0.92,
    interpretation: "Verified Benchmark Cohort: Tree ensemble with 9.64% overall test WAPE. Bagged trees handle localized urban markdown variability.",
    metrics: { mae: 1480, rmse: 2020, mape: 7.54, r2: 0.963 }
  },
  {
    id: "fc-bm-005",
    storeId: 35,
    storeName: "Store 35 — Compact Unit",
    deptId: 7,
    deptName: "Sporting Goods",
    horizonWeeks: 8,
    status: "Completed",
    createdAt: "2026-10-15 22:50",
    modelUsed: "Hybrid C: Stacking Ensemble",
    projectedSales: 198400,
    historicalBaseline: 189000,
    changePercent: 4.97,
    confidenceScore: 0.93,
    interpretation: "Verified Benchmark Cohort: Stacking ensemble (RF + XGB + Ridge meta-learner). Achieved 9.85% overall WAPE with high cross-series stability.",
    metrics: { mae: 2340, rmse: 3560, mape: 13.07, r2: 0.965 }
  }
]

export const MOCK_MODELS: ModelBenchmark[] = [
  {
    id: "xgboost-v2",
    name: "Baseline 4: XGBoost",
    family: "Tree-Ensemble",
    version: "2.4.1",
    description: "Gradient boosted decision trees with lag features (t-1 to t-8), rolling statistics, holiday indicators, and markdown decay weights.",
    mae: 5663.90,
    rmse: 8663.68,
    mape: 10.31,
    wape: 9.41,
    r2: 0.9655,
    valMae: 8766.36,
    valRmse: 13855.96,
    valWape: 13.45,
    valR2: 0.9270,
    trainingTimeSec: 0.54,
    inferenceLatencyMs: 5.50,
    featuresCount: 38,
    evaluationProtocol: "1-Step-Ahead Rolling Horizon (Weekly POS Feedback)",
    forecastHorizon: "1 Week Ahead (h=1 week)",
    recursiveMultiStepTestWape: 14.94,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Lowest 1-step rolling out-of-time test error (9.41% WAPE) across volatile promotional categories.",
    status: "Production",
    hyperparameters: {
      n_estimators: 450,
      learning_rate: 0.045,
      max_depth: 6,
      subsample: 0.85,
      colsample_bytree: 0.8,
      reg_alpha: 0.25,
      reg_lambda: 1.5
    },
    featureImportance: [
      { feature: "Rolling_Avg_4W", weight: 0.28 },
      { feature: "Lag_1W_Sales", weight: 0.22 },
      { feature: "Is_Holiday_Week", weight: 0.14 },
      { feature: "MarkDown_Total", weight: 0.12 },
      { feature: "Store_Size_SqFt", weight: 0.09 },
      { feature: "Weekly_Temperature", weight: 0.06 },
      { feature: "CPI_Index", weight: 0.05 },
      { feature: "Fuel_Price", weight: 0.04 }
    ]
  },
  {
    id: "random-forest",
    name: "Baseline 3: Random Forest",
    family: "Tree-Ensemble",
    version: "1.8.0",
    description: "Bagged decision tree forest resilient to outlier noise with localized split finding.",
    mae: 5802.75,
    rmse: 9008.18,
    mape: 10.61,
    wape: 9.64,
    r2: 0.9627,
    valMae: 8486.51,
    valRmse: 14767.40,
    valWape: 13.02,
    valR2: 0.9171,
    trainingTimeSec: 0.33,
    inferenceLatencyMs: 46.82,
    featuresCount: 34,
    evaluationProtocol: "1-Step-Ahead Rolling Horizon (Weekly POS Feedback)",
    forecastHorizon: "1 Week Ahead (h=1 week)",
    recursiveMultiStepTestWape: 14.54,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Top-tier out-of-time point forecaster (9.64% WAPE) and best multi-step recursive tree forecaster (14.54% WAPE).",
    status: "Challenger",
    hyperparameters: {
      n_estimators: 300,
      max_depth: 14,
      min_samples_split: 5,
      min_samples_leaf: 2,
      max_features: "sqrt"
    },
    featureImportance: [
      { feature: "Lag_1W_Sales", weight: 0.25 },
      { feature: "Rolling_Avg_4W", weight: 0.24 },
      { feature: "Store_Type", weight: 0.13 },
      { feature: "Is_Holiday_Week", weight: 0.12 },
      { feature: "MarkDown1_Cleaned", weight: 0.10 },
      { feature: "Unemployment_Rate", weight: 0.08 },
      { feature: "Store_Size_SqFt", weight: 0.08 }
    ]
  },
  {
    id: "prophet",
    name: "Baseline 5A: Prophet",
    family: "Additive",
    version: "1.1.5",
    description: "Decomposable additive time series model with yearly seasonality, US holiday calendars, and changepoints.",
    mae: 9080.32,
    rmse: 13350.01,
    mape: 16.00,
    wape: 15.09,
    r2: 0.9182,
    valMae: 8399.21,
    valRmse: 13479.59,
    valWape: 12.88,
    valR2: 0.9309,
    trainingTimeSec: 8.59,
    inferenceLatencyMs: 4129.78,
    featuresCount: 16,
    evaluationProtocol: "Fixed-Origin Direct (Annual Fourier + US Holidays)",
    forecastHorizon: "Multi-Step Direct (h=1..19 weeks)",
    recursiveMultiStepTestWape: 15.09,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Selected Final Deterministic Forecaster: Won validation tournament with lowest error (12.88% Val WAPE, $8,399.21 MAE).",
    status: "Selected",
    hyperparameters: {
      changepoint_prior_scale: 0.05,
      seasonality_prior_scale: 10.0,
      holidays_prior_scale: 15.0,
      yearly_seasonality: "auto",
      weekly_seasonality: false
    },
    featureImportance: [
      { feature: "Yearly_Seasonality", weight: 0.42 },
      { feature: "Holiday_Component", weight: 0.26 },
      { feature: "Overall_Trend", weight: 0.21 },
      { feature: "Exogenous_Markdowns", weight: 0.11 }
    ]
  },
  {
    id: "seasonal-naive",
    name: "Baseline 1: Seasonal Naive",
    family: "Time Series",
    version: "1.0.0",
    description: "Non-parametric seasonal persistence benchmark anchoring directly on the observed t-52 sales lag from the previous year.",
    mae: 8597.83,
    rmse: 14079.11,
    mape: 13.98,
    wape: 14.28,
    r2: 0.9090,
    valMae: 10460.85,
    valRmse: 18780.38,
    valWape: 16.05,
    valR2: 0.8659,
    trainingTimeSec: 0.04,
    inferenceLatencyMs: 114.08,
    featuresCount: 1,
    evaluationProtocol: "Fixed-Origin Direct (Pre-Origin 52w Observed Lag)",
    forecastHorizon: "Multi-Step Direct (h=1..19 weeks)",
    recursiveMultiStepTestWape: 14.28,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Zero-parameter baseline for long-horizon multi-step persistence (14.28% WAPE).",
    status: "Challenger",
    hyperparameters: {
      lag_period: 52,
      parameter_count: 0
    },
    featureImportance: [
      { feature: "Seasonal_Lag_52W", weight: 1.0 }
    ]
  },
  {
    id: "arima",
    name: "Baseline 5B: SARIMAX",
    family: "Time Series",
    version: "0.14.2",
    description: "Seasonal Autoregressive Integrated Moving Average with Kalman filtering and exogenous promotional markdown regressors.",
    mae: 29260.41,
    rmse: 42721.19,
    mape: 66.06,
    wape: 48.61,
    r2: 0.1619,
    valMae: 26506.58,
    valRmse: 40916.03,
    valWape: 40.66,
    valR2: 0.3636,
    trainingTimeSec: 1.36,
    inferenceLatencyMs: 318.90,
    featuresCount: 12,
    evaluationProtocol: "Fixed-Origin State-Space (Kalman Filter)",
    forecastHorizon: "Multi-Step Direct (h=1..19 weeks)",
    recursiveMultiStepTestWape: 48.61,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Classical econometric reference; struggles with high intermittent volatility across retail departments.",
    status: "Experimental",
    hyperparameters: {
      order: "(2, 1, 2)",
      seasonal_order: "(1, 1, 1, 52)",
      enforce_stationarity: false,
      trend: "c"
    },
    featureImportance: [
      { feature: "AR_Lag_1", weight: 0.35 },
      { feature: "Seasonal_AR_52", weight: 0.31 },
      { feature: "MA_Lag_1", weight: 0.20 },
      { feature: "Exog_Markdowns", weight: 0.14 }
    ]
  },
  {
    id: "linear-regression",
    name: "Baseline 2: ElasticNet",
    family: "Linear",
    version: "1.0.0",
    description: "Regularized L1/L2 linear regression serving as foundational baseline on standardized lag and rolling features.",
    mae: 13533.11,
    rmse: 15871.23,
    mape: 36.35,
    wape: 22.48,
    r2: 0.8843,
    valMae: 15868.07,
    valRmse: 20574.80,
    valWape: 24.34,
    valR2: 0.8391,
    trainingTimeSec: 0.08,
    inferenceLatencyMs: 2.30,
    featuresCount: 22,
    evaluationProtocol: "1-Step-Ahead Rolling Horizon (Weekly POS Feedback)",
    forecastHorizon: "1 Week Ahead (h=1 week)",
    recursiveMultiStepTestWape: 36.71,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Fast linear sanity benchmark and coefficient interpretability. Severe multi-step degradation (+14.23% WAPE).",
    status: "Production",
    hyperparameters: {
      alpha: 1.0,
      l1_ratio: 0.35,
      fit_intercept: true,
      max_iter: 1000
    },
    featureImportance: [
      { feature: "Lag_1W_Sales", weight: 0.38 },
      { feature: "Store_Size_SqFt", weight: 0.26 },
      { feature: "Is_Holiday_Week", weight: 0.18 },
      { feature: "MarkDown_Total", weight: 0.12 },
      { feature: "CPI_Index", weight: 0.06 }
    ]
  },
  {
    id: "proposed-hybrid",
    name: "Hybrid D: Proposed Context-Aware Multi-Stage Hybrid",
    family: "Residual-Hybrid",
    version: "1.0.0-rc",
    description: "Multi-stage architecture combining additive seasonal base with context-weighted XGBoost markdown residuals and heuristic prediction intervals.",
    mae: 9828.55,
    rmse: 15512.93,
    mape: 16.48,
    wape: 16.33,
    r2: 0.8895,
    valMae: 9810.12,
    valRmse: 14906.66,
    valWape: 15.05,
    valR2: 0.9155,
    trainingTimeSec: 0.56,
    inferenceLatencyMs: 37.14,
    featuresCount: 42,
    evaluationProtocol: "1-Step-Ahead Rolling Multi-Stage Context Hybrid",
    forecastHorizon: "1 Week Ahead (h=1 week)",
    recursiveMultiStepTestWape: 16.33,
    uncertaintyCoveragePicp: 72.11,
    intervalWidthMpiw: 22926.00,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Selected Probabilistic Architecture: Provides supply-chain uncertainty bounds (72.11% empirical coverage against 95% nominal target, labeled uncalibrated heuristic).",
    status: "Selected",
    hyperparameters: {
      base_decomposer: "Bayesian Changepoint GAM",
      residual_learner: "XGBoost Regressor",
      markdown_decay_rate: 0.85,
      holiday_anticipation_window: 2,
      confidence_interval: 0.95
    },
    featureImportance: [
      { feature: "Additive_Seasonal_Base", weight: 0.36 },
      { feature: "Residual_Lag_1W", weight: 0.22 },
      { feature: "MarkDown_Decay_Weighted", weight: 0.16 },
      { feature: "Holiday_Surge_Factor", weight: 0.14 },
      { feature: "Store_Footprint_Elasticity", weight: 0.08 },
      { feature: "Regional_Fuel_CPI", weight: 0.04 }
    ]
  },
  {
    id: "hybrid-prophet-xgb",
    name: "Hybrid A: Prophet + XGBoost Residual",
    family: "Residual-Hybrid",
    version: "1.2.0",
    description: "Two-stage pipeline where Prophet estimates structural trend and holiday calendar curves, while XGBoost fits residual errors.",
    mae: 8294.49,
    rmse: 12377.30,
    mape: 15.47,
    wape: 13.78,
    r2: 0.9297,
    valMae: 8491.84,
    valRmse: 12711.64,
    valWape: 13.03,
    valR2: 0.9386,
    trainingTimeSec: 12.21,
    inferenceLatencyMs: 2629.66,
    featuresCount: 38,
    evaluationProtocol: "1-Step-Ahead Rolling Residual Hybrid",
    forecastHorizon: "1 Week Ahead (h=1 week)",
    recursiveMultiStepTestWape: 14.85,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Strong holiday season generalization; 13.03% validation WAPE and 13.78% test WAPE.",
    status: "Challenger",
    hyperparameters: {
      stage1_model: "Prophet Additive",
      stage2_model: "XGBoost",
      n_estimators: 350,
      learning_rate: 0.035
    },
    featureImportance: [
      { feature: "Prophet_Trend_Component", weight: 0.40 },
      { feature: "Residual_Lag_Sales", weight: 0.26 },
      { feature: "Holiday_Prior", weight: 0.18 },
      { feature: "MarkDown_Combined", weight: 0.16 }
    ]
  },
  {
    id: "hybrid-arima-xgb",
    name: "Hybrid B: SARIMAX + XGBoost Residual",
    family: "Residual-Hybrid",
    version: "1.1.0",
    description: "Implementation of Zhang (2003) framework: SARIMAX captures stationary linear autocorrelations; XGBoost models non-linear residuals.",
    mae: 25207.40,
    rmse: 33971.78,
    mape: 66.67,
    wape: 41.88,
    r2: 0.4701,
    valMae: 25408.38,
    valRmse: 33827.20,
    valWape: 38.97,
    valR2: 0.5650,
    trainingTimeSec: 1.60,
    inferenceLatencyMs: 266.53,
    featuresCount: 32,
    evaluationProtocol: "1-Step-Ahead Rolling Residual Hybrid",
    forecastHorizon: "1 Week Ahead (h=1 week)",
    recursiveMultiStepTestWape: 43.10,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Improves substantially on pure SARIMAX (41.88% vs 48.61% WAPE).",
    status: "Experimental",
    hyperparameters: {
      arima_order: "(2, 1, 2)",
      seasonal_order: "(1, 1, 1, 52)",
      xgboost_max_depth: 5
    },
    featureImportance: [
      { feature: "SARIMAX_Linear_Forecast", weight: 0.44 },
      { feature: "NonLinear_Residual_Lags", weight: 0.28 },
      { feature: "MarkDown_Events", weight: 0.18 },
      { feature: "Store_Size", weight: 0.10 }
    ]
  },
  {
    id: "hybrid-stacking",
    name: "Hybrid C: Stacking Ensemble",
    family: "Stacking-Ensemble",
    version: "1.0.4",
    description: "Two-layer model stacking blending out-of-fold predictions from Random Forest and XGBoost using a regularized Ridge meta-learner.",
    mae: 5925.80,
    rmse: 8681.68,
    mape: 12.41,
    wape: 9.85,
    r2: 0.9654,
    valMae: 8945.65,
    valRmse: 14736.87,
    valWape: 13.72,
    valR2: 0.9174,
    trainingTimeSec: 1.64,
    inferenceLatencyMs: 54.41,
    featuresCount: 36,
    evaluationProtocol: "1-Step-Ahead Rolling Stacking (RF + XGB + Ridge)",
    forecastHorizon: "1 Week Ahead (h=1 week)",
    recursiveMultiStepTestWape: 15.10,
    cohortScope: "Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)",
    bestFor: "Broad variance reduction across diverse store tiers and volatile categories (9.85% WAPE).",
    status: "Challenger",
    hyperparameters: {
      layer1_models: "RandomForest, XGBoost",
      meta_learner: "Ridge Regression",
      cv_folds: 5
    },
    featureImportance: [
      { feature: "XGBoost_OOF_Prediction", weight: 0.52 },
      { feature: "RandomForest_OOF_Prediction", weight: 0.34 },
      { feature: "Rolling_4W_Mean", weight: 0.14 }
    ]
  }
]

export const MOCK_INSIGHTS: RetailInsight[] = [
  {
    id: "ins-01",
    category: "Planning signal",
    headline: "Pre-holiday inventory buffer recommended for Store 20 (Electronics)",
    narrative: "Predicted 9.2% surge in Q4 consumer electronics across high-density Mid-Atlantic stores. Historical markdown responsiveness indicates early stock-outs occur if replenishment is kept at 2023 baseline levels.",
    impactLevel: "High",
    storeRef: "Store 20",
    metricDelta: "+$155K Demand Delta",
    recommendation: "Increase lead replenishment orders by 12% across Dept 72 SKUs prior to Week 46.",
    timestamp: "2 hours ago"
  },
  {
    id: "ins-02",
    category: "Seasonality",
    headline: "Thanksgiving week multi-store surge multiplier estimated at 2.45x",
    narrative: "Consistently across all Type A supercenters, grocery and pantry demand spikes in the final 10 days of November, preceding a 35% contraction in post-holiday week.",
    impactLevel: "High",
    metricDelta: "2.45x Volume Lift",
    recommendation: "Lock in perishable logistics slots 3 weeks ahead to avoid premium spot-rate transportation surcharges.",
    timestamp: "5 hours ago"
  },
  {
    id: "ins-03",
    category: "Demand trend",
    headline: "Mountain West stores (Denver & Salt Lake) demonstrating sustained +6.8% momentum",
    narrative: "Stores 04 and 13 continue to outperform national baseline by 320 bps, driven by apparel and general consumables stability despite regional fuel cost variations.",
    impactLevel: "Medium",
    storeRef: "Stores 04, 13",
    metricDelta: "+320 bps Alpha",
    recommendation: "Reallocate regional safety stock allocations from Southeast distribution centers to Mountain West hubs.",
    timestamp: "1 day ago"
  },
  {
    id: "ins-04",
    category: "Volatility",
    headline: "Promotional markdown elasticity decoupling in Urban Northeast stores",
    narrative: "MarkDown1 and MarkDown5 shows diminished lift in Store 14 (Philadelphia) compared to suburban peers, suggesting price competition or localized inventory friction.",
    impactLevel: "Medium",
    storeRef: "Store 14",
    metricDelta: "-18% Elasticity",
    recommendation: "Review localized assortment mix and competitor pricing within 5-mile radius before committing deep discounts.",
    timestamp: "2 days ago"
  },
  {
    id: "ins-05",
    category: "Store behavior",
    headline: "Type C compact stores exhibit lowest forecast variance (MAPE 2.8%)",
    narrative: "Smaller square footage footprint stores (Stores 33, 38) demonstrate highly recurring essential goods consumption, making them ideal candidates for automated continuous reordering.",
    impactLevel: "Low",
    metricDelta: "2.8% Error Rate",
    recommendation: "Enable automated zero-touch replenishment for top 40 staple departments in compact stores.",
    timestamp: "3 days ago"
  }
]

export const MOCK_DATA_HEALTH: DataHealthMetric = {
  rowsProcessed: 421570,
  activeStores: 45,
  departmentsTracked: 81,
  missingValuesCleaned: 271420,
  duplicateRowsFound: 0,
  dateCoverage: {
    start: "2010-02-05",
    end: "2012-10-26",
    totalWeeks: 143
  },
  pipelineStatus: "Operational",
  lastSyncTimestamp: "Today at 06:00 AM UTC",
  dataSources: [
    {
      name: "Retail Network Weekly Sales Stream",
      type: "Store-Department Transactions",
      status: "Healthy",
      lastIngestion: "Today, 06:00 AM",
      recordCount: "421,570 records"
    },
    {
      name: "Store Demographics & Footprint Registry",
      type: "Metadata Dimensions",
      status: "Healthy",
      lastIngestion: "Yesterday, 23:30 PM",
      recordCount: "45 store units"
    },
    {
      name: "Macroeconomic & Weather Features Feed",
      type: "Exogenous Factors (CPI, Fuel, Temp)",
      status: "Healthy",
      lastIngestion: "Today, 05:45 AM",
      recordCount: "8,190 observations"
    },
    {
      name: "Promotional Markdown Ledger (MD1-MD5)",
      type: "Campaign Elasticity Data",
      status: "Healthy",
      lastIngestion: "Today, 06:00 AM",
      recordCount: "151,890 events"
    }
  ]
}

// Generate realistic time-series for overview trajectory & forecast charts
export function generateOverviewTrajectory(): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  // 24 months of trajectory
  let baseline = 42.5 // millions
  for (let year = 2023; year <= 2024; year++) {
    for (let m = 0; m < 12; m++) {
      const monthName = months[m]
      const isHolidaySeason = monthName === "Nov" || monthName === "Dec"
      const isSummerPeak = monthName === "Jul" || monthName === "Aug"
      
      let seasonalFactor = 1.0
      if (monthName === "Nov") seasonalFactor = 1.28
      if (monthName === "Dec") seasonalFactor = 1.42
      if (isSummerPeak) seasonalFactor = 1.08
      if (monthName === "Jan") seasonalFactor = 0.88

      const noise = (Math.sin(m * 1.5) * 1.2)
      const sales = Number(((baseline + (year === 2024 ? 3.2 : 0) + noise) * seasonalFactor).toFixed(2))

      points.push({
        date: `${monthName} ${year}`,
        historical: sales,
        isHoliday: isHolidaySeason,
        holidayName: monthName === "Nov" ? "Thanksgiving" : monthName === "Dec" ? "Christmas" : undefined
      })
    }
  }
  return points
}

export function generateForecastSeries(
  historicalWeeks: number = 24,
  forecastWeeks: number = 8,
  storeBase: number = 95000,
  growthRate: number = 1.05
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = []
  
  // Historical segment
  const now = new Date(2024, 9, 25)
  for (let i = historicalWeeks; i >= 1; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    
    const cycle = Math.sin(i * 0.4) * (storeBase * 0.08)
    const randomVariation = (Math.sin(i * 2.3) * (storeBase * 0.04))
    const sales = Math.round(storeBase + cycle + randomVariation)
    
    points.push({
      date: dateStr,
      historical: sales,
      isHoliday: i === 8 ? true : undefined,
      holidayName: i === 8 ? "Labor Day" : undefined
    })
  }

  // Anchor the transition week so lines connect smoothly
  const lastHistorical = points[points.length - 1].historical || storeBase
  points[points.length - 1].forecast = lastHistorical
  points[points.length - 1].lowerBound = lastHistorical
  points[points.length - 1].upperBound = lastHistorical

  // Forecast segment
  for (let j = 1; j <= forecastWeeks; j++) {
    const d = new Date(now)
    d.setDate(d.getDate() + j * 7)
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    
    // upward holiday bump in later weeks (Thanksgiving/Black Friday simulation)
    const holidayLift = j >= 4 && j <= 6 ? 1.22 : 1.0
    const projected = Math.round(lastHistorical * (1 + (j * 0.012)) * holidayLift * growthRate)
    const uncertaintySpread = Math.round(projected * (0.03 + j * 0.008))

    points.push({
      date: dateStr,
      forecast: projected,
      lowerBound: projected - uncertaintySpread,
      upperBound: projected + uncertaintySpread,
      isHoliday: j === 5 ? true : undefined,
      holidayName: j === 5 ? "Thanksgiving Surge" : undefined
    })
  }

  return points
}
