import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface MetricProps {
  label: string
  value: string | number
  delta?: {
    value: string
    isPositive?: boolean
    isNeutral?: boolean
  }
  subtext?: string
  icon?: React.ReactNode
  className?: string
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  delta,
  subtext,
  icon,
  className = '',
}) => {
  return (
    <div className={`p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle ${className}`}>
      <div className="flex items-center justify-between text-zinc-500 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
        {icon && <span className="text-zinc-400">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 font-display">
          {value}
        </div>

        {delta && (
          <div
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${
              delta.isNeutral
                ? 'bg-zinc-100 text-zinc-700'
                : delta.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {delta.isNeutral ? (
              <Minus className="w-3 h-3 mr-1" />
            ) : delta.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1 text-rose-600" />
            )}
            {delta.value}
          </div>
        )}
      </div>

      {subtext && <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{subtext}</p>}
    </div>
  )
}
