// =============================================================================
// AquaGround AI — TypeScript Type Definitions
// =============================================================================

// ── Risk Levels ──────────────────────────────────────────────────────────────
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low' | 'stable';
export type SensorStatus = 'online' | 'offline' | 'warning' | 'maintenance';
export type TrendDirection = 'up' | 'down' | 'stable';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type DecisionStatus = 'pending' | 'approved' | 'modified' | 'rejected';
export type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom' | 'alert';
export type UserRole = 'admin' | 'analyst' | 'officer' | 'viewer';
export type LayerId =
  | 'heatmap'
  | 'risk'
  | 'river'
  | 'canal'
  | 'aquifer'
  | 'district'
  | 'village'
  | 'dwlr'
  | 'satellite'
  | 'terrain'
  | 'rainfall'
  | 'sensor';

// ── Geographic ───────────────────────────────────────────────────────────────
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface District {
  id: string;
  name: string;
  state: string;
  coordinates: Coordinates;
  healthScore: number;       // 0-100
  riskLevel: RiskLevel;
  trend: TrendDirection;
  rainfall: number;          // mm
  groundwaterDepth: number;  // meters below ground level
  extractionRate: number;    // MCM/year
  rechargeRate: number;      // MCM/year
  activeSensors: number;
  offlineSensors: number;
  totalSensors: number;
  alerts: Alert[];
  waterLevelHistory: WaterLevelReading[];
  lastUpdated: string;
}

export interface Village {
  id: string;
  name: string;
  districtId: string;
  state: string;
  coordinates: Coordinates;
  riskLevel: RiskLevel;
  healthScore: number;
}

// ── Sensor ───────────────────────────────────────────────────────────────────
export interface Sensor {
  id: string;
  name: string;
  districtId: string;
  villageId?: string;
  coordinates: Coordinates;
  status: SensorStatus;
  lastReading: number;        // meters BGL
  lastUpdated: string;
  batteryLevel: number;       // percentage
  signalStrength: number;     // percentage
  installDate: string;
}

// ── Water Level ──────────────────────────────────────────────────────────────
export interface WaterLevelReading {
  timestamp: string;
  depth: number;              // meters BGL
  extraction: number;         // MCM
  recharge: number;           // MCM
  rainfall: number;           // mm
}

export interface WaterLevelSeries {
  districtId: string;
  period: 'daily' | 'monthly' | 'yearly';
  readings: WaterLevelReading[];
}

// ── Alert ────────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  districtId: string;
  districtName: string;
  state: string;
  severity: AlertSeverity;
  type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// ── Prediction ───────────────────────────────────────────────────────────────
export interface PredictionPoint {
  timestamp: string;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface Prediction {
  id: string;
  districtId: string;
  districtName: string;
  state: string;
  horizon: '3month' | '6month' | '1year';
  confidenceScore: number;    // 0-100
  predictedRisk: RiskLevel;
  trend: TrendDirection;
  data: PredictionPoint[];
  generatedAt: string;
  modelVersion: string;       // AI module placeholder
}

// ── Decision Support ─────────────────────────────────────────────────────────
export interface AIRecommendation {
  id: string;
  districtId: string;
  districtName: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  summary: string;
  details: string;
  confidence: number;
  generatedAt: string;
}

export interface OfficerNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: string;
}

export interface DecisionRecord {
  id: string;
  recommendationId: string;
  districtName: string;
  status: DecisionStatus;
  officerName: string;
  note: string;
  timestamp: string;
}

// ── Reports ──────────────────────────────────────────────────────────────────
export interface Report {
  id: string;
  title: string;
  type: ReportType;
  district?: string;
  state?: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  fileSize: string;
  pages: number;
  status: 'ready' | 'generating' | 'failed';
}

// ── Users ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  district?: string;
  state?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  avatar?: string;
}

// ── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

// ── Map Layer ────────────────────────────────────────────────────────────────
export interface MapLayer {
  id: LayerId;
  label: string;
  icon: string;
  color: string;
  active: boolean;
  description: string;
  group: 'base' | 'data' | 'boundary' | 'infrastructure';
}

// ── App State ────────────────────────────────────────────────────────────────
export interface AppState {
  sidebarCollapsed: boolean;
  selectedDistrict: District | null;
  activeLayers: LayerId[];
  notificationPanelOpen: boolean;
  unreadNotifications: number;
  mapCenter: Coordinates;
  mapZoom: number;
  isLoading: boolean;
}

// ── Stats Card ───────────────────────────────────────────────────────────────
export interface StatCardData {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: TrendDirection;
  delta?: number | string;
  deltaLabel?: string;
  icon: string;
  color: 'royal' | 'emerald' | 'amber' | 'red' | 'sky' | 'graphite';
}

// ── Chart ────────────────────────────────────────────────────────────────────
export interface ChartDataset {
  label: string;
  data: number[];
  color: string;
}

export interface ChartConfig {
  labels: string[];
  datasets: ChartDataset[];
}
