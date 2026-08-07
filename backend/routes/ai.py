from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.schemas import (
    ChatRequest, ChatResponse,
    ExplainRiskRequest, ExplainRiskResponse,
    GenerateReportRequest, GenerateReportResponse,
    RecommendationSummaryRequest, RecommendationSummaryResponse,
    SummarizeDistrictRequest, SummarizeDistrictResponse,
    ForecastRequest, ForecastResponse
)
from services.gemini_service import gemini_service
from services.forecasting_service import forecasting_service

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

@router.post("/forecast", response_model=ForecastResponse)
async def get_forecast(request: ForecastRequest):
    try:
        forecast_data = forecasting_service.generate_forecast(
            district=request.district,
            rainfall_trend_pct=request.rainfall_trend_pct or 0.0,
            extraction_change_pct=request.extraction_change_pct or 0.0
        )
        
        # Try to enrich with Gemini XAI explanation if available
        try:
            xai_prompt = (
                f"Explain the 90-day groundwater forecast for district '{request.district}'. "
                f"Current depth: {forecast_data['current_depth_mbgl']}m bgl. "
                f"Predicted 90-day depth: {forecast_data['predicted_90d_depth_mbgl']}m bgl. "
                f"Trend status: {forecast_data['trend_status']}. "
                f"Rainfall factor: {request.rainfall_trend_pct}%, Extraction factor: {request.extraction_change_pct}%. "
                f"Provide concise CGWB Hydrogeologist explanation and 2 specific policy mitigation actions."
            )
            explanation = await gemini_service.chat(xai_prompt)
        except Exception:
            explanation = (
                f"Statistical regression models project {request.district}'s groundwater depth shifting from "
                f"{forecast_data['current_depth_mbgl']}m bgl to {forecast_data['predicted_90d_depth_mbgl']}m bgl over the next 90 days. "
                f"Status: {forecast_data['trend_status']}. Recommended action: Deploy artificial recharge check dams and promote micro-irrigation."
            )
            
        forecast_data["ai_explanation"] = explanation
        forecast_data["timestamp"] = datetime.utcnow().isoformat()
        return forecast_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

