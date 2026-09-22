import React from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  keyExtractor: (item: T) => string | number
  emptyState?: React.ReactNode
  className?: string
  hoverable?: boolean
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  keyExtractor,
  emptyState,
  className = '',
  hoverable = true,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className="py-8">{emptyState}</div>
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-zinc-200/80 bg-white shadow-subtle ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((item, index) => {
            const isClickable = !!onRowClick
            return (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors duration-150 ${
                  isClickable ? 'cursor-pointer' : ''
                } ${hoverable ? 'hover:bg-zinc-50/80' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 text-zinc-700 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(item, index) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
