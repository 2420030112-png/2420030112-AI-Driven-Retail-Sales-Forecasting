import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Sliders,
  TrendingUp,
  Sparkles,
  Database,
  Settings,
  Store as StoreIcon,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Calendar,
  Layers,
  X,
  BookOpen,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MOCK_STORES, MOCK_MODELS } from '../../data/mockData'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  category: 'Navigation' | 'Stores' | 'Models' | 'Forecasts' | 'Research' | 'Quick Actions'
  action: () => void
}

export const CommandPaletteModal: React.FC = () => {
  const { setCommandPaletteOpen, forecasts } = useApp()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(timer)
  }, [])

  const handleSelect = (action: () => void) => {
    action()
    setCommandPaletteOpen(false)
  }

  const baseItems: CommandItem[] = [
    {
      id: 'act-new-forecast',
      title: 'Create New Forecast',
      subtitle: 'Configure store, department, and horizon projection',
      icon: <PlusCircle className="w-4 h-4 text-blue-600" />,
      category: 'Quick Actions',
      action: () => navigate('/forecasts/new'),
    },
    {
      id: 'nav-overview',
      title: 'Overview',
      subtitle: 'Retail demand network at a glance',
      icon: <TrendingUp className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/'),
    },
    {
      id: 'nav-forecasts',
      title: 'Forecast Workspace',
      subtitle: 'View generated demand projections and history',
      icon: <Layers className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/forecasts'),
    },
    {
      id: 'nav-analytics',
      title: 'Analytics Hub',
      subtitle: 'Sales trends, store performance, and seasonality',
      icon: <BarChart3 className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/analytics'),
    },
    {
      id: 'nav-sales',
      title: 'Sales Trends Analytics',
      subtitle: 'Multi-year sales trajectory and volume analysis',
      icon: <TrendingUp className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/analytics/sales'),
    },
    {
      id: 'nav-stores',
      title: 'Store Performance Analytics',
      subtitle: 'Comparative metrics across 45 retail stores',
      icon: <StoreIcon className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/analytics/stores'),
    },
    {
      id: 'nav-seasonality',
      title: 'Seasonality Analysis',
      subtitle: '52-week cycles, holiday surge multipliers, and markdown effects',
      icon: <Calendar className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/analytics/seasonality'),
    },
    {
      id: 'nav-models',
      title: 'Model Lab',
      subtitle: 'Evaluate XGBoost, Random Forest, ARIMA, and Prophet',
      icon: <Sliders className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/models'),
    },
    {
      id: 'nav-research',
      title: 'Research Lab & Methodology',
      subtitle: 'Academic framework, Review-3 evidence, and experiment matrices',
      icon: <BookOpen className="w-4 h-4 text-purple-600" />,
      category: 'Research',
      action: () => navigate('/research'),
    },
    {
      id: 'nav-research-literature',
      title: 'Literature Review & Matrix',
      subtitle: '12 peer-reviewed studies across classical, ML, and hybrid forecasting',
      icon: <BookOpen className="w-4 h-4 text-purple-600" />,
      category: 'Research',
      action: () => navigate('/research/literature'),
    },
    {
      id: 'nav-research-experiments',
      title: 'Experiment Engine & Tracking',
      subtitle: '9-model benchmark matrix with chronological splitting audit',
      icon: <FlaskConical className="w-4 h-4 text-purple-600" />,
      category: 'Research',
      action: () => navigate('/research/experiments'),
    },
    {
      id: 'nav-research-novelty',
      title: 'Novelty Verification Matrix',
      subtitle: '11 methodology dimensions evaluated against literature citations',
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      category: 'Research',
      action: () => navigate('/research/novelty'),
    },
    {
      id: 'nav-research-results',
      title: 'Benchmark Results & Selection',
      subtitle: 'Review-3 presentation charts, leaderboard, and dynamic model rationale',
      icon: <BarChart3 className="w-4 h-4 text-purple-600" />,
      category: 'Research',
      action: () => navigate('/research/results'),
    },
    {
      id: 'nav-insights',
      title: 'Retail Intelligence Insights',
      subtitle: 'Actionable planning signals and demand trend anomalies',
      icon: <Sparkles className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/insights'),
    },
    {
      id: 'nav-data',
      title: 'Data Health & Coverage',
      subtitle: 'Data pipeline integrity, cleanliness, and source telemetry',
      icon: <Database className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/data'),
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      subtitle: 'Organization defaults, forecasting parameters, API keys',
      icon: <Settings className="w-4 h-4 text-zinc-600" />,
      category: 'Navigation',
      action: () => navigate('/settings'),
    },
  ]

  // Add individual forecasts to search
  const forecastItems: CommandItem[] = (forecasts || []).map((fc) => ({
    id: `fc-${fc.id}`,
    title: `${fc.storeName} — ${fc.deptName}`,
    subtitle: `${fc.horizonWeeks}w Horizon • ${fc.modelUsed} • $${(fc.projectedSales / 1000).toFixed(0)}k Projected`,
    icon: <Layers className="w-4 h-4 text-blue-600" />,
    category: 'Forecasts',
    action: () => navigate(`/forecasts/${fc.id}`),
  }))

  // Add individual stores to search
  const storeItems: CommandItem[] = MOCK_STORES.map((st) => ({
    id: `store-${st.id}`,
    title: st.name,
    subtitle: `${st.location} • Type ${st.type} • $${(st.totalHistoricalSales / 1_000_000).toFixed(1)}M Vol`,
    icon: <StoreIcon className="w-4 h-4 text-emerald-600" />,
    category: 'Stores',
    action: () => navigate(`/analytics/stores/${st.id}`),
  }))

  // Add individual models to search
  const modelItems: CommandItem[] = MOCK_MODELS.map((m) => ({
    id: `model-${m.id}`,
    title: m.name,
    subtitle: `${m.family} • MAPE: ${m.mape}% • Status: ${m.status}`,
    icon: <Sliders className="w-4 h-4 text-purple-600" />,
    category: 'Models',
    action: () => navigate(`/models/${m.id}`),
  }))

  const allItems = [...baseItems, ...forecastItems, ...storeItems, ...modelItems]

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].action)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setCommandPaletteOpen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-elevated border border-zinc-200 overflow-hidden animate-slide-down">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search store, or jump to page..."
            className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 rounded border border-zinc-200">
            ESC
          </kbd>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="sm:hidden p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-zinc-50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No matching commands or pages found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.action)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-3">
                    <span className="p-1.5 rounded-lg bg-white border border-zinc-200/80 shadow-subtle shrink-0">
                      {item.icon}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {isSelected && <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />}
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] text-zinc-500 mr-1">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] text-zinc-500 mr-1.5">
                ↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] text-zinc-500 mr-1.5">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span className="font-mono text-zinc-400">NEXUS v1.0</span>
        </div>
      </div>
    </div>
  )
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen } = useApp()
  if (!isCommandPaletteOpen) return null
  return <CommandPaletteModal />
}
