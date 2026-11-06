import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  subtitle?: string
  badge?: string
}

export interface SearchSelectProps {
  options: SelectOption[]
  value?: string | number
  onChange: (value: any) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  helperText?: string
  error?: string
  disabled?: boolean
  className?: string
}

export const SearchSelect: React.FC<SearchSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  label,
  helperText,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.subtitle && opt.subtitle.toLowerCase().includes(search.toLowerCase())) ||
    (opt.badge && opt.badge.toLowerCase().includes(search.toLowerCase()))
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openSelect = () => {
    if (disabled) return
    setSearch('')
    setHighlightedIndex(0)
    setIsOpen(true)
  }

  const toggleSelect = () => {
    if (disabled) return
    if (!isOpen) {
      openSelect()
    } else {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        openSelect()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value)
        setIsOpen(false)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5 font-sans">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleSelect}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-lg border bg-white text-sm transition-all duration-150 ${
          isOpen
            ? 'border-zinc-900 ring-2 ring-zinc-900/10'
            : error
            ? 'border-rose-300 hover:border-rose-400'
            : 'border-zinc-300/90 hover:border-zinc-400 shadow-subtle'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-50' : 'cursor-pointer'}`}
      >
        <div className="truncate flex-1 pr-2">
          {selectedOption ? (
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-zinc-400">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="w-4 h-4 text-zinc-400 shrink-0" />
      </button>

      {/* Helper / Error text */}
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : (
        helperText && <p className="mt-1 text-xs text-zinc-400">{helperText}</p>
      )}

      {/* Popover list */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-zinc-200 shadow-dropdown overflow-hidden animate-slide-down">
          {/* Search box */}
          <div className="p-2 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50/50">
            <Search className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setHighlightedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none py-1"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-zinc-50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs text-zinc-400">
                No matching results found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value)
                const isHighlighted = idx === highlightedIndex

                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer text-sm transition-colors ${
                      isHighlighted ? 'bg-zinc-100/80 text-zinc-900' : 'text-zinc-700'
                    } ${isSelected ? 'font-semibold text-zinc-950 bg-zinc-50' : ''}`}
                  >
                    <div className="truncate pr-3">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subtitle && (
                        <p className="text-xs text-zinc-400 font-normal truncate mt-0.5">
                          {opt.subtitle}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-zinc-950 shrink-0 ml-2" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
