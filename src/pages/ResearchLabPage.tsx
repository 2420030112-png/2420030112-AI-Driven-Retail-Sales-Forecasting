import React from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Metric } from '../components/common/Metric'
import { ActionButton } from '../components/common/ActionButton'
import {
  BookOpen,
  FlaskConical,
  Sparkles,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award
} from 'lucide-react'

export const ResearchLabPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-12">
      {/* Editorial Header */}
      <PageHeader
        title="Research Lab & Scientific Framework"
        subtitle="Empirical retail demand forecasting, literature benchmarking, novelty verification, and Review-3 research evidence."
        eyebrow="Academic Research"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/research/results">
              <ActionButton
                size="sm"
                variant="primary"
                icon={<BarChart3 className="w-4 h-4" />}
              >
                Review-3 Results
              </ActionButton>
            </Link>
          </div>
        }
      />

      {/* Review-3 Academic Milestone Alert */}
      <section className="bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-950 font-display">
                Review-3 Scientific Deliverable
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                Methodology Audited
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 max-w-2xl leading-relaxed">
              Evaluating the proposed context-aware multi-stage residual hybrid forecasting model against 5 established baselines and 3 hybrid architectures using the 143-week Walmart retail dataset under strict chronological splitting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/research/novelty">
            <ActionButton size="sm" variant="outline" icon={<ShieldCheck className="w-4 h-4" />}>
              Novelty Matrix
            </ActionButton>
          </Link>
          <Link to="/research/experiments">
            <ActionButton size="sm" variant="secondary" icon={<FlaskConical className="w-4 h-4" />}>
              Experiment Log
            </ActionButton>
          </Link>
        </div>
      </section>

      {/* Research Telemetry Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Benchmark Dataset"
          value="143 Weeks"
          delta={{ value: "421,570 Rows", isNeutral: true }}
          subtext="Walmart retail network (45 stores, 81 depts)"
        />
        <Metric
          label="Literature Survey"
          value="12 Papers"
          delta={{ value: "6 Categories", isNeutral: true }}
          subtext="Peer-reviewed studies (ARIMA to DeepAR)"
        />
        <Metric
          label="Models Evaluated"
          value="10 Architectures"
          delta={{ value: "6 Baselines + 4 Hybrids", isPositive: true }}
          subtext="Chronological out-of-time test partition"
        />
        <Metric
          label="Top Test Model"
          value="9.41% WAPE"
          delta={{ value: "XGBoost ($5,663 MAE)", isPositive: true }}
          subtext="Prophet selected on Val WAPE (12.88%)"
        />
      </section>

      {/* 4 Dedicated Workspaces (Grid of Cards) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-zinc-950 font-display">
            Research Workspaces & Review-3 Modules
          </h2>
          <p className="text-xs text-zinc-500">
            Dedicated research environments supporting scientific inquiry and literature-based verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Workspace 1: Literature Review */}
          <Link
            to="/research/literature"
            className="group p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-subtle hover:border-zinc-300 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                  12 Verified Studies
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 font-display group-hover:text-blue-600 transition-colors">
                  Literature Review & Matrix
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Systematic taxonomy across classical forecasting (ARIMA, Box-Jenkins), machine learning (Chen 2016), deep learning (Smyl 2020), and retail competitions (Makridakis M5). Features an academic comparison matrix mapping research gaps to NEXUS.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900 group-hover:text-blue-600">
              <span>Explore Literature Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Workspace 2: Experiment Engine */}
          <Link
            to="/research/experiments"
            className="group p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-subtle hover:border-zinc-300 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                  9 Experiment Runs
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 font-display group-hover:text-blue-600 transition-colors">
                  Experiment Engine & Matrix
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Systematic experiment tracking across 5 baselines (Linear Regression, Random Forest, XGBoost, SARIMAX, Prophet) and 4 hybrid pipelines. Audited strict chronological train/val/test splitting to eliminate data leakage.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900 group-hover:text-blue-600">
              <span>View Experiment Tracking Matrix</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Workspace 3: Novelty Verification */}
          <Link
            to="/research/novelty"
            className="group p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-subtle hover:border-zinc-300 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                  Integrity Verified
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 font-display group-hover:text-blue-600 transition-colors">
                  Novelty Verification Matrix
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Structured scientific evaluation of 11 architectural dimensions against existing literature. Adheres to strict research integrity: avoids unsupported claims, clearly classifying elements as Existing, Partially Explored, or Potential Contribution.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900 group-hover:text-blue-600">
              <span>Inspect Novelty Matrix</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Workspace 4: Results & Model Selection */}
          <Link
            to="/research/results"
            className="group p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-subtle hover:border-zinc-300 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Review-3 Slides Ready
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 font-display group-hover:text-blue-600 transition-colors">
                  Experiment Results & Model Selection
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Presentation-ready comparison charts, error distributions (MAE, RMSE, MAPE, R²), execution times, and dynamic model-selection rationale explaining why the Proposed Hybrid was scientifically selected.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-900 group-hover:text-blue-600">
              <span>View Benchmark Results & Selection</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Methodology Architecture Pipeline */}
      <section className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-7 shadow-subtle space-y-6">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            End-to-End Scientific Architecture
          </span>
          <h2 className="text-lg font-bold text-zinc-950 font-display mt-0.5">
            NEXUS Hybrid Research Pipeline
          </h2>
          <p className="text-xs text-zinc-500 max-w-2xl mt-1 leading-relaxed">
            The modular experiment pipeline ensures reproducible feature extraction, zero data leakage across chronological horizons, and rigorous model evaluation.
          </p>
        </div>

        {/* Step-by-Step Methodology Stages */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400">01</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900">Data Ingestion</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Walmart weekly sales (45 stores, 81 depts, 143 weeks, markdowns MD1-5).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400">02</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900">Chronological Split</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Train (106w) → Val (18w) → Test (19w). Zero future leakage guaranteed.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400">03</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900">Feature Engineering</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Lags 1-8w, rolling stats, markdown decay weights, macro CPI/fuel indicators.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400">04</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900">Baseline Benchmarks</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Seasonal Naive, ElasticNet, Random Forest, XGBoost, Prophet (5A), and SARIMAX (5B).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-400">05</span>
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900">Hybrid Modeling</h3>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Residual hybrids (Prophet/SARIMAX + XGB), Stacking (RF+XGB), and Proposed Context Hybrid.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-600">06</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-bold text-emerald-950">Model Selection</h3>
            <p className="text-[11px] text-emerald-800 leading-normal">
              Dual selection: Prophet (Val WAPE 12.88%) for point forecasting; Hybrid D (72.11% PICP) for risk planning.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
