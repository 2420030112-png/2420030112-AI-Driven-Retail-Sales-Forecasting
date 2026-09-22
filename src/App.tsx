import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'

// Pages
import { OverviewPage } from './pages/OverviewPage'
import { ForecastsPage } from './pages/ForecastsPage'
import { NewForecastPage } from './pages/NewForecastPage'
import { ForecastDetailPage } from './pages/ForecastDetailPage'
import { AnalyticsHubPage } from './pages/AnalyticsHubPage'
import { SalesAnalyticsPage } from './pages/SalesAnalyticsPage'
import { StoresAnalyticsPage } from './pages/StoresAnalyticsPage'
import { StoreDetailPage } from './pages/StoreDetailPage'
import { SeasonalityAnalyticsPage } from './pages/SeasonalityAnalyticsPage'
import { ModelLabPage } from './pages/ModelLabPage'
import { ModelDetailPage } from './pages/ModelDetailPage'
import { InsightsPage } from './pages/InsightsPage'
import { DataHealthPage } from './pages/DataHealthPage'
import { SettingsPage } from './pages/SettingsPage'

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            {/* Overview */}
            <Route index element={<OverviewPage />} />

            {/* Forecasting */}
            <Route path="forecasts" element={<ForecastsPage />} />
            <Route path="forecasts/new" element={<NewForecastPage />} />
            <Route path="forecasts/:id" element={<ForecastDetailPage />} />

            {/* Analytics */}
            <Route path="analytics" element={<AnalyticsHubPage />} />
            <Route path="analytics/sales" element={<SalesAnalyticsPage />} />
            <Route path="analytics/stores" element={<StoresAnalyticsPage />} />
            <Route path="analytics/stores/:id" element={<StoreDetailPage />} />
            <Route path="analytics/seasonality" element={<SeasonalityAnalyticsPage />} />

            {/* Intelligence */}
            <Route path="models" element={<ModelLabPage />} />
            <Route path="models/:id" element={<ModelDetailPage />} />
            <Route path="insights" element={<InsightsPage />} />

            {/* System */}
            <Route path="data" element={<DataHealthPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
