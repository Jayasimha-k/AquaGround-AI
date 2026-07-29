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
