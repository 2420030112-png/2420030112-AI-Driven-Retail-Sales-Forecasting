# NEXUS — Production Deployment & Operational Readiness Guide

This guide details the deployment architecture, configuration, and verification protocols for the **NEXUS Retail Demand Intelligence Platform** (React 19 + TypeScript + Vite frontend with a Python FastAPI ML inference backend).

---

## 1. Architectural Separation

NEXUS is designed as a decoupled client-server system:

```
┌──────────────────────────────────────────────┐
│  Static Web Hosting (Vercel / S3 / Netlify)   │
│  React 19 + TypeScript + Vite SPA             │
│  - Bundled JS/CSS assets (dist/)             │
│  - Environment variable: VITE_API_URL        │
└──────────────────────┬───────────────────────┘
                       │ HTTPS REST API
                       ▼
┌──────────────────────────────────────────────┐
│  Containerized ML Runtime (Cloud Run / ECS)   │
│  Python 3.10+ FastAPI / Uvicorn Backend       │
│  - Pre-warmed Model Registry (10 models)     │
│  - In-memory Feature Engineering & Scaling   │
│  - Pre-origin Context (artifacts/models/)    │
│  - Zero Target Leakage Forecast Protocols    │
└──────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Static Hosting Limitation**: Static hosts (such as Vercel, Netlify, Cloudflare Pages, or GitHub Pages) serve compiled JavaScript and HTML. They **cannot** execute the Python runtime, load `.joblib` model artifacts, or compute real scikit-learn/XGBoost/Prophet inference. The FastAPI backend must be deployed to a container runtime or application server.

---

## 2. Frontend Deployment (Static SPA)

### Build Specification
```bash
# Install dependencies
npm ci

# Compile TypeScript and build production bundle
npm run build

# Output directory: dist/
```

### Environment Configuration
Set the following build-time environment variable on your static host:
```bash
VITE_API_URL=https://api.your-domain.com
```

### SPA Routing Fallback
Because NEXUS uses client-side routing (`react-router-dom`), any direct navigation to deep links (e.g., `/forecasts/new`, `/analytics/sales`, `/models/proposed-hybrid`) must be rewritten to `/index.html`.

- **Vercel (`vercel.json`)**:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Netlify (`public/_redirects`)**:
  ```
  /*    /index.html   200
  ```
- **Nginx (`nginx.conf`)**:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```

---

## 3. Backend Deployment (FastAPI ML Container)

### Hardware & Resource Allocation
- **CPU**: 1–2 vCPUs recommended.
- **Memory**: Minimum 512 MB (1 GB recommended). The model registry lazy-loads models on demand, requiring ~150 MB of resident memory once all 10 models are loaded.
- **Port**: Configured via `NEXUS_API_PORT` (default: `8000`).

### Production `Dockerfile`
A reference multi-stage production Dockerfile:

```dockerfile
FROM python:3.11-slim as base

# Set environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NEXUS_ENV=production \
    NEXUS_API_HOST=0.0.0.0 \
    NEXUS_API_PORT=8000 \
    NEXUS_ARTIFACTS_DIR=/app/artifacts/models

WORKDIR /app

# Install system dependencies (build-essential needed for some scikit-learn / statsmodels wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and serialized inference artifacts ONLY
# Note: Raw data in data/raw/ is excluded to avoid leaking raw datasets
COPY src/ /app/src/
COPY artifacts/models/ /app/artifacts/models/

EXPOSE 8000

# Health check using backend /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["python", "-m", "uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

### Production `docker-compose.yml`
```yaml
version: '3.8'

services:
  nexus-api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NEXUS_ENV=production
      - NEXUS_API_HOST=0.0.0.0
      - NEXUS_API_PORT=8000
      - NEXUS_CORS_ORIGINS=https://app.your-domain.com,https://nexus.your-domain.com
      - NEXUS_ARTIFACTS_DIR=artifacts/models
      - NEXUS_REQUEST_TIMEOUT_SEC=30.0
    restart: unless-stopped
```

---

## 4. Environment Variables Reference

| Variable | Target | Default | Production Example | Description |
| :--- | :---: | :--- | :--- | :--- |
| `VITE_API_URL` | Frontend | `""` (proxy) | `https://api.nexus-demand.com` | Base URL of deployed FastAPI backend. |
| `NEXUS_ENV` | Backend | `development` | `production` | Deployment mode flag. |
| `NEXUS_API_HOST` | Backend | `127.0.0.1` | `0.0.0.0` | Host IP address for Uvicorn listener. |
| `NEXUS_API_PORT` | Backend | `8000` | `8000` | Listening port for API server. |
| `NEXUS_CORS_ORIGINS` | Backend | `""` | `https://app.nexus-demand.com` | Comma-separated allowed browser origins. |
| `NEXUS_ARTIFACTS_DIR` | Backend | `artifacts/models` | `/app/artifacts/models` | Absolute or relative path to model weights. |
| `NEXUS_REQUEST_TIMEOUT_SEC` | Backend | `30.0` | `30.0` | Execution timeout for inference requests. |

---

## 5. Security & Data Governance

1. **No Raw Datasets in Production**:
   - The raw retail training data (`data/raw/*.csv`, ~421,000 rows) is **strictly excluded** from container images and web distributions.
   - The backend runs inference using exclusively the lightweight pre-origin context file (`historical_context.csv`, 124 weeks up to $T_0$) and out-of-time exogenous calendar indicators (`test_covariates.csv`).
2. **CORS Hardening**:
   - In production, wildcards (`*`) are disallowed. Set `NEXUS_CORS_ORIGINS` strictly to your production frontend domains.
3. **Audit and Health Monitoring**:
   - Automated health monitoring must poll `GET /api/health`. An HTTP 200 response with `"status": "healthy"` confirms that all 15 models, scalers, and tensors are mounted and valid.

---

## 6. Verification & Smoke Test Checklist

Following any deployment, execute the following operational smoke test:

```bash
# 1. Verify backend health
curl -s https://api.your-domain.com/api/health | jq .status
# Expected: "healthy"

# 2. Verify model catalog
curl -s https://api.your-domain.com/api/models | jq 'length'
# Expected: 10

# 3. Verify real forecast generation (Store 20, Dept 72, 12 weeks)
curl -s -X POST https://api.your-domain.com/api/forecast/generate \
  -H "Content-Type: application/json" \
  -d '{"store_id": 20, "dept_id": 72, "horizon_weeks": 12, "protocol": "recursive_multistep", "model_id": "proposed-hybrid"}' \
  | jq '.status, .model_name, .projected_total_sales, .uncertainty.calibrated'
# Expected: "Completed", "Hybrid D...", positive number, false

# 4. Verify rejection of unsupported series
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.your-domain.com/api/forecast/generate \
  -H "Content-Type: application/json" \
  -d '{"store_id": 99, "dept_id": 99, "horizon_weeks": 12, "protocol": "recursive_multistep", "model_id": "proposed-hybrid"}'
# Expected: 400
```
