import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { StatusBadge } from '../components/common/StatusBadge'
import { ActionButton } from '../components/common/ActionButton'
import { ChartContainer } from '../components/common/ChartContainer'
import { MOCK_MODELS } from '../data/mockData'
import { ArrowLeft, Cpu, Zap, Sliders, CheckCircle2, Layers, BarChart2 } from 'lucide-react'
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
  const navigate = useNavigate()

  const model = MOCK_MODELS.find((m) => m.id === id) || MOCK_MODELS[0]

  const featureChartData = model.featureImportance.map((f) => ({
    name: f.feature,
    weight: Math.round(f.weight * 100),
  }))

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
        subtitle={`${model.family} Architecture • Version ${model.version}`}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Mean Absolute Error (MAE)"
          value={`$${model.mae.toLocaleString()}`}
          subtext="Validation holdout set"
        />
        <Metric
          label="Root Mean Squared Error (RMSE)"
          value={`$${model.rmse.toLocaleString()}`}
          subtext="Penalty for large outliers"
        />
        <Metric
          label="Mean Absolute % Error (MAPE)"
          value={`${model.mape}%`}
          delta={{ value: model.mape < 4.0 ? 'Optimal' : 'Standard', isPositive: model.mape < 4.0 }}
          subtext="Relative percentage variance"
        />
        <Metric
          label="R² Variance Explained"
          value={model.r2}
          subtext="Goodness-of-fit coefficient"
        />
      </div>

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
              Operational Performance
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
              Tuned Hyperparameters
            </h4>
          </div>

          <div className="p-4 bg-zinc-950 text-zinc-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            <pre>{JSON.stringify(model.hyperparameters, null, 2)}</pre>
          </div>
          <p className="text-[11px] text-zinc-400">
            Parameters tuned via 5-fold cross-validation with temporal blocking to avoid data leakage.
          </p>
        </div>
      </div>
    </div>
  )
}
