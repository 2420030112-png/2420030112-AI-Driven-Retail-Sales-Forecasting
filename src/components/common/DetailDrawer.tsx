import React, { useEffect } from 'react'
import { X, ExternalLink, Cpu, BarChart2, CheckCircle2, Sliders } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ModelBenchmark } from '../../types'
import { StatusBadge } from './StatusBadge'
import { ActionButton } from './ActionButton'

export interface DetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  model: ModelBenchmark | null
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  model,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !model) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/30 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md md:max-w-lg bg-white shadow-drawer border-l border-zinc-200 flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status={model.status} />
                <span className="text-xs font-mono text-zinc-400">v{model.version}</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight font-display">
                {model.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">{model.family} Model Family</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm">
            {/* Model description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-2">
                Architecture Summary
              </h4>
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                {model.description}
              </p>
            </div>

            {/* Core Evaluation Metrics */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-3">
                Validation Performance
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70">
                  <span className="text-xs text-zinc-400 block font-mono">MAE</span>
                  <span className="text-lg font-bold text-zinc-900 font-display">
                    ${model.mae.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Mean Abs Error</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70">
                  <span className="text-xs text-zinc-400 block font-mono">RMSE</span>
                  <span className="text-lg font-bold text-zinc-900 font-display">
                    ${model.rmse.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Root Mean Sq Error</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70">
                  <span className="text-xs text-zinc-400 block font-mono">MAPE</span>
                  <span className="text-lg font-bold text-emerald-700 font-display">
                    {model.mape}%
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Abs % Error</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70">
                  <span className="text-xs text-zinc-400 block font-mono">R² Score</span>
                  <span className="text-lg font-bold text-zinc-900 font-display">
                    {model.r2}
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Variance Explained</span>
                </div>
              </div>
            </div>

            {/* Comparison with Baseline (Section 12) */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-2">
                Comparison With Baseline
              </h4>
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 font-medium">vs Linear Regression:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {(((7.82 - model.mape) / 7.82) * 100).toFixed(1)}% Error Reduction
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 font-medium">vs Standalone XGBoost:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {model.mape <= 3.12 ? `-${(((3.12 - model.mape) / 3.12) * 100).toFixed(1)}% MAPE` : `+${(((model.mape - 3.12) / 3.12) * 100).toFixed(1)}% MAPE`}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Contribution Visualization */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Feature Importance Weights
                </h4>
                <span className="text-[11px] text-zinc-400 font-mono">{model.featuresCount} Features Total</span>
              </div>

              <div className="space-y-2.5 p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200/60">
                {model.featureImportance.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-zinc-700">{item.feature}</span>
                      <span className="font-mono text-zinc-500">{(item.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-800 h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.weight * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training & Latency Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-3">
                Operational Characteristics
              </h4>
              <div className="space-y-2 text-xs divide-y divide-zinc-100">
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    Training Runtime
                  </span>
                  <span className="font-mono font-medium text-zinc-800">{model.trainingTimeSec}s</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-zinc-400" />
                    Inference Latency
                  </span>
                  <span className="font-mono font-medium text-zinc-800">{model.inferenceLatencyMs} ms</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                    Optimal Scenario
                  </span>
                  <span className="font-normal text-zinc-700 text-right max-w-[240px] truncate">
                    {model.bestFor}
                  </span>
                </div>
              </div>
            </div>

            {/* Hyperparameters sample */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Hyperparameter Configuration
              </h4>
              <div className="p-3 bg-zinc-900 text-zinc-200 rounded-lg text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(model.hyperparameters, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 px-6 border-t border-zinc-200 bg-zinc-50/60 flex items-center justify-between">
            <Link
              to="/models"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-900 hover:text-blue-600 inline-flex items-center gap-1.5"
            >
              <span>Open full model comparison</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <ActionButton size="sm" variant="secondary" onClick={onClose}>
              Close
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}
