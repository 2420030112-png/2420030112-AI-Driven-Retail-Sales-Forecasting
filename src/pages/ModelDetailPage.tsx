import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { StatusBadge } from '../components/common/StatusBadge'
import { ActionButton } from '../components/common/ActionButton'
import { ChartContainer } from '../components/common/ChartContainer'
import { MOCK_MODELS } from '../data/mockData'
import { ArrowLeft, Cpu, Sliders, AlertTriangle } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const model = MOCK_MODELS.find((m) => m.id === id) || MOCK_MODELS[0]

  const featureChartData = model.featureImportance.map((f) => ({
    name: f.feature,
    weight: Math.round(f.weight * 100),
  }))

  const displayWape = model.wape ?? model.mape

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/models"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Model Lab
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={model.name}
        subtitle={`${model.family} Architecture • ${model.forecastHorizon || `Version ${model.version}`}`}
        eyebrow="Model Architecture Detail"
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={model.status} size="md" />
            <Link to="/forecasts/new">
              <ActionButton size="sm" variant="primary">
                Run Simulation with this Model
              </ActionButton>
            </Link>
          </div>
        }
      />

      {/* Evaluation Protocol & Cohort Scope Banner */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">Evaluation Protocol:</span>
            <span className="font-mono text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded">
              {model.evaluationProtocol || '1-Step-Ahead Rolling Horizon'}
            </span>
          </div>
          <p className="text-zinc-500 text-[11px]">
            {model.cohortScope || 'Evaluated on 20-series cohort (Stores 1, 10, 14, 20, 35; Depts 1, 7, 72, 92; 380 test rows)'}
          </p>
        </div>

        {model.recursiveMultiStepTestWape && (
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Recursive Multi-Step (h=1..19w)</span>
            <span className="font-mono font-bold text-purple-700 text-sm">
              {model.recursiveMultiStepTestWape}% WAPE
            </span>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Test WAPE"
          value={`${displayWape}%`}
          delta={{ value: displayWape < 10 ? 'Optimal' : 'Standard', isPositive: displayWape < 15 }}
          subtext="19-week out-of-time test partition"
        />
        <Metric
          label="Validation WAPE"
          value={model.valWape ? `${model.valWape}%` : 'N/A'}
          subtext="18-week out-of-time spring partition"
        />
        <Metric
          label="Mean Absolute Error (MAE)"
          value={`$${model.mae.toLocaleString()}`}
          subtext="Test holdout set error"
        />
        <Metric
          label="R² Variance Explained"
          value={model.r2}
          subtext="Goodness-of-fit coefficient"
        />
      </div>

      {/* Uncertainty Diagnostics (If applicable) */}
      {model.uncertaintyCoveragePicp && (
        <div className="p-5 bg-amber-50/70 rounded-xl border border-amber-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950 font-display">
                Prediction Interval Diagnostics — Uncalibrated Heuristic
              </h4>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Empirical coverage is {model.uncertaintyCoveragePicp}% against the nominal 95.0% target (Mean Width: ${model.intervalWidthMpiw?.toLocaleString()}). High department-level heterogeneity: Dept 1 over-covered at 100%, while Dept 72 (Electronics) achieved only 40.0% coverage due to markdown surge spikes.
              </p>
            </div>
          </div>
          <span className="font-mono font-bold px-3 py-1 rounded-full bg-amber-200/60 text-amber-900 border border-amber-300 self-start md:self-auto shrink-0">
            Shortfall: -22.89%
          </span>
        </div>
      )}

      {/* Feature Importance Chart */}
      <ChartContainer
        title="Feature Contribution & Permutation Importance"
        subtitle="Relative percentage contribution of input regressors in predicting forward weekly sales"
      >
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 11 }} width={130} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2.5 rounded-lg shadow-elevated border border-zinc-200 text-xs">
                        <span className="font-semibold text-zinc-900">{payload[0].payload.name}</span>
                        <div className="font-mono font-bold text-blue-600 mt-0.5">
                          {payload[0].value}% Relative Contribution
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="weight" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Operational Characteristics & Hyperparameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Characteristics */}
        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-700" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Operational Performance & Benchmark Context
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {model.description}
          </p>

          <div className="space-y-2.5 text-xs divide-y divide-zinc-100 pt-2">
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Training Time</span>
              <span className="font-mono font-semibold text-zinc-900">{model.trainingTimeSec} seconds</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Inference Latency</span>
              <span className="font-mono font-semibold text-zinc-900">{model.inferenceLatencyMs} ms</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Total Features Utilized</span>
              <span className="font-mono font-semibold text-zinc-900">{model.featuresCount} regressors</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Optimal Application Scenario</span>
              <span className="font-medium text-zinc-800 text-right max-w-[240px]">{model.bestFor}</span>
            </div>
          </div>
        </div>

        {/* Hyperparameter JSON */}
        <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              Tuned Hyperparameters & Training Specs
            </h4>
          </div>

          <div className="p-4 bg-zinc-950 text-zinc-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            <pre>{JSON.stringify(model.hyperparameters, null, 2)}</pre>
          </div>
          <p className="text-[11px] text-zinc-400">
            Fitted strictly on 106-week training partition (2010-02-05 to 2012-02-10). Zero test leakage.
          </p>
        </div>
      </div>
    </div>
  )
}
