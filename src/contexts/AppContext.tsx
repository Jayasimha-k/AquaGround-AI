// =============================================================================
// AquaGround AI — Global App Context
// =============================================================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { District, LayerId, AppState } from '@/types';
import { MAP_CONFIG, MAP_LAYERS } from '@/constants';

// ── State ─────────────────────────────────────────────────────────────────────
const initialState: AppState = {
  sidebarCollapsed: false,
  selectedDistrict: null,
  activeLayers: MAP_LAYERS.filter(l => l.active).map(l => l.id),
  notificationPanelOpen: false,
  unreadNotifications: 5,
  mapCenter: MAP_CONFIG.DEFAULT_CENTER,
  mapZoom: MAP_CONFIG.DEFAULT_ZOOM,
  isLoading: false,
};

// ── Actions ───────────────────────────────────────────────────────────────────
type Action =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SELECT_DISTRICT'; payload: District | null }
  | { type: 'TOGGLE_LAYER'; payload: LayerId }
  | { type: 'SET_ACTIVE_LAYERS'; payload: LayerId[] }
  | { type: 'TOGGLE_NOTIFICATION_PANEL' }
  | { type: 'CLOSE_NOTIFICATION_PANEL' }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'SET_MAP_CENTER'; payload: { lat: number; lng: number } }
  | { type: 'SET_MAP_ZOOM'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SELECT_DISTRICT':
      return { ...state, selectedDistrict: action.payload };
    case 'TOGGLE_LAYER': {
      const layers = state.activeLayers.includes(action.payload)
        ? state.activeLayers.filter(l => l !== action.payload)
        : [...state.activeLayers, action.payload];
      return { ...state, activeLayers: layers };
    }
    case 'SET_ACTIVE_LAYERS':
      return { ...state, activeLayers: action.payload };
    case 'TOGGLE_NOTIFICATION_PANEL':
      return { ...state, notificationPanelOpen: !state.notificationPanelOpen };
    case 'CLOSE_NOTIFICATION_PANEL':
      return { ...state, notificationPanelOpen: false };
    case 'MARK_NOTIFICATIONS_READ':
      return { ...state, unreadNotifications: 0 };
    case 'SET_MAP_CENTER':
      return { ...state, mapCenter: action.payload };
    case 'SET_MAP_ZOOM':
      return { ...state, mapZoom: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectDistrict: (district: District | null) => void;
  toggleLayer: (layerId: LayerId) => void;
  setActiveLayers: (layers: LayerId[]) => void;
  toggleNotificationPanel: () => void;
  closeNotificationPanel: () => void;
  markNotificationsRead: () => void;
  setMapCenter: (coords: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebarCollapsed = useCallback((c: boolean) => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: c }), []);
  const selectDistrict = useCallback((d: District | null) => dispatch({ type: 'SELECT_DISTRICT', payload: d }), []);
  const toggleLayer = useCallback((id: LayerId) => dispatch({ type: 'TOGGLE_LAYER', payload: id }), []);
  const setActiveLayers = useCallback((l: LayerId[]) => dispatch({ type: 'SET_ACTIVE_LAYERS', payload: l }), []);
  const toggleNotificationPanel = useCallback(() => dispatch({ type: 'TOGGLE_NOTIFICATION_PANEL' }), []);
  const closeNotificationPanel = useCallback(() => dispatch({ type: 'CLOSE_NOTIFICATION_PANEL' }), []);
  const markNotificationsRead = useCallback(() => dispatch({ type: 'MARK_NOTIFICATIONS_READ' }), []);
  const setMapCenter = useCallback((c: { lat: number; lng: number }) => dispatch({ type: 'SET_MAP_CENTER', payload: c }), []);
  const setMapZoom = useCallback((z: number) => dispatch({ type: 'SET_MAP_ZOOM', payload: z }), []);
  const setLoading = useCallback((l: boolean) => dispatch({ type: 'SET_LOADING', payload: l }), []);

  return (
    <AppContext.Provider value={{
      state,
      toggleSidebar, setSidebarCollapsed,
      selectDistrict,
      toggleLayer, setActiveLayers,
      toggleNotificationPanel, closeNotificationPanel, markNotificationsRead,
      setMapCenter, setMapZoom,
      setLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
