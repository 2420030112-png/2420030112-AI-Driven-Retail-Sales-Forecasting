import React from 'react'
import { FolderSearch } from 'lucide-react'
import { ActionButton } from './ActionButton'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-10 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-200/60">
        {icon || <FolderSearch className="w-6 h-6 text-zinc-400" />}
      </div>
      <h3 className="text-base font-semibold text-zinc-900 font-display tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <ActionButton size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </ActionButton>
        </div>
      )}
    </div>
  )
}
