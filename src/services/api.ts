/**
 * NEXUS Phase 4 — Real Forecast Inference API Client.
 * Connects the React frontend directly to the FastAPI backend.
 */

import { ForecastRecord } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

export interface ForecastRequestPayload {
  store_id: number
  dept_id: number
  horizon_weeks: number
  protocol: 'recursive_multistep' | 'rolling_onestep'
  model_id: string
  confidence_interval?: number
}

export interface ApiPredictionItem {
  date: string
  predicted_sales: number
  lower_bound: number | null
  upper_bound: number | null
  is_holiday: boolean
  holiday_name?: string | null
  actual_sales?: number | null
}

export interface ApiHistoricalPoint {
  date: string
  sales: number
  is_holiday: boolean
}

export interface ApiUncertaintyMetadata {
  is_supported: boolean
  calibrated: boolean
  empirical_coverage_picp?: number | null
  nominal_coverage_target?: number | null
  mpiw_dollars?: number | null
  method?: string | null
  warning: string
}

export interface ApiForecastResponse {
  forecast_id: string
  store_id: number
  store_name: string
  dept_id: number
  dept_name: string
  model_id: string
  model_name: string
  protocol: 'recursive_multistep' | 'rolling_onestep'
  horizon_weeks: number
  forecast_origin_date: string
  predictions: ApiPredictionItem[]
  historical_context: ApiHistoricalPoint[]
  projected_total_sales: number
  historical_baseline_total: number
  weekly_baseline_average: number
  change_percent: number
  uncertainty: ApiUncertaintyMetadata
  metrics: {
    val_wape?: number
    test_wape?: number
    protocol?: string
  }
  latency_ms: number
  status: string
}

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'unavailable'
  artifacts_directory: string
  artifacts_present: Record<string, boolean>
  loaded_models: string[]
  benchmark_cohort_series_count: number
  forecast_origin_date: string
  server_time: string
}

export interface ApiModelInfo {
  id: string
  name: string
  family: string
  version: string
  description: string
  supported_protocols: string[]
  supports_uncertainty: boolean
  val_wape?: number
  test_wape?: number
  status: string
}

export interface ApiBenchmarkSeriesResponse {
  supported_stores: Array<{ id: number; name: string; type: string; region: string }>
  supported_departments: Array<{ id: number; name: string; category: string }>
  benchmark_pairs: Array<{ store_id: number; dept_id: number }>
  disclaimer: string
}

export interface ApiValidationResponse {
  is_supported: boolean
  store_id: number
  dept_id: number
  store_name?: string
  dept_name?: string
  message: string
}

/**
 * Checks FastAPI backend health and loaded artifacts.
 */
export async function checkBackendHealth(): Promise<ApiHealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`)
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`)
  }
  return res.json()
}

/**
 * Retrieves the catalog of models and supported protocols.
 */
export async function fetchBackendModels(): Promise<ApiModelInfo[]> {
  const res = await fetch(`${API_BASE}/api/models`)
  if (!res.ok) {
    throw new Error(`Failed to fetch models list: HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * Retrieves the verified 20-series benchmark cohort.
 */
export async function fetchBenchmarkSeries(): Promise<ApiBenchmarkSeriesResponse> {
  const res = await fetch(`${API_BASE}/api/benchmark-series`)
  if (!res.ok) {
    throw new Error(`Failed to fetch benchmark series: HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * Validates whether a store and department pair belongs to the trained cohort.
 */
export async function validateSeriesWithBackend(
  storeId: number,
  deptId: number
): Promise<ApiValidationResponse> {
  const res = await fetch(
    `${API_BASE}/api/benchmark-series/validate?store_id=${storeId}&dept_id=${deptId}`
  )
  if (!res.ok) {
    throw new Error(`Validation check failed: HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * Submits forecast parameters and executes real model inference on the FastAPI backend.
 */
export async function generateRealForecast(
  payload: ForecastRequestPayload
): Promise<ApiForecastResponse> {
  const res = await fetch(`${API_BASE}/api/forecast/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let errorDetail = 'Inference request failed'
    try {
      const errJson = await res.json()
      if (errJson.detail && typeof errJson.detail === 'object') {
        errorDetail = errJson.detail.message || JSON.stringify(errJson.detail)
      } else if (errJson.detail) {
        errorDetail = errJson.detail
      }
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`
    }
    throw new Error(errorDetail)
  }

  return res.json()
}

/**
 * Maps FastAPI response to the application's typed ForecastRecord.
 */
export function mapApiResponseToForecastRecord(
  apiRes: ApiForecastResponse
): ForecastRecord {
  return {
    id: apiRes.forecast_id,
    storeId: apiRes.store_id,
    storeName: apiRes.store_name,
    deptId: apiRes.dept_id,
    deptName: apiRes.dept_name,
    horizonWeeks: apiRes.horizon_weeks as 4 | 8 | 12,
    status: 'Completed',
    createdAt: 'Just now',
    modelUsed: apiRes.model_name,
    projectedSales: apiRes.projected_total_sales,
    historicalBaseline: apiRes.historical_baseline_total,
    changePercent: apiRes.change_percent,
    confidenceScore: apiRes.uncertainty.is_supported ? 0.95 : 0.90,
    interpretation: `Real model inference executed across a ${apiRes.horizon_weeks}-week forward horizon using ${apiRes.model_name} under the ${
      apiRes.protocol === 'recursive_multistep'
        ? 'Fixed-Origin Recursive Multi-Step (zero target leakage)'
        : '1-Step-Ahead Rolling Horizon (weekly POS feedback)'
    } protocol. Projected ${apiRes.change_percent >= 0 ? '+' : ''}${apiRes.change_percent}% volume vs pre-origin historical baseline.`,
    metrics: {
      wape: apiRes.metrics.test_wape,
      valWape: apiRes.metrics.val_wape,
    },
    protocol: apiRes.protocol,
    forecastOriginDate: apiRes.forecast_origin_date,
    isRealInference: true,
    executionLatencyMs: apiRes.latency_ms,
    uncertainty: {
      isSupported: apiRes.uncertainty.is_supported,
      calibrated: apiRes.uncertainty.calibrated,
      empiricalCoveragePicp: apiRes.uncertainty.empirical_coverage_picp ?? undefined,
      nominalCoverageTarget: apiRes.uncertainty.nominal_coverage_target ?? undefined,
      mpiwDollars: apiRes.uncertainty.mpiw_dollars ?? undefined,
      method: apiRes.uncertainty.method ?? undefined,
      warning: apiRes.uncertainty.warning,
    },
    predictions: apiRes.predictions.map((p) => ({
      date: p.date,
      predictedSales: p.predicted_sales,
      lowerBound: p.lower_bound,
      upperBound: p.upper_bound,
      isHoliday: p.is_holiday,
      holidayName: p.holiday_name ?? undefined,
      actualSales: p.actual_sales,
    })),
    historicalContext: apiRes.historical_context.map((h) => ({
      date: h.date,
      sales: h.sales,
      isHoliday: h.is_holiday,
    })),
  }
}
