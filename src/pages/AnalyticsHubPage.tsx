import React from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { ArrowRight, TrendingUp, Store, Calendar, Layers, ShieldCheck, Activity } from 'lucide-react'

export const AnalyticsHubPage: React.FC = () => {
  const hubs = [
    {
      title: 'Sales Trends',
      subtitle: 'Longitudinal sales trajectory, multi-year comparisons, and category volume breakdowns across the 45-store network.',
      path: '/analytics/sales',
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      metrics: [
        { label: 'Network Total', val: '$2.21B' },
        { label: 'Annual Growth', val: '+4.6%' },
        { label: 'Weekly Mean', val: '$15.4M' },
      ],
      tag: 'Macro Overview',
    },
    {
      title: 'Store Performance',
      subtitle: 'Comparative revenue, footprint efficiency, and volatility tiers across Supercenter, Suburban, and Compact store formats.',
      path: '/analytics/stores',
      icon: <Store className="w-6 h-6 text-emerald-600" />,
      metrics: [
        { label: 'Audited Stores', val: '45 Units' },
        { label: 'Top Performer', val: 'Store #20' },
        { label: 'Avg Depts', val: '74 Depts' },
      ],
      tag: 'Unit Economics',
    },
    {
      title: 'Seasonality & Holidays',
      subtitle: '52-week recurring demand rhythms, Thanksgiving surge multipliers, and promotional markdown elasticity analytics.',
      path: '/analytics/seasonality',
      icon: <Calendar className="w-6 h-6 text-amber-600" />,
      metrics: [
        { label: 'Q4 Peak Multiplier', val: '2.45x' },
        { label: 'Holiday Weeks', val: '4 Per Year' },
        { label: 'Markdown Elasticity', val: '+14.2%' },
      ],
      tag: 'Temporal Dynamics',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Analytics Hub"
        subtitle="Explore deep descriptive analytics across sales trajectories, store footprints, and temporal seasonality."
        eyebrow="Analytics"
      />

      {/* Navigation Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <Link
            key={hub.path}
            to={hub.path}
            className="p-6 bg-white rounded-2xl border border-zinc-200/90 shadow-subtle hover:shadow-elevated hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 group-hover:scale-105 transition-transform">
                  {hub.icon}
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                  {hub.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold text-zinc-950 font-display group-hover:text-blue-600 transition-colors">
                {hub.title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
                {hub.subtitle}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-100">
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                {hub.metrics.map((m, i) => (
                  <div key={i} className="p-2 bg-zinc-50 rounded-lg">
                    <span className="text-[10px] text-zinc-400 font-mono block">{m.label}</span>
                    <span className="text-xs font-bold text-zinc-900 font-mono mt-0.5 block">
                      {m.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 group-hover:text-blue-600">
                <span>Open Dedicated Analysis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Network Overview Summary Banner */}
      <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white border border-zinc-200 shadow-subtle">
            <Activity className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Continuous Ingestion & Preprocessing Verified
            </h4>
            <p className="text-xs text-zinc-500">
              421,570 weekly records cleaned with zero date leakage. Ready for model forecasting.
            </p>
          </div>
        </div>

        <Link
          to="/data"
          className="text-xs font-semibold text-zinc-900 hover:text-blue-600 inline-flex items-center gap-1.5 shrink-0"
        >
          Check Data Health
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
