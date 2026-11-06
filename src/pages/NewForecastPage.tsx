import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { SearchSelect, SelectOption } from '../components/common/SearchSelect'
import { ActionButton } from '../components/common/ActionButton'
import { LoadingState } from '../components/common/LoadingState'
import { MOCK_STORES, MOCK_DEPARTMENTS, MOCK_MODELS } from '../data/mockData'
import { isBenchmarkSeries } from '../data/resultsLoader'
import { useApp } from '../context/AppContext'
import { generateRealForecast, mapApiResponseToForecastRecord } from '../services/api'
import {
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Zap,
  Calendar,
} from 'lucide-react'

export const NewForecastPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addForecast, addToast } = useApp()

  // Pre-fill store/dept from query params or defaults (Store 20, Dept 72)
  const initialStoreId = searchParams.get('storeId') || '20'
  const initialDeptId = searchParams.get('deptId') || '72'

  const [storeId, setStoreId] = useState<string>(initialStoreId)
  const [deptId, setDeptId] = useState<string>(initialDeptId)
  const [horizonWeeks, setHorizonWeeks] = useState<4 | 8 | 12>(12)
  const [protocol, setProtocol] = useState<'recursive_multistep' | 'rolling_onestep'>('recursive_multistep')
  const [modelStrategy, setModelStrategy] = useState<'Recommended' | 'Compare models' | 'Custom'>('Recommended')
  const [customModelId, setCustomModelId] = useState<string>('proposed-hybrid')
  const [isAdvancedDrawerOpen, setIsAdvancedDrawerOpen] = useState(false)

  // Advanced Drawer Configurations
  const [confidenceInterval, setConfidenceInterval] = useState<string>('95%')
  const [markdownElasticityWeight, setMarkdownElasticityWeight] = useState<number>(0.85)
  const [includeHolidayAnticipation, setIncludeHolidayAnticipation] = useState<boolean>(true)

  // Generation state
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [stageLogs, setStageLogs] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Store options
  const storeOptions: SelectOption[] = MOCK_STORES.map((s) => ({
    value: String(s.id),
    label: s.name,
    subtitle: `${s.location} • ${s.region}`,
    badge: `Type ${s.type}`,
  }))

  // Department options
  const deptOptions: SelectOption[] = MOCK_DEPARTMENTS.map((d) => ({
    value: String(d.id),
    label: `Dept ${d.id} — ${d.name}`,
    subtitle: `Category: ${d.category} • Volatility: ${(d.volatilityIndex * 100).toFixed(0)}%`,
    badge: `$${(d.avgWeeklySales / 1000).toFixed(0)}k/wk`,
  }))

  const selectedStore = MOCK_STORES.find((s) => String(s.id) === storeId) || MOCK_STORES[0]
  const selectedDept = MOCK_DEPARTMENTS.find((d) => String(d.id) === deptId) || MOCK_DEPARTMENTS[0]

  // Model resolution:
  const resolvedModel = modelStrategy === 'Recommended'
    ? MOCK_MODELS.find((m) => m.id === 'proposed-hybrid') || MOCK_MODELS[0]
    : modelStrategy === 'Compare models'
    ? MOCK_MODELS.find((m) => m.id === 'hybrid-stacking') || MOCK_MODELS[0]
    : MOCK_MODELS.find((m) => m.id === customModelId) || MOCK_MODELS[0]

  // Check if current selection belongs to the 20-series benchmark cohort
  const isCohortSupported = isBenchmarkSeries(Number(selectedStore.id), Number(selectedDept.id))

  // Execute real inference
  const handleStartGeneration = async () => {
    if (!isCohortSupported) {
      setErrorMessage(
        `Store ${selectedStore.id} — Dept ${selectedDept.id} is outside the trained benchmark cohort. Real model inference cannot execute.`
      )
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)
    setCurrentStageIndex(0)

    const stageNames = [
      `Connecting to FastAPI backend & validating series integrity for Store #${selectedStore.id} — Dept #${selectedDept.id}...`,
      `Querying pre-origin historical context up to forecast origin T0 (2012-06-15)...`,
      `Constructing exogenous feature tensor & scaling continuous macroeconomic covariates...`,
      protocol === 'recursive_multistep'
        ? `Executing fixed-origin recursive multi-step forecasting with dynamic autoregressive rolling (Zero Target Leakage)...`
        : `Executing 1-step-ahead rolling horizon forecasting with simulated weekly POS feedback...`,
      `Synthesizing ${resolvedModel.name} predictions and computing uncertainty dispersion bounds...`,
      `Auditing output tensor and persisting verified demand record to workspace...`,
    ]

    setStageLogs([stageNames[0]])

    // Trigger asynchronous inference
    try {
      // Advance stages visually as inference proceeds
      const stageInterval = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < 4) {
            const next = prev + 1
            setStageLogs((l) => [...l, stageNames[next]])
            return next
          }
          return prev
        })
      }, 350)

      const apiResult = await generateRealForecast({
        store_id: Number(selectedStore.id),
        dept_id: Number(selectedDept.id),
        horizon_weeks: horizonWeeks,
        protocol: protocol,
        model_id: resolvedModel.id,
        confidence_interval: parseFloat(confidenceInterval) / 100,
      })

      clearInterval(stageInterval)
      setCurrentStageIndex(5)
      setStageLogs((l) => [...l, stageNames[5]])

      // Map to typed record
      const record = mapApiResponseToForecastRecord(apiResult)

      setTimeout(() => {
        addForecast(record)
        addToast({
          title: 'Forecast Generated',
          message: `Real inference completed in ${apiResult.latency_ms}ms via ${apiResult.model_name}`,
          type: 'success',
        })
        navigate(`/forecasts/${record.id}`)
      }, 450)
    } catch (err: unknown) {
      setIsProcessing(false)
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(msg)
      addToast({
        title: 'Inference Error',
        message: msg,
        type: 'warning',
      })
    }
  }

  const handleSelectVerifiedCohort = () => {
    setStoreId('20')
    setDeptId('72')
    setErrorMessage(null)
  }

  if (isProcessing) {
    return (
      <LoadingState
        currentStageIndex={currentStageIndex}
        totalStages={6}
        stageLogs={stageLogs}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Editorial Page Header */}
      <PageHeader
        title="Create forecast"
        subtitle="Connected to real trained machine learning models. Select a store, department, horizon, and forecasting protocol to generate real demand projections."
        eyebrow="Forecast Studio • Real ML Inference"
      />

      {/* Error Banner if inference failed or invalid selection */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-subtle flex items-start justify-between gap-3 text-xs text-red-900 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Inference Error: </span>
              {errorMessage}
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Configuration Form Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-subtle p-6 sm:p-8 space-y-7">
        {/* Cohort Status Indicator */}
        {isCohortSupported ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-2 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Verified Benchmark Cohort:</strong> Store {selectedStore.id} — Dept {selectedDept.id} is connected to real serialized model artifacts.
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 border border-emerald-300">
              Ready for Inference
            </span>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Real Model Inference Unavailable:</strong> Store {selectedStore.id} — Dept {selectedDept.id} is outside the 20-series evaluated benchmark cohort.
                To prevent fabricated numbers and maintain strict scientific defensibility, real inference is restricted to verified benchmark series (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92).
              </div>
            </div>
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectVerifiedCohort}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900 text-white font-medium text-xs hover:bg-amber-950 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Switch to Verified Series (Store 20, Dept 72)
              </button>
            </div>
          </div>
        )}

        {/* 1. Store Selector */}
        <div>
          <SearchSelect
            label="1. Retail Store Entity"
            placeholder="Search stores by name, location, or ID..."
            searchPlaceholder="Filter stores..."
            options={storeOptions}
            value={storeId}
            onChange={(val) => {
              setStoreId(String(val))
              setErrorMessage(null)
            }}
            helperText="Store determines square footage, regional climate covariates, and historical traffic patterns."
          />
        </div>

        {/* 2. Department Selector */}
        <div>
          <SearchSelect
            label="2. Product Department"
            placeholder="Search departments by name or category..."
            searchPlaceholder="Filter product departments..."
            options={deptOptions}
            value={deptId}
            onChange={(val) => {
              setDeptId(String(val))
              setErrorMessage(null)
            }}
            helperText="Department determines historical markdown responsiveness and seasonal holiday surge profiles."
          />
        </div>

        {/* 3. Forecast Horizon */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2 font-sans">
            3. Forecast Horizon
          </label>
          <div className="grid grid-cols-3 gap-3">
            {([4, 8, 12] as const).map((weeks) => {
              const isSelected = horizonWeeks === weeks
              return (
                <button
                  key={weeks}
                  type="button"
                  onClick={() => setHorizonWeeks(weeks)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-950 text-white shadow-card ring-1 ring-zinc-950'
                      : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold font-display">
                      {weeks} weeks
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    {weeks === 4 && 'Short-term replenishment'}
                    {weeks === 8 && 'Mid-term safety stock'}
                    {weeks === 12 && 'Full quarterly demand'}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Forecasting Protocol Selection (Section 4 & 6) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 font-sans">
              4. Forecasting Protocol
            </label>
            <span className="text-xs text-zinc-400 font-mono">
              Zero Target Leakage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProtocol('recursive_multistep')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                protocol === 'recursive_multistep'
                  ? 'border-zinc-900 bg-zinc-50 text-zinc-950 shadow-subtle ring-1 ring-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-700" />
                  Fixed-Origin Recursive Multi-Step
                </span>
                {protocol === 'recursive_multistep' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    Strategic
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Zero future target feedback across {horizonWeeks} weeks. Autoregressive lags dynamically rolled forward using model predictions. Best for multi-week planning.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setProtocol('rolling_onestep')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                protocol === 'rolling_onestep'
                  ? 'border-zinc-900 bg-zinc-50 text-zinc-950 shadow-subtle ring-1 ring-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-zinc-700" />
                  1-Step-Ahead Rolling Horizon
                </span>
                {protocol === 'rolling_onestep' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Operational
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Simulates weekly store replenishment where ground-truth realized POS actuals from week t-1 are provided for each weekly step.
              </p>
            </button>
          </div>
        </div>

        {/* 5. Model Strategy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 font-sans">
              5. Model Strategy
            </label>
            <span className="text-xs text-zinc-400 font-mono">
              Strategy: {modelStrategy}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['Recommended', 'Compare models', 'Custom'] as const).map((strategy) => {
              const isSelected = modelStrategy === strategy
              return (
                <button
                  key={strategy}
                  type="button"
                  onClick={() => setModelStrategy(strategy)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-950 shadow-subtle ring-1 ring-zinc-900'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{strategy}</span>
                    {strategy === 'Recommended' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Best
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {strategy === 'Recommended' && 'Selected final hybrid model (with uncertainty bounds)'}
                    {strategy === 'Compare models' && 'Stacking ensemble blending decision trees'}
                    {strategy === 'Custom' && 'Choose baseline (XGBoost, RF, Prophet, Naive)'}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Conditional selector if "Custom" strategy is selected */}
          {modelStrategy === 'Custom' && (
            <div className="mt-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2 animate-fade-in">
              <label className="text-xs font-semibold text-zinc-700">Select Specific Algorithm:</label>
              <select
                value={customModelId}
                onChange={(e) => setCustomModelId(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none"
              >
                {MOCK_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.family}) — {m.wape ?? m.mape}% WAPE
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Summary pill of selected model strategy */}
          <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-zinc-600">Model Assigned:</span>
              <span className="font-semibold text-zinc-950">{resolvedModel.name}</span>
            </div>
            <span className="font-mono text-emerald-700 font-medium">
              {resolvedModel.wape ?? resolvedModel.mape}% Test WAPE
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsAdvancedDrawerOpen(true)}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 self-start sm:self-auto py-2"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            Advanced configuration
          </button>

          <ActionButton
            size="md"
            variant="primary"
            onClick={handleStartGeneration}
            disabled={!isCohortSupported}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate forecast
          </ActionButton>
        </div>
      </div>

      {/* Advanced Configuration Slide-over Drawer */}
      {isAdvancedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsAdvancedDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950 font-display">
                  Advanced Configuration
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Tune econometric parameters and uncertainty bounds
                </p>
              </div>
              <button
                onClick={() => setIsAdvancedDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 flex-1 text-xs sm:text-sm">
              {/* Confidence Interval */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-800">
                  Target Nominal Confidence Interval
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['90%', '95%', '99%'].map((ci) => (
                    <button
                      key={ci}
                      type="button"
                      onClick={() => setConfidenceInterval(ci)}
                      className={`p-2 rounded-lg text-xs font-mono font-medium border ${
                        confidenceInterval === ci
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-700'
                      }`}
                    >
                      {ci}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Note: Disclosed as uncalibrated heuristic intervals (empirical test coverage: 72.11%).
                </p>
              </div>

              {/* Markdown Decay Rate */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-zinc-800">
                    Promotional Markdown Decay Weight
                  </label>
                  <span className="font-mono text-zinc-600 text-xs">{markdownElasticityWeight}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={markdownElasticityWeight}
                  onChange={(e) => setMarkdownElasticityWeight(parseFloat(e.target.value))}
                  className="w-full accent-zinc-900"
                />
                <p className="text-[11px] text-zinc-400">
                  Governs how rapidly promotional lift dampens across post-event trading weeks.
                </p>
              </div>

              {/* Holiday Surge Anticipation */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-zinc-800 block">
                      Holiday Anticipation Window
                    </label>
                    <span className="text-[11px] text-zinc-400">
                      Model demand spikes 2 weeks prior to calendar events
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeHolidayAnticipation}
                    onChange={(e) => setIncludeHolidayAnticipation(e.target.checked)}
                    className="w-4 h-4 accent-zinc-900 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
              <ActionButton
                size="sm"
                variant="primary"
                onClick={() => setIsAdvancedDrawerOpen(false)}
              >
                Apply Settings
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
