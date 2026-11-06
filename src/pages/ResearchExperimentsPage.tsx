import React, { useState, useMemo } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { MOCK_EXPERIMENTS } from '../data/researchData'
import { ExperimentRecord } from '../types'
import {
  Search,
  ArrowUpRight,
  ShieldCheck,
  X
} from 'lucide-react'

export const ResearchExperimentsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentRecord | null>(null)

  const filterTypes = [
    'All',
    'Baselines',
    'Hybrids',
    'Proposed Hybrid',
  ]

  const filteredExperiments = useMemo(() => {
    return MOCK_EXPERIMENTS.filter((exp) => {
      let matchesType = true
      if (selectedType === 'Baselines') matchesType = exp.type === 'Baseline'
      if (selectedType === 'Hybrids') matchesType = exp.type.includes('Hybrid') && exp.type !== 'Proposed Hybrid'
      if (selectedType === 'Proposed Hybrid') matchesType = exp.type === 'Proposed Hybrid'

      const q = searchQuery.toLowerCase()
      const matchesSearch =
        exp.id.toLowerCase().includes(q) ||
        exp.modelName.toLowerCase().includes(q) ||
        exp.featureConfig.toLowerCase().includes(q) ||
        exp.architectureSummary.toLowerCase().includes(q)

      return matchesType && matchesSearch
    })
  }, [selectedType, searchQuery])

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        title="Experiment Engine & Benchmark Matrix"
        subtitle="Systematic tracking of 10 algorithmic experiments across 6 baselines (including Prophet & SARIMAX), 3 residual/stacking hybrids, and the proposed architecture."
        eyebrow="Empirical Verification"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 bg-white border border-zinc-200 px-2.5 py-1.5 rounded-lg shadow-subtle">
              Engine Status: 10/10 Completed & Audited
            </span>
          </div>
        }
      />

      {/* Chronological Splitting Protocol Badge (Section 22) */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-display">
                Data Leakage Prevention & Chronological Splitting Audit
              </h3>
              <p className="text-[11px] text-zinc-500">
                Non-randomized temporal partitioning strictly enforced across all 10 experimental pipelines on the 20-series cohort
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Zero Future Leakage Audited
          </span>
        </div>

        {/* 3 Chronological Segments Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 font-display">1. Training Partition</span>
              <span className="font-mono text-[10px] text-zinc-500">106 Weeks (2,120 rows)</span>
            </div>
            <p className="font-mono text-[11px] text-zinc-600">2010-02-05 → 2012-02-10</p>
            <p className="text-[11px] text-zinc-400">Used strictly for model fitting and coefficient learning.</p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 font-display">2. Validation Partition</span>
              <span className="font-mono text-[10px] text-zinc-500">18 Weeks (360 rows)</span>
            </div>
            <p className="font-mono text-[11px] text-zinc-600">2012-02-17 → 2012-06-15</p>
            <p className="text-[11px] text-zinc-400">Used for hyperparameter tuning and model tournament selection.</p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 font-display">3. Out-of-Time Test Set</span>
              <span className="font-mono text-[10px] text-blue-700">19 Weeks (380 rows)</span>
            </div>
            <p className="font-mono text-[11px] text-blue-800">2012-06-22 → 2012-10-26</p>
            <p className="text-[11px] text-blue-700">Pure future evaluation. Untouched during training/tuning.</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiments by ID, model, or features..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950/20 shadow-subtle"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {filterTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedType === type
                  ? 'bg-zinc-900 text-white font-semibold shadow-subtle'
                  : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Experiments Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 font-display">
              Experiment Run Matrix
            </h3>
            <p className="text-xs text-zinc-500">
              Complete experimental telemetry across 143-week chronological splits
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {filteredExperiments.length} Runs Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-4 min-w-[200px]">Candidate Architecture</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3 text-right">MAE ($)</th>
                <th className="py-3 px-3 text-right">RMSE ($)</th>
                <th className="py-3 px-3 text-right">MAPE (%)</th>
                <th className="py-3 px-3 text-right">R²</th>
                <th className="py-3 px-3 text-right">Train Time</th>
                <th className="py-3 px-3 text-right">Latency</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredExperiments.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => setSelectedExperiment(exp)}
                  className={`hover:bg-zinc-50/80 transition-colors cursor-pointer group ${
                    exp.status === 'Selected' ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* Experiment ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                    {exp.id}
                  </td>

                  {/* Candidate Architecture */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-950 group-hover:text-blue-600 transition-colors">
                      {exp.modelName}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {exp.architectureSummary}
                    </div>
                  </td>

                  {/* Classification */}
                  <td className="py-3.5 px-3">
                    <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {exp.type}
                    </span>
                  </td>

                  {/* MAE */}
                  <td className="py-3.5 px-3 text-right font-mono text-zinc-700">
                    ${exp.mae.toLocaleString()}
                  </td>

                  {/* RMSE */}
                  <td className="py-3.5 px-3 text-right font-mono text-zinc-700">
                    ${exp.rmse.toLocaleString()}
                  </td>

                  {/* MAPE */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold">
                    <span className={exp.mape < 2.5 ? 'text-emerald-700' : exp.mape < 3.5 ? 'text-zinc-950' : 'text-zinc-600'}>
                      {exp.mape}%
                    </span>
                  </td>

                  {/* R2 */}
                  <td className="py-3.5 px-3 text-right font-mono text-zinc-700">
                    {exp.r2}
                  </td>

                  {/* Train Time */}
                  <td className="py-3.5 px-3 text-right font-mono text-zinc-500">
                    {exp.trainingTimeSec}s
                  </td>

                  {/* Latency */}
                  <td className="py-3.5 px-3 text-right font-mono text-zinc-500">
                    {exp.predictionTimeMs}ms
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center">
                    {exp.status === 'Selected' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Selected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-600 bg-zinc-100 border border-zinc-200">
                        Completed
                      </span>
                    )}
                  </td>

                  {/* Inspect */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 group-hover:text-zinc-950">
                      View
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection Drawer for Experiment */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setSelectedExperiment(null)}
          />

          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {selectedExperiment.id} • {selectedExperiment.type}
                </span>
                <h3 className="text-base font-bold text-zinc-950 font-display mt-1">
                  {selectedExperiment.modelName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExperiment(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 flex-1 text-xs sm:text-sm">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Test WAPE</span>
                  <div className="text-lg font-bold font-mono text-zinc-950">{selectedExperiment.wape ?? selectedExperiment.mape}%</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Val WAPE</span>
                  <div className="text-lg font-bold font-mono text-zinc-950">{selectedExperiment.valWape ? `${selectedExperiment.valWape}%` : 'N/A'}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Recursive WAPE</span>
                  <div className="text-lg font-bold font-mono text-purple-700">{selectedExperiment.recursiveMultiStepTestWape ? `${selectedExperiment.recursiveMultiStepTestWape}%` : 'N/A'}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">MAE</span>
                  <div className="text-lg font-bold font-mono text-zinc-950">${selectedExperiment.mae.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">RMSE</span>
                  <div className="text-lg font-bold font-mono text-zinc-950">${selectedExperiment.rmse.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">R² Score</span>
                  <div className="text-lg font-bold font-mono text-zinc-950">{selectedExperiment.r2}</div>
                </div>
              </div>

              {/* Protocol and Horizon */}
              {selectedExperiment.evaluationProtocol && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Evaluation Protocol & Horizon</span>
                  <div className="text-xs bg-zinc-50 p-3 rounded-lg border border-zinc-200/60 space-y-1 font-mono">
                    <div><strong>Protocol:</strong> {selectedExperiment.evaluationProtocol}</div>
                    <div><strong>Horizon:</strong> {selectedExperiment.forecastHorizon}</div>
                    {selectedExperiment.uncertaintyCoveragePicp && (
                      <div className="text-amber-800">
                        <strong>Uncertainty PICP:</strong> {selectedExperiment.uncertaintyCoveragePicp}% (Empirical vs 95% Target, MPIW ${selectedExperiment.intervalWidthMpiw?.toLocaleString()})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Architecture Summary */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Architecture Pipeline</span>
                <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200/60">
                  {selectedExperiment.architectureSummary}
                </p>
              </div>

              {/* Feature Configuration */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Feature Set & Transformations</span>
                <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200/60">
                  {selectedExperiment.featureConfig}
                </p>
              </div>

              {/* Data Partitioning */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Partition Timestamps</span>
                <div className="text-xs font-mono text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200/60 space-y-1">
                  <div><strong>Train:</strong> {selectedExperiment.trainingPeriod}</div>
                  <div><strong>Test:</strong> {selectedExperiment.testingPeriod}</div>
                  <div className="text-emerald-700"><strong>Split:</strong> {selectedExperiment.splitMethod}</div>
                </div>
              </div>

              {/* Computational Efficiency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Train Duration</span>
                  <div className="text-sm font-bold font-mono text-zinc-900">{selectedExperiment.trainingTimeSec}s</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Inference Latency</span>
                  <div className="text-sm font-bold font-mono text-zinc-900">{selectedExperiment.predictionTimeMs}ms</div>
                </div>
              </div>

              {/* Model Selection Rationale */}
              {selectedExperiment.selectionRationale && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Evaluation Rationale</span>
                  <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                    {selectedExperiment.selectionRationale}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
