import React, { useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { ChartContainer } from '../components/common/ChartContainer'
import { generateOverviewTrajectory, MOCK_DEPARTMENTS } from '../data/mockData'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export const SalesAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24M' | '12M'>('24M')
  const trajectory = generateOverviewTrajectory()
  const displayData = timeframe === '12M' ? trajectory.slice(-12) : trajectory

  const deptVolumeData = MOCK_DEPARTMENTS.map((d) => ({
    name: d.name.length > 18 ? d.name.substring(0, 18) + '...' : d.name,
    fullName: d.name,
    weeklySales: d.avgWeeklySales,
    category: d.category,
  })).sort((a, b) => b.weeklySales - a.weeklySales)

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Sales Trends Analysis"
        subtitle="Longitudinal revenue trajectory, departmental volume contributions, and holiday dynamics across 143 audited weeks."
        eyebrow="Analytics"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Total Network Sales"
          value="$2.21B"
          delta={{ value: "+4.6% YoY", isPositive: true }}
          subtext="Audited historical revenue"
        />
        <Metric
          label="Mean Weekly Sales"
          value="$15.4M"
          delta={{ value: "Stable", isNeutral: true }}
          subtext="Across all 45 regional units"
        />
        <Metric
          label="Peak Holiday Week"
          value="$28.9M"
          delta={{ value: "2.45x Lift", isPositive: true }}
          subtext="Thanksgiving / Black Friday"
        />
        <Metric
          label="Promotional Volume"
          value="34.8%"
          delta={{ value: "+2.1%", isPositive: true }}
          subtext="Markdown-assisted sales ratio"
        />
      </div>

      {/* Main Trajectory Chart */}
      <ChartContainer
        title="Longitudinal Sales Trajectory ($ Millions)"
        subtitle="Weekly revenue time series with seasonal Thanksgiving and Christmas surges"
        action={
          <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeframe('24M')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeframe === '24M' ? 'bg-white text-zinc-950 shadow-subtle font-semibold' : 'text-zinc-500'
              }`}
            >
              24 Months
            </button>
            <button
              onClick={() => setTimeframe('12M')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeframe === '12M' ? 'bg-white text-zinc-950 shadow-subtle font-semibold' : 'text-zinc-500'
              }`}
            >
              LTM (12 Months)
            </button>
          </div>
        }
      >
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="date" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `$${v}M`} width={50} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-zinc-200 text-xs">
                        <p className="font-semibold text-zinc-900 mb-1">{label}</p>
                        <div className="flex items-center justify-between gap-3 text-zinc-600">
                          <span>Volume:</span>
                          <span className="font-mono font-bold text-zinc-950">${payload[0].value}M</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="historical" stroke="#2563eb" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Top Department Weekly Volume ($)"
          subtitle="Highest grossing product departments across the retail network"
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptVolumeData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 11 }} width={120} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-2.5 rounded-lg shadow-elevated border border-zinc-200 text-xs">
                          <p className="font-semibold text-zinc-900">{data.fullName}</p>
                          <p className="text-zinc-500">{data.category}</p>
                          <p className="font-mono font-bold text-blue-600 mt-1">
                            ${data.weeklySales.toLocaleString()} / week
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="weeklySales" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Store Type Footprint Dynamics */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 font-display">Store Format Velocity</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Performance stratification by physical store archetype</p>

            <div className="mt-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-900">Type A — Supercenter (200k+ sq ft)</span>
                  <span className="font-mono font-bold text-zinc-900">$2.04M / wk</span>
                </div>
                <p className="text-[11px] text-zinc-500">22 Stores • 82 Depts avg • High seasonal surge sensitivity</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-900">Type B — Suburban Format (120k sq ft)</span>
                  <span className="font-mono font-bold text-zinc-900">$1.15M / wk</span>
                </div>
                <p className="text-[11px] text-zinc-500">17 Stores • 72 Depts avg • Balanced grocery and apparel demand</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-900">Type C — Compact Express (40k sq ft)</span>
                  <span className="font-mono font-bold text-zinc-900">$385k / wk</span>
                </div>
                <p className="text-[11px] text-zinc-500">6 Stores • 54 Depts avg • Lowest volatility & high replenishment predictability</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-400">
            Based on 143 audited historical sales weeks from 2010 to 2012.
          </div>
        </div>
      </div>
    </div>
  )
}
