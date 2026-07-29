// =============================================================================
// AquaGround AI — Application Constants
// =============================================================================

import type { NavItem, MapLayer } from '@/types';

// ── Routes ────────────────────────────────────────────────────────────────────
export const ROUTES = {
  DASHBOARD: '/',
  MAP: '/map',
  ANALYTICS: '/analytics',
  PREDICTIONS: '/predictions',
  RISK: '/risk',
  RECOMMENDATIONS: '/recommendations',
  REPORTS: '/reports',
  USERS: '/users',
  SETTINGS: '/settings',
} as const;

// ── Navigation Items ──────────────────────────────────────────────────────────
export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { id: 'map', label: 'India Map', path: ROUTES.MAP, icon: 'Map' },
  { id: 'analytics', label: 'Analytics', path: ROUTES.ANALYTICS, icon: 'BarChart3' },
  { id: 'predictions', label: 'Predictions', path: ROUTES.PREDICTIONS, icon: 'TrendingUp' },
  { id: 'risk', label: 'Risk Assessment', path: ROUTES.RISK, icon: 'AlertTriangle' },
  { id: 'recommendations', label: 'Decision Support', path: ROUTES.RECOMMENDATIONS, icon: 'Brain' },
  { id: 'reports', label: 'Reports', path: ROUTES.REPORTS, icon: 'FileText' },
  { id: 'users', label: 'User Management', path: ROUTES.USERS, icon: 'Users' },
  { id: 'settings', label: 'Settings', path: ROUTES.SETTINGS, icon: 'Settings' },
];

// ── Map Configuration ─────────────────────────────────────────────────────────
export const MAP_CONFIG = {
  // Swap this URL to change basemap provider (Mapbox, Google, etc.)
  TILE_URL: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  DEFAULT_CENTER: { lat: 22.5937, lng: 78.9629 },
  DEFAULT_ZOOM: 5,
  MIN_ZOOM: 4,
  MAX_ZOOM: 18,
  INDIA_BOUNDS: {
    north: 37.6,
    south: 6.4,
    west: 68.1,
    east: 97.4,
  },
} as const;

// ── Map Layers ────────────────────────────────────────────────────────────────
export const MAP_LAYERS: MapLayer[] = [
  { id: 'district', label: 'Districts', icon: 'Map', color: '#3b82f6', active: true, description: 'District boundaries', group: 'boundary' },
  { id: 'dwlr', label: 'DWLR Stations', icon: 'Radio', color: '#10b981', active: true, description: 'Digital Water Level Recorders', group: 'data' },
  { id: 'sensor', label: 'Sensors', icon: 'Activity', color: '#60a5fa', active: true, description: 'All monitoring sensors', group: 'data' },
  { id: 'heatmap', label: 'Heatmap', icon: 'Layers', color: '#ef4444', active: false, description: 'Groundwater stress heatmap', group: 'data' },
  { id: 'risk', label: 'Risk Zones', icon: 'AlertTriangle', color: '#f59e0b', active: false, description: 'Risk level overlay', group: 'data' },
  { id: 'rainfall', label: 'Rainfall', icon: 'CloudRain', color: '#38bdf8', active: false, description: 'Rainfall distribution', group: 'data' },
  { id: 'river', label: 'Rivers', icon: 'Waves', color: '#0ea5e9', active: false, description: 'River network', group: 'infrastructure' },
  { id: 'canal', label: 'Canals', icon: 'GitBranch', color: '#06b6d4', active: false, description: 'Canal network', group: 'infrastructure' },
  { id: 'aquifer', label: 'Aquifers', icon: 'Droplets', color: '#818cf8', active: false, description: 'Aquifer zones', group: 'data' },
  { id: 'village', label: 'Villages', icon: 'MapPin', color: '#a78bfa', active: false, description: 'Village-level data', group: 'boundary' },
  { id: 'satellite', label: 'Satellite', icon: 'Satellite', color: '#94a3b8', active: false, description: 'Satellite imagery (placeholder)', group: 'base' },
  { id: 'terrain', label: 'Terrain', icon: 'Mountain', color: '#78716c', active: false, description: 'Terrain elevation', group: 'base' },
];

// ── Chart Colors ──────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  royal: { line: '#3b82f6', fill: 'rgba(59, 130, 246, 0.15)' },
  emerald: { line: '#10b981', fill: 'rgba(16, 185, 129, 0.15)' },
  amber: { line: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)' },
  red: { line: '#ef4444', fill: 'rgba(239, 68, 68, 0.15)' },
  sky: { line: '#38bdf8', fill: 'rgba(56, 189, 248, 0.15)' },
  purple: { line: '#818cf8', fill: 'rgba(129, 140, 248, 0.15)' },
} as const;

// ── Risk Color Map ────────────────────────────────────────────────────────────
export const RISK_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  moderate: '#3b82f6',
  low: '#10b981',
  stable: '#10b981',
};

// ── Indian States ─────────────────────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
] as const;

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 10;

// ── Animation Durations (ms) ──────────────────────────────────────────────────
export const ANIMATION = {
  FAST: 200,
  BASE: 350,
  SLOW: 600,
  COUNTER: 1200,
  PAGE_TRANSITION: 300,
  MARKER_PULSE: 2000,
} as const;

// ── API Endpoints (stubbed for future integration) ────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  DISTRICTS: '/districts',
  SENSORS: '/sensors',
  ALERTS: '/alerts',
  WATER_LEVELS: '/water-levels',
  PREDICTIONS: '/predictions',
  RECOMMENDATIONS: '/recommendations',
  REPORTS: '/reports',
  USERS: '/users',
} as const;
