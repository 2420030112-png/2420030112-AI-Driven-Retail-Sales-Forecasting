import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { SearchSelect, SelectOption } from '../components/common/SearchSelect'
import { ActionButton } from '../components/common/ActionButton'
import { LoadingState } from '../components/common/LoadingState'
import { MOCK_STORES, MOCK_DEPARTMENTS, MOCK_MODELS } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { ForecastRecord } from '../types'
import { Sliders, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react'

export const NewForecastPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addForecast } = useApp()

  // Pre-fill store if passed in query param ?storeId=20
  const initialStoreId = searchParams.get('storeId') || '20'
  const initialDeptId = searchParams.get('deptId') || '72'

  const [storeId, setStoreId] = useState<string>(initialStoreId)
  const [deptId, setDeptId] = useState<string>(initialDeptId)
  const [horizonWeeks, setHorizonWeeks] = useState<4 | 8 | 12>(12)
  const [selectedModelId, setSelectedModelId] = useState<string>('xgboost-v2')

  // Generation state
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [stageLogs, setStageLogs] = useState<string[]>([])

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
  const selectedModel = MOCK_MODELS.find((m) => m.id === selectedModelId) || MOCK_MODELS[0]

  // Simulate realistic 5-stage inference execution
  useEffect(() => {
    if (!isProcessing) return

    const logsMap = [
      [
        `Validating historical timeseries for Store #${selectedStore.id} (${selectedStore.name})`,
        `Ingested 143 weekly observations with 0 missing date intervals`,
        `Markdown sparsity sanitized: 0.0 applied for pre-Nov 2011 records`,
      ],
      [
        `Decomposing multi-year seasonal periodicity (52-week Fourier basis)`,
        `Calculated regional Thanksgiving surge multiplier: 2.14x`,
        `Estimated markdown elasticity coefficient: +4.2% lift`,
      ],
      [
        `Engineering feature tensor: Lag_1W through Lag_8W constructed`,
        `Synthesizing rolling window statistics: 4-week mean and standard deviation`,
        `Vectorizing macroeconomic indicators: CPI, Fuel Price, Unemployment`,
      ],
      [
        `Initializing ${selectedModel.name}`,
        `Fitting 450 boosted estimators with subsample=0.85, learning_rate=0.045`,
        `Cross-validation RMSE: $4,890 • Validation MAPE: ${selectedModel.mape}%`,
      ],
      [
        `Synthesizing ${horizonWeeks}-week forward projection points`,
        `Computing 95% heteroskedastic confidence intervals`,
        `Demand projection artifact finalized and persisted.`,
      ],
    ]

    const interval = setInterval(() => {
      setCurrentStageIndex((prevStage) => {
        if (prevStage < 4) {
          const nextStage = prevStage + 1
          setStageLogs((prevLogs) => [...prevLogs, ...logsMap[nextStage]])
          return nextStage
        } else {
          // Finished! Create record and navigate
          clearInterval(interval)
          setTimeout(() => {
            const newForecastId = `fc-${Date.now().toString().slice(-4)}`
            const baseline = selectedDept.avgWeeklySales * horizonWeeks
            const liftMultiplier = horizonWeeks === 12 ? 1.09 : 1.05
            const projectedSales = Math.round(baseline * liftMultiplier)
            const changePercent = Number(((liftMultiplier - 1) * 100).toFixed(2))

            const newForecast: ForecastRecord = {
              id: newForecastId,
              storeId: selectedStore.id,
              storeName: selectedStore.name,
              deptId: selectedDept.id,
              deptName: selectedDept.name,
              horizonWeeks,
              status: 'Completed',
              createdAt: 'Just now',
              modelUsed: selectedModel.name,
              projectedSales,
              historicalBaseline: baseline,
              changePercent,
              confidenceScore: 0.95,
              interpretation: `Projected ${changePercent}% volume acceleration over historical baseline for ${selectedStore.name} — ${selectedDept.name} across the ${horizonWeeks}-week horizon. Driven by seasonal peak alignment and promotional markdown elasticity.`,
              metrics: {
                mae: selectedModel.mae,
                rmse: selectedModel.rmse,
                mape: selectedModel.mape,
                r2: selectedModel.r2,
              },
            }

            addForecast(newForecast)
            navigate(`/forecasts/${newForecastId}`)
          }, 700)
          return prevStage
        }
      })
    }, 1100)

    // Initial logs for stage 0
    setStageLogs(logsMap[0])

    return () => clearInterval(interval)
  }, [isProcessing, selectedStore, selectedDept, selectedModel, horizonWeeks, navigate, addForecast])

  const handleStartGeneration = () => {
    setIsProcessing(true)
    setCurrentStageIndex(0)
  }

  if (isProcessing) {
    return (
      <LoadingState
        currentStageIndex={currentStageIndex}
        stageLogs={stageLogs}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Configure Demand Forecast"
        subtitle="Specify target store, department, and prediction horizon to execute predictive modeling."
        eyebrow="Configuration"
      />

      {/* Main Configuration Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-subtle p-6 sm:p-8 space-y-7">
        {/* Store Selector */}
        <div>
          <SearchSelect
            label="1. Target Retail Store Entity"
            placeholder="Search stores by name, city, or ID..."
            searchPlaceholder="Filter 45 stores..."
            options={storeOptions}
            value={storeId}
            onChange={(val) => setStoreId(String(val))}
            helperText="Selected store dictates square footage, regional climate, and localized foot traffic history."
          />
        </div>

        {/* Department Selector */}
        <div>
          <SearchSelect
            label="2. Product Department / Assortment"
            placeholder="Search departments by name or category..."
            searchPlaceholder="Filter product departments..."
            options={deptOptions}
            value={deptId}
            onChange={(val) => setDeptId(String(val))}
            helperText="Department determines historical markdown elasticities and seasonal spike profiles."
          />
        </div>

        {/* Forecast Horizon: Refined Segmented Control */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2 font-sans">
            3. Prediction Horizon
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
                      {weeks} Weeks
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    {weeks === 4 && 'Immediate Replenishment'}
                    {weeks === 8 && 'Mid-Term Inventory Buffer'}
                    {weeks === 12 && 'Full Quarterly Demand Cycle'}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Model Selection */}
        <div className="pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 font-sans">
              4. Forecasting Algorithm
            </label>
            <span className="text-xs text-zinc-400 font-mono">Benchmark: {selectedModel.mape}% MAPE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_MODELS.slice(0, 4).map((m) => {
              const isSelected = selectedModelId === m.id
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModelId(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900">{m.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{m.family}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {m.bestFor}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Configuration Summary Pill */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Configured: <strong>{selectedStore.name}</strong> •{' '}
              <strong>{selectedDept.name}</strong> ({horizonWeeks}w)
            </span>
          </div>
          <span className="text-zinc-400 font-mono">Dataset: 143 Weeks Ready</span>
        </div>

        {/* Primary CTA */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <ActionButton
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/forecasts')}
          >
            Cancel
          </ActionButton>

          <ActionButton
            type="button"
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={handleStartGeneration}
          >
            Continue
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
