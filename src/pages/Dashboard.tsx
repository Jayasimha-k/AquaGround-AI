// =============================================================================
// Module 1: National Operations Center (Command Center Dashboard)
// =============================================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, Server, Radio,
  ShieldCheck, AlertCircle, Clock, Droplets,
  FileText, Download, TrendingUp, Wifi, ChevronRight
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
import { useLanguage } from '@/contexts/LanguageContext';

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
  icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: 'blue' | 'green' | 'indigo' | 'rose';
}

function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
  const styles: Record<string, { border: string; bg: string; iconBg: string; iconColor: string }> = {
    blue:   { border: '#3B82F6', bg: '#FFFFFF', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    green:  { border: '#10B981', bg: '#FFFFFF', iconBg: '#ECFDF5', iconColor: '#059669' },
    indigo: { border: '#6366F1', bg: '#FFFFFF', iconBg: '#EEF2FF', iconColor: '#4F46E5' },
    rose:   { border: '#F43F5E', bg: '#FFFFFF', iconBg: '#FEF2F2', iconColor: '#E11D48' },
  };

  const s = styles[accent];

  return (
    <div
      style={{
        background: s.bg,
        border: '1px solid #E8EDF3',
        borderLeft: `5px solid ${s.border}`,
        borderRadius: '14px',
        padding: '24px 28px',
        boxShadow: '0 4px 16px rgba(15,23,42,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
    >
      <div>
        <p style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px 0' }}>
          {label}
        </p>
        <p style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px', lineHeight: 1.1, margin: '0 0 6px 0' }}>
          {value}
        </p>
        <p style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, margin: 0 }}>
          {sub}
        </p>
      </div>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: s.iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, marginLeft: '16px',
      }}>
        <Icon size={24} color={s.iconColor} />
      </div>
    </div>
  );
}

// ── Alert Row ─────────────────────────────────────────────────────────────────
function AlertRow({ alert }: { alert: typeof MOCK_ALERTS[0] }) {
  const isCritical = alert.severity === 'critical';
  const isWarning  = alert.severity === 'warning';

  const borderColor = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6';
  const bgColor     = isCritical ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#EFF6FF';
  const iconColor   = isCritical ? '#DC2626' : isWarning ? '#D97706' : '#2563EB';

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8EDF3',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '12px',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
      transition: 'all 0.15s',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, marginTop: '2px',
      }}>
        <AlertTriangle size={18} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{alert.districtName}</span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, flexShrink: 0 }}>
            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p style={{ fontSize: '12.5px', fontWeight: 700, color: iconColor, margin: '0 0 4px 0' }}>{alert.type}</p>
        <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>{alert.message}</p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <PageContainer
      title={t('dash_title', 'National Groundwater Operations Center')}
      subtitle={t('dash_subtitle', 'Central hydrological database telemetry nodes and regional directive control panels')}
      actions={
        <span style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12.5px', fontWeight: 700, color: '#047857',
          background: '#ECFDF5', border: '1px solid #A7F3D0',
          padding: '8px 14px', borderRadius: '10px',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
          {t('ops_room_active', 'Operations Room Active')}
        </span>
      }
    >

      {/* ── KPI Stat Cards ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <StatCard
          label={t('dash_kpi_health', 'National Health Index')}
          value={`${DASHBOARD_STATS.nationalHealthScore}%`}
          sub={t('dash_kpi_health_sub', 'Weighted basin telemetry health')}
          icon={Activity}
          accent="blue"
        />
        <StatCard
          label={t('dash_kpi_sustain', 'Sustainability Storage')}
          value={`${DASHBOARD_STATS.groundwaterSustainability}%`}
          sub={t('dash_kpi_sustain_sub', 'Average storage sustainability rate')}
          icon={Droplets}
          accent="green"
        />
        <StatCard
          label={t('dash_kpi_sensors', 'Active DWLR Sensors')}
          value={`${DASHBOARD_STATS.activeSensors} / ${DASHBOARD_STATS.totalSensors}`}
          sub={t('dash_kpi_sensors_sub', 'Node arrays transmitting')}
          icon={Server}
          accent="indigo"
        />
        <StatCard
          label={t('dash_kpi_alerts', 'Escalated Alerts')}
          value={`${DASHBOARD_STATS.todayAlerts}`}
          sub={t('dash_kpi_alerts_sub', 'Active anomalies awaiting review')}
          icon={AlertTriangle}
          accent="rose"
        />
      </div>

      {/* ── Three-Column Command Layout ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── LEFT: Map + Summary ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '28px', background: '#FFFFFF' }}>
            <SectionHeader
              title={t('map_title', 'India Tactical Telemetry Map')}
              subtitle={t('map_subtitle', 'Live DWLR basin coordinate cluster distribution')}
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
                  {t('expand_map', 'Expand Map →')}
                </Button>
              }
            />

            {/* Mini Map */}
            <div style={{ height: '280px', width: '100%', borderRadius: '12px', border: '1px solid #E8EDF3', overflow: 'hidden', marginTop: '18px', position: 'relative', zIndex: 10 }}>
              <MapContainer
                center={[22.5937, 78.9629]}
                zoom={4}
                zoomControl={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer url={MAP_CONFIG.TILE_URL} attribution="" />
                {MOCK_DISTRICTS.map(d => (
                  <CircleMarker
                    key={d.id}
                    center={[d.coordinates.lat, d.coordinates.lng]}
                    radius={7}
                    pathOptions={{
                      color: RISK_COLORS[d.riskLevel],
                      fillColor: RISK_COLORS[d.riskLevel],
                      fillOpacity: 0.8,
                      weight: 2,
                    }}
                  />
                ))}
                <MiniMapController />
              </MapContainer>
            </div>

            {/* Legend */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: t('risk_critical', 'Critical'), color: '#EF4444' },
                { label: t('risk_high', 'High'),         color: '#F97316' },
                { label: t('risk_moderate', 'Moderate'), color: '#3B82F6' },
                { label: t('risk_low', 'Low'),           color: '#10B981' },
              ].map(l => (
                <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  {l.label}
                </span>
              ))}
            </div>

            {/* Summary pane */}
            <div style={{ marginTop: '20px', background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '12px', padding: '18px' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
                <ShieldCheck size={14} color="#2563EB" />
                {t('hydro_summary', 'Hydrological Summary')}
              </p>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: '0 0 6px 0' }}>
                National aquifers at{' '}
                <strong style={{ color: '#0F172A' }}>{DASHBOARD_STATS.groundwaterSustainability}%</strong>{' '}
                average storage index.{' '}
                <strong style={{ color: '#0F172A' }}>{DASHBOARD_STATS.activeSensors}</strong>{' '}
                DWLR nodes active and transmitting.
              </p>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                Baseline deviations calculated at 09:30 IST
              </p>
            </div>

            {/* Live Open-Meteo Satellite Data Stream Badge */}
            <div style={{ marginTop: '16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', animation: 'pulse 2s infinite' }} />
                  {t('live_api_badge', 'Live Free APIs Connected')}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, background: '#DBEAFE', color: '#1E40AF', padding: '2px 7px', borderRadius: '4px' }}>
                  Open-Meteo + Gemini
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#1E293B', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                {t('live_api_text', 'Receiving real-time live precipitation, temperature, and topsoil moisture telemetry directly from free Open-Meteo REST API & Google Gemini XAI.')}
              </p>
            </div>
          </div>
        </div>


        {/* ── MIDDLE: Alerts Queue ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '28px', background: '#FFFFFF' }}>
            <SectionHeader
              title={t('alerts_queue_title', 'Aquifer Alerts Queue')}
              subtitle={t('alerts_queue_subtitle', 'Escalated anomalies requiring administrative dispatch')}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px', maxHeight: '560px', overflowY: 'auto', paddingRight: '4px' }}>
              {MOCK_ALERTS.map(alert => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Network Health + Quick Actions ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Network Telemetry Health */}
          <div className="card" style={{ padding: '28px', background: '#FFFFFF' }}>
            <SectionHeader
              title={t('network_telemetry_title', 'DWLR Network Telemetry')}
              subtitle={t('network_telemetry_subtitle', 'Physical node diagnostics & uptime')}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Wifi size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 3px 0' }}>{t('uptime_index', 'Uptime Index')}</p>
                    <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>Target ≥ 99.50%</p>
                  </div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>99.82%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Radio size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 3px 0' }}>{t('dash_kpi_sensors', 'Active DWLR Sensors')}</p>
                    <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>Telemetry active</p>
                  </div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                  {DASHBOARD_STATS.activeSensors}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginLeft: '4px' }}>/ {DASHBOARD_STATS.totalSensors}</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 3px 0' }}>{t('offline_nodes', 'Offline Nodes')}</p>
                    <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>Maintenance required</p>
                  </div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#EF4444' }}>
                  {DASHBOARD_STATS.offlineSensors}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '6px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>
                  <span>{t('network_coverage', 'Network Coverage')}</span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>
                    {Math.round((DASHBOARD_STATS.activeSensors / DASHBOARD_STATS.totalSensors) * 100)}%
                  </span>
                </div>
                <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #3B82F6, #6366F1)', borderRadius: '99px', width: `${Math.round((DASHBOARD_STATS.activeSensors / DASHBOARD_STATS.totalSensors) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operations Command Menu */}
          <div className="card" style={{ padding: '28px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <SectionHeader
              title={t('ops_command_title', 'Operations Command')}
              subtitle={t('ops_command_subtitle', 'Dispatch policy, export logs, generate audits')}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
              <Button
                variant="primary"
                fullWidth
                icon={<FileText size={16} />}
                onClick={() => navigate('/reports')}
              >
                {t('gen_audit', 'Generate Hydrological Audit')}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={<Download size={16} />}
              >
                {t('export_logs', 'Export Sensor Telemetry Logs')}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                icon={<TrendingUp size={16} />}
                onClick={() => navigate('/predictions')}
              >
                {t('view_predictions', 'View Prediction Center')}
              </Button>
            </div>

            <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
              <Clock size={13} color="#94A3B8" />
              <span>National Ops Center · Delhi HQ · IST</span>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}

