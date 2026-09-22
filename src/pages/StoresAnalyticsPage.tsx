import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { StatusBadge } from '../components/common/StatusBadge'
import { MOCK_STORES } from '../data/mockData'
import { Search, ArrowUpRight, TrendingUp, TrendingDown, Store as StoreIcon } from 'lucide-react'

export const StoresAnalyticsPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'All' | 'A' | 'B' | 'C'>('All')
  const navigate = useNavigate()

  const filteredStores = MOCK_STORES.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.location.toLowerCase().includes(search.toLowerCase()) ||
      st.region.toLowerCase().includes(search.toLowerCase()) ||
      String(st.id) === search

    const matchesType = typeFilter === 'All' ? true : st.type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Store Performance"
        subtitle="Unit-level sales velocity, square footage efficiency, and historical volatility across the 45-store network."
        eyebrow="Analytics"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Active Store Units"
          value="45"
          delta={{ value: "100% Operational", isPositive: true }}
          subtext="Covering 18 states"
        />
        <Metric
          label="Network Top Volume"
          value="Store #20"
          delta={{ value: "$2.11M / wk", isPositive: true }}
          subtext="Bethlehem Flagship Supercenter"
        />
        <Metric
          label="Average Store Size"
          value="130,287"
          subtext="Square feet gross leasable area"
        />
        <Metric
          label="Sales per Sq Ft"
          value="$12.40"
          delta={{ value: "+3.8% YoY", isPositive: true }}
          subtext="Weekly network efficiency"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, city, or ID..."
            className="w-full bg-white pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 shadow-subtle placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {/* Store Type Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/60 self-start sm:self-auto text-xs font-medium">
          <span className="px-2 text-zinc-400">Type:</span>
          {(['All', 'A', 'B', 'C'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg transition-all ${
                typeFilter === t
                  ? 'bg-white text-zinc-950 font-semibold shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t === 'All' ? 'All Types' : `Type ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                <th className="py-3 px-4">Store Identity</th>
                <th className="py-3 px-4">Format Type</th>
                <th className="py-3 px-4 text-right">Floor Area (Sq Ft)</th>
                <th className="py-3 px-4 text-right">Avg Weekly Volume</th>
                <th className="py-3 px-4 text-right">Total Historical</th>
                <th className="py-3 px-4 text-center">Trend</th>
                <th className="py-3 px-4">Volatility</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStores.map((st) => (
                <tr
                  key={st.id}
                  onClick={() => navigate(`/analytics/stores/${st.id}`)}
                  className="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      {st.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {st.location} • {st.region}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                      Type {st.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-zinc-700">
                    {st.sizeSqFt.toLocaleString()} sq ft
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-900">
                    ${(st.avgWeeklySales / 1_000).toFixed(0)}k/wk
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-zinc-600">
                    ${(st.totalHistoricalSales / 1_000_000).toFixed(1)}M
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                        st.trendPercent >= 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {st.trendPercent >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {st.trendPercent >= 0 ? '+' : ''}
                      {st.trendPercent}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={st.volatility} />
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 group-hover:text-zinc-950 group-hover:underline">
                      Inspect
                      <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-950" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
