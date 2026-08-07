from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class ExplainRiskRequest(BaseModel):
    district: str
    risk: str
    rainfall: float
    extraction: float
    recharge: float
    water_level: float

class ExplainRiskResponse(BaseModel):
    response: str
    timestamp: str

class GenerateReportRequest(BaseModel):
    districts: List[Dict[str, Any]]

class GenerateReportResponse(BaseModel):
    response: str
    timestamp: str

class RecommendationSummaryRequest(BaseModel):
    recommendations: List[Dict[str, Any]]

class RecommendationSummaryResponse(BaseModel):
    response: str
    timestamp: str

class SummarizeDistrictRequest(BaseModel):
    district_name: str
    data: Dict[str, Any]

class SummarizeDistrictResponse(BaseModel):
    response: str
    timestamp: str

class ForecastRequest(BaseModel):
    district: str
    historical_months: Optional[int] = 12
    rainfall_trend_pct: Optional[float] = 0.0
    extraction_change_pct: Optional[float] = 0.0

class ForecastPoint(BaseModel):
    date: str
    historical: Optional[float] = None
    forecast: Optional[float] = None
    lower_ci: Optional[float] = None
    upper_ci: Optional[float] = None
    recharge_factor: float

class ForecastResponse(BaseModel):
    district: str
    current_depth_mbgl: float
    predicted_90d_depth_mbgl: float
    trend_status: str
    time_series: List[ForecastPoint]
    ai_explanation: Optional[str] = None
    timestamp: str

