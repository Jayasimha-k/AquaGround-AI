import logging
import google.generativeai as genai
from config.settings import settings
from utils.prompts import (
    SYSTEM_PROMPT, CHAT_PROMPT_TEMPLATE, EXPLAIN_RISK_TEMPLATE,
    GENERATE_REPORT_TEMPLATE, RECOMMENDATION_SUMMARY_TEMPLATE,
    SUMMARIZE_DISTRICT_TEMPLATE
)

logger = logging.getLogger("aquaground_ai.gemini_service")
logging.basicConfig(level=logging.INFO)

class GeminiService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.enabled = bool(self.api_key and "YOUR_GEMINI_API_KEY" not in self.api_key)
        
        if self.enabled:
            logger.info("Initializing Gemini API with configured key.")
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=SYSTEM_PROMPT
            )
        else:
            logger.warning("Gemini API key is not configured. Running in Mock fallback mode.")
            self.model = None

    async def chat(self, message: str, history: list = None) -> str:
        if not self.enabled:
            return f"[Mock Mode] AquaGround AI Assistant: Received message '{message}'. Configured model 'gemini-1.5-flash' is running in simulation mode because GEMINI_API_KEY is not set."
        
        try:
            prompt = CHAT_PROMPT_TEMPLATE.format(message=message)
            # Standard chat session simulation or simple generation
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini chat API error: {e}", exc_info=True)
            return f"An error occurred while communicating with the AI Service: {str(e)}"

    async def explain_risk(self, district: str, risk: str, rainfall: float, extraction: float, recharge: float, water_level: float) -> str:
        if not self.enabled:
            return f"[Mock Mode] Explaining risk for {district} ({risk}): Extraction is {extraction} MCM/yr against Recharge of {recharge} MCM/yr. Deficit: {round(extraction - recharge, 2)} MCM. Water table stands at {water_level}m BGL with {rainfall}mm rainfall."

        try:
            prompt = EXPLAIN_RISK_TEMPLATE.format(
                district=district,
                risk=risk,
                rainfall=rainfall,
                extraction=extraction,
                recharge=recharge,
                water_level=water_level
            )
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini explain_risk API error: {e}", exc_info=True)
            return f"Error compiling risk report: {str(e)}"

    async def generate_report(self, districts: list) -> str:
        if not self.enabled:
            summary = "\n".join([f"- {d.get('name')}: Depth {d.get('groundwaterDepth')}m, Risk {d.get('riskLevel')}" for d in districts])
            return f"[Mock Mode] Executive Groundwater Audit Report:\n\n1. Executive Summary\nMonitored {len(districts)} districts. Deficit trends are prominent in crop irrigation belts.\n\n2. Aquifer Resource Deficit Audit\n{summary}\n\n3. Directives & Recommendations\nImplement artificial check-dams and restrict new borewells."

        try:
            data_summary = "\n".join([
                f"District: {d.get('name')}, State: {d.get('state')}, Risk: {d.get('riskLevel')}, Depth: {d.get('groundwaterDepth')}m BGL, Extraction: {d.get('extractionRate')} MCM/yr, Recharge: {d.get('rechargeRate')} MCM/yr"
                for d in districts
            ])
            prompt = GENERATE_REPORT_TEMPLATE.format(data_summary=data_summary)
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini generate_report API error: {e}", exc_info=True)
            return f"Error compiling executive summary report: {str(e)}"

    async def summarize_recommendations(self, recommendations: list) -> str:
        if not self.enabled:
            recs = "\n".join([f"- {r.get('districtName')}: {r.get('summary')} (Priority: {r.get('priority')})" for r in recommendations])
            return f"[Mock Mode] Recommendations Summary:\n\nHighly critical directives list:\n{recs}\n\nValidate and dispatch check-dam structures."

        try:
            recs_list = "\n".join([
                f"District: {r.get('districtName')}, Priority: {r.get('priority')}, Summary: {r.get('summary')}, Details: {r.get('details')}"
                for r in recommendations
            ])
            prompt = RECOMMENDATION_SUMMARY_TEMPLATE.format(recommendations_list=recs_list)
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini summarize_recommendations API error: {e}", exc_info=True)
            return f"Error summarizing directives: {str(e)}"

    async def summarize_district(self, district_name: str, data: dict) -> str:
        if not self.enabled:
            return f"[Mock Mode] Telemetry summary for {district_name}:\nWater depth is {data.get('groundwaterDepth')}m BGL with a {data.get('trend')} trend. Active DWLR nodes count: {data.get('activeSensors')}. Offline: {data.get('offlineSensors')}."

        try:
            district_data = "\n".join([f"{k}: {v}" for k, v in data.items() if k not in ['waterLevelHistory', 'alerts']])
            prompt = SUMMARIZE_DISTRICT_TEMPLATE.format(district_name=district_name, district_data=district_data)
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini summarize_district API error: {e}", exc_info=True)
            return f"Error compiling district summary: {str(e)}"

# Instantiate a single service instance
gemini_service = GeminiService()
