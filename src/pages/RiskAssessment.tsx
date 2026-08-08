import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PageContainer } from '@/components/ui/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Timeline } from '@/components/ui/Timeline';
import { MOCK_DISTRICTS, MOCK_ALERTS } from '@/constants/mockData';
import { MAP_CONFIG, RISK_COLORS } from '@/constants';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(MOCK_DISTRICTS[0].id);
  const selectedDistrict = MOCK_DISTRICTS.find(d => d.id === selectedId) || MOCK_DISTRICTS[0];
  const criticalDistricts = MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical' || d.riskLevel === 'high');

  const riskBgMap: Record<string, string> = {
    critical: '#FEF2F2',
    high:     '#FFF7ED',
    moderate: '#EFF6FF',
    low:      '#ECFDF5',
    stable:   '#ECFDF5',
  };

  return (
    <PageContainer
      title={t('risk_title', 'Regional Risk Monitor')}
      subtitle={t('risk_subtitle', 'Hydrological risk triaging, critical basins, and escalation pipelines')}
    >
      {/* 3-column grid: sidebar | map+details | timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: '20px', minHeight: 600 }}>

        {/* ── Left: Basin Action Queue ──────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionHeader
            title={t('basin_action_queue', 'Basin Action Queue')}
            subtitle={t('regions_critical_zone', 'Regions in critical depletion zone')}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: 580 }}>
            {criticalDistricts.map(d => {
              const isSelected = d.id === selectedId;
              const riskColor = RISK_COLORS[d.riskLevel];
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  style={{
                    background: isSelected ? riskBgMap[d.riskLevel] || '#F8FAFC' : '#FFFFFF',
                    border: `1px solid ${isSelected ? riskColor : '#E8EDF3'}`,
                    borderLeft: `4px solid ${riskColor}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? `0 4px 16px ${riskColor}22`
                      : '0 1px 3px rgba(15,23,42,0.06)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                        {d.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>
                        {d.state}
                      </p>
                    </div>
                    <StatusBadge variant={d.riskLevel} size="sm" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                    <span style={{ color: '#64748B', fontFamily: 'monospace' }}>
                      Depth: {d.groundwaterDepth}m BGL
                    </span>
                    <span style={{ color: d.trend === 'down' ? '#EF4444' : '#10B981' }}>
                      {d.trend === 'down' ? '↓ Depleting' : '→ Stable'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center: Map + Detail Metrics ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Risk Map */}
          <div className="card" style={{ padding: '24px' }}>
            <SectionHeader
              title={t('india_risk_mapping', 'India Risk Mapping')}
              subtitle={t('geographic_view', 'Geographic view of over-extracted aquifer regions')}
            />
            <div style={{
              height: 260, width: '100%', borderRadius: '10px',
              border: '1px solid #E8EDF3', overflow: 'hidden', marginTop: '16px',
              position: 'relative', zIndex: 10,
            }}>
              <MapContainer
                center={[22.5937, 78.9629]}
                zoom={4}
                zoomControl={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer url={MAP_CONFIG.TILE_URL} attribution="" />
                {criticalDistricts.map(d => (
                  <CircleMarker
                    key={d.id}
                    center={[d.coordinates.lat, d.coordinates.lng]}
                    radius={selectedId === d.id ? 9 : 6}
                    pathOptions={{
                      color: RISK_COLORS[d.riskLevel],
                      fillColor: RISK_COLORS[d.riskLevel],
                      fillOpacity: 0.85,
                      weight: selectedId === d.id ? 2.5 : 1.5,
                    }}
                  >
                    <Tooltip direction="top" opacity={1}>
                      <span style={{ fontWeight: 700, fontSize: '12px' }}>
                        {d.name} ({d.state})
                      </span>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Diagnostic detail card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#3B82F6" />
                  {selectedDistrict.name} {t('diagnostics', 'Diagnostics')}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>{selectedDistrict.state}</p>
              </div>
              <StatusBadge variant={selectedDistrict.riskLevel} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
              {[
                { label: t('bgl_depth', 'BGL Depth'),      value: `${selectedDistrict.groundwaterDepth} m`, color: '#0F172A' },
                { label: t('annual_deficit', 'Annual Deficit'), value: `${(selectedDistrict.extractionRate - selectedDistrict.rechargeRate).toFixed(1)} MCM`, color: '#EF4444' },
                { label: t('active_nodes', 'Active Nodes'),   value: `${selectedDistrict.activeSensors} DWLR`,  color: '#0F172A' },
                { label: t('trend_rate', 'Trend Rate'),     value: `${(selectedDistrict.groundwaterDepth * 0.05).toFixed(1)} m/mo`, color: '#0F172A' },
              ].map((m, i) => (
                <div key={i} style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '14px 16px' }}>
                  <p style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    {m.label}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: m.color, marginTop: '6px', lineHeight: 1 }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Escalation Timeline ────────────────────────────────── */}
        <div>
          <div className="card" style={{ padding: '24px', height: '100%' }}>
            <SectionHeader
              title={t('risk_escalations', 'Risk Escalations')}
              subtitle={t('alerts_timeline', 'Basin alerts timeline log')}
            />
            <div style={{ marginTop: '16px' }}>
              <Timeline events={alertTimelineEvents} />
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

