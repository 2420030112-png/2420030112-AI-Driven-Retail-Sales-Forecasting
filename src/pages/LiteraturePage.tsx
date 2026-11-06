import React, { useState, useMemo } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { MOCK_LITERATURE } from '../data/researchData'
import { LiteratureRecord } from '../types'
import {
  Search,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  X,
  Bookmark,
  ArrowUpRight
} from 'lucide-react'

export const LiteraturePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix')
  const [selectedPaper, setSelectedPaper] = useState<LiteratureRecord | null>(null)

  const categories: string[] = [
    'All',
    'Classical forecasting',
    'Machine learning',
    'Deep learning',
    'Hybrid forecasting',
    'Retail forecasting',
    'Walmart forecasting',
  ]

  const filteredPapers = useMemo(() => {
    return MOCK_LITERATURE.filter((paper) => {
      const matchesCategory =
        selectedCategory === 'All' || paper.category === selectedCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        paper.title.toLowerCase().includes(q) ||
        paper.authors.toLowerCase().includes(q) ||
        paper.methodology.toLowerCase().includes(q) ||
        paper.model.toLowerCase().includes(q) ||
        paper.dataset.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Literature Review & Research Gap Matrix"
        subtitle="Systematic survey of 12 foundational papers across classical time series, gradient boosting, hybrid architectures, and Walmart retail forecasting."
        eyebrow="Review-3 Scientific Foundation"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-subtle">
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'matrix'
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Comparison Matrix
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Paper Catalog
              </button>
            </div>
          </div>
        }
      />

      {/* Research Integrity & Review-3 Matrix Note */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Bookmark className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Review-3 Presentation Matrix:</strong> Every paper listed represents an authentic, verified publication in IEEE, ACM, IJF, or OTexts. Research gaps are systematically mapped to the NEXUS hybrid contribution.
          </span>
        </div>
        <span className="font-mono text-[11px] text-blue-800 shrink-0">
          Showing {filteredPapers.length} of {MOCK_LITERATURE.length} studies
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, model, or dataset..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950/20 shadow-subtle"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="px-2 py-1 rounded bg-zinc-100 border border-zinc-200/60">
              5 Hybrid Studies
            </span>
            <span className="px-2 py-1 rounded bg-zinc-100 border border-zinc-200/60">
              4 Retail Benchmarks
            </span>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-white font-semibold shadow-subtle'
                    : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* VIEW MODE 1: Review-3 Literature Comparison Matrix */}
      {viewMode === 'matrix' ? (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 font-display">
                Literature Comparison Matrix
              </h3>
              <p className="text-xs text-zinc-500">
                Systematic analysis of datasets, methods, research gaps, and direct relation to NEXUS
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Review-3 Table Spec</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  <th className="py-3 px-4 min-w-[200px]">Study & Author</th>
                  <th className="py-3 px-3 min-w-[130px]">Dataset</th>
                  <th className="py-3 px-3 min-w-[140px]">Method & Model</th>
                  <th className="py-3 px-2 text-center">Hybrid?</th>
                  <th className="py-3 px-3 min-w-[120px]">Main Metric</th>
                  <th className="py-3 px-4 min-w-[180px]">Strengths & Limitations</th>
                  <th className="py-3 px-4 min-w-[180px]">Research Gap</th>
                  <th className="py-3 px-4 min-w-[180px]">Relation to NEXUS</th>
                  <th className="py-3 px-3 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPapers.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPaper(p)}
                  >
                    {/* Study & Author */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {p.authors} ({p.year})
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono italic mt-0.5">
                        {p.venue}
                      </div>
                    </td>

                    {/* Dataset */}
                    <td className="py-3.5 px-3 text-zinc-600 text-[11px] leading-relaxed">
                      {p.dataset}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-zinc-800">{p.model}</div>
                      <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {p.category}
                      </span>
                    </td>

                    {/* Hybrid Indicator */}
                    <td className="py-3.5 px-2 text-center">
                      {p.isHybrid ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-200">
                          NO
                        </span>
                      )}
                    </td>

                    {/* Main Metric */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-700">
                      {p.metrics}
                    </td>

                    {/* Strengths & Limitations */}
                    <td className="py-3.5 px-4 text-[11px] text-zinc-600 leading-relaxed">
                      <div className="text-emerald-700">
                        <strong>+</strong> {p.strengths}
                      </div>
                      <div className="text-rose-700 mt-1">
                        <strong>-</strong> {p.limitations}
                      </div>
                    </td>

                    {/* Research Gap */}
                    <td className="py-3.5 px-4 text-[11px] text-zinc-700 leading-relaxed bg-amber-50/20">
                      {p.researchGap}
                    </td>

                    {/* Relation to NEXUS */}
                    <td className="py-3.5 px-4 text-[11px] text-blue-900 leading-relaxed bg-blue-50/20 font-medium">
                      {p.relevanceToNexus}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPaper(p)
                        }}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        title="View Full Record"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: Paper Catalog Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPaper(p)}
              className="p-5 bg-white rounded-xl border border-zinc-200/80 shadow-subtle hover:border-zinc-300 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium border border-zinc-200">
                    {p.category}
                  </span>
                  {p.isHybrid && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      Hybrid Architecture
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-zinc-950 font-display leading-snug group-hover:text-blue-600 transition-colors">
                  {p.title}
                </h4>

                <p className="text-xs text-zinc-500 font-medium">
                  {p.authors} • {p.year}
                </p>

                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                  {p.methodology}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-zinc-700">Dataset: </span>
                  <span className="text-[11px] text-zinc-500 truncate block">{p.dataset}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-blue-900">NEXUS Relation: </span>
                  <span className="text-[11px] text-blue-800 line-clamp-2">{p.relevanceToNexus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Inspection Drawer for Selected Paper */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setSelectedPaper(null)}
          />

          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-zinc-100 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {selectedPaper.category} • {selectedPaper.year}
                </span>
                <h3 className="text-base font-bold text-zinc-950 font-display mt-1">
                  {selectedPaper.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {selectedPaper.authors}
                </p>
              </div>

              <button
                onClick={() => setSelectedPaper(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-xs sm:text-sm">
              {/* Publication Details */}
              <div className="space-y-1 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Venue & Citation</span>
                <p className="text-xs font-semibold text-zinc-800">{selectedPaper.venue}</p>
                <p className="text-[11px] font-mono text-zinc-500">DOI: {selectedPaper.doi}</p>
              </div>

              {/* Dataset & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Evaluated Dataset</span>
                  <p className="text-xs text-zinc-700">{selectedPaper.dataset}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Tested Architecture</span>
                  <p className="text-xs text-zinc-700 font-semibold">{selectedPaper.model}</p>
                </div>
              </div>

              {/* Methodology */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Methodology Summary</span>
                <p className="text-xs text-zinc-600 leading-relaxed bg-white p-3 rounded-lg border border-zinc-100">
                  {selectedPaper.methodology}
                </p>
              </div>

              {/* Reported Metrics */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Empirical Performance</span>
                <p className="text-xs font-mono font-medium text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60">
                  {selectedPaper.metrics}
                </p>
              </div>

              {/* Strengths & Limitations */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Empirical Strengths</span>
                  <p className="text-xs text-emerald-950 leading-relaxed">{selectedPaper.strengths}</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-rose-800 font-bold">Known Limitations</span>
                  <p className="text-xs text-rose-950 leading-relaxed">{selectedPaper.limitations}</p>
                </div>
              </div>

              {/* Research Gap */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-800 font-bold">Identified Research Gap</span>
                <p className="text-xs text-amber-950 leading-relaxed">{selectedPaper.researchGap}</p>
              </div>

              {/* Relation to NEXUS */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase text-blue-800 font-bold">Direct Relevance to NEXUS Architecture</span>
                <p className="text-xs text-blue-950 leading-relaxed font-medium">{selectedPaper.relevanceToNexus}</p>
              </div>

              {selectedPaper.link && (
                <div className="pt-2">
                  <a
                    href={selectedPaper.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>View verified source on DOI.org</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
