export type StoreType = 'A' | 'B' | 'C'

export interface Store {
  id: number
  name: string
  type: StoreType
  sizeSqFt: number
  location: string
  region: string
  totalHistoricalSales: number
  avgWeeklySales: number
  departmentCount: number
  trendPercent: number
  volatility: 'Low' | 'Moderate' | 'High'
  status: 'Active' | 'Seasonal' | 'Auditing'
}

export interface Department {
  id: number
  name: string
  category: string
  avgWeeklySales: number
  volatilityIndex: number
}

export interface ForecastRecord {
  id: string
  storeId: number
  storeName: string
  deptId: number
  deptName: string
  horizonWeeks: 4 | 8 | 12
  status: 'Completed' | 'Processing' | 'Scheduled'
  createdAt: string
  modelUsed: string
  projectedSales: number
  historicalBaseline: number
  changePercent: number
  confidenceScore: number
  interpretation: string
  metrics: {
    mae?: number
    rmse?: number
    mape?: number
    r2?: number
    wape?: number
    valWape?: number
  }
  // Phase 4 Real Forecast Inference attributes
  protocol?: 'recursive_multistep' | 'rolling_onestep'
  forecastOriginDate?: string
  isRealInference?: boolean
  executionLatencyMs?: number
  uncertainty?: {
    isSupported: boolean
    calibrated: boolean
    empiricalCoveragePicp?: number
    nominalCoverageTarget?: number
    mpiwDollars?: number
    method?: string
    warning?: string
  }
  predictions?: Array<{
    date: string
    predictedSales: number
    lowerBound?: number | null
    upperBound?: number | null
    isHoliday?: boolean
    holidayName?: string
    actualSales?: number | null
  }>
  historicalContext?: Array<{
    date: string
    sales: number
    isHoliday?: boolean
  }>
}

export interface TimeSeriesPoint {
  date: string
  historical?: number
  forecast?: number
  lowerBound?: number
  upperBound?: number
  isHoliday?: boolean
  holidayName?: string
  markdownTotal?: number
}

export interface ModelBenchmark {
  id: string
  name: string
  family: 'Linear' | 'Tree-Ensemble' | 'Time Series' | 'Additive' | 'Residual-Hybrid' | 'Stacking-Ensemble'
  version: string
  description: string
  mae: number
  rmse: number
  mape: number
  wape?: number
  r2: number
  valMae?: number
  valRmse?: number
  valWape?: number
  valR2?: number
  trainingTimeSec: number
  inferenceLatencyMs: number
  featuresCount: number
  bestFor: string
  status: 'Production' | 'Challenger' | 'Experimental' | 'Deprecated' | 'Selected'
  evaluationProtocol?: string
  forecastHorizon?: string
  recursiveMultiStepTestWape?: number
  uncertaintyCoveragePicp?: number
  intervalWidthMpiw?: number
  cohortScope?: string
  hyperparameters: Record<string, string | number | boolean>
  featureImportance: { feature: string; weight: number }[]
}

export interface RetailInsight {
  id: string
  category: 'Demand trend' | 'Seasonality' | 'Volatility' | 'Store behavior' | 'Planning signal'
  headline: string
  narrative: string
  impactLevel: 'High' | 'Medium' | 'Low'
  storeRef?: string
  metricDelta: string
  recommendation: string
  timestamp: string
}

export interface DataHealthMetric {
  rowsProcessed: number
  activeStores: number
  departmentsTracked: number
  missingValuesCleaned: number
  duplicateRowsFound: number
  dateCoverage: {
    start: string
    end: string
    totalWeeks: number
  }
  pipelineStatus: 'Operational' | 'Degraded' | 'Syncing'
  lastSyncTimestamp: string
  dataSources: {
    name: string
    type: string
    status: 'Healthy' | 'Warning' | 'Syncing'
    lastIngestion: string
    recordCount: string
  }[]
}

export type LiteratureCategory = 
  | 'Classical forecasting'
  | 'Machine learning'
  | 'Deep learning'
  | 'Hybrid forecasting'
  | 'Retail forecasting'
  | 'Walmart forecasting'

export interface LiteratureRecord {
  id: string
  title: string
  authors: string
  year: number
  venue: string
  category: LiteratureCategory
  dataset: string
  methodology: string
  model: string
  metrics: string
  strengths: string
  limitations: string
  researchGap: string
  relevanceToNexus: string
  doi: string
  link?: string
  isHybrid: boolean
}

export type NoveltyStatus =
  | 'Existing'
  | 'Partially explored'
  | 'Different implementation'
  | 'Potential contribution'
  | 'Requires verification'

export interface NoveltyItem {
  id: string
  featureOrApproach: string
  category: 'Data & Features' | 'Model Architecture' | 'Evaluation & Splits' | 'System & UX'
  existingLiterature: string
  ourImplementation: string
  status: NoveltyStatus
  evidence: string
  primaryCitation: string
}

export interface ExperimentRecord {
  id: string
  modelName: string
  type: 'Baseline' | 'Hybrid A (Prophet+XGB)' | 'Hybrid B (ARIMA+XGB)' | 'Hybrid C (Stacking)' | 'Proposed Hybrid'
  datasetVersion: string
  featureConfig: string
  splitMethod: string
  trainingPeriod: string
  testingPeriod: string
  mae: number
  rmse: number
  mape: number
  wape?: number
  r2: number
  valMae?: number
  valRmse?: number
  valWape?: number
  valMape?: number
  valR2?: number
  trainingTimeSec: number
  predictionTimeMs: number
  status: 'Completed' | 'Selected' | 'Audited'
  architectureSummary: string
  selectionRationale?: string
  evaluationProtocol?: string
  forecastHorizon?: string
  recursiveMultiStepTestWape?: number
  uncertaintyCoveragePicp?: number
  intervalWidthMpiw?: number
  cohortScope?: string
}

