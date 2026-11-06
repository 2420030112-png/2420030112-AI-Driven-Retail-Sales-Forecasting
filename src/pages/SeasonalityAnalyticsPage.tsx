import React from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { ChartContainer } from '../components/common/ChartContainer'
import { Calendar, Tag } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export const SeasonalityAnalyticsPage: React.FC = () => {
  // 52-week seasonality index curve
  const week52Data = Array.from({ length: 52 }, (_, i) => {
    const week = i + 1
    let index = 1.0 + Math.sin((week / 52) * Math.PI * 2 - Math.PI / 2) * 0.12

    // Super Bowl (W6)
    if (week === 6) index += 0.22
    // Easter / Spring (W14)
    if (week === 14) index += 0.18
    // Memorial Day (W21)
    if (week === 21) index += 0.15
    // Labor Day (W36)
    if (week === 36) index += 0.2
    // Thanksgiving / Black Friday (W47)
    if (week === 47) index += 1.45
    // Christmas (W51)
    if (week === 51) index += 1.38
    // Post-Holiday drop (W52, W1)
    if (week === 52 || week === 1) index -= 0.18

    return {
      week: `W${week}`,
      seasonalityIndex: Number(index.toFixed(2)),
      baseline: 1.0,
      isPeak: week === 47 || week === 51,
    }
  })

  // Holiday event multipliers
  const holidayEvents = [
    { name: 'Thanksgiving & Black Friday', week: 'Week 47', multiplier: '2.45x', liftPercent: '+145%', impactCategory: 'Electronics & Grocery' },
    { name: 'Christmas Eve Peak', week: 'Week 51', multiplier: '2.38x', liftPercent: '+138%', impactCategory: 'Toys & Apparel' },
    { name: 'Super Bowl Weekend', week: 'Week 06', multiplier: '1.22x', liftPercent: '+22%', impactCategory: 'Beverages & Snacks' },
    { name: 'Labor Day End of Summer', week: 'Week 36', multiplier: '1.20x', liftPercent: '+20%', impactCategory: 'Outdoor & Patio' },
    { name: 'Memorial Day Kickoff', week: 'Week 21', multiplier: '1.15x', liftPercent: '+15%', impactCategory: 'Grilling & Apparel' },
  ]

  // Markdown responsiveness data
  const markdownImpact = [
    { type: 'MarkDown1', name: 'General Clearance', avgWeeklyAmount: '$24.5k', elasticityLift: '+6.2%', correlation: 0.74 },
    { type: 'MarkDown2', name: 'Seasonal Rollbacks', avgWeeklyAmount: '$18.2k', elasticityLift: '+8.4%', correlation: 0.81 },
    { type: 'MarkDown3', name: 'Holiday Door-Busters', avgWeeklyAmount: '$38.9k', elasticityLift: '+19.6%', correlation: 0.92 },
    { type: 'MarkDown4', name: 'Manufacturer Coupons', avgWeeklyAmount: '$12.4k', elasticityLift: '+3.8%', correlation: 0.58 },
    { type: 'MarkDown5', name: 'Store Manager Special', avgWeeklyAmount: '$16.1k', elasticityLift: '+5.1%', correlation: 0.65 },
  ]

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Seasonality & Calendar Dynamics"
        subtitle="52-week seasonal cycle decomposition, holiday multiplier calibration, and promotional markdown elasticities."
        eyebrow="Analytics"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Peak Annual Multiplier"
          value="2.45x"
          delta={{ value: "Week 47", isNeutral: true }}
          subtext="Thanksgiving volume multiplier"
        />
        <Metric
          label="Seasonal Amplitude"
          value="163%"
          subtext="Peak to trough annual spread"
        />
        <Metric
          label="Markdown Lift"
          value="+14.2%"
          delta={{ value: "+2.4%", isPositive: true }}
          subtext="Incremental promotional revenue"
        />
        <Metric
          label="Holiday Calendar Effect"
          value="4 Events"
          subtext="Direct calendar regressors"
        />
      </div>

      {/* 52-Week Seasonality Curve */}
      <ChartContainer
        title="52-Week Normalized Demand Multiplier Cycle"
        subtitle="Ratio to baseline non-promotional trading week (1.00 = Neutral Demand baseline)"
      >
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={week52Data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="week" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} interval={3} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(1)}x`} domain={[0.6, 2.6]} width={45} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-zinc-200 text-xs">
                        <p className="font-semibold text-zinc-900 mb-1">{label}</p>
                        <div className="flex items-center justify-between gap-3 text-zinc-600">
                          <span>Demand Multiplier:</span>
                          <span className="font-mono font-bold text-blue-600">{val}x</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line type="monotone" dataKey="seasonalityIndex" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#2563eb' }} />
              <Line type="monotone" dataKey="baseline" stroke="#a1a1aa" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Two Column Breakdown: Holiday Multipliers & Markdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holiday Multipliers Table */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 font-display">
                Key Calendar Holiday Surge Multipliers
              </h3>
              <p className="text-xs text-zinc-500">Exogenous event coefficients derived from multi-year training</p>
            </div>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {holidayEvents.map((evt, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-900">{evt.name}</div>
                  <div className="text-[11px] text-zinc-400">{evt.week} • {evt.impactCategory}</div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-zinc-900 block">
                    {evt.multiplier}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {evt.liftPercent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotional Markdown Elasticity */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 font-display">
                Promotional Markdown Elasticities (MD1–MD5)
              </h3>
              <p className="text-xs text-zinc-500">Impact of price promotions on category volume lift</p>
            </div>
            <Tag className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {markdownImpact.map((md, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-900 flex items-center gap-2">
                    <span>{md.type}</span>
                    <span className="text-zinc-500 font-normal">({md.name})</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">Weekly Spend: {md.avgWeeklyAmount}</div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-blue-600 block">
                    {md.elasticityLift}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    R = {md.correlation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
