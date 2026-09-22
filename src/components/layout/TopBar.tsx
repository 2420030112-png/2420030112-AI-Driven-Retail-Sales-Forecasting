import React from 'react'
import { Menu, Search, Sparkles } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Breadcrumbs, BreadcrumbItem } from '../common/Breadcrumbs'

export interface TopBarProps {
  onOpenMobileMenu: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { setCommandPaletteOpen } = useApp()
  const location = useLocation()

  // Generate breadcrumbs from route path
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const path = location.pathname
    if (path === '/') return [{ label: 'Overview' }]

    const segments = path.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    let accumulatedPath = ''
    segments.forEach((seg, idx) => {
      accumulatedPath += `/${seg}`
      const isLast = idx === segments.length - 1

      let label = seg.charAt(0).toUpperCase() + seg.slice(1)
      if (seg === 'forecasts') label = 'Forecasts'
      if (seg === 'analytics') label = 'Analytics'
      if (seg === 'models') label = 'Model Lab'
      if (seg === 'insights') label = 'Insights'
      if (seg === 'data') label = 'Data Health'
      if (seg === 'settings') label = 'Settings'
      if (seg === 'new') label = 'New Configuration'

      // Check if it's an ID
      if (seg.startsWith('fc-')) label = `Forecast #${seg.replace('fc-', '')}`
      if (!isNaN(Number(seg))) label = `Store #${seg}`

      items.push({
        label,
        href: isLast ? undefined : accumulatedPath,
      })
    })

    return items
  }

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumbs items={getBreadcrumbItems()} className="truncate" />
      </div>

      {/* Right section: Command Palette Trigger & System status */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Command palette search bar button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/70 border border-zinc-200/60 text-xs text-zinc-500 transition-colors shadow-subtle"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Search or jump to...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white rounded border border-zinc-200 shadow-subtle ml-1">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Live System telemetry pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Network Synced</span>
        </div>

        {/* Intelligence quick trigger */}
        <Link
          to="/insights"
          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          title="View Business Intelligence"
        >
          <Sparkles className="w-4 h-4 text-zinc-500" />
        </Link>
      </div>
    </header>
  )
}
