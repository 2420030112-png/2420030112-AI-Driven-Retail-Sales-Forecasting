import React from 'react'

export interface StatusBadgeProps {
  status: string
  variant?: 'neutral' | 'success' | 'warning' | 'info' | 'critical' | 'outline'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'sm',
  dot = true,
  className = '',
}) => {
  // Derive variant if not explicitly provided
  const resolvedVariant = variant || (() => {
    const s = status.toLowerCase()
    if (s.includes('complete') || s.includes('active') || s.includes('operational') || s.includes('production') || s.includes('healthy') || s.includes('low')) {
      return 'success'
    }
    if (s.includes('process') || s.includes('sync') || s.includes('moderate') || s.includes('challenger') || s.includes('warning')) {
      return 'warning'
    }
    if (s.includes('fail') || s.includes('high') || s.includes('critical') || s.includes('degraded')) {
      return 'critical'
    }
    if (s.includes('schedul') || s.includes('season') || s.includes('experiment')) {
      return 'info'
    }
    return 'neutral'
  })()

  const variantStyles = {
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/70',
    info: 'bg-sky-50 text-sky-700 border-sky-200/70',
    critical: 'bg-rose-50 text-rose-700 border-rose-200/70',
    outline: 'bg-transparent text-zinc-600 border-zinc-200',
  }

  const dotColors = {
    neutral: 'bg-zinc-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    critical: 'bg-rose-500',
    outline: 'bg-zinc-400',
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium gap-1.5',
    md: 'text-xs px-2.5 py-1 font-medium gap-2',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeStyles[size]} ${variantStyles[resolvedVariant]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[resolvedVariant]} ${
            resolvedVariant === 'warning' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span className="capitalize">{status}</span>
    </span>
  )
}
