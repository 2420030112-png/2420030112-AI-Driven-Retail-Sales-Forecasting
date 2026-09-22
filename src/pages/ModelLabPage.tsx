import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { StatusBadge } from '../components/common/StatusBadge'
import { MOCK_MODELS } from '../data/mockData'
import { ArrowUpRight, Cpu, Zap, Sliders, CheckCircle2 } from 'lucide-react'

export const ModelLabPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Model Lab & Algorithmic Benchmarks"
        subtitle="Rigorous cross-validation comparison across Linear Regression, Random Forest, XGBoost, ARIMA, and Prophet."
        eyebrow="Intelligence"
      />

      {/* Top Benchmark KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Leading Production Model"
          value="XGBoost (v2.4)"
          delta={{ value: "3.12% MAPE", isPositive: true }}
          subtext="Lowest error across retail network"
        />
        <Metric
          label="Models Evaluated"
          value="5 Families"
          subtext="Classical time-series & tree ensembles"
        />
        <Metric
          label="Mean Inference Latency"
          value="18 ms"
          delta={{ value: "Low Latency", isPositive: true }}
          subtext="Optimized for real-time re-scoring"
        />
        <Metric
          label="Feature Dimensions"
          value="38 Features"
          subtext="Lags, rolling stats, macro indicators"
        />
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 font-display">
              Algorithm Benchmark Leaderboard
            </h3>
            <p className="text-xs text-zinc-500">Evaluated on 143-week out-of-time test partition</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Sort: Lowest MAPE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                <th className="py-3 px-4">Algorithm Candidate</th>
                <th className="py-3 px-4">Family</th>
                <th className="py-3 px-4 text-right">MAE ($)</th>
                <th className="py-3 px-4 text-right">RMSE ($)</th>
                <th className="py-3 px-4 text-right">MAPE (%)</th>
                <th className="py-3 px-4 text-right">R² Score</th>
                <th className="py-3 px-4 text-right">Train Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {MOCK_MODELS.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => navigate(`/models/${m.id}`)}
                  className="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">v{m.version}</div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-xs font-mono border border-zinc-200">
                      {m.family}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-zinc-700">
                    ${m.mae.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-zinc-700">
                    ${m.rmse.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-950">
                    <span className={m.mape < 4.0 ? 'text-emerald-700' : 'text-zinc-900'}>
                      {m.mape}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-zinc-700">
                    {m.r2}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-zinc-500">
                    {m.trainingTimeSec}s
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Selection Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Production Architecture Rationale
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            XGBoost Regressor (v2.4) currently delivers the lowest test MAPE (3.12%) by capturing non-linear interactions between promotional markdown campaigns and multi-week lags. Its sub-20ms inference speed makes it suitable for instant interactive simulations.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Challenger & Additive Models
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Prophet remains our primary challenger for long-horizon macro forecasting (&gt;12 weeks) due to its interpretable changepoints and decomposable holiday calendar components, while Random Forest offers outlier robustness on volatile categories.
          </p>
        </div>
      </div>
    </div>
  )
}
