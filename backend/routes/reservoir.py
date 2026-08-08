# =============================================================================
# reservoir.py — FastAPI router for live reservoir storage data
# GET /api/v1/reservoirs  → returns list of ReservoirData
# =============================================================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.reservoir_service import fetch_reservoir_data

router = APIRouter(prefix="/api/v1", tags=["reservoirs"])


# ── Response Schema ───────────────────────────────────────────────────────────
class ReservoirOut(BaseModel):
    id: str
    name: str
    state: str
    river: str
    lat: float
    lng: float
    totalCapacity: float
    frlStorage: float
    liveStorage: float
    levelPercent: float
    lastUpdated: str


# ── Route ─────────────────────────────────────────────────────────────────────
@router.get("/reservoirs", response_model=list[ReservoirOut], summary="Live Indian reservoir storage levels")
async def get_reservoirs():
    """
    Returns live storage levels for major Indian dams/reservoirs.

    Data is sourced from the Central Water Commission (CWC) Reservoir
    Storage Monitoring System (RSMS). If the live API is unavailable,
    a curated static fallback dataset is returned so the map overlay
    always has data to display.
    """
    try:
        data = await fetch_reservoir_data()
        return data
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Reservoir service error: {exc}") from exc
