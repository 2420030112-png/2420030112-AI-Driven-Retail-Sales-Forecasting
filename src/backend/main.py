"""
NEXUS Real Forecast Inference FastAPI Application Entry Point.
Provides authenticated, validated endpoints for model health, benchmark series discovery,
model catalog, and zero-leakage forecast inference.
"""

import sys
import time
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("nexus.api")

# Ensure paths
repo_root = Path(__file__).resolve().parents[2]
ml_dir = repo_root / "src" / "ml"
if str(ml_dir) not in sys.path:
    sys.path.insert(0, str(ml_dir))

from .config import (
    CORS_ALLOWED_ORIGINS,
    NEXUS_ENV,
    NEXUS_API_HOST,
    NEXUS_API_PORT,
    NEXUS_ARTIFACTS_DIR
)
from .model_registry import ModelRegistry
from .routes import health, models, benchmark, forecast


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and preload registry on startup
    logger.info(f"Starting NEXUS Backend in '{NEXUS_ENV}' mode on {NEXUS_API_HOST}:{NEXUS_API_PORT}")
    logger.info(f"Configured artifacts directory: {NEXUS_ARTIFACTS_DIR}")
    registry = ModelRegistry.get_instance()
    audit = registry.check_health()
    logger.info(
        f"Health check status: {audit['status']}. "
        f"Artifacts present: {sum(audit['artifacts_present'].values())}/{len(audit['artifacts_present'])}. "
        f"Benchmark series: {audit['benchmark_cohort_series_count']}"
    )
    yield
    logger.info("NEXUS Backend shutting down gracefully.")


app = FastAPI(
    title="NEXUS Forecast Inference API",
    description=(
        "Production-grade FastAPI backend for NEXUS Demand Intelligence. "
        "Connected directly to authentic trained machine learning models with "
        "strict separation between rolling 1-step and fixed-origin recursive multi-step forecasting."
    ),
    version="4.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware with explicit development and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Logs incoming requests with execution duration."""
    start_time = time.time()
    try:
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000.0, 2)
        logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")
        return response
    except Exception as exc:
        duration_ms = round((time.time() - start_time) * 1000.0, 2)
        logger.error(f"{request.method} {request.url.path} FAILED: {exc} ({duration_ms}ms)")
        raise exc


# Register routers
app.include_router(health.router)
app.include_router(models.router)
app.include_router(benchmark.router)
app.include_router(forecast.router)


@app.get("/", tags=["System"])
def root():
    return JSONResponse({
        "service": "NEXUS Forecast Inference API",
        "version": "4.0.0",
        "phase": "Phase 4 & 5 — Real Forecast Inference & Deployment Readiness",
        "environment": NEXUS_ENV,
        "documentation": "/docs",
        "endpoints": [
            "/api/health",
            "/api/models",
            "/api/benchmark-series",
            "/api/benchmark-series/validate",
            "/api/forecast/generate",
        ],
        "status": "OPERATIONAL"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.backend.main:app", host=NEXUS_API_HOST, port=NEXUS_API_PORT, reload=True)
