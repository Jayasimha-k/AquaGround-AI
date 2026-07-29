// =============================================================================
// Module 5: Risk Monitor (Triage Command Board)
// =============================================================================

import React, { useState } from 'react';
import { AlertTriangle, MapPin, Search, Activity, Droplets, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Timeline } from '@/components/ui/Timeline';
import { MOCK_DISTRICTS, MOCK_ALERTS } from '@/constants/mockData';
import { MAP_CONFIG, RISK_COLORS } from '@/constants';
import { formatDistanceToNow } from 'date-fns';

const alertTimelineEvents = MOCK_ALERTS.slice(0, 5).map(a => ({
  id: a.id,
  title: `${a.districtName} — ${a.type}`,
  subtitle: a.state,
  description: a.message,
  timestamp: a.timestamp,
  status: (a.severity === 'critical' ? 'alert' : a.severity === 'warning' ? 'pending' : 'info') as any,
  actor: a.acknowledged ? 'Command Verified' : 'Awaiting Field Dispatch',
}));

export function RiskAssessment() {
  const [selectedId, setSelectedId] = useState(MOCK_DISTRICTS[0].id);
  const selectedDistrict = MOCK_DISTRICTS.find(d => d.id === selectedId) || MOCK_DISTRICTS[0];

  const criticalDistricts = MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical' || d.riskLevel === 'high');

  return (
    <PageContainer
      title="Regional Risk Monitor"
      subtitle="Hydrological risk triaging, critical basins, and escalation pipelines"
    >
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-full min-h-[580px]">

        {/* ── Left Column: Active Triage Escalation Districts ───────────────── */}
        <div className="xl:col-span-1.5 space-y-4">
          <SectionHeader title="Basin Action Queue" subtitle="Regions in critical depletion zone" />
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {criticalDistricts.map(d => {
              const isSelected = d.id === selectedId;
              const riskColor = RISK_COLORS[d.riskLevel];
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={[
                    'cursor-pointer rounded border p-4 transition-all duration-150 bg-white border-l-4',
                    isSelected ? 'ring-2 ring-blue-600/20 border-blue-600 shadow-sm' : 'border-slate-200 hover:shadow-sm'
                  ].join(' ')}
                  style={{ borderLeftColor: riskColor }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{d.state}</p>
                    </div>
                    <StatusBadge variant={d.riskLevel} size="sm" />
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3">
                    <span>Depth: {d.groundwaterDepth}m</span>
                    <span className="text-red-600 font-semibold">{d.trend === 'down' ? 'Depleting' : 'Stable'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center Column: Interactive India Risk Map & Metrics ────────── */}
        <div className="xl:col-span-2.5 space-y-5">
          {/* Tactical Risk Map centerpiece */}
          <div className="card p-4 bg-white">
            <SectionHeader title="India Risk Mapping" subtitle="Geographic view of over-extracted aquifer regions" />
            <div className="h-64 w-full rounded border border-slate-200 overflow-hidden mt-3 relative z-10">
              <MapContainer
                center={[22.5937, 78.9629]}
                zoom={4}
                zoomControl={false}
                className="w-full h-full"
              >
                <TileLayer
                  url={MAP_CONFIG.TILE_URL}
                  attribution=""
                />
                {criticalDistricts.map(d => (
                  <CircleMarker
                    key={d.id}
                    center={[d.coordinates.lat, d.coordinates.lng]}
                    radius={selectedId === d.id ? 8 : 6}
                    pathOptions={{
                      color: RISK_COLORS[d.riskLevel],
                      fillColor: RISK_COLORS[d.riskLevel],
                      fillOpacity: 0.8,
                      weight: selectedId === d.id ? 2 : 1,
                    }}
                  >
                    <Tooltip direction="top" opacity={1}>
                      <span className="font-bold text-xs">{d.name} ({d.state})</span>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Detailed Triage Metrics Card */}
          <div className="card p-5 bg-white space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{selectedDistrict.name} Diagnostics</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{selectedDistrict.state}</p>
              </div>
              <StatusBadge variant={selectedDistrict.riskLevel} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
                <div className="text-slate-400 font-medium">BGL Depth</div>
                <p className="font-bold text-slate-800 mt-0.5">{selectedDistrict.groundwaterDepth} m BGL</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
                <div className="text-slate-400 font-medium">Annual Deficit</div>
                <p className="font-bold text-red-600 mt-0.5">{(selectedDistrict.extractionRate - selectedDistrict.rechargeRate).toFixed(1)} MCM</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
                <div className="text-slate-400 font-medium">Active Nodes</div>
                <p className="font-bold text-slate-800 mt-0.5">{selectedDistrict.activeSensors} DWLR</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
                <div className="text-slate-400 font-medium">Trend Rate</div>
                <p className="font-bold text-slate-800 mt-0.5">{(selectedDistrict.groundwaterDepth * 0.05).toFixed(1)} m/month</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Escalation Pipeline Log Timeline ────────────── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="card p-5 bg-white h-full">
            <SectionHeader title="Recent Risk Escalations" subtitle="Basin alerts timeline logs" className="mb-4" />
            <Timeline events={alertTimelineEvents} />
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
