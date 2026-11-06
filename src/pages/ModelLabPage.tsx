import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { StatusBadge } from '../components/common/StatusBadge'
import { ActionButton } from '../components/common/ActionButton'
import { MOCK_MODELS } from '../data/mockData'
import { ArrowUpRight, CheckCircle2, BookOpen, Info, ShieldCheck } from 'lucide-react'

export const ModelLabPage: React.FC = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'baselines' | 'hybrids'>('all')

  const filteredModels = MOCK_MODELS.filter((m) => {
    if (filter === 'baselines') {
      return m.family === 'Linear' || m.family === 'Tree-Ensemble' || m.family === 'Time Series' || m.family === 'Additive'
    }
    if (filter === 'hybrids') {
      return m.family === 'Residual-Hybrid' || m.family === 'Stacking-Ensemble'
    }
    return true
  }).sort((a, b) => (a.wape ?? a.mape) - (b.wape ?? b.mape))

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Model Lab & Algorithmic Benchmarks"
        subtitle="Audited cross-validation comparison across Linear Regression, Random Forest, XGBoost, SARIMAX, Prophet, and Hybrid architectures."
        eyebrow="Intelligence"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/research/results">
              <ActionButton
                size="sm"
                variant="outline"
                icon={<BookOpen className="w-4 h-4" />}
              >
                Review-3 Scientific Results
              </ActionButton>
            </Link>
          </div>
        }
      />

      {/* Benchmark Cohort Scope Callout */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-zinc-700">
            <strong>Evaluated Benchmark Scope:</strong> 20 series across 5 stores (1, 10, 14, 20, 35) and 4 departments (1, 7, 72, 92) covering 380 out-of-time test weeks.
          </span>
        </div>
        <span className="font-mono text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded shrink-0">
          Zero Future Target Leakage
        </span>
      </div>

      {/* Top Benchmark KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Validation Winner"
          value="12.88% WAPE"
          delta={{ value: "Prophet ($8,399 MAE)", isPositive: true }}
          subtext="Lowest out-of-time validation error"
        />
        <Metric
          label="Lowest 1-Step Test Error"
          value="9.41% WAPE"
          delta={{ value: "XGBoost ($5,663 MAE)", isPositive: true }}
          subtext="Random Forest close 2nd (9.64%)"
        />
        <Metric
          label="Multi-Step Persistence"
          value="14.28% WAPE"
          delta={{ value: "Seasonal Naive (h=1..19)", isNeutral: true }}
          subtext="RF follows at 14.54% recursive WAPE"
        />
        <Metric
          label="Probabilistic Standard"
          value="Hybrid D"
          delta={{ value: "72.11% Coverage", isPositive: false }}
          subtext="Uncalibrated heuristic vs 95% target"
        />
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 font-display">
              Algorithm Benchmark Leaderboard
            </h3>
            <p className="text-xs text-zinc-500">Evaluated on 19-week out-of-time test partition (380 target rows)</p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'all' ? 'bg-white shadow-subtle text-zinc-900 font-semibold' : 'text-zinc-600'
              }`}
            >
              All ({MOCK_MODELS.length})
            </button>
            <button
              onClick={() => setFilter('baselines')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'baselines' ? 'bg-white shadow-subtle text-zinc-900 font-semibold' : 'text-zinc-600'
              }`}
            >
              Baselines (6)
            </button>
            <button
              onClick={() => setFilter('hybrids')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'hybrids' ? 'bg-white shadow-subtle text-zinc-900 font-semibold' : 'text-zinc-600'
              }`}
            >
              Hybrids (4)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                <th className="py-3 px-4">Algorithm Candidate</th>
                <th className="py-3 px-4">Family</th>
                <th className="py-3 px-3 text-right">Val WAPE (%)</th>
                <th className="py-3 px-3 text-right">Test WAPE (%)</th>
                <th className="py-3 px-4 text-right">Test MAE ($)</th>
                <th className="py-3 px-4 text-right">Test RMSE ($)</th>
                <th className="py-3 px-3 text-right">R² Score</th>
                <th className="py-3 px-3 text-right">Latency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredModels.map((m) => {
                const isSelected = m.status === 'Selected'
                const displayWape = m.wape ?? m.mape
                return (
                  <tr
                    key={m.id}
                    onClick={() => navigate(`/models/${m.id}`)}
                    className={`hover:bg-zinc-50/80 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-emerald-50/20 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">{m.forecastHorizon || `v${m.version}`}</div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-xs font-mono border border-zinc-200">
                        {m.family}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-zinc-600">
                      {m.valWape ? `${m.valWape}%` : 'N/A'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-950">
                      <span className={displayWape < 10 ? 'text-emerald-700' : displayWape < 16 ? 'text-zinc-950' : 'text-zinc-600'}>
                        {displayWape}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-zinc-700">
                      ${m.mae.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-zinc-700">
                      ${m.rmse.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-zinc-700">
                      {m.r2}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-zinc-500">
                      {m.inferenceLatencyMs < 50 ? `${m.inferenceLatencyMs.toFixed(1)}ms` : `${(m.inferenceLatencyMs / 1000).toFixed(2)}s`}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={m.status} />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 group-hover:text-zinc-950 group-hover:underline">
                        View
                        <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-950" />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Selection Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Validation Selection Winner: Baseline 5A (Prophet)
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Baseline 5A: Prophet won the formal validation tournament with 12.88% Val WAPE ($8,399.21 MAE) on the 18-week out-of-time spring partition. On the subsequent test partition, tree models (XGBoost 9.41% WAPE, Random Forest 9.64% WAPE) adapted faster to promotional markdowns. Prophet remains the scientifically honest validation-selected model.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Selected Probabilistic Architecture: Hybrid D
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Hybrid D (Proposed Context-Aware Multi-Stage Hybrid) is selected for probabilistic supply-chain planning. Its empirical prediction interval coverage is 72.11% against the 95% nominal target (MPIW $22,926.00). It is transparently labeled as an uncalibrated heuristic pending department-specific conformal recalibration.
          </p>
        </div>
      </div>
    </div>
  )
}
