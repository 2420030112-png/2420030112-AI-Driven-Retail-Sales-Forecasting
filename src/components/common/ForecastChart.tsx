import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { TimeSeriesPoint } from '../../types'

export interface ForecastChartProps {
  data: TimeSeriesPoint[]
  height?: number
  showConfidenceInterval?: boolean
  forecastStartIndex?: number
  currencyFormatter?: (val: number) => string
}

const defaultFormatter = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)

const CustomTooltip = ({ active, payload, label, formatter = defaultFormatter }: any) => {
  if (active && payload && payload.length) {
    const historical = payload.find((p: any) => p.dataKey === 'historical')?.value
    const forecast = payload.find((p: any) => p.dataKey === 'forecast')?.value
    const lower = payload.find((p: any) => p.dataKey === 'lowerBound')?.value
    const upper = payload.find((p: any) => p.dataKey === 'upperBound')?.value
    const pointData = payload[0]?.payload as TimeSeriesPoint

    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-elevated border border-zinc-200 text-xs font-sans min-w-[190px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
          <span className="font-semibold text-zinc-900">{label}</span>
          {pointData?.isHoliday && (
            <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-1.5 py-0.5 rounded">
              {pointData.holidayName || 'Holiday Event'}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {historical !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                Historical Sales
              </span>
              <span className="font-mono font-medium text-zinc-900">
                {formatter(historical)}
              </span>
            </div>
          )}

          {forecast !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Projected Demand
              </span>
              <span className="font-mono font-semibold text-blue-600">
                {formatter(forecast)}
              </span>
            </div>
          )}

          {lower !== undefined && upper !== undefined && (
            <div className="pt-1.5 mt-1.5 border-t border-zinc-100 text-[11px] flex items-center justify-between text-zinc-400">
              <span>95% Confidence</span>
              <span className="font-mono text-zinc-600">
                {formatter(lower)} – {formatter(upper)}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  height = 360,
  showConfidenceInterval = true,
  currencyFormatter = defaultFormatter,
}) => {
  // Find index where forecast starts
  const transitionPoint = data.find(d => d.historical !== undefined && d.forecast !== undefined)

  return (
    <div className="w-full" style={{ height }}>
      {/* Visual legend indicator */}
      <div className="flex flex-wrap items-center justify-end gap-5 text-xs text-zinc-500 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0.5 bg-zinc-800 rounded-full" />
          <span>Historical Baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-0.5 border-t-2 border-dashed border-blue-600" />
          <span className="text-zinc-800 font-medium">Model Projection</span>
        </div>
        {showConfidenceInterval && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
            <span>95% Confidence Band</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.14} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="historicalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71717a" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#71717a" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />

          <XAxis
            dataKey="date"
            axisLine={{ stroke: '#e4e4e7' }}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 11 }}
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 11 }}
            tickFormatter={(val) => {
              if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
              if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`
              return `$${val}`
            }}
            width={58}
          />

          <Tooltip content={<CustomTooltip formatter={currencyFormatter} />} />

          {/* Historical trend */}
          <Area
            type="monotone"
            dataKey="historical"
            stroke="transparent"
            fill="url(#historicalFill)"
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="historical"
            stroke="#18181b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#18181b', strokeWidth: 2, stroke: '#ffffff' }}
          />

          {/* Confidence interval area */}
          {showConfidenceInterval && (
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="url(#confidenceBand)"
              isAnimationActive={false}
            />
          )}

          {/* Projected demand forecast */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#2563eb"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: '#2563eb', strokeWidth: 1, stroke: '#ffffff' }}
            activeDot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
          />

          {/* Separation boundary line */}
          {transitionPoint && (
            <ReferenceLine
              x={transitionPoint.date}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{
                value: 'Forecast Origin',
                position: 'top',
                fill: '#64748b',
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
