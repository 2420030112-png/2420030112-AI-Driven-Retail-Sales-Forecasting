import React, { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { ActionButton } from '../components/common/ActionButton'
import { StatusBadge } from '../components/common/StatusBadge'
import { ChartContainer } from '../components/common/ChartContainer'
import { MOCK_STORES, MOCK_DEPARTMENTS, generateForecastSeries } from '../data/mockData'
import { Plus, ArrowLeft, ArrowUpRight, TrendingUp, Sparkles, Building2, MapPin } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const store = MOCK_STORES.find((s) => String(s.id) === id) || MOCK_STORES[0]

  // Generate historical trajectory for this store
  const storeSeries = useMemo(() => {
    return generateForecastSeries(24, 0, store.avgWeeklySales, 1.0)
  }, [store])

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/analytics/stores"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Store Performance
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={store.name}
        subtitle={`${store.location} • ${store.region} • Type ${store.type} Store (${store.sizeSqFt.toLocaleString()} sq ft)`}
        eyebrow={`Store Unit #${store.id}`}
        actions={
          <Link to={`/forecasts/new?storeId=${store.id}`}>
            <ActionButton
              size="md"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              Forecast this store
            </ActionButton>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Total Historical Sales"
          value={`$${(store.totalHistoricalSales / 1_000_000).toFixed(1)}M`}
          subtext="143 weeks audited sales"
        />
        <Metric
          label="Average Weekly Sales"
          value={`$${(store.avgWeeklySales / 1_000).toFixed(0)}k`}
          delta={{
            value: `${store.trendPercent >= 0 ? '+' : ''}${store.trendPercent}% YoY`,
            isPositive: store.trendPercent >= 0,
          }}
          subtext="Network benchmark: $1.18M"
        />
        <Metric
          label="Department Count"
          value={store.departmentCount}
          subtext="Active revenue categories"
        />
        <Metric
          label="Historical Volatility"
          value={store.volatility}
          subtext="Stability classification"
        />
      </div>

      {/* Sales Trajectory Chart */}
      <ChartContainer
        title="Store Weekly Sales Trajectory"
        subtitle={`24-week historical sales timeline reflecting local demand pattern and holiday variance ($)`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">
              Status: <StatusBadge status={store.status} />
            </span>
          </div>
        }
      >
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={storeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="storeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09090b" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#09090b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="date" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1_000).toFixed(0)}k`}
                width={56}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-zinc-200 text-xs">
                        <p className="font-semibold text-zinc-900 mb-1">{label}</p>
                        <div className="flex items-center justify-between gap-3 text-zinc-600">
                          <span>Weekly Sales:</span>
                          <span className="font-mono font-bold text-zinc-950">
                            ${Number(payload[0].value).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="historical" stroke="#09090b" strokeWidth={2} fill="url(#storeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Demand Pattern & Footprint Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Demand Pattern Assessment
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {store.type === 'A'
              ? 'High-throughput supercenter exhibiting massive Q4 Thanksgiving and Christmas surge elasticity (+140% holiday lift). Markdown responsiveness is strongly positive across electronics and home goods.'
              : store.type === 'B'
              ? 'Moderate-scale suburban retail footprint. Stable week-over-week grocery demand with seasonal spikes concentrated in back-to-school and summer holiday periods.'
              : 'Compact community retail format. Extremely low coefficient of variation (0.08). Primary drivers are essential consumer staples with minimal markdown elasticities.'}
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Physical Store Footprint
            </h4>
          </div>
          <div className="space-y-2 text-xs divide-y divide-zinc-100">
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Gross Floor Area</span>
              <span className="font-mono font-medium">{store.sizeSqFt.toLocaleString()} sq ft</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Store Classification</span>
              <span className="font-semibold">Type {store.type}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Sales / Sq Ft Annualized</span>
              <span className="font-mono font-medium">${((store.avgWeeklySales * 52) / store.sizeSqFt).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Regional Geography
            </h4>
          </div>
          <div className="space-y-2 text-xs divide-y divide-zinc-100">
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Market</span>
              <span className="font-medium">{store.location}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Logistics Hub</span>
              <span className="font-medium">{store.region}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Fulfillment Status</span>
              <span className="font-semibold text-emerald-600">Standard Next-Day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Departments in this Store */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 font-display">
              Assortment Departments
            </h3>
            <p className="text-xs text-zinc-500">Key categories operating in this store unit</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">{MOCK_DEPARTMENTS.length} Featured</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {MOCK_DEPARTMENTS.slice(0, 5).map((dept) => (
            <div
              key={dept.id}
              className="py-3.5 flex items-center justify-between hover:bg-zinc-50/70 px-2 rounded-lg transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900">
                    Dept #{dept.id} — {dept.name}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {dept.category}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  Avg ${(dept.avgWeeklySales).toLocaleString()} / wk • Volatility: {(dept.volatilityIndex * 100).toFixed(0)}%
                </span>
              </div>

              <Link to={`/forecasts/new?storeId=${store.id}&deptId=${dept.id}`}>
                <ActionButton size="sm" variant="outline" icon={<Plus className="w-3.5 h-3.5" />}>
                  Forecast
                </ActionButton>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
