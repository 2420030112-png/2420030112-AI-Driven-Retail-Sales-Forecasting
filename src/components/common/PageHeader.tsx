import React from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-zinc-200/70 ${className}`}>
      <div className="space-y-1.5 max-w-2xl">
        {eyebrow && (
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block font-mono">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 font-display">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-zinc-500 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-end">
          {actions}
        </div>
      )}
    </div>
  )
}

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 font-display">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
