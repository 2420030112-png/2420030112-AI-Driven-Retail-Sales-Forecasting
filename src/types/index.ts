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
    mae: number
    rmse: number
    mape: number
    r2: number
  }
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
  family: 'Linear' | 'Tree-Ensemble' | 'Time Series' | 'Additive'
  version: string
  description: string
  mae: number
  rmse: number
  mape: number
  r2: number
  trainingTimeSec: number
  inferenceLatencyMs: number
  featuresCount: number
  bestFor: string
  status: 'Production' | 'Challenger' | 'Experimental' | 'Deprecated'
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
