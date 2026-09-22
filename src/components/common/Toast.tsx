import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            case 'warning':
              return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            default:
              return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          }
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start justify-between gap-3 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-zinc-200 shadow-elevated animate-slide-down text-xs"
          >
            <div className="flex items-start gap-2.5">
              {getIcon()}
              <div>
                <p className="font-semibold text-zinc-900">{toast.title}</p>
                {toast.message && (
                  <p className="text-zinc-500 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
