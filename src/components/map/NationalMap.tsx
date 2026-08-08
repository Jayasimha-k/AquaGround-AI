// =============================================================================
// NationalMap — Full-screen Leaflet GIS map centerpiece
// =============================================================================

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polygon, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG, RISK_COLORS } from '@/constants';
import { MOCK_DISTRICTS, MOCK_VILLAGES, MOCK_RIVERS, MOCK_CANALS, MOCK_RESERVOIRS } from '@/constants/mockData';
import type { District } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { ReservoirLayer } from '@/components/map/ReservoirLayer';


// ── Map Controller for Camera Zoom/Fly ─────────────────────────────────────────
interface MapControllerProps {
  selectedState: string;
  selectedDistrict: District | null;
}

// Bounding boxes coordinates for major states in mock data
const STATE_BOUNDS: Record<string, { center: [number, number]; zoom: number }> = {
  'Uttar Pradesh': { center: [26.8467, 80.9462], zoom: 6 },
  'Rajasthan': { center: [26.5837, 73.8629], zoom: 6 },
  'Punjab': { center: [31.1471, 75.3412], zoom: 7 },
  'Maharashtra': { center: [19.7515, 75.7139], zoom: 6 },
  'Telangana': { center: [18.1124, 79.0193], zoom: 7 },
  'Karnataka': { center: [15.3173, 75.7139], zoom: 6 },
  'West Bengal': { center: [23.8144, 87.9718], zoom: 7 },
  'Kerala': { center: [10.8505, 76.2711], zoom: 7 },
  'Haryana': { center: [29.0588, 76.0856], zoom: 8 },
  'Andhra Pradesh': { center: [15.9129, 79.7400], zoom: 7 },
  'all': { center: [22.5937, 78.9629], zoom: 5 },
};

function MapController({ selectedState, selectedDistrict }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedDistrict) {
      // Zoom to selected district coordinates
      map.setView([selectedDistrict.coordinates.lat, selectedDistrict.coordinates.lng], 8, {
        animate: true,
        duration: 0.8
      });
    } else if (selectedState && STATE_BOUNDS[selectedState]) {
      // Zoom to selected state coordinates
      const target = STATE_BOUNDS[selectedState];
      map.setView(target.center, target.zoom, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedState, selectedDistrict, map]);

  return null;
}

// ── Hexagonal boundary generator ──────────────────────────────────────────────
function getHexagonPoints(center: { lat: number; lng: number }, radius: number = 0.12): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    points.push([
      center.lat + radius * Math.sin(angle),
      center.lng + radius * Math.cos(angle) * 1.15
    ]);
  }
  return points;
}

// ── Main Map Component ────────────────────────────────────────────────────────
interface NationalMapProps {
  onDistrictClick?: (district: District) => void;
  selectedState: string;
  selectedDistrictId: string;
  selectedRisks: string[];
  searchQuery: string;
  activeLayers: string[];
  activeBasemap: 'light' | 'satellite' | 'terrain';
  heatmapParameter: 'risk' | 'depth' | 'extraction' | 'rainfall';
}

const BASEMAP_TILES = {
  light: MAP_CONFIG.TILE_URL,
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
};

export function NationalMap({
  onDistrictClick,
  selectedState,
  selectedDistrictId,
  selectedRisks,
  searchQuery,
  activeLayers,
  activeBasemap,
  heatmapParameter
}: NationalMapProps) {
  const { state, selectDistrict } = useApp();

  const handleDistrictClick = (district: District) => {
    selectDistrict(district);
    onDistrictClick?.(district);
  };

  // Filter districts based on active controls
  const filteredDistricts = MOCK_DISTRICTS.filter(d => {
    // 1. State Filter
    if (selectedState !== 'all' && d.state !== selectedState) return false;

    // 2. District Filter
    if (selectedDistrictId !== 'all' && d.id !== selectedDistrictId) return false;

    // 3. Risk Filter
    if (selectedRisks.length > 0 && !selectedRisks.includes(d.riskLevel)) return false;

    // 4. Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchState = d.state.toLowerCase().includes(q);
      
      // search inside sensors
      const matchSensors = d.name.toLowerCase().includes(q); 
      
      if (!matchName && !matchState && !matchSensors) return false;
    }

    return true;
  });

  // Filter villages based on filtered districts
  const filteredVillages = MOCK_VILLAGES.filter(v => {
    const parentDistrict = filteredDistricts.find(d => d.id === v.districtId);
    return !!parentDistrict;
  });

  // Color intensity calculator for mock heatmap cells
  const getHeatmapColor = (district: District) => {
    if (heatmapParameter === 'depth') {
      return district.groundwaterDepth > 45 ? '#DC2626' : district.groundwaterDepth > 25 ? '#F97316' : '#10B981';
    }
    if (heatmapParameter === 'extraction') {
      return district.extractionRate > 10 ? '#DC2626' : district.extractionRate > 5 ? '#F97316' : '#10B981';
    }
    if (heatmapParameter === 'rainfall') {
      return district.rainfall < 400 ? '#DC2626' : district.rainfall < 700 ? '#F97316' : '#2563EB';
    }
    // Default (Risk intensity)
    return RISK_COLORS[district.riskLevel];
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[MAP_CONFIG.DEFAULT_CENTER.lat, MAP_CONFIG.DEFAULT_CENTER.lng]}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        minZoom={MAP_CONFIG.MIN_ZOOM}
        maxZoom={MAP_CONFIG.MAX_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Basemap Tile Layer */}
        <TileLayer
          url={BASEMAP_TILES[activeBasemap]}
          attribution="&copy; Esri, CGWB Mapping Services"
          maxZoom={MAP_CONFIG.MAX_ZOOM}
        />

        {/* ── 1. Heatmap Layer (Dynamic grid cells) ──────────────────── */}
        {activeLayers.includes('heatmap') && filteredDistricts.map(d => {
          const color = getHeatmapColor(d);
          return (
            <CircleMarker
              key={`heat-${d.id}`}
              center={[d.coordinates.lat, d.coordinates.lng]}
              radius={24}
              pathOptions={{
                color: 'transparent',
                fillColor: color,
                fillOpacity: 0.18,
              }}
            />
          );
        })}

        {/* ── 2. Rainfall Layer (Dynamic blue rings) ──────────────────── */}
        {activeLayers.includes('rainfall') && filteredDistricts.map(d => (
          <CircleMarker
            key={`rain-${d.id}`}
            center={[d.coordinates.lat, d.coordinates.lng]}
            radius={Math.min(30, (d.rainfall / 100) * 1.5)}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '3, 4',
            }}
          />
        ))}

        {/* ── 3. District Boundaries (Polygons) ───────────────────────── */}
        {activeLayers.includes('district') && filteredDistricts.map(d => {
          const isSelected = state.selectedDistrict?.id === d.id;
          const color = RISK_COLORS[d.riskLevel];
          return (
            <Polygon
              key={`poly-${d.id}`}
              positions={getHexagonPoints(d.coordinates)}
              pathOptions={{
                color: isSelected ? '#2563EB' : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.35 : 0.08,
                weight: isSelected ? 2.5 : 1,
              }}
              eventHandlers={{ click: () => handleDistrictClick(d) }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <span className="font-semibold text-xs">{d.name} District ({d.state})</span>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* ── 4. Village Boundaries (Smaller polygons) ────────────────── */}
        {activeLayers.includes('village') && filteredVillages.map(v => (
          <Polygon
            key={`vil-poly-${v.id}`}
            positions={getHexagonPoints(v.coordinates, 0.04)}
            pathOptions={{
              color: RISK_COLORS[v.riskLevel],
              fillColor: 'transparent',
              weight: 0.8,
              dashArray: '2, 3',
            }}
          >
            <Tooltip direction="top">
              <span className="text-[10px]">{v.name} ({v.state})</span>
            </Tooltip>
          </Polygon>
        ))}

        {/* ── 5. DWLR Locations / Sensors (Core Markers) ──────────────── */}
        {activeLayers.includes('dwlr') && filteredDistricts.map(d => {
          const isSelected = state.selectedDistrict?.id === d.id;
          const color = RISK_COLORS[d.riskLevel];
          const radius = isSelected ? 11 : 7;
          return (
            <CircleMarker
              key={`marker-${d.id}`}
              center={[d.coordinates.lat, d.coordinates.lng]}
              radius={radius}
              pathOptions={{
                color: isSelected ? '#2563EB' : '#FFFFFF',
                fillColor: color,
                fillOpacity: 0.9,
                weight: 1.5,
              }}
              eventHandlers={{ click: () => handleDistrictClick(d) }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <div className="text-xs space-y-0.5 leading-snug">
                  <p className="font-bold text-slate-900">{d.name}</p>
                  <p className="text-slate-500 font-medium">{d.state}</p>
                  <p className="text-slate-700">Water Depth: <span className="font-semibold">{d.groundwaterDepth}m BGL</span></p>
                  <p className="font-bold uppercase text-[9px] tracking-wide" style={{ color }}>Risk Level: {d.riskLevel}</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* ── 6. Rivers (Blue paths with telemetry tooltips) ──────────── */}
        {activeLayers.includes('river') && MOCK_RIVERS.map((r, idx) => {
          const isHigh = r.flowStatus === 'High Flow';
          const isDeficit = r.flowStatus === 'Deficit Flow';
          const color = isHigh ? '#0284C7' : isDeficit ? '#F59E0B' : '#2563EB';

          return (
            <Polyline
              key={`river-${r.id || idx}`}
              positions={r.path}
              pathOptions={{
                color,
                weight: 3.5,
                opacity: 0.85,
              }}
            >
              <Tooltip sticky opacity={1}>
                <div style={{ minWidth: 170, fontFamily: 'inherit' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A', marginBottom: 2 }}>
                    🌊 {r.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>
                    {r.riverBasin} · {r.lengthKm} km
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', fontSize: 11 }}>
                    <span style={{ color: '#64748B' }}>Live Flow:</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{r.currentDischargeCumecs.toLocaleString()} m³/s</span>
                    <span style={{ color: '#64748B' }}>Gauge Level:</span>
                    <span style={{ fontWeight: 700, color: r.waterLevelMeters >= r.dangerLevelMeters ? '#EF4444' : '#0F172A' }}>
                      {r.waterLevelMeters}m / {r.dangerLevelMeters}m
                    </span>
                    <span style={{ color: '#64748B' }}>WQI Index:</span>
                    <span style={{ fontWeight: 700, color: r.wqi >= 75 ? '#10B981' : '#F59E0B' }}>
                      {r.wqi} / 100
                    </span>
                  </div>
                  <div style={{ marginTop: 6, display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: isHigh ? '#E0F2FE' : isDeficit ? '#FEF3C7' : '#EFF6FF', color }}>
                    Flow Status: {r.flowStatus}
                  </div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* ── 7. Canals (Cyan dashed paths) ────────────────────────────── */}
        {activeLayers.includes('canal') && MOCK_CANALS.map((c, idx) => (
          <Polyline
            key={`canal-${idx}`}
            positions={c.path}
            pathOptions={{
              color: '#06B6D4',
              weight: 1.5,
              dashArray: '3, 4',
              opacity: 0.8,
            }}
          >
            <Tooltip sticky>
              <span className="text-[10px] font-medium text-cyan-700">{c.name}</span>
            </Tooltip>
          </Polyline>
        ))}

        {/* ── 8. Reservoirs (Blue polygons) ────────────────────────────── */}
        {activeLayers.includes('aquifer') && MOCK_RESERVOIRS.map((res, idx) => (
          <Polygon
            key={`res-${idx}`}
            positions={res.polygon}
            pathOptions={{
              color: '#2563EB',
              fillColor: '#3B82F6',
              fillOpacity: 0.4,
              weight: 1,
            }}
          >
            <Tooltip sticky>
              <span className="text-xs font-semibold text-blue-800">{res.name} Storage</span>
            </Tooltip>
          </Polygon>
        ))}

        {/* ── 9. Live Reservoir Levels (CWC/NWIC) ─────────────────────── */}
        <ReservoirLayer visible={activeLayers.includes('reservoir')} />

        {/* Dynamic Zoom Fly Controller */}
        <MapController 
          selectedState={selectedState} 
          selectedDistrict={state.selectedDistrict} 
        />
      </MapContainer>
    </div>
  );
}
