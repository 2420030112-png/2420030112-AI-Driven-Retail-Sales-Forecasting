import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  mapApiResponseToForecastRecord,
  ApiForecastResponse,
  generateRealForecast,
  checkBackendHealth,
  validateSeriesWithBackend,
  fetchBackendModels,
  fetchBenchmarkSeries,
} from '../src/services/api'
import { isBenchmarkSeries, BENCHMARK_COHORT_INFO } from '../src/data/resultsLoader'

describe('NEXUS Phase 4 & 5 — Frontend API Client & Inference Integration Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const sampleApiResponse: ApiForecastResponse = {
    forecast_id: 'fc-real-abc123',
    store_id: 20,
    store_name: 'Store 20 — Philadelphia Metro',
    dept_id: 72,
    dept_name: 'Dept 72 — Electronics',
    model_id: 'proposed-hybrid',
    model_name: 'Hybrid D: Proposed Context-Aware Multi-Stage Hybrid',
    protocol: 'recursive_multistep',
    horizon_weeks: 12,
    forecast_origin_date: '2012-06-15',
    predictions: [
      {
        date: '2012-06-22',
        predicted_sales: 105420.5,
        lower_bound: 82494.5,
        upper_bound: 128346.5,
        is_holiday: false,
        holiday_name: null,
        actual_sales: 104230.0,
      },
      {
        date: '2012-06-29',
        predicted_sales: 108920.0,
        lower_bound: 85994.0,
        upper_bound: 131846.0,
        is_holiday: false,
        holiday_name: null,
        actual_sales: 107110.0,
      },
    ],
    historical_context: [
      { date: '2012-06-08', sales: 98400.0, is_holiday: false },
      { date: '2012-06-15', sales: 101200.0, is_holiday: false },
    ],
    projected_total_sales: 1265046.0,
    historical_baseline_total: 1197600.0,
    weekly_baseline_average: 99800.0,
    change_percent: 5.63,
    uncertainty: {
      is_supported: true,
      calibrated: false,
      empirical_coverage_picp: 72.11,
      nominal_coverage_target: 95.0,
      mpiw_dollars: 22926.0,
      method: 'Heteroskedastic Residual Dispersion (+/- 1.96 * sigma_holiday)',
      warning: 'Uncalibrated heuristic intervals with empirical 72.11% coverage against 95% nominal target.',
    },
    metrics: {
      val_wape: 15.05,
      test_wape: 16.33,
      protocol: 'recursive_multistep',
    },
    latency_ms: 18.4,
    status: 'Completed',
  }

  it('maps API response accurately to ForecastRecord', () => {
    const record = mapApiResponseToForecastRecord(sampleApiResponse)

    expect(record.id).toBe('fc-real-abc123')
    expect(record.storeId).toBe(20)
    expect(record.deptId).toBe(72)
    expect(record.horizonWeeks).toBe(12)
    expect(record.isRealInference).toBe(true)
    expect(record.protocol).toBe('recursive_multistep')
    expect(record.forecastOriginDate).toBe('2012-06-15')
    expect(record.executionLatencyMs).toBe(18.4)

    // Uncertainty metadata must be explicitly labeled as uncalibrated heuristic
    expect(record.uncertainty?.isSupported).toBe(true)
    expect(record.uncertainty?.calibrated).toBe(false)
    expect(record.uncertainty?.empiricalCoveragePicp).toBe(72.11)
    expect(record.uncertainty?.warning).toContain('Uncalibrated heuristic intervals')

    // Historical context and predictions length
    expect(record.predictions).toHaveLength(2)
    expect(record.historicalContext).toHaveLength(2)
    expect(record.predictions?.[0].predictedSales).toBe(105420.5)
    expect(record.predictions?.[0].lowerBound).toBe(82494.5)
    expect(record.predictions?.[0].upperBound).toBe(128346.5)
  })

  it('verifies benchmark cohort inclusion logic', () => {
    // Verified cohort stores: 1, 10, 14, 20, 35
    // Verified departments: 1, 7, 72, 92
    expect(isBenchmarkSeries(20, 72)).toBe(true)
    expect(isBenchmarkSeries(1, 1)).toBe(true)
    expect(isBenchmarkSeries(14, 92)).toBe(true)
    expect(isBenchmarkSeries(35, 7)).toBe(true)

    // Non-benchmark series must be rejected
    expect(isBenchmarkSeries(2, 72)).toBe(false)
    expect(isBenchmarkSeries(4, 1)).toBe(false)
    expect(isBenchmarkSeries(20, 3)).toBe(false)
    expect(isBenchmarkSeries(99, 99)).toBe(false)
  })

  it('validates benchmark cohort scope metadata parity', () => {
    expect(BENCHMARK_COHORT_INFO.totalSeries).toBe(20)
    expect(BENCHMARK_COHORT_INFO.stores).toEqual([1, 10, 14, 20, 35])
    expect(BENCHMARK_COHORT_INFO.departments).toEqual([1, 7, 72, 92])
    expect(BENCHMARK_COHORT_INFO.testWeeks).toBe(19)
    expect(BENCHMARK_COHORT_INFO.trainWeeks).toBe(106)
  })

  it('correctly maps 1-step rolling horizon protocol response without uncertainty', () => {
    const rollingApiResponse: ApiForecastResponse = {
      ...sampleApiResponse,
      protocol: 'rolling_onestep',
      model_id: 'xgboost-v2',
      model_name: 'Baseline 4: XGBoost',
      uncertainty: {
        is_supported: false,
        calibrated: false,
        warning: "Selected model 'Baseline 4: XGBoost' does not compute uncertainty intervals.",
      },
    }

    const record = mapApiResponseToForecastRecord(rollingApiResponse)
    expect(record.protocol).toBe('rolling_onestep')
    expect(record.uncertainty?.isSupported).toBe(false)
    expect(record.uncertainty?.calibrated).toBe(false)
    expect(record.interpretation).toContain('1-Step-Ahead Rolling Horizon')
  })

  describe('API Failure and Resilience Handling', () => {
    it('surfaces backend 400 validation error with detailed message', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          detail: {
            error: 'Invalid Forecast Request',
            message: 'Store 99 is outside the trained 20-series benchmark cohort.',
          },
        }),
      } as Response)

      await expect(
        generateRealForecast({
          store_id: 99,
          dept_id: 72,
          horizon_weeks: 12,
          protocol: 'recursive_multistep',
          model_id: 'proposed-hybrid',
        })
      ).rejects.toThrow('Store 99 is outside the trained 20-series benchmark cohort.')
    })

    it('surfaces backend 503 service unavailable error when model artifact is missing', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({
          detail: {
            error: 'Model Artifact Unavailable',
            message: "Model artifact 'proposed_hybrid.joblib' not found.",
          },
        }),
      } as Response)

      await expect(
        generateRealForecast({
          store_id: 20,
          dept_id: 72,
          horizon_weeks: 12,
          protocol: 'recursive_multistep',
          model_id: 'proposed-hybrid',
        })
      ).rejects.toThrow("Model artifact 'proposed_hybrid.joblib' not found.")
    })

    it('handles backend 500 internal server error without JSON detail cleanly', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON')
        },
      } as unknown as Response)

      await expect(
        generateRealForecast({
          store_id: 20,
          dept_id: 72,
          horizon_weeks: 12,
          protocol: 'recursive_multistep',
          model_id: 'proposed-hybrid',
        })
      ).rejects.toThrow('HTTP 500: Internal Server Error')
    })

    it('handles health check HTTP failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as Response)

      await expect(checkBackendHealth()).rejects.toThrow('Health check failed with status 503')
    })

    it('handles network connection refusal / offline state', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch (Connection refused)'))

      await expect(
        generateRealForecast({
          store_id: 20,
          dept_id: 72,
          horizon_weeks: 12,
          protocol: 'recursive_multistep',
          model_id: 'proposed-hybrid',
        })
      ).rejects.toThrow('Failed to fetch (Connection refused)')
    })

    it('handles model catalog and benchmark series fetch failures', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ ok: false, status: 502 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 504 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 404 } as Response)

      await expect(fetchBackendModels()).rejects.toThrow('HTTP 502')
      await expect(fetchBenchmarkSeries()).rejects.toThrow('HTTP 504')
      await expect(validateSeriesWithBackend(1, 1)).rejects.toThrow('HTTP 404')
    })
  })
})

