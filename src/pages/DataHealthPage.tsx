import React from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { StatusBadge } from '../components/common/StatusBadge'
import { ActionButton } from '../components/common/ActionButton'
import { MOCK_DATA_HEALTH } from '../data/mockData'
import { Database, ShieldCheck, RefreshCw } from 'lucide-react'

export const DataHealthPage: React.FC = () => {
  const data = MOCK_DATA_HEALTH

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Data Health & Pipeline Integrity"
        subtitle="Telemetry and quality assurance for historical retail transactions, store registers, and exogenous feature feeds."
        eyebrow="System"
        actions={
          <ActionButton
            size="sm"
            variant="outline"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-verify Ingestion Integrity
          </ActionButton>
        }
      />

      {/* Primary Data Quality KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Rows Ingested & Cleaned"
          value={data.rowsProcessed.toLocaleString()}
          delta={{ value: "421.5k Records", isPositive: true }}
          subtext="Store-Department weekly rows"
        />
        <Metric
          label="Missing Values Imputed"
          value={data.missingValuesCleaned.toLocaleString()}
          delta={{ value: "0 Nulls Remaining", isPositive: true }}
          subtext="MarkDown1-5 pre-2011 structural zeros"
        />
        <Metric
          label="Duplicate Transactions"
          value="0"
          delta={{ value: "Zero Duplicates", isPositive: true }}
          subtext="Strict primary key integrity"
        />
        <Metric
          label="Continuous Date Coverage"
          value={`${data.dateCoverage.totalWeeks} Weeks`}
          delta={{ value: "No Gaps", isPositive: true }}
          subtext={`${data.dateCoverage.start} to ${data.dateCoverage.end}`}
        />
      </div>

      {/* Ingestion & Preprocessing Verification Card */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 font-display">
                Preprocessing & Feature Sanitation Status
              </h3>
              <p className="text-xs text-zinc-500">
                All validation checks passed. Target variable `Weekly_Sales` confirmed stationary within rolling folds.
              </p>
            </div>
          </div>
          <StatusBadge status={data.pipelineStatus} size="md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase block">
              Audited Scope
            </span>
            <div className="text-sm font-semibold text-zinc-900">
              45 Stores • 81 Unique Departments
            </div>
            <p className="text-xs text-zinc-500">Full network topology indexed with zero unmapped stores.</p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase block">
              Temporal Continuity
            </span>
            <div className="text-sm font-semibold text-zinc-900">
              143 Continuous Weekly Intervals
            </div>
            <p className="text-xs text-zinc-500">No missing calendar weeks detected across any operational unit.</p>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase block">
              Last Sync Timestamp
            </span>
            <div className="text-sm font-semibold text-zinc-900 font-mono">
              {data.lastSyncTimestamp}
            </div>
            <p className="text-xs text-zinc-500">Automated ETL health audit scheduled every 24 hours.</p>
          </div>
        </div>
      </div>

      {/* Connected Data Sources Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-subtle overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 font-display">
              Primary Data Feeds & External Sources
            </h3>
            <p className="text-xs text-zinc-500">Direct inputs powering the feature engineering pipeline</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">4 Data Streams</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {data.dataSources.map((ds, idx) => (
            <div key={idx} className="p-4 sm:px-6 flex items-center justify-between hover:bg-zinc-50/60 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 text-sm">{ds.name}</div>
                  <div className="text-xs text-zinc-400">{ds.type}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <span className="font-mono text-xs text-zinc-700 block">{ds.recordCount}</span>
                  <span className="text-[11px] text-zinc-400">Synced: {ds.lastIngestion}</span>
                </div>
                <StatusBadge status={ds.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
