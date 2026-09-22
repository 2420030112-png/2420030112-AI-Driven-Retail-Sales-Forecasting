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
    id: "fc-2024-001",
    storeId: 20,
    storeName: "Store 20 — Bethlehem Flagship",
    deptId: 72,
    deptName: "Electronics & Audio",
    horizonWeeks: 12,
    status: "Completed",
    createdAt: "2024-10-24 09:15",
    modelUsed: "XGBoost Regressor (v2.4)",
    projectedSales: 1845200,
    historicalBaseline: 1690000,
    changePercent: 9.18,
    confidenceScore: 0.94,
    interpretation: "Strong seasonal acceleration driven by Q4 promotional markdown cadence and pre-holiday electronics replenishment.",
    metrics: { mae: 4210, rmse: 5930, mape: 3.42, r2: 0.962 }
  },
  {
    id: "fc-2024-002",
    storeId: 4,
    storeName: "Store 04 — Denver Tech Center",
    deptId: 92,
    deptName: "Dry Grocery & Pantry",
    horizonWeeks: 8,
    status: "Completed",
    createdAt: "2024-10-23 16:40",
    modelUsed: "LightGBM + Lag Features",
    projectedSales: 1284000,
    historicalBaseline: 1220000,
    changePercent: 5.25,
    confidenceScore: 0.96,
    interpretation: "Stable consumer staples baseline with anticipated Thanksgiving week spike of +28% over mid-period average.",
    metrics: { mae: 2150, rmse: 3110, mape: 2.15, r2: 0.978 }
  },
  {
    id: "fc-2024-003",
    storeId: 2,
    storeName: "Store 02 — Dallas Galleria",
    deptId: 40,
    deptName: "Pet Supplies & Care",
    horizonWeeks: 4,
    status: "Completed",
    createdAt: "2024-10-22 11:20",
    modelUsed: "Random Forest Ensemble",
    projectedSales: 172400,
    historicalBaseline: 168000,
    changePercent: 2.62,
    confidenceScore: 0.91,
    interpretation: "Steady weekly trajectory with minimal variance; promotional markdown responsiveness estimated at +4.2%.",
    metrics: { mae: 1480, rmse: 2020, mape: 3.85, r2: 0.941 }
  },
  {
    id: "fc-2024-004",
    storeId: 14,
    storeName: "Store 14 — Philadelphia Urban",
    deptId: 1,
    deptName: "Candy & Confections",
    horizonWeeks: 4,
    status: "Completed",
    createdAt: "2024-10-20 14:05",
    modelUsed: "Prophet Seasonal",
    projectedSales: 114600,
    historicalBaseline: 98500,
    changePercent: 16.35,
    confidenceScore: 0.93,
    interpretation: "Sharp Halloween seasonal surge captured; demand expected to peak 6 days prior to calendar holiday.",
    metrics: { mae: 1820, rmse: 2640, mape: 4.12, r2: 0.935 }
  },
  {
    id: "fc-2024-005",
    storeId: 1,
    storeName: "Store 01 — Rogers Metro",
    deptId: 95,
    deptName: "Beverages, Snacks & Dairy",
    horizonWeeks: 8,
    status: "Completed",
    createdAt: "2024-10-19 08:30",
    modelUsed: "XGBoost Regressor (v2.4)",
    projectedSales: 1120400,
    historicalBaseline: 1095000,
    changePercent: 2.32,
    confidenceScore: 0.95,
    interpretation: "Predictable recurring weekly replenishment cycles with low sensitivity to external temperature fluctuations.",
    metrics: { mae: 2940, rmse: 4180, mape: 2.68, r2: 0.971 }
  }
]

export const MOCK_MODELS: ModelBenchmark[] = [
  {
    id: "xgboost-v2",
    name: "XGBoost Regressor (v2.4)",
    family: "Tree-Ensemble",
    version: "2.4.1",
    description: "Gradient boosted decision trees with lag features (t-1 to t-8), rolling sales statistics, holiday indicators, and markdown decay weights.",
    mae: 3420,
    rmse: 4890,
    mape: 3.12,
    r2: 0.974,
    trainingTimeSec: 14.2,
    inferenceLatencyMs: 18,
    featuresCount: 38,
    bestFor: "High-volume departments with complex promotional markdown dynamics and holiday cross-elasticities.",
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
    name: "Random Forest Regressor",
    family: "Tree-Ensemble",
    version: "1.8.0",
    description: "Bagged decision tree forest resilient to outlier noise in weather and store localized fluctuations.",
    mae: 4150,
    rmse: 5820,
    mape: 3.88,
    r2: 0.958,
    trainingTimeSec: 32.6,
    inferenceLatencyMs: 34,
    featuresCount: 34,
    bestFor: "Mid-tier grocery and consumer packaged goods with moderate volatility.",
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
    name: "Prophet Seasonal Forecaster",
    family: "Additive",
    version: "1.1.5",
    description: "Decomposable additive time series model with yearly seasonality, holiday calendar effects, and changepoints.",
    mae: 4890,
    rmse: 6940,
    mape: 4.65,
    r2: 0.932,
    trainingTimeSec: 8.4,
    inferenceLatencyMs: 42,
    featuresCount: 16,
    bestFor: "Long-horizon (12+ weeks) macro demand planning and national holiday surge calibration.",
    status: "Challenger",
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
    id: "arima",
    name: "SARIMAX (2, 1, 2) × (1, 1, 1)₅₂",
    family: "Time Series",
    version: "0.14.2",
    description: "Seasonal Autoregressive Integrated Moving Average with exogenous promotional markdown regressors.",
    mae: 5610,
    rmse: 7850,
    mape: 5.41,
    r2: 0.908,
    trainingTimeSec: 48.0,
    inferenceLatencyMs: 65,
    featuresCount: 12,
    bestFor: "Strict statistical significance testing and stationary weekly time series benchmark.",
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
    name: "Ridge ElasticNet Baseline",
    family: "Linear",
    version: "1.0.0",
    description: "Regularized linear regression serving as our foundational baseline for performance comparison.",
    mae: 7420,
    rmse: 10240,
    mape: 7.82,
    r2: 0.854,
    trainingTimeSec: 1.2,
    inferenceLatencyMs: 2,
    featuresCount: 22,
    bestFor: "Instant low-latency sanity baseline and coefficient interpretability.",
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
