// =============================================================================
// AquaGround AI — Mock Data
// Comprehensive realistic data for all entities
// =============================================================================

import type {
  District, Sensor, Alert, Prediction, AIRecommendation,
  DecisionRecord, Report, User, WaterLevelReading
} from '@/types';

// ── Helper ────────────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function generateWaterLevelHistory(base: number, count: number = 24): WaterLevelReading[] {
  return Array.from({ length: count }, (_, i) => {
    const variation = (Math.random() - 0.4) * 0.5;
    return {
      timestamp: daysAgo(count - i),
      depth: +(base + variation * i * 0.1).toFixed(2),
      extraction: +(Math.random() * 2 + 1).toFixed(2),
      recharge: +(Math.random() * 1.5 + 0.5).toFixed(2),
      rainfall: +(Math.random() * 15).toFixed(1),
    };
  });
}

// ── Districts ─────────────────────────────────────────────────────────────────
export const MOCK_DISTRICTS: District[] = [
  {
    id: 'dist-001',
    name: 'Jhansi',
    state: 'Uttar Pradesh',
    coordinates: { lat: 25.4484, lng: 78.5685 },
    healthScore: 28,
    riskLevel: 'critical',
    trend: 'down',
    rainfall: 412,
    groundwaterDepth: 34.2,
    extractionRate: 8.4,
    rechargeRate: 2.1,
    activeSensors: 12,
    offlineSensors: 3,
    totalSensors: 15,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(34, 30),
    lastUpdated: hoursAgo(1),
  },
  {
    id: 'dist-002',
    name: 'Bikaner',
    state: 'Rajasthan',
    coordinates: { lat: 28.0229, lng: 73.3119 },
    healthScore: 22,
    riskLevel: 'critical',
    trend: 'down',
    rainfall: 281,
    groundwaterDepth: 58.7,
    extractionRate: 11.2,
    rechargeRate: 1.3,
    activeSensors: 8,
    offlineSensors: 5,
    totalSensors: 13,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(58, 30),
    lastUpdated: hoursAgo(2),
  },
  {
    id: 'dist-003',
    name: 'Jodhpur',
    state: 'Rajasthan',
    coordinates: { lat: 26.2389, lng: 73.0243 },
    healthScore: 31,
    riskLevel: 'critical',
    trend: 'down',
    rainfall: 310,
    groundwaterDepth: 47.3,
    extractionRate: 9.8,
    rechargeRate: 2.0,
    activeSensors: 14,
    offlineSensors: 2,
    totalSensors: 16,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(47, 30),
    lastUpdated: hoursAgo(1),
  },
  {
    id: 'dist-004',
    name: 'Ludhiana',
    state: 'Punjab',
    coordinates: { lat: 30.901, lng: 75.8573 },
    healthScore: 38,
    riskLevel: 'high',
    trend: 'down',
    rainfall: 524,
    groundwaterDepth: 28.4,
    extractionRate: 12.3,
    rechargeRate: 4.1,
    activeSensors: 18,
    offlineSensors: 1,
    totalSensors: 19,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(28, 30),
    lastUpdated: hoursAgo(0.5),
  },
  {
    id: 'dist-005',
    name: 'Amritsar',
    state: 'Punjab',
    coordinates: { lat: 31.634, lng: 74.8723 },
    healthScore: 41,
    riskLevel: 'high',
    trend: 'down',
    rainfall: 598,
    groundwaterDepth: 22.1,
    extractionRate: 10.8,
    rechargeRate: 3.9,
    activeSensors: 16,
    offlineSensors: 0,
    totalSensors: 16,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(22, 30),
    lastUpdated: hoursAgo(1),
  },
  {
    id: 'dist-006',
    name: 'Nashik',
    state: 'Maharashtra',
    coordinates: { lat: 19.9975, lng: 73.7898 },
    healthScore: 54,
    riskLevel: 'moderate',
    trend: 'stable',
    rainfall: 690,
    groundwaterDepth: 14.6,
    extractionRate: 6.2,
    rechargeRate: 5.8,
    activeSensors: 21,
    offlineSensors: 2,
    totalSensors: 23,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(14, 30),
    lastUpdated: hoursAgo(2),
  },
  {
    id: 'dist-007',
    name: 'Warangal',
    state: 'Telangana',
    coordinates: { lat: 17.9689, lng: 79.5941 },
    healthScore: 61,
    riskLevel: 'moderate',
    trend: 'up',
    rainfall: 872,
    groundwaterDepth: 9.8,
    extractionRate: 4.3,
    rechargeRate: 6.1,
    activeSensors: 11,
    offlineSensors: 1,
    totalSensors: 12,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(9, 30),
    lastUpdated: hoursAgo(3),
  },
  {
    id: 'dist-008',
    name: 'Tumkur',
    state: 'Karnataka',
    coordinates: { lat: 13.3379, lng: 77.1173 },
    healthScore: 72,
    riskLevel: 'low',
    trend: 'stable',
    rainfall: 780,
    groundwaterDepth: 7.4,
    extractionRate: 3.1,
    rechargeRate: 5.6,
    activeSensors: 9,
    offlineSensors: 0,
    totalSensors: 9,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(7, 30),
    lastUpdated: hoursAgo(1),
  },
  {
    id: 'dist-009',
    name: 'Murshidabad',
    state: 'West Bengal',
    coordinates: { lat: 24.18, lng: 88.27 },
    healthScore: 78,
    riskLevel: 'stable',
    trend: 'up',
    rainfall: 1420,
    groundwaterDepth: 4.2,
    extractionRate: 2.8,
    rechargeRate: 7.4,
    activeSensors: 7,
    offlineSensors: 0,
    totalSensors: 7,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(4, 30),
    lastUpdated: hoursAgo(2),
  },
  {
    id: 'dist-010',
    name: 'Thrissur',
    state: 'Kerala',
    coordinates: { lat: 10.5276, lng: 76.2144 },
    healthScore: 88,
    riskLevel: 'stable',
    trend: 'up',
    rainfall: 2780,
    groundwaterDepth: 3.1,
    extractionRate: 1.9,
    rechargeRate: 9.2,
    activeSensors: 6,
    offlineSensors: 0,
    totalSensors: 6,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(3, 30),
    lastUpdated: hoursAgo(0.5),
  },
  {
    id: 'dist-011',
    name: 'Hisar',
    state: 'Haryana',
    coordinates: { lat: 29.1492, lng: 75.7217 },
    healthScore: 33,
    riskLevel: 'critical',
    trend: 'down',
    rainfall: 389,
    groundwaterDepth: 42.5,
    extractionRate: 10.1,
    rechargeRate: 1.8,
    activeSensors: 15,
    offlineSensors: 4,
    totalSensors: 19,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(42, 30),
    lastUpdated: hoursAgo(1),
  },
  {
    id: 'dist-012',
    name: 'Anantapur',
    state: 'Andhra Pradesh',
    coordinates: { lat: 14.6819, lng: 77.6006 },
    healthScore: 44,
    riskLevel: 'high',
    trend: 'down',
    rainfall: 441,
    groundwaterDepth: 21.8,
    extractionRate: 7.4,
    rechargeRate: 3.2,
    activeSensors: 13,
    offlineSensors: 2,
    totalSensors: 15,
    alerts: [],
    waterLevelHistory: generateWaterLevelHistory(21, 30),
    lastUpdated: hoursAgo(2),
  },
];

// ── Alerts ────────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    districtId: 'dist-001',
    districtName: 'Jhansi',
    state: 'Uttar Pradesh',
    severity: 'critical',
    type: 'Rapid Depletion',
    message: 'Groundwater level dropped 2.4m in last 30 days. Immediate intervention required.',
    timestamp: hoursAgo(2),
    acknowledged: false,
  },
  {
    id: 'alert-002',
    districtId: 'dist-002',
    districtName: 'Bikaner',
    state: 'Rajasthan',
    severity: 'critical',
    type: 'Critical Threshold',
    message: 'Water table has crossed the critical threshold of 55m BGL.',
    timestamp: hoursAgo(4),
    acknowledged: false,
  },
  {
    id: 'alert-003',
    districtId: 'dist-004',
    districtName: 'Ludhiana',
    state: 'Punjab',
    severity: 'warning',
    type: 'Over-extraction',
    message: 'Extraction rate 3x higher than recharge. Seasonal regulation advised.',
    timestamp: hoursAgo(6),
    acknowledged: false,
  },
  {
    id: 'alert-004',
    districtId: 'dist-011',
    districtName: 'Hisar',
    state: 'Haryana',
    severity: 'critical',
    type: 'Sensor Offline',
    message: '4 DWLR sensors offline. Coverage gap in northern zone.',
    timestamp: hoursAgo(8),
    acknowledged: true,
  },
  {
    id: 'alert-005',
    districtId: 'dist-012',
    districtName: 'Anantapur',
    state: 'Andhra Pradesh',
    severity: 'warning',
    type: 'Declining Trend',
    message: 'Consistent 6-month declining trend observed. Prediction model flagged high risk.',
    timestamp: hoursAgo(12),
    acknowledged: false,
  },
  {
    id: 'alert-006',
    districtId: 'dist-003',
    districtName: 'Jodhpur',
    state: 'Rajasthan',
    severity: 'critical',
    type: 'Monsoon Deficit',
    message: 'Below-average monsoon (-42%) will worsen existing depletion.',
    timestamp: hoursAgo(18),
    acknowledged: false,
  },
  {
    id: 'alert-007',
    districtId: 'dist-006',
    districtName: 'Nashik',
    state: 'Maharashtra',
    severity: 'info',
    type: 'Recharge Improvement',
    message: 'MAR (Managed Aquifer Recharge) programme showing positive results.',
    timestamp: daysAgo(1),
    acknowledged: true,
  },
];

// Attach alerts to districts
MOCK_DISTRICTS.forEach(d => {
  d.alerts = MOCK_ALERTS.filter(a => a.districtId === d.id);
});

// ── Sensors ───────────────────────────────────────────────────────────────────
export const MOCK_SENSORS: Sensor[] = MOCK_DISTRICTS.flatMap(d =>
  Array.from({ length: d.totalSensors }, (_, i) => ({
    id: `sensor-${d.id}-${i + 1}`,
    name: `DWLR-${d.name.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
    districtId: d.id,
    coordinates: {
      lat: d.coordinates.lat + (Math.random() - 0.5) * 0.5,
      lng: d.coordinates.lng + (Math.random() - 0.5) * 0.5,
    },
    status: i < d.offlineSensors ? 'offline' : i === d.offlineSensors ? 'warning' : 'online',
    lastReading: d.groundwaterDepth + (Math.random() - 0.5) * 2,
    lastUpdated: hoursAgo(Math.floor(Math.random() * 6)),
    batteryLevel: i < d.offlineSensors ? 0 : Math.floor(Math.random() * 40 + 60),
    signalStrength: i < d.offlineSensors ? 0 : Math.floor(Math.random() * 30 + 70),
    installDate: daysAgo(Math.floor(Math.random() * 365 + 180)),
  }))
);

// ── Predictions ───────────────────────────────────────────────────────────────
export const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: 'pred-001',
    districtId: 'dist-001',
    districtName: 'Jhansi',
    state: 'Uttar Pradesh',
    horizon: '6month',
    confidenceScore: 87,
    predictedRisk: 'critical',
    trend: 'down',
    data: Array.from({ length: 6 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
      predicted: 34.2 + i * 1.8,
      confidenceLow: 34.2 + i * 1.2,
      confidenceHigh: 34.2 + i * 2.4,
    })),
    generatedAt: hoursAgo(6),
    modelVersion: 'AquaPredict-v2.1 [PLACEHOLDER]',
  },
  {
    id: 'pred-002',
    districtId: 'dist-004',
    districtName: 'Ludhiana',
    state: 'Punjab',
    horizon: '1year',
    confidenceScore: 79,
    predictedRisk: 'critical',
    trend: 'down',
    data: Array.from({ length: 12 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
      predicted: 28.4 + i * 2.1,
      confidenceLow: 28.4 + i * 1.4,
      confidenceHigh: 28.4 + i * 2.8,
    })),
    generatedAt: hoursAgo(12),
    modelVersion: 'AquaPredict-v2.1 [PLACEHOLDER]',
  },
  {
    id: 'pred-003',
    districtId: 'dist-007',
    districtName: 'Warangal',
    state: 'Telangana',
    horizon: '3month',
    confidenceScore: 91,
    predictedRisk: 'low',
    trend: 'up',
    data: Array.from({ length: 3 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
      predicted: 9.8 - i * 0.4,
      confidenceLow: 9.8 - i * 0.6,
      confidenceHigh: 9.8 - i * 0.2,
    })),
    generatedAt: hoursAgo(3),
    modelVersion: 'AquaPredict-v2.1 [PLACEHOLDER]',
  },
];

// ── AI Recommendations (Placeholders) ────────────────────────────────────────
export const MOCK_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec-001',
    districtId: 'dist-001',
    districtName: 'Jhansi',
    priority: 'urgent',
    summary: 'Implement immediate groundwater extraction moratorium',
    details: 'Based on 6-month depletion trend analysis, groundwater levels in Jhansi are projected to cross the irreversible depletion threshold by Q3. Recommend: (1) Temporary ban on agricultural tube-wells, (2) Deploy 3 new artificial recharge sites, (3) Issue district-level water emergency advisory.',
    confidence: 87,
    generatedAt: hoursAgo(4),
  },
  {
    id: 'rec-002',
    districtId: 'dist-002',
    districtName: 'Bikaner',
    priority: 'urgent',
    summary: 'Emergency water supply augmentation required',
    details: 'Bikaner district has entered critical scarcity zone. Recommend: (1) Expedite Indira Gandhi Canal diversion, (2) Deploy 5 tanker supply routes for drinking water priority, (3) Activate Rajasthan State Emergency Water Protocol.',
    confidence: 92,
    generatedAt: hoursAgo(6),
  },
  {
    id: 'rec-003',
    districtId: 'dist-004',
    districtName: 'Ludhiana',
    priority: 'high',
    summary: 'Crop pattern intervention advisory',
    details: 'Punjab paddy cultivation is the primary driver of over-extraction. Recommend: (1) Promote shift to less water-intensive crops (maize, pulses), (2) Implement paddy transplantation delay by 15 days, (3) Provide financial incentives for drip irrigation adoption.',
    confidence: 78,
    generatedAt: hoursAgo(8),
  },
];

// ── Decision Records ──────────────────────────────────────────────────────────
export const MOCK_DECISIONS: DecisionRecord[] = [
  {
    id: 'dec-001',
    recommendationId: 'rec-003',
    districtName: 'Ludhiana',
    status: 'approved',
    officerName: 'Dr. Rajesh Kumar, IAS',
    note: 'Approved for FY 2025-26 Rabi season. MoU with Punjab Agriculture Dept initiated.',
    timestamp: daysAgo(2),
  },
  {
    id: 'dec-002',
    recommendationId: 'rec-001',
    districtName: 'Jhansi',
    status: 'modified',
    officerName: 'Smt. Priya Sharma, IAS',
    note: 'Moratorium scope reduced to commercial extraction only. Domestic use exempted.',
    timestamp: daysAgo(5),
  },
  {
    id: 'dec-003',
    recommendationId: 'rec-002',
    districtName: 'Bikaner',
    status: 'pending',
    officerName: 'Pending Review',
    note: '',
    timestamp: hoursAgo(4),
  },
];

// ── Reports ───────────────────────────────────────────────────────────────────
export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-001',
    title: 'National Groundwater Status Report — June 2025',
    type: 'monthly',
    period: 'June 2025',
    generatedAt: daysAgo(2),
    generatedBy: 'System',
    fileSize: '4.2 MB',
    pages: 48,
    status: 'ready',
  },
  {
    id: 'rep-002',
    title: 'Critical Districts — Emergency Assessment Q2 2025',
    type: 'quarterly',
    district: 'Multiple',
    period: 'Q2 2025',
    generatedAt: daysAgo(7),
    generatedBy: 'Dr. Anand Verma',
    fileSize: '8.7 MB',
    pages: 102,
    status: 'ready',
  },
  {
    id: 'rep-003',
    title: 'Annual Groundwater Survey Report 2024-25',
    type: 'annual',
    period: 'FY 2024-25',
    generatedAt: daysAgo(30),
    generatedBy: 'System',
    fileSize: '22.1 MB',
    pages: 284,
    status: 'ready',
  },
  {
    id: 'rep-004',
    title: 'Rajasthan Drought Risk Analysis — July 2025',
    type: 'custom',
    state: 'Rajasthan',
    period: 'July 2025',
    generatedAt: hoursAgo(12),
    generatedBy: 'Smt. Kavita Mehta',
    fileSize: '3.1 MB',
    pages: 34,
    status: 'ready',
  },
  {
    id: 'rep-005',
    title: 'Punjab Over-Extraction Alert Report',
    type: 'alert',
    state: 'Punjab',
    period: 'July 2025',
    generatedAt: hoursAgo(6),
    generatedBy: 'System',
    fileSize: '1.8 MB',
    pages: 18,
    status: 'generating',
  },
];

// ── Users ─────────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Dr. Anand Verma',
    email: 'anand.verma@cgwb.gov.in',
    role: 'admin',
    department: 'Central Ground Water Board',
    status: 'active',
    lastActive: hoursAgo(0.5),
  },
  {
    id: 'usr-002',
    name: 'Smt. Priya Sharma',
    email: 'priya.sharma@up.gov.in',
    role: 'officer',
    department: 'State Ground Water Authority',
    state: 'Uttar Pradesh',
    status: 'active',
    lastActive: hoursAgo(1),
  },
  {
    id: 'usr-003',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@punjab.gov.in',
    role: 'officer',
    department: 'Punjab Water Resources',
    state: 'Punjab',
    status: 'active',
    lastActive: hoursAgo(3),
  },
  {
    id: 'usr-004',
    name: 'Dr. Meera Iyer',
    email: 'meera.iyer@cgwb.gov.in',
    role: 'analyst',
    department: 'Central Ground Water Board',
    status: 'active',
    lastActive: daysAgo(1),
  },
  {
    id: 'usr-005',
    name: 'Smt. Kavita Mehta',
    email: 'kavita.mehta@rajasthan.gov.in',
    role: 'analyst',
    department: 'Rajasthan Ground Water Department',
    state: 'Rajasthan',
    status: 'active',
    lastActive: hoursAgo(6),
  },
  {
    id: 'usr-006',
    name: 'Arjun Nair',
    email: 'arjun.nair@kerala.gov.in',
    role: 'viewer',
    department: 'Kerala Water Authority',
    state: 'Kerala',
    status: 'active',
    lastActive: daysAgo(2),
  },
  {
    id: 'usr-007',
    name: 'Suresh Reddy',
    email: 'suresh.reddy@telangana.gov.in',
    role: 'viewer',
    department: 'Telangana Ground Water Department',
    state: 'Telangana',
    status: 'inactive',
    lastActive: daysAgo(14),
  },
];

// ── Dashboard Statistics ───────────────────────────────────────────────────────
export const DASHBOARD_STATS = {
  nationalHealthScore: 58,
  groundwaterSustainability: 62,
  activeSensors: MOCK_SENSORS.filter(s => s.status === 'online').length,
  totalSensors: MOCK_SENSORS.length,
  offlineSensors: MOCK_SENSORS.filter(s => s.status === 'offline').length,
  criticalDistricts: MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical').length,
  highRiskAreas: MOCK_DISTRICTS.filter(d => d.riskLevel === 'high').length,
  todayAlerts: MOCK_ALERTS.filter(a => !a.acknowledged).length,
};

// ── Monthly Chart Data ─────────────────────────────────────────────────────────
export const MONTHLY_WATER_LEVEL_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  depth: [18.2, 19.1, 20.4, 22.1, 23.8, 24.2, 20.1, 16.4, 14.2, 15.1, 16.8, 17.9],
  extraction: [8.2, 7.8, 9.1, 10.4, 11.2, 10.8, 7.4, 5.8, 6.2, 7.1, 8.0, 8.4],
  recharge: [2.1, 1.8, 1.4, 0.9, 0.7, 2.8, 6.4, 8.2, 7.1, 4.2, 2.8, 2.1],
  rainfall: [12, 8, 4, 2, 1, 42, 145, 182, 124, 58, 18, 10],
};

export const YEARLY_WATER_LEVEL_DATA = {
  labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
  depth: [14.2, 15.8, 16.4, 17.1, 18.8, 20.2, 21.4, 22.8],
  extraction: [7.2, 7.8, 8.1, 8.4, 8.9, 9.2, 9.8, 10.1],
  recharge: [4.8, 4.2, 3.9, 3.6, 3.2, 2.8, 2.4, 2.1],
};

// ── GIS Map Overlays Mock Data ────────────────────────────────────────────────
export const MOCK_VILLAGES = MOCK_DISTRICTS.flatMap(d => [
  {
    id: `vil-${d.id}-1`,
    name: `${d.name} Basin North`,
    districtId: d.id,
    state: d.state,
    coordinates: { lat: d.coordinates.lat + 0.08, lng: d.coordinates.lng + 0.06 },
    riskLevel: d.riskLevel,
    healthScore: Math.min(100, d.healthScore + 4),
  },
  {
    id: `vil-${d.id}-2`,
    name: `${d.name} Sector South`,
    districtId: d.id,
    state: d.state,
    coordinates: { lat: d.coordinates.lat - 0.07, lng: d.coordinates.lng - 0.08 },
    riskLevel: d.riskLevel === 'critical' ? 'high' : d.riskLevel,
    healthScore: Math.max(0, d.healthScore - 8),
  },
  {
    id: `vil-${d.id}-3`,
    name: `${d.name} Station West`,
    districtId: d.id,
    state: d.state,
    coordinates: { lat: d.coordinates.lat + 0.05, lng: d.coordinates.lng - 0.07 },
    riskLevel: d.riskLevel,
    healthScore: d.healthScore,
  }
]);

export const MOCK_RIVERS = [
  // Betwa River near Jhansi coordinates
  {
    name: 'Betwa River',
    path: [
      [24.5, 78.2],
      [25.0, 78.4],
      [25.4484, 78.5685],
      [25.9, 78.8],
      [26.2, 79.2]
    ] as [number, number][]
  },
  // Chambal River flowing in Rajasthan
  {
    name: 'Chambal River',
    path: [
      [25.0, 75.5],
      [25.8, 76.2],
      [26.2389, 77.0243],
      [26.8, 77.8],
      [27.1, 78.5]
    ] as [number, number][]
  },
  // Sutlej River near Ludhiana
  {
    name: 'Sutlej River',
    path: [
      [31.2, 75.0],
      [30.901, 75.8573],
      [31.1, 76.4],
      [31.3, 77.2]
    ] as [number, number][]
  }
];

export const MOCK_CANALS = [
  // Indira Gandhi Canal near Bikaner coordinates
  {
    name: 'Indira Gandhi Canal Main branch',
    path: [
      [29.2, 73.8],
      [28.5, 73.5],
      [28.0229, 73.3119],
      [27.4, 72.8],
      [26.8, 72.2]
    ] as [number, number][]
  },
  // Ganga Canal Branch near Jhansi
  {
    name: 'Ganga Canal Branch III',
    path: [
      [26.1, 78.4],
      [25.7, 78.5],
      [25.4484, 78.5685],
      [25.1, 78.7]
    ] as [number, number][]
  }
];

export const MOCK_RESERVOIRS = [
  {
    name: 'Jhansi Aquifer Reservoir',
    polygon: [
      [25.50, 78.60],
      [25.52, 78.62],
      [25.51, 78.65],
      [25.48, 78.64],
      [25.47, 78.61]
    ] as [number, number][]
  },
  {
    name: 'Bikaner Dry Reservoir Basin',
    polygon: [
      [28.05, 73.35],
      [28.08, 73.37],
      [28.07, 73.40],
      [28.03, 73.39],
      [28.02, 73.36]
    ] as [number, number][]
  }
];

