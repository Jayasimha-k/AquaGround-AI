// =============================================================================
// Module 1: National Operations Center (Command Center Dashboard)
// =============================================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, Server, Radio,
  ShieldCheck, AlertCircle, Clock, Droplets,
  FileText, Download, TrendingUp, Wifi
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import {
  MOCK_ALERTS, MOCK_DISTRICTS, DASHBOARD_STATS,
} from '@/constants/mockData';
import { MAP_CONFIG, RISK_COLORS } from '@/constants';
import { formatDistanceToNow } from 'date-fns';

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

// ── Stat Card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: 'blue' | 'green' | 'indigo' | 'rose';
}

function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
  const iconStyles = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    rose:   'bg-rose-50 text-rose-600',
  };
  return (
    <div className={`stat-card stat-card-${accent}`}>
      <div style={{ paddingLeft: '8px' }}>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </p>
        <p className="text-[30px] font-black text-slate-900 tracking-tight leading-none mb-1.5">
          {value}
        </p>
        <p className="text-[12px] text-slate-500 font-medium leading-snug">
          {sub}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ml-4 ${iconStyles[accent]}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}

// ── Alert Row ─────────────────────────────────────────────────────────────────
function AlertRow({ alert }: { alert: typeof MOCK_ALERTS[0] }) {
  const isCritical = alert.severity === 'critical';
  const isWarning  = alert.severity === 'warning';

  const rowClass = isCritical
    ? 'alert-row alert-row-critical'
    : isWarning
    ? 'alert-row alert-row-warning'
    : 'alert-row alert-row-info';

  const iconBg = isCritical
    ? 'bg-red-100 text-red-600'
    : isWarning
    ? 'bg-amber-100 text-amber-600'
    : 'bg-blue-100 text-blue-600';

  return (
    <div className={rowClass}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
        <AlertTriangle size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[13px] font-bold text-slate-900 leading-none">{alert.districtName}</span>
          <span className="text-[11px] text-slate-400 font-medium shrink-0">
            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-[12px] text-slate-600 font-semibold leading-none mb-1">{alert.type}</p>
        <p className="text-[12px] text-slate-400 leading-snug line-clamp-2">{alert.message}</p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="National Groundwater Operations Center"
      subtitle="Central hydrological database telemetry nodes and regional directive control panels"
      actions={
        <span className="flex items-center gap-1.5 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Operations Room Active
        </span>
      }
    >

      {/* ── KPI Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard
          label="National Health Index"
          value={`${DASHBOARD_STATS.nationalHealthScore}%`}
          sub="Weighted basin telemetry health"
          icon={Activity}
          accent="blue"
        />
        <StatCard
          label="Sustainability Storage"
          value={`${DASHBOARD_STATS.groundwaterSustainability}%`}
          sub="Average storage sustainability rate"
          icon={Droplets}
          accent="green"
        />
        <StatCard
          label="Active DWLR Sensors"
          value={`${DASHBOARD_STATS.activeSensors} / ${DASHBOARD_STATS.totalSensors}`}
          sub="Node arrays transmitting"
          icon={Server}
          accent="indigo"
        />
        <StatCard
          label="Escalated Alerts"
          value={`${DASHBOARD_STATS.todayAlerts}`}
          sub="Active anomalies awaiting review"
          icon={AlertTriangle}
          accent="rose"
        />
      </div>

      {/* ── Three-Column Command Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT: Map + Summary ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="card p-6 flex flex-col">
            <SectionHeader
              title="India Tactical Telemetry Map"
              subtitle="Live DWLR basin coordinate cluster distribution"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
                  Expand Map
                </Button>
              }
            />

            {/* Mini Map */}
            <div className="h-60 w-full rounded-xl border border-slate-200 overflow-hidden mt-4 relative z-10">
              <MapContainer
                center={[22.5937, 78.9629]}
                zoom={4}
                zoomControl={false}
                className="w-full h-full"
              >
                <TileLayer url={MAP_CONFIG.TILE_URL} attribution="" />
                {MOCK_DISTRICTS.map(d => (
                  <CircleMarker
                    key={d.id}
                    center={[d.coordinates.lat, d.coordinates.lng]}
                    radius={6}
                    pathOptions={{
                      color: RISK_COLORS[d.riskLevel],
                      fillColor: RISK_COLORS[d.riskLevel],
                      fillOpacity: 0.75,
                      weight: 1.5,
                    }}
                  />
                ))}
                <MiniMapController />
              </MapContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              {[
                { label: 'Critical', color: '#EF4444' },
                { label: 'High',     color: '#F97316' },
                { label: 'Moderate', color: '#3B82F6' },
                { label: 'Low',      color: '#10B981' },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>

            {/* Summary pane */}
            <div className="mt-4 inner-section space-y-2">
              <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-blue-500" />
                Hydrological Summary
              </p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                National aquifers at{' '}
                <span className="font-bold text-slate-900">{DASHBOARD_STATS.groundwaterSustainability}%</span>{' '}
                average storage index.{' '}
                <span className="font-bold text-slate-900">{DASHBOARD_STATS.activeSensors}</span>{' '}
                DWLR nodes active and transmitting.
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Baseline deviations calculated at 09:30 IST
              </p>
            </div>
          </div>
        </div>

        {/* ── MIDDLE: Alerts Queue ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="card p-6 flex flex-col">
            <SectionHeader
              title="Aquifer Alerts Queue"
              subtitle="Escalated anomalies requiring administrative dispatch"
            />
            <div className="space-y-3 mt-4 overflow-y-auto" style={{ maxHeight: 520 }}>
              {MOCK_ALERTS.map(alert => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Network Health + Quick Actions ─────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Network Telemetry Health */}
          <div className="card p-6">
            <SectionHeader
              title="DWLR Network Telemetry"
              subtitle="Physical node diagnostics & uptime"
            />
            <div className="space-y-3 mt-4">

              <div className="network-row">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Wifi size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 leading-none">Uptime Index</p>
                    <p className="text-[11px] text-slate-400 mt-1">Target ≥ 99.50%</p>
                  </div>
                </div>
                <span className="text-[15px] font-black text-emerald-600">99.82%</span>
              </div>

              <div className="network-row">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Radio size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 leading-none">Active Sensors</p>
                    <p className="text-[11px] text-slate-400 mt-1">Telemetry active</p>
                  </div>
                </div>
                <span className="text-[15px] font-black text-slate-900">
                  {DASHBOARD_STATS.activeSensors}
                  <span className="text-[12px] font-medium text-slate-400 ml-1">/ {DASHBOARD_STATS.totalSensors}</span>
                </span>
              </div>

              <div className="network-row">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800 leading-none">Offline Nodes</p>
                    <p className="text-[11px] text-slate-400 mt-1">Maintenance required</p>
                  </div>
                </div>
                <span className="text-[15px] font-black text-rose-500">
                  {DASHBOARD_STATS.offlineSensors}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-2">
                  <span>Network Coverage</span>
                  <span className="font-bold text-slate-700">
                    {Math.round((DASHBOARD_STATS.activeSensors / DASHBOARD_STATS.totalSensors) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((DASHBOARD_STATS.activeSensors / DASHBOARD_STATS.totalSensors) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operations Command Menu */}
          <div className="card p-6 flex flex-col gap-4">
            <SectionHeader
              title="Operations Command"
              subtitle="Dispatch policy, export logs, generate audits"
            />

            <div className="space-y-3 mt-1">
              <Button
                variant="primary"
                fullWidth
                icon={<FileText size={15} />}
                onClick={() => navigate('/reports')}
              >
                Generate Hydrological Audit
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={<Download size={15} />}
              >
                Export Sensor Telemetry Logs
              </Button>
              <Button
                variant="ghost"
                fullWidth
                icon={<TrendingUp size={15} />}
                onClick={() => navigate('/predictions')}
              >
                View Prediction Center
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11.5px] text-slate-400 font-medium">
              <Clock size={12} className="text-slate-300 shrink-0" />
              <span>National Ops Center · Delhi HQ · IST</span>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
