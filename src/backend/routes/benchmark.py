"""
Benchmark Cohort discovery and validation endpoints for NEXUS Backend.
"""

from fastapi import APIRouter, Query
from ..model_registry import (
    ModelRegistry,
    BENCHMARK_STORES_META,
    BENCHMARK_DEPTS_META
)
from ..schemas import (
    BenchmarkSeriesResponse,
    StoreInfo,
    DeptInfo,
)

router = APIRouter(prefix="/api/benchmark-series", tags=["Benchmark Cohort"])


@router.get("", response_model=BenchmarkSeriesResponse)
def get_benchmark_series():
    """
    Returns the 20 evaluated benchmark series across 5 stores and 4 departments.
    """
    stores = [
        StoreInfo(id=sid, name=m["name"], type=m["type"], region=m["region"])
        for sid, m in BENCHMARK_STORES_META.items()
    ]
    depts = [
        DeptInfo(id=did, name=m["name"], category=m["category"])
        for did, m in BENCHMARK_DEPTS_META.items()
    ]

    pairs = []
    for s in BENCHMARK_STORES_META.keys():
        for d in BENCHMARK_DEPTS_META.keys():
            pairs.append({"store_id": s, "dept_id": d})

    return BenchmarkSeriesResponse(
        supported_stores=stores,
        supported_departments=depts,
        benchmark_pairs=pairs,
        disclaimer=(
            "Machine learning models are trained and verified on the standardized 20-series cohort "
            "(Stores 1, 10, 14, 20, 35; Departments 1, 7, 72, 92). Real model inference is guaranteed "
            "for all 20 combinations across both recursive multi-step and 1-step rolling protocols."
        )
    )


@router.get("/validate")
def validate_series(
    store_id: int = Query(..., description="Store ID"),
    dept_id: int = Query(..., description="Department ID")
):
    """
    Validates whether a specific store and department combination is supported.
    """
    registry = ModelRegistry.get_instance()
    is_supported = registry.is_benchmark_cohort(store_id, dept_id)

    if is_supported:
        s_meta = registry.get_store_meta(store_id)
        d_meta = registry.get_dept_meta(dept_id)
        return {
            "is_supported": True,
            "store_id": store_id,
            "dept_id": dept_id,
            "store_name": s_meta["name"],
            "dept_name": d_meta["name"],
            "message": "Series belongs to the verified 20-series benchmark cohort. Ready for real inference."
        }
    else:
        return {
            "is_supported": False,
            "store_id": store_id,
            "dept_id": dept_id,
            "message": (
                f"Store {store_id} — Dept {dept_id} is outside the trained benchmark cohort. "
                "Supported Stores: [1, 10, 14, 20, 35]. Supported Departments: [1, 7, 72, 92]."
            )
        }
