import React, { useState, useMemo } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { MOCK_NOVELTY_ITEMS } from '../data/researchData'
import { NoveltyStatus } from '../types'
import { Search, ShieldCheck } from 'lucide-react'

export const NoveltyVerificationPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const statuses: { label: string; value: string }[] = [
    { label: 'All Approaches (11)', value: 'All' },
    { label: 'Potential Contribution', value: 'Potential contribution' },
    { label: 'Different Implementation', value: 'Different implementation' },
    { label: 'Partially Explored', value: 'Partially explored' },
    { label: 'Existing Baseline', value: 'Existing' },
  ]

  const filteredItems = useMemo(() => {
    return MOCK_NOVELTY_ITEMS.filter((item) => {
      const matchesStatus =
        selectedStatus === 'All' || item.status === selectedStatus
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        item.featureOrApproach.toLowerCase().includes(q) ||
        item.existingLiterature.toLowerCase().includes(q) ||
        item.ourImplementation.toLowerCase().includes(q) ||
        item.evidence.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [selectedStatus, searchQuery])

  const getStatusBadge = (status: NoveltyStatus) => {
    switch (status) {
      case 'Existing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            Existing Baseline
          </span>
        )
      case 'Partially explored':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Partially Explored
          </span>
        )
      case 'Different implementation':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
            Different Implementation
          </span>
        )
      case 'Potential contribution':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Potential Contribution
          </span>
        )
      case 'Requires verification':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-50 text-purple-800 border border-purple-200">
            Requires Verification
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Novelty Verification & Contribution Matrix"
        subtitle="Systematic validation of architectural components against peer-reviewed literature. Designed to prevent unsupported scientific claims for Review-3."
        eyebrow="Research Integrity Protocol"
      />

      {/* Mandatory Scientific Integrity Standard Alert */}
      <div className="p-5 rounded-2xl bg-zinc-950 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-display">
              Review-3 Academic Integrity Rule
            </h3>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              In strict accordance with academic review requirements, NEXUS never makes blanket claims such as <em>"No one has done this before"</em>. Every method is formally categorized into existing literature baselines, architectural adaptations, or potential research contributions subject to empirical verification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
            Status: Formally Classified
          </span>
        </div>
      </div>

      {/* Novelty Status Distribution Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400">Existing Baselines</span>
          <div className="text-2xl font-bold text-zinc-950 font-display">4 Items</div>
          <p className="text-[11px] text-zinc-500">ARIMA, Prophet, XGBoost, Walmart benchmark</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400">Partially Explored</span>
          <div className="text-2xl font-bold text-amber-700 font-display">2 Items</div>
          <p className="text-[11px] text-zinc-500">Residual hybrids (Prophet/ARIMA + XGB)</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400">Different Implementation</span>
          <div className="text-2xl font-bold text-blue-700 font-display">3 Items</div>
          <p className="text-[11px] text-zinc-500">Markdown decay features, Stacking, Multi-horizon</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-subtle space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-400">Potential Contribution</span>
          <div className="text-2xl font-bold text-emerald-700 font-display">2 Items</div>
          <p className="text-[11px] text-zinc-500">Proposed Hybrid & Decision Intelligence UX</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by feature, method, or citation..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950/20 shadow-subtle"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setSelectedStatus(st.value)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedStatus === st.value
                  ? 'bg-zinc-900 text-white font-semibold shadow-subtle'
                  : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Novelty Verification Matrix Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 font-display">
              Scientific Novelty & Evidence Matrix
            </h3>
            <p className="text-xs text-zinc-500">
              Formally evaluated for Review-3 presentation defense
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Showing {filteredItems.length} of {MOCK_NOVELTY_ITEMS.length} dimensions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                <th className="py-3 px-4 min-w-[200px]">Feature / Approach</th>
                <th className="py-3 px-3 min-w-[120px]">Category</th>
                <th className="py-3 px-4 min-w-[200px]">Existing Literature</th>
                <th className="py-3 px-4 min-w-[220px]">Our Implementation</th>
                <th className="py-3 px-3 min-w-[150px]">Verification Status</th>
                <th className="py-3 px-4 min-w-[220px]">Academic Evidence & Citations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                  {/* Feature / Approach */}
                  <td className="py-3.5 px-4 font-semibold text-zinc-950 font-display">
                    {item.featureOrApproach}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3">
                    <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {item.category}
                    </span>
                  </td>

                  {/* Existing Literature */}
                  <td className="py-3.5 px-4 text-zinc-600 text-[11px] leading-relaxed">
                    {item.existingLiterature}
                  </td>

                  {/* Our Implementation */}
                  <td className="py-3.5 px-4 text-zinc-900 text-[11px] leading-relaxed font-medium">
                    {item.ourImplementation}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Evidence & Citation */}
                  <td className="py-3.5 px-4 text-[11px] leading-relaxed">
                    <div className="text-zinc-700">{item.evidence}</div>
                    <div className="text-[10px] font-mono text-blue-700 font-semibold mt-1">
                      Ref: {item.primaryCitation}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
