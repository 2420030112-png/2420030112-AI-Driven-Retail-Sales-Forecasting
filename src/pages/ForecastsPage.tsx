import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, ArrowUpRight, Clock, Layers } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/common/PageHeader'
import { ActionButton } from '../components/common/ActionButton'
import { StatusBadge } from '../components/common/StatusBadge'
import { EmptyState } from '../components/common/EmptyState'

export const ForecastsPage: React.FC = () => {
  const { forecasts } = useApp()
  const [search, setSearch] = useState('')
  const [horizonFilter, setHorizonFilter] = useState<'All' | '4' | '8' | '12'>('All')
  const navigate = useNavigate()

  const filteredForecasts = forecasts.filter((fc) => {
    const matchesSearch =
      fc.storeName.toLowerCase().includes(search.toLowerCase()) ||
      fc.deptName.toLowerCase().includes(search.toLowerCase()) ||
      fc.modelUsed.toLowerCase().includes(search.toLowerCase())

    const matchesHorizon =
      horizonFilter === 'All' ? true : String(fc.horizonWeeks) === horizonFilter

    return matchesSearch && matchesHorizon
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Forecast Workspace"
        subtitle="Manage and evaluate forward-looking demand projections across network nodes"
        eyebrow="Forecasting"
        actions={
          <Link to="/forecasts/new">
            <ActionButton
              size="md"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              New Forecast
            </ActionButton>
          </Link>
        }
      />

      {/* Control Bar: Search & Horizon Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by store, department, or model..."
            className="w-full bg-white pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 shadow-subtle placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {/* Horizon Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 self-start sm:self-auto text-xs font-medium">
          <span className="px-2 text-zinc-400 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Horizon:
          </span>
          {(['All', '4', '8', '12'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizonFilter(h)}
              className={`px-3 py-1 rounded-lg transition-all ${
                horizonFilter === h
                  ? 'bg-white text-zinc-950 font-semibold shadow-subtle'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {h === 'All' ? 'All Horizons' : `${h} Weeks`}
            </button>
          ))}
        </div>
      </div>

      {/* Forecasts List / Table */}
      {filteredForecasts.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-zinc-400" />}
          title="No forecasts found"
          description={
            search
              ? "No forecast runs match your search filters. Try adjusting your query or horizon."
              : "No forecasts have been generated yet. Create your first retail demand projection."
          }
          actionLabel="Create New Forecast"
          onAction={() => navigate('/forecasts/new')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  <th className="py-3 px-4">Store Entity</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Horizon</th>
                  <th className="py-3 px-4">Generated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Projected Demand</th>
                  <th className="py-3 px-4 text-right">Expected Lift</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredForecasts.map((fc) => (
                  <tr
                    key={fc.id}
                    onClick={() => navigate(`/forecasts/${fc.id}`)}
                    className="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Store */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {fc.storeName}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">Store #{fc.storeId}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-zinc-700">
                      <div className="font-medium text-zinc-800">{fc.deptName}</div>
                      <div className="text-[11px] text-zinc-400">Dept #{fc.deptId}</div>
                    </td>

                    {/* Horizon */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-xs border border-zinc-200">
                        {fc.horizonWeeks}w Forward
                      </span>
                    </td>

                    {/* Generated time */}
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{fc.createdAt}</span>
                      </div>
                    </td>

                    {/* Forecast status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={fc.status} />
                    </td>

                    {/* Projected Sales */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-950">
                      ${fc.projectedSales.toLocaleString()}
                    </td>

                    {/* Expected Change */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${
                          fc.changePercent >= 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {fc.changePercent >= 0 ? '+' : ''}
                        {fc.changePercent}%
                      </span>
                    </td>

                    {/* View Action */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 group-hover:text-zinc-950 group-hover:underline">
                        View
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-900" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
