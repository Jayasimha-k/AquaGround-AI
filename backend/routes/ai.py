from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.schemas import (
    ChatRequest, ChatResponse,
    ExplainRiskRequest, ExplainRiskResponse,
    GenerateReportRequest, GenerateReportResponse,
    RecommendationSummaryRequest, RecommendationSummaryResponse,
    SummarizeDistrictRequest, SummarizeDistrictResponse
)
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        reply = await gemini_service.chat(request.message, request.history)
        return ChatResponse(
            response=reply,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-risk", response_model=ExplainRiskResponse)
async def explain_risk(request: ExplainRiskRequest):
    try:
        reply = await gemini_service.explain_risk(
            district=request.district,
            risk=request.risk,
            rainfall=request.rainfall,
            extraction=request.extraction,
            recharge=request.recharge,
            water_level=request.water_level
        )
        return ExplainRiskResponse(
            response=reply,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-report", response_model=GenerateReportResponse)
async def generate_report(request: GenerateReportRequest):
    try:
        reply = await gemini_service.generate_report(request.districts)
        return GenerateReportResponse(
            response=reply,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendation-summary", response_model=RecommendationSummaryResponse)
async def recommendation_summary(request: RecommendationSummaryRequest):
    try:
        reply = await gemini_service.summarize_recommendations(request.recommendations)
        return RecommendationSummaryResponse(
            response=reply,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize-district", response_model=SummarizeDistrictResponse)
async def summarize_district(request: SummarizeDistrictRequest):
    try:
        reply = await gemini_service.summarize_district(request.district_name, request.data)
        return SummarizeDistrictResponse(
            response=reply,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
