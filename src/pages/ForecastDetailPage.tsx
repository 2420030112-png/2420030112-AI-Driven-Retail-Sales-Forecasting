import React, { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Download,
  Plus,
  Sliders,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/common/PageHeader'
import { ActionButton } from '../components/common/ActionButton'
import { StatusBadge } from '../components/common/StatusBadge'
import { ChartContainer } from '../components/common/ChartContainer'
import { ForecastChart } from '../components/common/ForecastChart'
import { generateForecastSeries, MOCK_MODELS } from '../data/mockData'

export const ForecastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getForecast, openModelDrawer, addToast } = useApp()

  const forecast = getForecast(id || '')

  // Lookup model metadata
  const modelMetadata = useMemo(() => {
    if (!forecast) return MOCK_MODELS[0]
    return (
      MOCK_MODELS.find(
        (m) =>
          forecast.modelUsed.toLowerCase().includes(m.name.toLowerCase()) ||
          forecast.modelUsed.toLowerCase().includes(m.family.toLowerCase())
      ) || MOCK_MODELS[0]
    )
  }, [forecast])

  // Generate continuous time series with clear separation
  const chartSeries = useMemo(() => {
    if (!forecast) return []
    const weeklyAvg = Math.round(forecast.historicalBaseline / forecast.horizonWeeks)
    const growth = 1 + forecast.changePercent / 100
    return generateForecastSeries(20, forecast.horizonWeeks, weeklyAvg, growth)
  }, [forecast])

  if (!forecast) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 font-display">Forecast Not Found</h2>
        <p className="text-sm text-zinc-500">
          The requested demand projection ID does not exist or has expired.
        </p>
        <ActionButton onClick={() => navigate('/forecasts')}>
          Return to Forecast Workspace
        </ActionButton>
      </div>
    )
  }

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Date', 'Historical_Sales', 'Projected_Demand', 'Lower_Bound_95', 'Upper_Bound_95'],
      ...chartSeries.map((pt) => [
        pt.date,
        pt.historical ?? '',
        pt.forecast ?? '',
        pt.lowerBound ?? '',
        pt.upperBound ?? '',
      ]),
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${forecast.id}_${forecast.storeId}_dept${forecast.deptId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast({
      title: 'Forecast Exported',
      message: `Downloaded CSV projection for ${forecast.storeName}`,
      type: 'success',
    })
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header with Store, Dept, Horizon, and Actions */}
      <PageHeader
        title={forecast.storeName}
        subtitle={`${forecast.deptName} • ${forecast.horizonWeeks}-Week Demand Horizon`}
        eyebrow={`Forecast Record #${forecast.id}`}
        actions={
          <>
            <ActionButton
              size="sm"
              variant="outline"
              icon={<Sliders className="w-4 h-4 text-zinc-600" />}
              onClick={() => openModelDrawer(modelMetadata)}
            >
              View model analysis
            </ActionButton>

            <ActionButton
              size="sm"
              variant="outline"
              icon={<Download className="w-4 h-4 text-zinc-600" />}
              onClick={handleDownloadCSV}
            >
              Download forecast
            </ActionButton>

            <Link to="/forecasts/new">
              <ActionButton
                size="sm"
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Create another forecast
              </ActionButton>
            </Link>
          </>
        }
      />

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono block mb-1">
            Projected Volume
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-zinc-950">
            ${forecast.projectedSales.toLocaleString()}
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">
            Across {forecast.horizonWeeks} weeks forward
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono block mb-1">
            Expected Change
          </span>
          <div
            className={`text-2xl sm:text-3xl font-bold font-display ${
              forecast.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {forecast.changePercent >= 0 ? '+' : ''}
            {forecast.changePercent}%
          </div>
          <span className="text-xs text-zinc-500 mt-1 block">
            vs. {forecast.horizonWeeks}-wk baseline (${forecast.historicalBaseline.toLocaleString()})
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono block mb-1">
            Model Deployed
          </span>
          <div className="text-base sm:text-lg font-semibold text-zinc-900 truncate font-display">
            {forecast.modelUsed}
          </div>
          <button
            onClick={() => openModelDrawer(modelMetadata)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center gap-1"
          >
            Inspect weights & error
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono block mb-1">
            Confidence & Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={forecast.status} />
            <span className="text-xs font-mono font-semibold text-zinc-700">
              {(forecast.confidenceScore * 100).toFixed(0)}% Conf
            </span>
          </div>
          <span className="text-xs text-zinc-400 mt-2 block font-mono">
            {forecast.createdAt}
          </span>
        </div>
      </div>

      {/* 3. Main Historical + Forecast Separation Chart */}
      <ChartContainer
        title="Historical Actuals vs. Model Projection"
        subtitle={`20 weeks historical baseline with continuous ${forecast.horizonWeeks}-week forward projection and 95% confidence interval bands`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              Origin: Week 42
            </span>
            <button
              onClick={() => openModelDrawer(modelMetadata)}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-2.5 py-1 rounded-lg bg-zinc-50"
            >
              Model Metrics Drawer
            </button>
          </div>
        }
      >
        <ForecastChart data={chartSeries} height={380} />
      </ChartContainer>

      {/* 4. Concise Demand Interpretation */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-7 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
          <span className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 font-display">
            Demand Interpretation & Planning Signals
          </h3>
        </div>

        <p className="text-sm sm:text-base text-zinc-800 font-normal leading-relaxed">
          {forecast.interpretation}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
              Inventory Recommendation
            </span>
            <p className="text-xs text-zinc-700 leading-snug">
              Increase safety stock levels by 8.5% prior to Week 4 of the projection window.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
              Markdown Sensitivity
            </span>
            <p className="text-xs text-zinc-700 leading-snug">
              MarkDown1 and MarkDown5 drive 64% of promotional elasticity for this category.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">
              Stock-out Risk
            </span>
            <p className="text-xs text-emerald-700 font-medium leading-snug">
              Low (Under 4.2% probability given current regional warehouse lead times).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
