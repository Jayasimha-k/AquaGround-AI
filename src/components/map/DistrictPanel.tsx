import React from 'react';
import {
  X, MapPin, Activity, TrendingDown, TrendingUp,
  Minus, Droplets, Brain, AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WaterLevelChart } from '@/components/charts';
import { RISK_COLORS } from '@/constants';
import { MOCK_ALERTS } from '@/constants/mockData';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export function DistrictPanel() {
  const { state, selectDistrict } = useApp();
  const { t } = useLanguage();
  const district = state.selectedDistrict;

  if (!district) return null;

  const districtAlerts = MOCK_ALERTS.filter(a => a.districtId === district.id);
  const riskColor = RISK_COLORS[district.riskLevel];

  const TrendIcon = district.trend === 'up' ? TrendingUp
    : district.trend === 'down' ? TrendingDown
    : Minus;

  return (
    <div
      style={{
        position: 'absolute', top: '16px', right: '16px', bottom: '16px',
        width: '340px', zIndex: 1002, background: '#FFFFFF',
        border: '1px solid #E8EDF3', borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(15,23,42,0.15)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #F1F5F9', borderLeft: `4px solid ${riskColor}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
              {district.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
              <MapPin size={12} color="#94A3B8" />
              {district.state}
            </div>
          </div>
          <button
            onClick={() => selectDistrict(null)}
            style={{
              padding: '6px', borderRadius: '8px', border: 'none', background: '#F8FAFC',
              cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
          >
            <X size={15} />
          </button>
        </div>

        {/* Health Score */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '14px', background: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', border: '1px solid #EEF2F7' }}>
          <div style={{ width: '44px', height: '44px', position: 'relative', flexShrink: 0 }}>
            <svg viewBox="0 0 56 56" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#E2E8F0" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="22" fill="none" stroke={riskColor} strokeWidth="4"
                strokeDasharray="138"
                strokeDashoffset={138 - (138 * district.healthScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>
              {district.healthScore}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{t('health_status', 'Health Status')}</span>
              <StatusBadge variant={district.riskLevel} size="sm" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendIcon size={14} style={{ color: district.trend === 'down' ? '#EF4444' : '#10B981' }} />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                {district.groundwaterDepth} m BGL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body content scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Telemetry Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '12px 14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>{t('dash_kpi_sensors', 'Active DWLR')}</p>
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '4px', margin: 0 }}>
              {district.activeSensors} <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>/ {district.totalSensors}</span>
            </p>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '12px 14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>{t('offline_nodes', 'Offline Nodes')}</p>
            <p style={{ fontSize: '15px', fontWeight: 800, color: district.offlineSensors > 0 ? '#EF4444' : '#10B981', marginTop: '4px', margin: 0 }}>
              {district.offlineSensors}
            </p>
          </div>
        </div>

        {/* Water Balance */}
        <div style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '14px' }}>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px 0' }}>
            {t('water_balance', 'Water Balance (MCM/yr)')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>{t('recharge', 'Recharge')}</span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>{district.rechargeRate} MCM</span>
              </div>
              <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (district.rechargeRate / 10) * 100)}%`, background: '#10B981', borderRadius: '99px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#64748B', fontWeight: 500 }}>{t('extraction', 'Extraction')}</span>
                <span style={{ fontWeight: 700, color: '#EF4444' }}>{district.extractionRate} MCM</span>
              </div>
              <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (district.extractionRate / 10) * 100)}%`, background: '#EF4444', borderRadius: '99px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Trend Chart */}
        <div>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>
            {t('gw_trend_30d', 'Groundwater Trend (30-day)')}
          </p>
          <div style={{ background: '#FFFFFF', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '10px' }}>
            <WaterLevelChart
              labels={district.waterLevelHistory.map((_, i) => `D-${30 - i}`)}
              depthData={district.waterLevelHistory.map(h => h.depth)}
              height={140}
            />
          </div>
        </div>

        {/* Active Alerts */}
        {districtAlerts.length > 0 && (
          <div>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={12} color="#EF4444" /> {t('active_anomalies', 'Active Anomalies')} ({districtAlerts.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {districtAlerts.map(alert => (
                <div key={alert.id} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '3px solid #EF4444', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', margin: '0 0 3px 0' }}>{alert.type}</p>
                  <p style={{ fontSize: '11.5px', color: '#7F1D1D', margin: 0, lineHeight: 1.4 }}>{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interventions hint */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Brain size={16} color="#2563EB" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '11.5px', color: '#1D4ED8', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
            {t('decision_support_hint', 'Automated recommendations for this region are managed in the Decision Support workspace.')}
          </p>
        </div>

      </div>
    </div>
  );
}

