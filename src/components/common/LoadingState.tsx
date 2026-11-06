import React from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

export interface GenerationStage {
  id: string
  title: string
  description: string
}

const FORECAST_STAGES: GenerationStage[] = [
  {
    id: 'validate',
    title: 'Dataset validated',
    description: 'Verifying continuous 143-week date intervals, store metadata, and cleaning markdowns',
  },
  {
    id: 'series',
    title: 'Historical series prepared',
    description: 'Decomposing 52-week seasonal cycle, long-term trends, and holiday multipliers',
  },
  {
    id: 'features',
    title: 'Features generated',
    description: 'Constructing multi-lag regressors (t-1..t-8), rolling stats, and markdown decay weights',
  },
  {
    id: 'base_model',
    title: 'Forecasting model executed',
    description: 'Running base decomposition model and generating structural seasonal forecast',
  },
  {
    id: 'hybrid_residual',
    title: 'Hybrid residual/ensemble stage executed',
    description: 'Executing residual gradient boosting engine and context-aware promotional corrections',
  },
  {
    id: 'projection',
    title: 'Demand projection generated',
    description: 'Synthesizing projected demand trajectory and calibrating 95% confidence intervals',
  },
]

export interface LoadingStateProps {
  currentStageIndex: number
  totalStages?: number
  stageLogs?: string[]
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  currentStageIndex,
  totalStages = FORECAST_STAGES.length,
  stageLogs = [],
}) => {
  const progressPercent = Math.min(
    100,
    Math.round(((currentStageIndex + 1) / totalStages) * 100)
  )

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-elevated mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-600 font-semibold block mb-1">
              Hybrid Inference Pipeline Active
            </span>
            <h3 className="text-xl font-bold text-zinc-950 font-display tracking-tight">
              Generating Demand Projection
            </h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-zinc-900 font-mono">{progressPercent}%</span>
            <span className="text-[11px] text-zinc-400 block">Stage {currentStageIndex + 1} of {totalStages}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-zinc-900 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stages Checklist (Section 10) */}
        <div className="space-y-3">
          {FORECAST_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex
            const isCurrent = idx === currentStageIndex

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3.5 p-3 rounded-xl transition-all duration-200 ${
                  isCurrent ? 'bg-blue-50/60 border border-blue-100 shadow-subtle' : 'bg-transparent'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-blue-900 font-bold'
                          : isCompleted
                          ? 'text-zinc-900'
                          : 'text-zinc-400 font-normal'
                      }`}
                    >
                      {stage.title}
                    </h4>
                    {isCompleted && (
                      <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Passed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-mono font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                        Executing...
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isCurrent
                        ? 'text-blue-700/80'
                        : isCompleted
                        ? 'text-zinc-500'
                        : 'text-zinc-300'
                    }`}
                  >
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Real-time telemetry log feed */}
      {stageLogs.length > 0 && (
        <div className="bg-zinc-950 rounded-2xl p-4 sm:p-5 text-zinc-200 shadow-card font-mono text-xs space-y-2 border border-zinc-800">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
            <span>Inference Kernel Telemetry</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto pt-1 text-[11px]">
            {stageLogs.slice(-6).map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-zinc-300">
                <span className="text-zinc-500 select-none">&gt;</span>
                <span className="leading-relaxed">{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
