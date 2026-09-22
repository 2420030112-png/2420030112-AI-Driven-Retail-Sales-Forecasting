# NEXUS — Retail Demand Intelligence

> *"See demand before it happens."*

NEXUS is a commercial-grade retail demand forecasting and inventory intelligence platform engineered for multi-unit retail networks. It models store-level dynamics, holiday surge elasticities, promotional markdowns (MD1–MD5), and macroeconomic factors across regional supercenter, suburban, and compact store formats.

---

## Key Capabilities

- **Progressive Disclosure Architecture**: Purpose-driven screens where advanced insights appear through dedicated detail views, sliding inspection drawers, command palettes, and contextual drill-downs.
- **Continuous Trajectory Forecasting**: Visual separation between audited historical sales baselines and forward-looking demand projections with calibrated 95% heteroskedastic confidence interval bands.
- **Interactive Multi-Stage Inference Simulator**: A 5-stage pipeline with live kernel telemetry (`Dataset validated` → `Historical patterns analyzed` → `Features generated` → `Forecasting model executed` → `Demand projection generated`).
- **Model Lab & Benchmark Leaderboard**: In-depth model evaluation across XGBoost Regressor (v2.4), Random Forest, Prophet Seasonal Forecaster, SARIMAX, and ElasticNet Ridge baselines.
- **Store-Level Footprint Analytics**: Unit-level sales velocity, square footage efficiency ($/sq ft), and localized volatility tiers across all 45 retail units.
- **Calendar & Markdown Dynamics**: 52-week normalized seasonal curve, holiday surge multipliers (Thanksgiving 2.45x, Christmas 2.38x), and promotional markdown elasticity analysis.
- **Omnipresent Command Palette (`⌘K` / `Ctrl+K`)**: Rapid keyboard navigation across stores, models, forecasts, and analytics hubs.

---

## Application Route Structure

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Overview** | Executive hero, primary sales trajectory, 3 restrained metrics, "What's changing?" insight, and recent forecasts. |
| `/forecasts` | **Forecast Workspace** | Comprehensive forecast listing with horizon filters, status badges, and projected demand metrics. |
| `/forecasts/new` | **New Forecast** | Focused configuration workflow with command-style searchable selectors, 4/8/12w segmented control, and 5-stage inference. |
| `/forecasts/:id` | **Forecast Result / Detail** | Primary product experience: projected sales KPIs, historical + forecast separation chart, demand interpretation, and slide-over model drawer. |
| `/analytics` | **Analytics Hub** | Editorial navigation hub routing to Sales Trends, Store Performance, and Seasonality modules. |
| `/analytics/sales` | **Sales Trends** | Multi-year longitudinal trajectory, top departmental volume rankings, and store format velocity. |
| `/analytics/stores` | **Store Performance** | Searchable store leaderboard with footprint dimensions, average weekly velocity, and volatility classifications. |
| `/analytics/stores/:id` | **Store Detail** | Unit identity, historical sales trajectory, physical footprint, demand pattern assessment, and contextual "Forecast this store" CTA. |
| `/analytics/seasonality` | **Seasonality & Calendar** | 52-week normalized demand multiplier cycle, holiday multipliers, and promotional markdown elasticities. |
| `/models` | **Model Lab** | Technical benchmark leaderboard comparing MAE, RMSE, MAPE, R², training time, and inference latency. |
| `/models/:id` | **Model Detail** | Architecture breakdown, feature permutation contribution weights, and hyperparameter dictionary. |
| `/insights` | **Business Intelligence** | Executive retail signals, anomaly detections, and inventory planning recommendations. |
| `/data` | **Data Health** | Pipeline health telemetry: 421,570 rows processed, 0 duplicates, 143 continuous weeks coverage, and data source status. |
| `/settings` | **Settings** | Workspace defaults, prediction horizon configurations, and FastAPI endpoint connection management. |

---

## Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom editorial design tokens, refined border radii (12–16px), and subtle shadows
- **Charts & Data Visualization**: Recharts (ComposedChart, Area, Line, Bar, ReferenceLine, Custom Tooltips)
- **Icons**: Lucide React
- **Typography**: Inter & Plus Jakarta Sans via Google Fonts

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open in browser
http://localhost:5173/
```

To test the production build:
```bash
npm run build
npm run preview
```
