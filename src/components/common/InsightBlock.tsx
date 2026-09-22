import React from 'react'
import { ArrowUpRight, Sparkles, ShieldAlert, TrendingUp, Calendar, Compass } from 'lucide-react'
import { RetailInsight } from '../../types'

export interface InsightBlockProps {
  insight: RetailInsight
  onActionClick?: () => void
  className?: string
  compact?: boolean
}

export const InsightBlock: React.FC<InsightBlockProps> = ({
  insight,
  onActionClick,
  className = '',
  compact = false,
}) => {
  const getCategoryIcon = (category: RetailInsight['category']) => {
    switch (category) {
      case 'Planning signal':
        return <Compass className="w-3.5 h-3.5 text-indigo-600" />
      case 'Seasonality':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />
      case 'Volatility':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
      case 'Demand trend':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
      case 'Store behavior':
        return <Sparkles className="w-3.5 h-3.5 text-violet-600" />
      default:
        return <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
    }
  }

  const getImpactBadge = (impact: RetailInsight['impactLevel']) => {
    switch (impact) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200/60'
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/60'
      case 'Low':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200'
    }
  }

  return (
    <div className={`p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle hover:border-zinc-300 transition-all duration-150 ${className}`}>
      {/* Category header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-zinc-50 border border-zinc-200/60">
            {getCategoryIcon(insight.category)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
            {insight.category}
          </span>
          {insight.storeRef && (
            <span className="text-xs text-zinc-400 font-normal">
              • {insight.storeRef}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getImpactBadge(insight.impactLevel)}`}>
            {insight.impactLevel} Impact
          </span>
          {insight.timestamp && (
            <span className="text-[11px] text-zinc-400 hidden sm:inline">{insight.timestamp}</span>
          )}
        </div>
      </div>

      {/* Headline */}
      <h4 className="text-sm sm:text-base font-semibold text-zinc-950 tracking-tight font-display mb-1.5 leading-snug">
        {insight.headline}
      </h4>

      {/* Narrative */}
      <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed mb-3">
        {insight.narrative}
      </p>

      {/* Recommendation and Delta */}
      {!compact && (
        <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-700">
            <span className="font-semibold text-zinc-900">Recommendation:</span>
            <span className="text-zinc-600">{insight.recommendation}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-[11px] font-medium text-zinc-800 shrink-0 self-start sm:self-auto">
            <span>{insight.metricDelta}</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
          </div>
        </div>
      )}
    </div>
  )
}
