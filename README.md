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

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom editorial design tokens, refined border radii (12–16px), and subtle shadows
- **Charts & Visualization**: Recharts (ComposedChart, Area, Line, Bar, ReferenceLine, Radar, Tooltips) & Matplotlib / Seaborn (Diagnostic Q-Q & Dispersion plots)
- **Data Science & ML Pipeline**: Python 3.14 (Pandas, NumPy, SciPy, Statsmodels, Scikit-learn, Pytest)
- **Icons**: Lucide React
- **Typography**: Inter & Plus Jakarta Sans via Google Fonts

---

## Running Locally

### 1. Frontend Web Application

```bash
# 1. Install frontend dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open in browser: http://localhost:5173/

# 4. Production build verification
npm run build
npm run preview
```

### 2. Python Data Science Pipeline (Review-3)

```bash
# 1. Create and activate Python virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# 2. Install data science dependencies
pip install -r requirements.txt

# 3. Place dataset files in data/raw/
# Required: train.csv, features.csv, stores.csv (see data/README.md)

# 4. Run the reproducible Review-3 Data Science & Statistical Analysis Pipeline
python src/ml/nexus_review3_pipeline.py

# 5. Run pipeline unit and integration tests
pytest tests/
```

### Generated Artifacts (`results/`)

Running `nexus_review3_pipeline.py` executes strict chronological partitioning, missing-value treatment, outlier investigation, and normality testing, producing:

- `results/schema_report.json`: Dimensionality, dtypes, and memory statistics across raw tables.
- `results/duplicate_records_report.json`: Primary key uniqueness and relational integrity verification.
- `results/missing_values_report.json`: Pre- and post-imputation null audit (MarkDown zero-filling justification).
- `results/outlier_analysis.json`: IQR dispersion, negative returns audit (1,285 records / 0.305%), and holiday demand surge multipliers.
- `results/normality_and_statistics.json`: Jarque-Bera, D'Agostino-Pearson, and Shapiro-Wilk normality tests (rejecting Gaussian assumptions).
- `results/chronological_split_summary.json`: 106w Train / 18w Val / 19w Test non-overlapping boundary verification.
- `results/feature_engineering_summary.json`: 44 engineered tensors, lags (1–52w), rolling statistics, and StandardScaler fit metadata.
- `results/reproducibility_manifest.json`: Execution timestamp, runtime, and audit manifest.
- `results/plots/`: High-resolution figures:
  - `sales_distribution_and_qq.png`: Empirical sales distribution with mean/median markers and normal Q-Q plot.
  - `outlier_boxplot_and_holidays.png`: Dispersion boxplots comparing regular vs holiday weeks and Dept 72 surge.
  - `markdown_timeline.png`: Promotional markdown audit showing pre-Nov 2011 structural zeros.
  - `chronological_split_timeline.png`: Strict chronological partitioning timeline with zero data leakage.

---

## Phase 4 — Real Forecast Inference & FastAPI Backend

NEXUS Phase 4 connects the interactive New Forecast Studio to authentic trained machine learning model artifacts, executing real inference with validated protocols and zero future target leakage.

### Backend Setup & Model Artifacts

```bash
# 1. Activate Python virtual environment
.\.venv\Scripts\Activate.ps1

# 2. Install dependencies (including FastAPI, Uvicorn, Pydantic, HTTPX)
pip install -r requirements.txt

# 3. Train and serialize model artifacts to artifacts/models/
python src/ml/train_and_save_artifacts.py

# 4. Launch FastAPI Inference Server
python -m uvicorn src.backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The server launches at `http://127.0.0.1:8000` with interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

### Model Artifact Requirements (`artifacts/models/`)

The backend loads verified artifacts from `artifacts/models/`:
- `proposed_hybrid.joblib`: Proposed Context-Aware Multi-Stage Residual Hybrid (Hybrid D) with heuristic uncertainty bounds.
- `xgboost.joblib`: Production XGBoost point forecaster (9.41% test WAPE).
- `random_forest.joblib`: Random Forest ensemble (9.64% test WAPE, 14.54% recursive multi-step WAPE).
- `prophet.joblib`: Bayesian Additive Forecaster (Validation tournament winner, 12.88% val WAPE).
- `seasonal_naive.joblib`: Non-parametric seasonal persistence benchmark.
- `elastic_net.joblib`: Regularized linear baseline.
- `sarimax.joblib`: Econometric state-space model with Kalman filtering.
- `stacking_ensemble.joblib`: Time-Aware Stacking Ensemble (RF + XGB + Ridge).
- `scaler.joblib`: StandardScaler fitted strictly on the 106-week training partition.
- `feature_columns.json`: Ordered list of 31 engineered tabular feature tensors.
- `historical_context.csv`: Pre-origin observations (124 weeks up to T0 = 2012-06-15) for benchmark cohort series.
- `test_covariates.csv`: Out-of-time exogenous indicators (strictly without future sales actuals).
- `manifest.json`: Checksums, dates, and capability declarations.

### API Contracts

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status, loaded model count, artifact verification, and origin date. |
| `GET` | `/api/models` | List of all 10 registered models, family, test/val metrics, and protocol support. |
| `GET` | `/api/models/{id}` | Detailed specifications and hyperparameters for a specific model. |
| `GET` | `/api/benchmark-series` | Returns the 20 evaluated benchmark cohort combinations across 5 stores and 4 depts. |
| `GET` | `/api/benchmark-series/validate` | Validates whether `(store_id, dept_id)` belongs to the evaluated cohort. |
| `POST` | `/api/forecast/generate` | Generates real model predictions for requested store, department, horizon, and protocol. |

#### Forecast Request Contract (`POST /api/forecast/generate`)

```json
{
  "store_id": 20,
  "dept_id": 72,
  "horizon_weeks": 12,
  "protocol": "recursive_multistep",
  "model_id": "proposed-hybrid",
  "confidence_interval": 0.95
}
```

#### Validation & Error Handling

- **Unsupported Series**: If a store/department combination outside the 20-series cohort is submitted (e.g. Store 2, Dept 1), the endpoint returns `400 Bad Request` with an explicit diagnostic message. The system never silently substitutes a different series.
- **Unsupported Horizons**: Horizons outside `1..19` weeks return `422 Unprocessable Entity`.
- **Unknown Models**: Unrecognized model IDs return `400 Bad Request`.

### Forecasting Protocols

1. **Fixed-Origin Recursive Multi-Step (`recursive_multistep`)**:
   - Strictly withholds future test sales $y_{T0+1} \dots y_{T0+h}$.
   - Autoregressive short lags (`lag_1w`, `lag_2w`, `lag_4w`, `lag_8w`) and rolling statistics are dynamically rolled forward using the model's own prior predictions.
   - Long lag `lag_52w` uses verified pre-origin 2011 observations.
   - Ideal for strategic multi-week and quarterly demand planning.
2. **1-Step-Ahead Rolling Horizon (`rolling_onestep`)**:
   - Evaluates step-by-step predictions simulating weekly store replenishment where ground-truth realized POS sales from week $t-1$ become available at each week.

### Uncertainty Interval Calibration Disclosure

In compliance with empirical audits:
- Uncertainty intervals generated by `proposed-hybrid` are explicitly documented as **uncalibrated heuristic bounds** with an empirical test coverage of **72.11%** against the nominal 95% target.
- Deterministic point forecasters (XGBoost, Random Forest, Prophet, ElasticNet) return `uncertainty.is_supported = false`.
- The frontend and backend never claim uncalibrated heuristic intervals are calibrated 95% prediction intervals.

### Running Automated Test Suite

```bash
# Python backend & inference tests (42 tests)
.\.venv\Scripts\python -m pytest tests/ -v

# Frontend unit & integration tests (26 tests)
npm test

# Linting verification (0 warnings, 0 errors)
npm run lint

# Production build verification (TypeScript + Vite)
npm run build
```

---

## Phase 5 — End-to-End Verification & Deployment Readiness

Phase 5 delivers comprehensive end-to-end verification, operational audit, and deployment readiness across the full stack.

### 1. Concurrent Local Execution Workflow

To run the complete verified local workflow, open two separate terminal windows:

**Terminal 1 — Python ML Backend:**
```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start FastAPI Inference Server
python -m uvicorn src.backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Health verification:* Navigate to `http://127.0.0.1:8000/api/health` or `http://127.0.0.1:8000/docs`.

**Terminal 2 — React Vite Frontend:**
```bash
# Start Vite development server
npm run dev
```
*Application entry:* Navigate to `http://localhost:5173/forecasts/new`. The Vite server automatically proxies `/api` calls directly to `http://127.0.0.1:8000`.

### 2. Verified Forecast Correctness & Protocol Audit

- **Fixed-Origin Recursive Multi-Step (`recursive_multistep`)**:
  - Operates strictly from forecast origin $T_0 = \text{2012-06-15}$ without future actuals.
  - Short autoregressive lags (`lag_1w`, `lag_2w`, `lag_4w`, `lag_8w`) are dynamically rolled forward using model-generated prior predictions.
  - Long seasonal lag `lag_52w` uses historical observations from 2011.
- **1-Step-Ahead Rolling Horizon (`rolling_onestep`)**:
  - Simulates weekly POS feedback where realized ground truth sales from week $t-1$ become available before step $t$.
  - First-step predictions are identical across both protocols; subsequent steps diverge due to recursive error compounding.
- **Uncertainty Interval Disclosure**:
  - Heuristic prediction bounds for `proposed-hybrid` are explicitly flagged as **uncalibrated** (empirical test PICP coverage of **72.11%** vs nominal 95% target).
  - Deterministic models (XGBoost, Random Forest, Prophet, ElasticNet) explicitly return `uncertainty.is_supported = false`.
- **Validation & Error Handling**:
  - Unsupported stores or departments outside the 20-series cohort return `400 Bad Request` with structured diagnostics. The application **never** silently substitutes series or falls back to mock data when real inference is invoked.
  - Horizon bounds outside $1 \le h \le 19$ weeks return `422 Unprocessable Entity`.

### 3. Operational Reliability & Bundle Optimization

- **Request Logging**: Structured middleware logs request method, path, HTTP status, and millisecond latency.
- **CORS Hardening**: Development origins are restricted to `localhost:5173`, `localhost:4173`, and `localhost:3000`, with `NEXUS_CORS_ORIGINS` for production domain specification.
- **Linter Cleanliness**: Oxlint reports **0 errors and 0 warnings** across all 54 project files.
- **Bundle Optimization**: Rollup manual chunking in `vite.config.ts` partitions heavy dependencies into `vendor` (79 kB gzip), `charts` (118 kB gzip), `icons` (6 kB gzip), and `index` (105 kB gzip), building cleanly in ~7.1 seconds.

### 4. Deployment Documentation

For containerization recipes (`Dockerfile`, `docker-compose.yml`), SPA routing rewrite rules for static hosts, environment variable reference, and production smoke tests, refer to:
👉 **[DEPLOYMENT.md](DEPLOYMENT.md)**

