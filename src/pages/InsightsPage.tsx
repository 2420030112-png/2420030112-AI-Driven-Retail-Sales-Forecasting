import React, { useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { InsightBlock } from '../components/common/InsightBlock'
import { MOCK_INSIGHTS } from '../data/mockData'
import { RetailInsight } from '../types'
import { Sparkles, Filter, Compass, Calendar, ShieldAlert, TrendingUp } from 'lucide-react'

export const InsightsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedImpact, setSelectedImpact] = useState<string>('All')

  const categories = [
    'All',
    'Planning signal',
    'Seasonality',
    'Demand trend',
    'Volatility',
    'Store behavior',
  ]

  const filteredInsights = MOCK_INSIGHTS.filter((ins) => {
    const matchesCategory = selectedCategory === 'All' || ins.category === selectedCategory
    const matchesImpact = selectedImpact === 'All' || ins.impactLevel === selectedImpact
    return matchesCategory && matchesImpact
  })

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Business Intelligence & Planning Signals"
        subtitle="Executive interpretations of demand trends, volatility anomalies, and automated inventory planning triggers."
        eyebrow="Intelligence"
      />

      {/* KPI Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Active Intelligence Signals"
          value="5 Live"
          delta={{ value: "2 High Priority", isPositive: false }}
          subtext="Synthesized from telemetry"
        />
        <Metric
          label="Est. Allocation Impact"
          value="+$155K"
          delta={{ value: "+9.2% Surge", isPositive: true }}
          subtext="Store 20 Q4 replenishment"
        />
        <Metric
          label="Top Volatility Area"
          value="Store 14"
          subtext="Urban Northeast markdown friction"
        />
        <Metric
          label="Automated Ordering"
          value="2 Stores"
          delta={{ value: "Type C Ready", isPositive: true }}
          subtext="Staple departments qualifying"
        />
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 text-xs font-medium">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-zinc-950 font-semibold shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Impact Filter */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 self-end sm:self-auto">
          <span className="text-zinc-400 font-mono">Impact:</span>
          {(['All', 'High', 'Medium', 'Low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedImpact(lvl)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedImpact === lvl
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Stream */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400 bg-white rounded-xl border border-zinc-200">
            No insights match your selected category filter.
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <InsightBlock key={insight.id} insight={insight} />
          ))
        )}
      </div>
    </div>
  )
}
