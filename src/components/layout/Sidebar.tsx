import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  TrendingUp,
  Layers,
  BarChart3,
  Sliders,
  Sparkles,
  Database,
  Settings,
  X,
  Plus,
} from 'lucide-react'
import { ActionButton } from '../common/ActionButton'

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavSection {
  title: string
  items: {
    label: string
    to: string
    icon: React.ReactNode
    badge?: string
  }[]
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: 'Overview',
          to: '/',
          icon: <TrendingUp className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'FORECASTING',
      items: [
        {
          label: 'Forecasts',
          to: '/forecasts',
          icon: <Layers className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        {
          label: 'Analytics Hub',
          to: '/analytics',
          icon: <BarChart3 className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          label: 'Model Lab',
          to: '/models',
          icon: <Sliders className="w-4 h-4" />,
        },
        {
          label: 'Insights',
          to: '/insights',
          icon: <Sparkles className="w-4 h-4" />,
          badge: '5 Live',
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          label: 'Data Health',
          to: '/data',
          icon: <Database className="w-4 h-4" />,
        },
        {
          label: 'Settings',
          to: '/settings',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ]

  const isActiveLink = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200/90 select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-zinc-100 flex items-center justify-between">
        <NavLink to="/" onClick={onClose} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform duration-200 group-hover:scale-105">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-sm tracking-wider text-zinc-950">
                NEXUS
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium tracking-tight">
              Retail Intelligence
            </p>
          </div>
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <NavLink to="/forecasts/new" onClick={onClose} className="block">
          <ActionButton
            size="sm"
            variant="primary"
            className="w-full justify-center shadow-sm"
            icon={<Plus className="w-4 h-4" />}
          >
            New Forecast
          </ActionButton>
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActiveLink(item.to)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-subtle'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={active ? 'text-zinc-900' : 'text-zinc-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Workspace / Profile Footer */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-zinc-200/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0">
            RK
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 truncate">
                Retail Network
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
            </div>
            <p className="text-[11px] text-zinc-400 truncate">45 Active Stores • Prod</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
