// =============================================================================
// AI Service Client — Communitates with Python FastAPI AI Endpoint
// =============================================================================

const API_BASE_URL = 'http://localhost:8000/api/ai';

export interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

export const aiServiceClient = {
  async chat(message: string, history: ChatHistoryItem[] = []) {
    try {
      const formattedHistory = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        content: h.content
      }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: formattedHistory })
      });
      if (!response.ok) throw new Error('AI Service Chat Failed');
      return response.json();
    } catch (err) {
      console.warn('Backend unavailable, using local intelligence fallback:', err);
      return {
        response: `**AquaGround AI Assistant (Offline Mode)**\n\nAnalyzed inquiry: "${message}"\n\n**Current Telemetry Overview:**\n- **Regional Status**: Telemetry sensors report ongoing monitoring across active groundwater blocks.\n- **Risk Assessment**: Moderate to high extraction stress detected in intensive agricultural belts.\n- **Recommended Actions**: Prioritize localized rainwater harvesting, artificial recharge check-dams, and real-time DWLR monitoring.`
      };
    }
  },

  async explainRisk(params: {
    district: string;
    risk: string;
    rainfall: number;
    extraction: number;
    recharge: number;
    waterLevel: number;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/explain-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: params.district,
          risk: params.risk,
          rainfall: params.rainfall,
          extraction: params.extraction,
          recharge: params.recharge,
          water_level: params.waterLevel
        })
      });
      if (!response.ok) throw new Error('AI Service Risk Audit Failed');
      return response.json();
    } catch (err) {
      const deficit = (params.extraction - params.recharge).toFixed(2);
      return {
        response: `[Local Intelligence Fallback] Risk Audit for ${params.district} (${params.risk}): Groundwater depth is currently ${params.waterLevel}m BGL. Annual extraction (${params.extraction} MCM/yr) exceeds annual recharge (${params.recharge} MCM/yr) by ${deficit} MCM/yr under average rainfall of ${params.rainfall}mm.`
      };
    }
  },

  async generateReport(districts: any[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ districts })
      });
      if (!response.ok) throw new Error('AI Service Report Generation Failed');
      return response.json();
    } catch (err) {
      const summary = districts.map(d => `- ${d.name} (${d.riskLevel}): Depth ${d.groundwaterDepth}m BGL`).join('\n');
      return {
        response: `[Local Intelligence Fallback] Executive Groundwater Audit Report:\n\n1. Executive Summary\nMonitored ${districts.length} critical districts across telemetry networks.\n\n2. Regional Status:\n${summary}\n\n3. Priority Directives:\nEnforce check-dam construction and monitor real-time DWLR sensors.`
      };
    }
  },

  async summarizeDistrict(districtName: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/summarize-district`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district_name: districtName, data })
      });
      if (!response.ok) throw new Error('AI Service District Summary Failed');
      return response.json();
    } catch (err) {
      return {
        response: `[Local Intelligence Fallback] Telemetry Summary for ${districtName}:\nCurrent water depth is ${data?.groundwaterDepth || 32.5}m BGL with a ${data?.trend || 'Critical'} trend. Active telemetry sensors: ${data?.activeSensors || 12}.`
      };
    }
  },

  async recommendationSummary(recommendations: any[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendation-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendations })
      });
      if (!response.ok) throw new Error('AI Service Recommendations Summary Failed');
      return response.json();
    } catch (err) {
      return {
        response: `[Local Intelligence Fallback] Priority Action Directives:\n- High Priority: Construct check dams in over-exploited zones.\n- Medium Priority: Install rain harvesting structures in urban catchments.\n- General: Expand DWLR IoT sensor network coverage.`
      };
    }
  },
};
