import React, { useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { ActionButton } from '../components/common/ActionButton'
import { useApp } from '../context/AppContext'
import { Save, Key, Sliders } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp()
  const [defaultHorizon, setDefaultHorizon] = useState<number>(12)
  const [defaultModel, setDefaultModel] = useState<string>('xgboost-v2')
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95)
  const [apiEndpoint, setApiEndpoint] = useState<string>('http://127.0.0.1:8000/api/v1')
  const [apiKey, setApiKey] = useState<string>('nx_live_9f83a7c0412b3e819d4e')

  const handleSave = () => {
    addToast({
      title: 'Settings Saved',
      message: 'Forecasting defaults and API configuration updated successfully.',
      type: 'success',
    })
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <PageHeader
        title="Settings & Workspace Preferences"
        subtitle="Manage default forecasting parameters, confidence intervals, and upcoming FastAPI integration endpoints."
        eyebrow="System"
        actions={
          <ActionButton
            size="md"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Preferences
          </ActionButton>
        }
      />

      {/* Forecasting Defaults */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-subtle space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
          <Sliders className="w-4 h-4 text-zinc-700" />
          <h3 className="text-sm font-semibold text-zinc-900 font-display">
            Forecasting Engine Defaults
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              Default Prediction Horizon
            </label>
            <select
              value={defaultHorizon}
              onChange={(e) => setDefaultHorizon(Number(e.target.value))}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value={4}>4 Weeks (Immediate Replenishment)</option>
              <option value={8}>8 Weeks (Mid-Term Inventory)</option>
              <option value={12}>12 Weeks (Full Quarterly Cycle)</option>
            </select>
            <p className="text-[11px] text-zinc-400 mt-1">
              Initial horizon pre-selected in the New Forecast configuration modal.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              Default Production Model
            </label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value="xgboost-v2">XGBoost Regressor (v2.4) — Lowest Error</option>
              <option value="random-forest">Random Forest Ensemble — Resilient</option>
              <option value="prophet">Prophet Seasonal — Calendar Additive</option>
              <option value="arima">SARIMAX — Statistical Baseline</option>
            </select>
            <p className="text-[11px] text-zinc-400 mt-1">
              Algorithm prioritized when initiating batch or single forecasts.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              Confidence Interval Width
            </label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value={90}>90% Confidence Interval</option>
              <option value={95}>95% Confidence Interval (Recommended)</option>
              <option value={99}>99% Conservative Boundary</option>
            </select>
            <p className="text-[11px] text-zinc-400 mt-1">
              Heteroskedastic variance band width rendered on trajectory charts.
            </p>
          </div>
        </div>
      </div>

      {/* Backend API Connection Preview */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-subtle space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
          <Key className="w-4 h-4 text-zinc-700" />
          <h3 className="text-sm font-semibold text-zinc-900 font-display">
            Backend API & Microservice Integration (FastAPI)
          </h3>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              FastAPI Inference Endpoint
            </label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-800 focus:outline-none focus:border-zinc-900"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Target FastAPI base URL for model inference and dynamic data loading.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              API Service Secret
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-800 focus:outline-none focus:border-zinc-900"
              />
              <ActionButton
                size="sm"
                variant="outline"
                onClick={() => addToast({ title: 'New Secret Generated', type: 'info' })}
              >
                Regenerate
              </ActionButton>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Bearer token authentication for securing FastAPI communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
