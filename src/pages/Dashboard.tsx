// =============================================================================
// Module 1: National Operations Center (Command Center Dashboard)
// =============================================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, Shield, Zap, Map as MapIcon, ArrowRight,
  FileText, Download, CheckCircle, Database, Server, Radio,
  ShieldCheck, AlertCircle, Clock
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
  MOCK_ALERTS, MOCK_DISTRICTS, DASHBOARD_STATS,
} from '@/constants/mockData';
import { MAP_CONFIG, RISK_COLORS } from '@/constants';
import { formatDistanceToNow } from 'date-fns';

// Custom controller to disable interactive controls for a static mini-map
function MiniMapController() {
  const map = useMap();
  useEffect(() => {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
  }, [map]);
  return null;
}

export function Dashboard() {
  const navigate = useNavigate();

  // Sort critical districts
  const criticalDistricts = MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical' || d.riskLevel === 'high');

  return (
    <PageContainer
      title="National Groundwater Operations Center"
      subtitle="Central hydrological database telemetry nodes and regional directive control panels"
      actions={
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Operations Room Active
          </span>
        </div>
      }
    >
      {/* Three-Column Split Command Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full min-h-[580px]">

        {/* ── LEFT COLUMN: National Overview Map & Summary ──────────────── */}
        <div className="flex flex-col gap-5 h-full">
          <div className="card p-4 bg-white flex flex-col flex-1">
            <SectionHeader 
              title="India Tactical Telemetry Map" 
              subtitle="Current monitored basin coordinate distribution clusters" 
              action={<Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="text-xs">Expand Map</Button>}
            />
            
            {/* Mini Map centerpiece container */}
            <div className="h-56 w-full rounded border border-slate-200 overflow-hidden mt-3 relative z-10">
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
                {MOCK_DISTRICTS.map(d => (
                  <CircleMarker
                    key={d.id}
                    center={[d.coordinates.lat, d.coordinates.lng]}
                    radius={5}
                    pathOptions={{
                      color: RISK_COLORS[d.riskLevel],
                      fillColor: RISK_COLORS[d.riskLevel],
                      fillOpacity: 0.7,
                      weight: 1,
                    }}
                  />
                ))}
                <MiniMapController />
              </MapContainer>
            </div>

            {/* National summary text pane */}
            <div className="mt-4 bg-slate-50 border border-slate-100 rounded p-4 text-xs space-y-3">
              <p className="font-bold text-slate-800 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-blue-600" />
                Hydrological Summary
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                National aquifers are currently functioning at an average storage index coefficient of <span className="font-bold text-slate-900">{DASHBOARD_STATS.groundwaterSustainability}%</span>. 
                Recent telemetry checks confirm <span className="font-bold text-slate-900">{DASHBOARD_STATS.activeSensors}</span> active DWLR node arrays delivering data packets.
              </p>
              <div className="text-[10px] text-slate-400 font-medium">
                Baseline standard deviations calculated at 09:30 IST.
              </div>
            </div>
          </div>
        </div>

        {/* ── MIDDLE COLUMN: Critical Alerts & Telemetry Status ─────────── */}
        <div className="flex flex-col gap-5 h-full">
          <div className="card p-4 bg-white flex flex-col flex-1">
            <SectionHeader 
              title="Aquifer Alerts Queue" 
              subtitle="Escalated telemetry anomalies requiring administrative dispatch" 
            />
            
            {/* Scrolling Incident Alerts */}
            <div className="space-y-3 mt-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
              {MOCK_ALERTS.map(alert => {
                const isCritical = alert.severity === 'critical';
                return (
                  <div 
                    key={alert.id} 
                    className={[
                      'p-3.5 rounded border text-xs flex items-start gap-3 transition-colors bg-white',
                      isCritical ? 'border-red-200 hover:bg-red-50/20' : 'border-slate-200 hover:bg-slate-50/30'
                    ].join(' ')}
                  >
                    <span className={['p-1 rounded mt-0.5', isCritical ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'].join(' ')}>
                      <AlertTriangle size={13} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{alert.districtName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1">{alert.type}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Operations Status & Quick Actions ──────────── */}
        <div className="flex flex-col gap-5 h-full">
          
          {/* Operations Node array health */}
          <div className="card p-4 bg-white flex flex-col">
            <SectionHeader 
              title="DWLR Network Telemetry Health" 
              subtitle="Physical network node diagnostics" 
            />
            <div className="space-y-3 mt-3">
              {[
                { label: 'Uptime Index', value: '99.82%', sub: 'Target 99.50%', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Sensors', value: `${DASHBOARD_STATS.activeSensors} / ${DASHBOARD_STATS.totalSensors}`, sub: 'Telemetry active', icon: Radio, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Offline Nodes', value: `${DASHBOARD_STATS.offlineSensors} Nodes`, sub: 'Maintenance required', icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded ${item.bg} ${item.color}`}>
                      <item.icon size={13} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-none">{item.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-none">{item.sub}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-4 bg-white flex flex-col flex-1 justify-between">
            <div>
              <SectionHeader 
                title="Operations Command Menu" 
                subtitle="Dispatch policy, export logs, generate audits" 
              />
              <div className="space-y-2 mt-3">
                <Button 
                  variant="primary" 
                  fullWidth 
                  icon={<FileText size={13} />} 
                  onClick={() => navigate('/reports')}
                  className="text-xs py-2"
                >
                  Generate Hydrological Audit
                </Button>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  icon={<Download size={13} />}
                  className="text-xs py-2"
                >
                  Export Sensor Telemetry Logs
                </Button>
              </div>
            </div>
            
            {/* Direct access info footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed flex items-center gap-1.5">
              <Clock size={11} className="text-slate-300" />
              <span>National Operations Command Center · Delhi Headquarters</span>
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
}
