import React from 'react'
import { CheckCircle2, Loader2, Circle } from 'lucide-react'
import { Skeleton } from './Skeleton'

export interface GenerationStage {
  id: string
  title: string
  description: string
}

export const FORECAST_STAGES: GenerationStage[] = [
  {
    id: 'validate',
    title: 'Dataset validated',
    description: 'Verifying continuous date intervals, store metadata, and cleaning markdowns',
  },
  {
    id: 'patterns',
    title: 'Historical patterns analyzed',
    description: 'Decomposing 52-week seasonal cycle and localized holiday multipliers',
  },
  {
    id: 'features',
    title: 'Features generated',
    description: 'Constructing lag regressors (t-1..t-8), rolling averages, and markdown decay',
  },
  {
    id: 'model',
    title: 'Forecasting model executed',
    description: 'Running gradient boosted ensemble & evaluating cross-validation loss',
  },
  {
    id: 'projection',
    title: 'Demand projection generated',
    description: 'Synthesizing projected trajectory and calibrating 95% confidence bounds',
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
              Inference Pipeline Active
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

        {/* Stages Checklist */}
        <div className="space-y-4">
          {FORECAST_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex
            const isCurrent = idx === currentStageIndex
            const isPending = idx > currentStageIndex

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3.5 p-3 rounded-xl transition-all duration-200 ${
                  isCurrent ? 'bg-blue-50/60 border border-blue-100' : 'bg-transparent'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-semibold tracking-tight ${
                        isCurrent
                          ? 'text-blue-900'
                          : isCompleted
                          ? 'text-zinc-900'
                          : 'text-zinc-400'
                      }`}
                    >
                      {stage.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Running
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] uppercase font-mono text-zinc-400">
                        Done
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isCurrent ? 'text-blue-700' : 'text-zinc-500'
                    }`}
                  >
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live log stream preview */}
        {stageLogs.length > 0 && (
          <div className="mt-6 p-3 bg-zinc-950 rounded-xl text-zinc-300 font-mono text-xs space-y-1 overflow-hidden">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
              Kernel Telemetry
            </div>
            {stageLogs.slice(-3).map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-zinc-400 truncate">
                <span className="text-emerald-400">›</span>
                <span className="truncate">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skeleton preview of upcoming forecast UI */}
      <div className="space-y-4 opacity-40">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl w-full" />
      </div>
    </div>
  )
}
