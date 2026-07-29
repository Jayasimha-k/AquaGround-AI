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
        self.models_to_try = [
            settings.gemini_model,
            "gemini-flash-latest",
            "gemini-2.0-flash-lite",
            "gemini-2.5-flash-lite"
        ]
        
        if self.enabled:
            logger.info("Initializing Gemini API with configured key.")
            genai.configure(api_key=self.api_key)
            self._init_primary_model()
        else:
            logger.warning("Gemini API key is not configured. Running in Mock fallback mode.")
            self.model = None

    def _init_primary_model(self):
        for m_name in self.models_to_try:
            try:
                self.model = genai.GenerativeModel(
                    model_name=m_name,
                    system_instruction=SYSTEM_PROMPT
                )
                self.current_model_name = m_name
                logger.info(f"Successfully initialized Gemini model: {m_name}")
                return
            except Exception as e:
                logger.warning(f"Failed to init model {m_name}: {e}")
        self.model = None

    def _generate(self, prompt: str) -> str:
        if not self.enabled:
            raise RuntimeError("Gemini API disabled")
            
        last_exception = None
        for m_name in self.models_to_try:
            try:
                model = genai.GenerativeModel(
                    model_name=m_name,
                    system_instruction=SYSTEM_PROMPT
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text
            except Exception as e:
                last_exception = e
                logger.warning(f"Gemini generation with model {m_name} failed: {e}")
        
        raise last_exception or RuntimeError("All Gemini models failed")

    async def chat(self, message: str, history: list = None) -> str:
        if not self.enabled:
            return f"AquaGround AI Assistant (Simulation Mode): Analyzing telemetry for '{message}'. Ground water telemetry shows heightened extractions across agricultural belts."
        
        try:
            prompt = CHAT_PROMPT_TEMPLATE.format(message=message)
            return self._generate(prompt)
        except Exception as e:
            logger.error(f"Gemini chat API error: {e}")
            return f"AquaGround AI Assistant: Analyzed query '{message}'. Telemetry data indicates regional groundwater stress. Suggested intervention: Restrict non-essential tube-well extractions and monitor DWLR telemetry nodes."

    async def explain_risk(self, district: str, risk: str, rainfall: float, extraction: float, recharge: float, water_level: float) -> str:
        if not self.enabled:
            return f"Explaining risk for {district} ({risk}): Extraction is {extraction} MCM/yr against Recharge of {recharge} MCM/yr. Deficit: {round(extraction - recharge, 2)} MCM. Water table stands at {water_level}m BGL with {rainfall}mm rainfall."

        try:
            prompt = EXPLAIN_RISK_TEMPLATE.format(
                district=district,
                risk=risk,
                rainfall=rainfall,
                extraction=extraction,
                recharge=recharge,
                water_level=water_level
            )
            return self._generate(prompt)
        except Exception as e:
            logger.error(f"Gemini explain_risk API error: {e}")
            deficit = round(extraction - recharge, 2)
            return f"Groundwater Risk Analysis for {district} ({risk}):\n- Groundwater Depth: {water_level}m BGL\n- Annual Extraction: {extraction} MCM/yr\n- Annual Recharge: {recharge} MCM/yr\n- Net Annual Deficit: {deficit} MCM/yr\n\nRecommendation: Urgent deployment of artificial check-dam structures and strict monitoring of agricultural tube-wells."

    async def generate_report(self, districts: list) -> str:
        if not self.enabled:
            summary = "\n".join([f"- {d.get('name')}: Depth {d.get('groundwaterDepth')}m, Risk {d.get('riskLevel')}" for d in districts])
            return f"Executive Groundwater Audit Report:\n\n1. Executive Summary\nMonitored {len(districts)} districts. Deficit trends are prominent in crop irrigation belts.\n\n2. Aquifer Resource Deficit Audit\n{summary}\n\n3. Directives & Recommendations\nImplement artificial check-dams and restrict new borewells."

        try:
            data_summary = "\n".join([
                f"District: {d.get('name')}, State: {d.get('state')}, Risk: {d.get('riskLevel')}, Depth: {d.get('groundwaterDepth')}m BGL, Extraction: {d.get('extractionRate')} MCM/yr, Recharge: {d.get('rechargeRate')} MCM/yr"
                for d in districts
            ])
            prompt = GENERATE_REPORT_TEMPLATE.format(data_summary=data_summary)
            return self._generate(prompt)
        except Exception as e:
            logger.error(f"Gemini generate_report API error: {e}")
            summary = "\n".join([f"- {d.get('name')} ({d.get('riskLevel')}): Depth {d.get('groundwaterDepth')}m BGL, Extraction {d.get('extractionRate')} MCM/yr" for d in districts])
            return f"Executive Groundwater Audit Report:\n\n1. Executive Overview:\nEvaluated telemetry data across {len(districts)} key observation districts.\n\n2. Regional Status:\n{summary}\n\n3. Directives:\nAccelerate rainwater harvesting projects in over-exploited blocks."

    async def summarize_recommendations(self, recommendations: list) -> str:
        if not self.enabled:
            recs = "\n".join([f"- {r.get('districtName')}: {r.get('summary')} (Priority: {r.get('priority')})" for r in recommendations])
            return f"Recommendations Summary:\n\nHighly critical directives list:\n{recs}\n\nValidate and dispatch check-dam structures."

        try:
            recs_list = "\n".join([
                f"District: {r.get('districtName')}, Priority: {r.get('priority')}, Summary: {r.get('summary')}, Details: {r.get('details')}"
                for r in recommendations
            ])
            prompt = RECOMMENDATION_SUMMARY_TEMPLATE.format(recommendations_list=recs_list)
            return self._generate(prompt)
        except Exception as e:
            logger.error(f"Gemini summarize_recommendations API error: {e}")
            recs = "\n".join([f"- {r.get('districtName')}: {r.get('summary')} ({r.get('priority')} Priority)" for r in recommendations])
            return f"Action Directive Recommendations Summary:\n\nKey Interventions:\n{recs}"

    async def summarize_district(self, district_name: str, data: dict) -> str:
        if not self.enabled:
            return f"Telemetry summary for {district_name}:\nWater depth is {data.get('groundwaterDepth')}m BGL with a {data.get('trend')} trend. Active DWLR nodes count: {data.get('activeSensors')}. Offline: {data.get('offlineSensors')}."

        try:
            district_data = "\n".join([f"{k}: {v}" for k, v in data.items() if k not in ['waterLevelHistory', 'alerts']])
            prompt = SUMMARIZE_DISTRICT_TEMPLATE.format(district_name=district_name, district_data=district_data)
            return self._generate(prompt)
        except Exception as e:
            logger.error(f"Gemini summarize_district API error: {e}")
            return f"Telemetry Summary for {district_name}:\nGroundwater Depth: {data.get('groundwaterDepth')}m BGL. Trend: {data.get('trend')}. Monitored by {data.get('activeSensors')} active IoT sensor nodes."

# Instantiate a single service instance
gemini_service = GeminiService()
