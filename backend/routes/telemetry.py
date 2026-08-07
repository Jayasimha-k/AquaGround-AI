import asyncio
import random
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

router = APIRouter(prefix="/api/telemetry", tags=["DWLR Telemetry"])

class DWLRStation(BaseModel):
    station_id: str
    name: str
    district: str
    state: str
    water_level_mbgl: float
    battery_pct: float
    temperature_c: float
    signal_dbm: int
    status: str # Normal, Warning, Critical, Fault
    last_updated: str

SAMPLE_STATIONS = [
    {"station_id": "DWLR-RJ-001", "name": "Jaipur City South", "district": "Jaipur", "state": "Rajasthan", "base_depth": 18.4},
    {"station_id": "DWLR-RJ-002", "name": "Jodhpur Rural Block", "district": "Jodhpur", "state": "Rajasthan", "base_depth": 24.1},
    {"station_id": "DWLR-PB-001", "name": "Ludhiana Central", "district": "Ludhiana", "state": "Punjab", "base_depth": 22.8},
    {"station_id": "DWLR-KA-001", "name": "Bengaluru Urban Kengeri", "district": "Bengaluru", "state": "Karnataka", "base_depth": 14.2},
    {"station_id": "DWLR-TN-001", "name": "Coimbatore North", "district": "Coimbatore", "state": "Tamil Nadu", "base_depth": 11.7},
    {"station_id": "DWLR-UP-001", "name": "Agra East Block", "district": "Agra", "state": "Uttar Pradesh", "base_depth": 15.9},
    {"station_id": "DWLR-GJ-001", "name": "Ahmedabad Rural", "district": "Ahmedabad", "state": "Gujarat", "base_depth": 19.3},
    {"station_id": "DWLR-MH-001", "name": "Latur Central", "district": "Latur", "state": "Maharashtra", "base_depth": 21.5},
]

def generate_telemetry_snapshot() -> List[Dict[str, Any]]:
    snapshot = []
    for s in SAMPLE_STATIONS:
        fluctuation = (random.random() - 0.5) * 0.15
        depth = round(max(1.0, s["base_depth"] + fluctuation), 2)
        battery = round(max(10.0, 95.0 - random.random() * 5), 1)
        temp = round(26.0 + random.random() * 6, 1)
        signal = -65 + random.randint(-15, 10)
        
        if depth > 22.0:
            status = "Critical"
        elif depth > 15.0:
            status = "Warning"
        elif battery < 20.0:
            status = "Fault"
        else:
            status = "Normal"
            
        snapshot.append({
            "station_id": s["station_id"],
            "name": s["name"],
            "district": s["district"],
            "state": s["state"],
            "water_level_mbgl": depth,
            "battery_pct": battery,
            "temperature_c": temp,
            "signal_dbm": signal,
            "status": status,
            "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        })
    return snapshot

@router.get("/stations", response_model=List[DWLRStation])
async def get_telemetry_stations():
    return generate_telemetry_snapshot()

@router.websocket("/stream")
async def websocket_telemetry_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = generate_telemetry_snapshot()
            await websocket.send_json({
                "type": "TELEMETRY_TICK",
                "timestamp": datetime.utcnow().isoformat(),
                "stations": data
            })
            await asyncio.sleep(3.0)  # Stream update every 3 seconds
    except WebSocketDisconnect:
        pass
