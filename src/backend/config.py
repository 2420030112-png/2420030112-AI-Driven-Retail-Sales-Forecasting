"""
NEXUS Backend Configuration Module.
Environment-based configuration for ports, host, CORS origins, and artifact directories.
"""

import os
import sys
from pathlib import Path
from typing import List

# Find repository root dynamically
REPO_ROOT = Path(__file__).resolve().parents[2]

# Environment Mode
NEXUS_ENV = os.getenv("NEXUS_ENV", "development").lower()

# Server Settings
NEXUS_API_HOST = os.getenv("NEXUS_API_HOST", "127.0.0.1")
NEXUS_API_PORT = int(os.getenv("NEXUS_API_PORT", "8000"))
NEXUS_REQUEST_TIMEOUT_SEC = float(os.getenv("NEXUS_REQUEST_TIMEOUT_SEC", "30.0"))

# Artifacts Directory (supports relative or absolute paths)
raw_artifacts_dir = os.getenv("NEXUS_ARTIFACTS_DIR", "artifacts/models")
_candidate_path = Path(raw_artifacts_dir)
if _candidate_path.is_absolute():
    NEXUS_ARTIFACTS_DIR = _candidate_path
else:
    NEXUS_ARTIFACTS_DIR = (REPO_ROOT / raw_artifacts_dir).resolve()

# Configured CORS Origins
raw_cors = os.getenv("NEXUS_CORS_ORIGINS", "")
if raw_cors.strip():
    CORS_ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]
else:
    # Explicit development origins
    CORS_ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
