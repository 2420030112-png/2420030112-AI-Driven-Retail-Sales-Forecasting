import React, { createContext, useContext, useState, useEffect } from 'react'
import { ForecastRecord, ModelBenchmark } from '../types'
import { INITIAL_FORECASTS, MOCK_MODELS } from '../data/mockData'

interface ToastMessage {
  id: string
  title: string
  message?: string
  type: 'success' | 'info' | 'warning'
}

interface AppContextType {
  forecasts: ForecastRecord[]
  addForecast: (forecast: ForecastRecord) => void
  getForecast: (id: string) => ForecastRecord | undefined
  isCommandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  isModelDrawerOpen: boolean
  setModelDrawerOpen: (open: boolean) => void
  activeModelDrawer: ModelBenchmark | null
  openModelDrawer: (model?: ModelBenchmark) => void
  closeModelDrawer: () => void
  toasts: ToastMessage[]
  addToast: (toast: { title: string; message?: string; type?: 'success' | 'info' | 'warning' }) => void
  removeToast: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [forecasts, setForecasts] = useState<ForecastRecord[]>(() => {
    const saved = localStorage.getItem('nexus_forecasts')
    if (saved) {
      try { return JSON.parse(saved) } catch { /* ignore fallback */ }
    }
    return INITIAL_FORECASTS
  })

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isModelDrawerOpen, setModelDrawerOpen] = useState(false)
  const [activeModelDrawer, setActiveModelDrawer] = useState<ModelBenchmark | null>(MOCK_MODELS[0])
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    localStorage.setItem('nexus_forecasts', JSON.stringify(forecasts))
  }, [forecasts])

  // Global keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
        setModelDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const addForecast = (newForecast: ForecastRecord) => {
    setForecasts(prev => [newForecast, ...prev])
    addToast({
      title: "Forecast Generated Successfully",
      message: `${newForecast.storeName} — ${newForecast.deptName} (${newForecast.horizonWeeks}w)`,
      type: 'success'
    })
  }

  const getForecast = (id: string) => {
    return forecasts.find(f => f.id === id)
  }

  const openModelDrawer = (model?: ModelBenchmark) => {
    if (model) {
      setActiveModelDrawer(model)
    } else {
      setActiveModelDrawer(MOCK_MODELS[0])
    }
    setModelDrawerOpen(true)
  }

  const closeModelDrawer = () => {
    setModelDrawerOpen(false)
  }

  const addToast = (t: { title: string; message?: string; type?: 'success' | 'info' | 'warning' }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = { id, title: t.title, message: t.message, type: t.type || 'info' }
    setToasts(prev => [...prev, newToast])
    setTimeout(() => {
      removeToast(id)
    }, 4500)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        forecasts,
        addForecast,
        getForecast,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        isModelDrawerOpen,
        setModelDrawerOpen,
        activeModelDrawer,
        openModelDrawer,
        closeModelDrawer,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
