import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Clock, ExternalLink } from 'lucide-react'
import { Metric } from '../components/common/Metric'
import { ChartContainer } from '../components/common/ChartContainer'
import { StatusBadge } from '../components/common/StatusBadge'
import { ActionButton } from '../components/common/ActionButton'
import { generateOverviewTrajectory, MOCK_INSIGHTS } from '../data/mockData'
import { useApp } from '../context/AppContext'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export const OverviewPage: React.FC = () => {
  const { forecasts } = useApp()
  const trajectoryData = useMemo(() => generateOverviewTrajectory(), [])

  // Highlighted contextual insight
  const featuredInsight = MOCK_INSIGHTS[0]

  return (
    <div className="space-y-10">
      {/* 1. Elegant Editorial Hero Section */}
      <section className="pt-2 sm:pt-4 pb-2">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/90 border border-zinc-200/80 text-xs font-medium text-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>NEXUS Demand Intelligence • Q4 Forecast Cycle</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 font-display leading-[1.15]">
            Retail demand, at a glance.
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 font-normal leading-relaxed max-w-2xl">
            Understand what happened. Predict what comes next across 45 regional supercenters and 81 product categories.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link to="/forecasts">
              <ActionButton
                size="md"
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Explore forecasts
              </ActionButton>
            </Link>

            <Link to="/analytics">
              <ActionButton
                size="md"
                variant="outline"
              >
                View analytics
              </ActionButton>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Three Restrained Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric
          label="Historical Sales"
          value="$2.21B"
          delta={{ value: "421,570 Records", isPositive: true }}
          subtext="Cumulative network revenue across 143 audited trading weeks."
        />
        <Metric
          label="Active Stores"
          value="45 Units"
          delta={{ value: "Full Catalog", isNeutral: true }}
          subtext="Covering Type A supercenters, Type B, and Type C compact units."
        />
        <Metric
          label="ML Benchmark Cohort"
          value="20 Series"
          delta={{ value: "9.41% Test WAPE", isPositive: true }}
          subtext="5 Stores (1, 10, 14, 20, 35) & 4 Depts (1, 7, 72, 92) across 380 test rows."
        />
      </section>

      {/* 3. One Primary Sales Trajectory Visualization */}
      <section>
        <ChartContainer
          title="Network Sales Trajectory"
          subtitle="24-Month aggregated weekly revenue trend highlighting historical holiday peaks and seasonal patterns ($ Millions)"
          action={
            <Link
              to="/analytics/sales"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1 transition-colors"
            >
              Detailed sales analysis
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis
                  dataKey="date"
                  axisLine={{ stroke: '#e4e4e7' }}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickFormatter={(v) => `$${v}M`}
                  width={50}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value
                      return (
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-elevated border border-zinc-200 text-xs">
                          <p className="font-semibold text-zinc-900 mb-1">{label}</p>
                          <div className="flex items-center justify-between gap-3 text-zinc-600">
                            <span>Network Volume:</span>
                            <span className="font-mono font-bold text-zinc-950">${val}M</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="historical"
                  stroke="#09090b"
                  strokeWidth={2}
                  fill="url(#overviewGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </section>

      {/* 4. Concise "What's changing?" Contextual Insight */}
      <section className="bg-gradient-to-r from-zinc-50 via-white to-zinc-50/70 rounded-2xl border border-zinc-200/90 p-6 sm:p-7 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-900 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 font-display">
                What's Changing?
              </h3>
              <p className="text-xs text-zinc-400">Algorithmic network anomaly and demand signals</p>
            </div>
          </div>
          <Link
            to="/insights"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            All 5 live signals
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium border border-rose-200">
              High Priority Signal
            </span>
            <span className="text-xs text-zinc-400">• {featuredInsight.category}</span>
          </div>

          <h4 className="text-base sm:text-lg font-semibold text-zinc-950 font-display tracking-tight">
            {featuredInsight.headline}
          </h4>

          <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl">
            {featuredInsight.narrative}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-zinc-800">Action Plan:</span>
            <span className="text-zinc-600">{featuredInsight.recommendation}</span>
            <span className="font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 ml-auto">
              {featuredInsight.metricDelta}
            </span>
          </div>
        </div>
      </section>

      {/* 5. Small Recent Activity / Forecast Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-950 font-display tracking-tight">
              Recent Demand Forecasts
            </h3>
            <p className="text-xs text-zinc-500">Latest predictive models executed across stores and departments</p>
          </div>

          <Link
            to="/forecasts"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1"
          >
            View all ({forecasts.length})
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle divide-y divide-zinc-100 overflow-hidden">
          {forecasts.slice(0, 4).map((fc) => (
            <Link
              key={fc.id}
              to={`/forecasts/${fc.id}`}
              className="p-4 sm:px-5 flex items-center justify-between hover:bg-zinc-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:bg-zinc-200/80 transition-colors shrink-0">
                  <Clock className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 truncate">
                      {fc.storeName}
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-600 truncate">{fc.deptName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>{fc.horizonWeeks} Weeks Horizon</span>
                    <span>•</span>
                    <span className="font-mono">{fc.modelUsed}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-zinc-900 font-mono">
                    ${(fc.projectedSales / 1_000).toFixed(0)}k Projected
                  </div>
                  <div className={`text-xs font-medium ${fc.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fc.changePercent >= 0 ? '+' : ''}{fc.changePercent}% Expected
                  </div>
                </div>

                <StatusBadge status={fc.status} />

                <div className="p-1 rounded text-zinc-300 group-hover:text-zinc-700 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
