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
  },

  async explainRisk(params: {
    district: string;
    risk: string;
    rainfall: number;
    extraction: number;
    recharge: number;
    waterLevel: number;
  }) {
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
  },

  async generateReport(districts: any[]) {
    const response = await fetch(`${API_BASE_URL}/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ districts })
    });
    if (!response.ok) throw new Error('AI Service Report Generation Failed');
    return response.json();
  },

  async summarizeDistrict(districtName: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/summarize-district`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district_name: districtName, data })
    });
    if (!response.ok) throw new Error('AI Service District Summary Failed');
    return response.json();
  },

  async recommendationSummary(recommendations: any[]) {
    const response = await fetch(`${API_BASE_URL}/recommendation-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendations })
    });
    if (!response.ok) throw new Error('AI Service Recommendations Summary Failed');
    return response.json();
  },
};
