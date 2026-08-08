# =============================================================================
# river.py — FastAPI router for live river discharge & flow telemetry
# GET /api/v1/rivers → returns list of RiverData
# =============================================================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
from services.river_service import fetch_river_data

router = APIRouter(prefix="/api/v1", tags=["rivers"])


class RiverOut(BaseModel):
    id: str
    name: str
    state: str
    riverBasin: str
    lengthKm: int
    currentDischargeCumecs: float
    normalDischargeCumecs: float
    waterLevelMeters: float
    dangerLevelMeters: float
    flowStatus: str
    wqi: int
    path: list[list[float]]
    lastUpdated: str | None = None


@router.get("/rivers", response_model=list[RiverOut], summary="Live Indian River Discharge & Telemetry")
async def get_rivers():
    """
    Returns live discharge rates, water gauge levels, and basin telemetry
    for major Indian rivers from Central Water Commission (CWC) telemetry network.
    """
    try:
        return await fetch_river_data()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"River telemetry error: {exc}") from exc
