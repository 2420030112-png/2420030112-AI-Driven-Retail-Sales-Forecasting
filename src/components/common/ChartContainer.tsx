import React from 'react'

export interface ChartContainerProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  footer?: React.ReactNode
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  footer,
}) => {
  return (
    <div className={`bg-white rounded-xl border border-zinc-200/80 shadow-subtle flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 pt-5 pb-3 border-b border-zinc-100">
          <div>
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-zinc-900 font-display">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className="p-5 flex-1 min-h-0 w-full overflow-hidden">
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl text-xs text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  )
}
