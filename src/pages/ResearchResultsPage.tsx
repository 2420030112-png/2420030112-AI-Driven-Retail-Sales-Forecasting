import React, { useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { ActionButton } from '../components/common/ActionButton'
import { ChartContainer } from '../components/common/ChartContainer'
import {
  getRollingBenchmarkLeaderboard,
  getMultiStepBenchmarkLeaderboard,
  getMultiStepVsRollingComparison,
  getModelSelectionJustification,
  getUncertaintyDiagnostics,
} from '../data/resultsLoader'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  Award,
  ShieldCheck,
  Download,
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react'

export const ResearchResultsPage: React.FC = () => {
  const [protocolView, setProtocolView] = useState<'rolling' | 'multistep' | 'degradation'>('rolling')
  const [filterType, setFilterType] = useState<'all' | 'baselines' | 'hybrids'>('all')

  const rollingLeaderboard = getRollingBenchmarkLeaderboard()
  const multiStepLeaderboard = getMultiStepBenchmarkLeaderboard()
  const degradationData = getMultiStepVsRollingComparison()
  const selectionJustification = getModelSelectionJustification()
  const uncertainty = getUncertaintyDiagnostics()

  // Find models for showcase
  const validationWinner = rollingLeaderboard.find((m) => m.model_name.includes('Prophet'))!
  const proposedHybrid = rollingLeaderboard.find((m) => m.model_name.includes('Proposed Context-Aware'))!

  // Recharts data for rolling leaderboard
  const rollingChartData = rollingLeaderboard
    .filter((m) => {
      if (filterType === 'baselines') return m.architecture_type === 'Baseline'
      if (filterType === 'hybrids') return m.architecture_type === 'Hybrid'
      return true
    })
    .sort((a, b) => a.test_wape - b.test_wape)
    .map((m) => ({
      name: m.model_name.replace('Baseline ', 'B').replace('Hybrid ', 'H').split(':')[0] + ': ' + m.model_name.split(':')[1]?.trim()?.split(' ')[0],
      fullName: m.model_name,
      testWape: m.test_wape,
      valWape: m.val_wape,
      testMae: m.test_mae,
      protocol: m.evaluation_protocol,
      architecture: m.architecture_type,
    }))

  // Recharts data for recursive degradation
  const degradationChartData = [
    {
      name: 'Random Forest',
      rolling1Step: degradationData.random_forest.rolling_1step_test_wape,
      recursiveMultiStep: degradationData.random_forest.recursive_multistep_test_wape,
      degradation: degradationData.random_forest.horizon_degradation_wape,
    },
    {
      name: 'XGBoost',
      rolling1Step: degradationData.xgboost.rolling_1step_test_wape,
      recursiveMultiStep: degradationData.xgboost.recursive_multistep_test_wape,
      degradation: degradationData.xgboost.horizon_degradation_wape,
    },
    {
      name: 'ElasticNet (Linear)',
      rolling1Step: 22.48,
      recursiveMultiStep: 36.71,
      degradation: 14.23,
    },
    {
      name: 'Seasonal Naive',
      rolling1Step: 14.28,
      recursiveMultiStep: 14.28,
      degradation: 0.0,
    },
    {
      name: 'Prophet',
      rolling1Step: 15.09,
      recursiveMultiStep: 15.09,
      degradation: 0.0,
    },
  ]

  // Department Coverage PICP Data
  const deptCoverageData = [
    { department: 'Dept 1 (Candy / Seasonal)', picp: uncertainty.department_coverage_heterogeneity.dept_1_picp, target: 95.0, status: 'Over-Covered (Low Variance)' },
    { department: 'Dept 7 (Sporting Goods)', picp: uncertainty.department_coverage_heterogeneity.dept_7_picp, target: 95.0, status: 'Moderate Shortfall' },
    { department: 'Dept 72 (Electronics)', picp: uncertainty.department_coverage_heterogeneity.dept_72_picp, target: 95.0, status: 'Severe Shortfall (Surge Outliers)' },
    { department: 'Dept 92 (Groceries)', picp: uncertainty.department_coverage_heterogeneity.dept_92_picp, target: 95.0, status: 'Under-Covered' },
  ]

  return (
    <div className="space-y-10 pb-12">
      {/* Editorial Header */}
      <PageHeader
        title="Benchmark Results & Scientific Evidence"
        subtitle="Presentation-ready empirical findings comparing 6 baselines and 4 hybrid architectures across verified evaluation protocols."
        eyebrow="Review-3 Empirical Verification"
        actions={
          <div className="flex items-center gap-2">
            <ActionButton
              size="sm"
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Export Review-3 Brief
            </ActionButton>
          </div>
        }
      />

      {/* Cohort Scope Disclaimer Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-100/70 text-blue-800 border border-blue-200 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-display">
                Evaluated Benchmark Cohort Scope
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                20 Standardized Series • 380 Out-of-Time Test Rows
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              Models were evaluated on a representative 20-series cohort spanning 5 stores (Stores 1, 10, 14, 20, 35) across Type A, B, and C units, and 4 product departments (Candy 1, Sporting 7, Electronics 72, Groceries 92) covering 19 out-of-time test weeks (2012-06-22 to 2012-10-26).
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-500 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl shrink-0 self-start md:self-auto">
          Split: 106w Train / 18w Val / 19w Test
        </div>
      </div>

      {/* Showcase Cards: Dual Model Selection Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Validation Winner (Point Forecasting) */}
        <section className="bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-6 sm:p-7 shadow-elevated relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Validation Tournament Winner
                </span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
                Strict Out-of-Time Selection
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                {validationWinner.model_name}
              </h2>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Selected strictly on the 18-week out-of-time validation partition (Spring 2012) prior to test set inspection. Achieved lowest validation error across all candidates.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Val WAPE</span>
                <span className="text-xl font-bold font-mono text-indigo-300">{validationWinner.val_wape}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Val MAE</span>
                <span className="text-xl font-bold font-mono text-white">${validationWinner.val_mae.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Test WAPE</span>
                <span className="text-xl font-bold font-mono text-zinc-300">{validationWinner.test_wape}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-zinc-300 leading-relaxed">
              <span className="font-semibold text-white">Seasonal Regime Rationale:</span> During the steady-state spring validation window, smooth Fourier harmonics fit tightly. On the autumn test partition, tree models adapted faster to promotional markdowns. Maintaining Prophet as the validation-selected model is scientifically honest; retroactively altering selection after test outcomes would constitute test-set snooping.
            </div>
          </div>
        </section>

        {/* Card 2: Selected Probabilistic Architecture */}
        <section className="bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-6 sm:p-7 shadow-elevated relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Selected Probabilistic Architecture
                </span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Uncalibrated Heuristic Bounds
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                {proposedHybrid.model_name}
              </h2>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Multi-stage architecture combining additive seasonal base with context-weighted XGBoost residual learner and prediction interval diagnostics for supply-chain risk planning.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Empirical PICP</span>
                <span className="text-xl font-bold font-mono text-amber-300">{uncertainty.empirical_coverage_picp}%</span>
                <span className="text-[10px] text-zinc-400">Target: 95.0% (-22.9%)</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Interval Width</span>
                <span className="text-xl font-bold font-mono text-white">${Math.round(uncertainty.mean_interval_width_mpiw).toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400">Average MPIW</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Test WAPE</span>
                <span className="text-xl font-bold font-mono text-emerald-300">{proposedHybrid.test_wape}%</span>
                <span className="text-[10px] text-zinc-400">Rolling 1-Step</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
              <span className="font-semibold text-amber-100">Uncertainty Calibration Status:</span> The 72.11% empirical coverage is reported honestly against the 95% nominal target. A single global residual variance caused under-coverage on high-volatility departments like Electronics (40.0% PICP). Formally labeled as uncalibrated heuristic bounds pending department-level recalibration.
            </div>
          </div>
        </section>
      </div>

      {/* KPI Cards Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Lowest 1-Step Test WAPE"
          value="9.41%"
          delta={{ value: "XGBoost ($5,663 MAE)", isPositive: true }}
          subtext="Followed by Random Forest (9.64%)"
        />
        <Metric
          label="Validation Selection Basis"
          value="12.88%"
          delta={{ value: "Prophet (Lowest Val WAPE)", isPositive: true }}
          subtext="Strictly selected on 18-week validation"
        />
        <Metric
          label="Recursive Horizon Degradation"
          value="+4.90%"
          delta={{ value: "Random Forest (14.54%)", isNeutral: true }}
          subtext="Tree error accumulation over 19 weeks"
        />
        <Metric
          label="Empirical Interval Coverage"
          value="72.11%"
          delta={{ value: "Shortfall: -22.89%", isPositive: false }}
          subtext="Uncalibrated against 95% nominal target"
        />
      </section>

      {/* Protocol Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200 self-start text-xs font-medium">
        <button
          onClick={() => setProtocolView('rolling')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            protocolView === 'rolling'
              ? 'bg-white text-zinc-950 font-bold shadow-subtle'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          1-Step-Ahead Rolling Horizon Leaderboard (h=1w, 10 Models)
        </button>
        <button
          onClick={() => setProtocolView('multistep')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            protocolView === 'multistep'
              ? 'bg-white text-zinc-950 font-bold shadow-subtle'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Fixed-Origin Recursive Multi-Step Leaderboard (h=1..19w, 6 Models)
        </button>
        <button
          onClick={() => setProtocolView('degradation')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            protocolView === 'degradation'
              ? 'bg-white text-zinc-950 font-bold shadow-subtle'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Horizon Degradation Analysis (Leakage Audit)
        </button>
      </div>

      {/* Protocol View 1: 1-Step Rolling Leaderboard */}
      {protocolView === 'rolling' && (
        <div className="space-y-6">
          <ChartContainer
            title="1-Step Rolling Horizon Benchmark Leaderboard (Weekly POS Feedback)"
            subtitle="Models receive ground truth realized sales each week (h=1 week ahead, 380 test rows). Ranked by Test WAPE."
            action={
              <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    filterType === 'all' ? 'bg-white shadow-subtle text-zinc-900 font-semibold' : 'text-zinc-600'
                  }`}
                >
                  All (10)
                </button>
                <button
                  onClick={() => setFilterType('baselines')}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    filterType === 'baselines' ? 'bg-white shadow-subtle text-zinc-900 font-semibold' : 'text-zinc-600'
                  }`}
                >
                  Baselines (6)
                </button>
                <button
                  onClick={() => setFilterType('hybrids')}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    filterType === 'hybrids' ? 'bg-white shadow-subtle text-zinc-900 font-semibold' : 'text-zinc-600'
                  }`}
                >
                  Hybrids (4)
                </button>
              </div>
            }
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rollingChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="name" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 50]} width={40} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-elevated border border-zinc-200 text-xs space-y-1">
                            <p className="font-semibold text-zinc-900">{data.fullName}</p>
                            <div>Test WAPE: <span className="font-mono font-bold text-zinc-950">{data.testWape}%</span></div>
                            <div>Val WAPE: <span className="font-mono text-zinc-700">{data.valWape}%</span></div>
                            <div>Test MAE: <span className="font-mono text-zinc-700">${data.testMae.toLocaleString()}</span></div>
                            <div className="text-[10px] text-zinc-400 border-t pt-1 mt-1">{data.protocol}</div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="testWape" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          {/* Table */}
          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 font-display">
                  Official 1-Step Rolling Leaderboard Table
                </h3>
                <p className="text-xs text-zinc-500">
                  Protocol: 1-Step-Ahead Rolling Horizon with weekly POS feedback (h=1 week)
                </p>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Ranked by Test WAPE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4 min-w-[200px]">Model Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Val WAPE (%)</th>
                    <th className="py-3 px-3 text-right">Test WAPE (%)</th>
                    <th className="py-3 px-3 text-right">Test MAE ($)</th>
                    <th className="py-3 px-3 text-right">Test RMSE ($)</th>
                    <th className="py-3 px-3 text-right">R² Score</th>
                    <th className="py-3 px-3 text-right">Latency</th>
                    <th className="py-3 px-4">Role & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rollingLeaderboard
                    .filter((m) => {
                      if (filterType === 'baselines') return m.architecture_type === 'Baseline'
                      if (filterType === 'hybrids') return m.architecture_type === 'Hybrid'
                      return true
                    })
                    .sort((a, b) => a.test_wape - b.test_wape)
                    .map((m, idx) => {
                      const isValidationWinner = m.model_name.includes('Prophet')
                      const isTestWinner = m.model_name.includes('XGBoost')
                      const isSelectedHybrid = m.model_name.includes('Proposed Context-Aware')
                      return (
                        <tr
                          key={m.model_name}
                          className={`hover:bg-zinc-50/80 transition-colors ${
                            isValidationWinner ? 'bg-indigo-50/30' : isTestWinner ? 'bg-blue-50/20' : isSelectedHybrid ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-zinc-500">
                            #{idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-900">{m.model_name}</div>
                            <div className="text-[10px] text-zinc-400 font-mono truncate max-w-xs">{m.evaluation_protocol}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {m.architecture_type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-medium text-zinc-600">
                            {m.val_wape}%
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                            <span className={m.test_wape < 10 ? 'text-emerald-700 font-bold' : m.test_wape < 15 ? 'text-zinc-900' : 'text-zinc-600'}>
                              {m.test_wape}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-700">
                            ${m.test_mae.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-700">
                            ${m.test_rmse.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-700">
                            {m.test_r2}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-500">
                            {m.infer_time_ms < 50 ? `${m.infer_time_ms.toFixed(1)}ms` : `${(m.infer_time_ms / 1000).toFixed(2)}s`}
                          </td>
                          <td className="py-3 px-4">
                            {isValidationWinner ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Val Selection Winner
                              </span>
                            ) : isTestWinner ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                Top Test Point Forecaster
                              </span>
                            ) : isSelectedHybrid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Selected Probabilistic
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-400">Audited Candidate</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Protocol View 2: Fixed-Origin Multi-Step Leaderboard */}
      {protocolView === 'multistep' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Strict Multi-Step Forecasting Protocol (Zero Intermediate POS Feedback)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              In this protocol, all realized sales after origin date T0 (2012-06-15) are strictly withheld. Autoregressive models roll forward using their own generated predictions. Models are ranked on how well they maintain accuracy over the full 19-week horizon.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 font-display">
                  Fixed-Origin Recursive Multi-Step Leaderboard (h=1..19 weeks)
                </h3>
                <p className="text-xs text-zinc-500">
                  Evaluated across 19 continuous weeks from origin date 2012-06-15 with zero ground-truth feedback
                </p>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Ranked by Multi-Step Test WAPE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4 min-w-[200px]">Model Candidate</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Val WAPE (%)</th>
                    <th className="py-3 px-3 text-right">Multi-Step Test WAPE (%)</th>
                    <th className="py-3 px-3 text-right">Multi-Step Test MAE ($)</th>
                    <th className="py-3 px-3 text-right">Multi-Step Test RMSE ($)</th>
                    <th className="py-3 px-4">Evaluation Protocol Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {multiStepLeaderboard
                    .sort((a, b) => a.test_wape - b.test_wape)
                    .map((m, idx) => (
                      <tr key={m.model_name} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-500">#{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-zinc-900">{m.model_name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{m.forecast_horizon}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {m.architecture_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-zinc-600">{m.val_wape}%</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-950">
                          <span className={m.test_wape < 15 ? 'text-emerald-700' : 'text-zinc-800'}>
                            {m.test_wape}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-zinc-700">${m.test_mae.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-right font-mono text-zinc-700">${m.test_rmse.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-[11px] text-zinc-500 font-mono">{m.evaluation_protocol}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Protocol View 3: Degradation Analysis */}
      {protocolView === 'degradation' && (
        <div className="space-y-6">
          <ChartContainer
            title="1-Step Rolling vs. Recursive Multi-Step Horizon Degradation"
            subtitle="Quantifying error accumulation when weekly POS feedback is withheld across the 19-week forecast window"
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={degradationChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="name" axisLine={{ stroke: '#e4e4e7' }} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 40]} width={40} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-elevated border border-zinc-200 text-xs space-y-1">
                            <p className="font-semibold text-zinc-900">{label}</p>
                            <div className="text-blue-600">Rolling 1-Step: <span className="font-mono font-bold">{payload[0].value}% WAPE</span></div>
                            <div className="text-purple-600">Recursive Multi-Step: <span className="font-mono font-bold">{payload[1].value}% WAPE</span></div>
                            <div className="text-zinc-500 border-t pt-1 mt-1">Degradation: +{((payload[1].value as number) - (payload[0].value as number)).toFixed(2)}% WAPE</div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar name="Rolling 1-Step WAPE" dataKey="rolling1Step" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar name="Recursive Multi-Step WAPE" dataKey="recursiveMultiStep" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <div className="p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 font-mono">
              Scientific Audit Finding: Leakage & Error Accumulation
            </h4>
            <p className="text-zinc-600 leading-relaxed">
              {degradationData.leakage_audit_conclusion}
            </p>
          </div>
        </div>
      )}

      {/* Uncertainty Diagnostics & Prediction Interval Breakdown */}
      <section className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-7 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-zinc-950 font-display">
                Prediction Interval Diagnostics & Empirical Coverage Shortfall
              </h3>
              <p className="text-xs text-zinc-500">
                Evaluating Hybrid D's empirical coverage against nominal 95% confidence intervals
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
            72.11% Empirical Coverage (Target: 95.0%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Department Coverage Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 font-mono">
              Department Coverage Heterogeneity (PICP %)
            </h4>
            <div className="space-y-2 text-xs">
              {deptCoverageData.map((d) => (
                <div key={d.department} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900">{d.department}</span>
                    <span className="font-mono font-bold text-zinc-950">{d.picp}% PICP</span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.picp >= 90 ? 'bg-emerald-500' : d.picp >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(d.picp, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{d.status}</span>
                    <span>Target: 95.0%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Root Cause & Recalibration Guidance */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-3 text-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-zinc-900 font-mono mb-2">
                Root Cause Analysis for 22.89% Shortfall
              </h4>
              <ul className="space-y-2 text-zinc-600 list-disc list-inside">
                <li>
                  <strong className="text-zinc-800">In-Sample Variance Optimism:</strong> Residual variance was estimated on in-sample training residuals, underestimating out-of-time test error variance.
                </li>
                <li>
                  <strong className="text-zinc-800">Cross-Department Variance Dispersion:</strong> A single global standard deviation over-covers low-variance staples (Dept 1 achieved 100% coverage) while under-covering high-volatility electronics (Dept 72 achieved only 40.0% coverage).
                </li>
                <li>
                  <strong className="text-zinc-800">Heavy-Tailed Leptokurtic Residuals:</strong> Standard Gaussian multipliers (±1.96σ) fail to span retail sales outliers without empirical quantile calibration.
                </li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold">Academic Governance Policy:</span> We transparently document that these intervals are heuristic uncertainty indicators rather than calibrated confidence bounds until conformalized or category-specific quantile regression is implemented in Phase 4.
            </div>
          </div>
        </div>
      </section>

      {/* Gauss-Markov Normality Nuance & Statistical Justification */}
      <section className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-7 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
          <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Scale className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-zinc-950 font-display">
            Statistical Rigor: The Gauss-Markov Normality Caveat
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-900 font-mono uppercase text-[11px]">
              Why Rejecting Normality Does Not Disprove Linear Regression
            </h4>
            <p>
              {selectionJustification.statistical_and_empirical_justification.normality_caveat}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-zinc-900 font-mono uppercase text-[11px]">
              Empirical Validation & Residual Diagnostic Evidence
            </h4>
            <p>
              {selectionJustification.statistical_and_empirical_justification.empirical_validation_evidence}
            </p>
            <p className="pt-1">
              {selectionJustification.statistical_and_empirical_justification.residual_diagnostics_evidence}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
