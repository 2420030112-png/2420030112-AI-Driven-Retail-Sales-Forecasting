import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { ActionButton } from './ActionButton'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 font-display">
        {title}
      </h3>
      <p className="mt-1 text-xs text-rose-700 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <ActionButton
            size="sm"
            variant="outline"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            Retry Request
          </ActionButton>
        </div>
      )}
    </div>
  )
}
