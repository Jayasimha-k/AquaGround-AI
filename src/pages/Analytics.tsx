import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import {
  WaterLevelChart, ExtractionChart, RainfallChart,
  RiskDistributionChart,
} from '@/components/charts';
import {
  MONTHLY_WATER_LEVEL_DATA,
  MOCK_DISTRICTS,
  getDistrictTelemetryData,
} from '@/constants/mockData';
import {
  Filter, Download, HelpCircle, Activity, Droplets, ArrowUpRight,
  ShieldAlert, MapPin, Radio, Search, Layers, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type QuestionTab = 'depletion' | 'balance' | 'rainfall' | 'comparison';

export function Analytics() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeQuestion, setActiveQuestion] = useState<QuestionTab>('depletion');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique states sorted
  const availableStates = useMemo(() => {
    const states = Array.from(new Set(MOCK_DISTRICTS.map(d => d.state)));
    return ['all', ...states.sort()];
  }, []);

  // Filter districts by state & search query
  const filteredDistricts = useMemo(() => {
    return MOCK_DISTRICTS.filter(d => {
      const matchState = selectedState === 'all' || d.state === selectedState;
      const matchSearch = searchQuery === '' || 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchSearch;
    }).sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name));
  }, [selectedState, searchQuery]);

  // Selected district object (null if 'all')
  const selectedDistrict = useMemo(() => {
    if (selectedLocationId === 'all') return null;
    return MOCK_DISTRICTS.find(d => d.id === selectedLocationId) || null;
  }, [selectedLocationId]);

  // Get dynamic 12-month telemetry data curves for selected location
  const telemetryData = useMemo(() => {
    return getDistrictTelemetryData(selectedLocationId);
  }, [selectedLocationId]);

  // Calculate quick stats for side diagnostic panel
  const latestDepth = telemetryData.depth[telemetryData.depth.length - 1] || 22.8;
  const latestExtraction = selectedDistrict ? selectedDistrict.extractionRate : 9.8;
  const latestRecharge = selectedDistrict ? selectedDistrict.rechargeRate : 3.2;
  const deficitRatio = (latestExtraction / Math.max(0.1, latestRecharge)).toFixed(2);
  const totalRainfall = selectedDistrict ? selectedDistrict.rainfall : 650;

  // Question metadata
  const questions = [
    { id: 'depletion', label: t('q1_title', '1. Water Table Depletion'), icon: Droplets, title: t('q1_desc', 'Is the regional water table depleting over time?'), sub: t('q1_sub', 'Long-term groundwater depth trends below ground level (m BGL)') },
    { id: 'balance', label: t('q2_title', '2. Water Balance Index'), icon: Activity, title: t('q2_desc', 'Are extraction rates exceeding natural replenishment?'), sub: t('q2_sub', 'Comparison of annual extraction rate vs natural aquifer recharge (MCM/yr)') },
    { id: 'rainfall', label: t('q3_title', '3. Rainfall Correlation'), icon: HelpCircle, title: t('q3_desc', 'How does seasonal precipitation impact recovery?'), sub: t('q3_sub', 'Monthly rainfall distribution and storage index response indices') },
    { id: 'comparison', label: t('q4_title', '4. Basin Comparison'), icon: ShieldAlert, title: t('q4_desc', 'Which regional aquifer basins are changing fastest?'), sub: t('q4_sub', 'Direct state and district category classification analysis') },
  ];

  const currentQ = questions.find(q => q.id === activeQuestion) || questions[0];

  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case 'critical': return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
      case 'high': return { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' };
      case 'moderate': return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
      case 'low':
      case 'stable': return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      default: return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
    }
  };

  return (
    <PageContainer
      title={t('analytics_title', 'Resource Intelligence Workspace')}
      subtitle={t('analytics_subtitle', 'Hydrological analytics & DWLR telemetry trends tailored to diagnostic resource questions')}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedDistrict && (
            <Button
              variant="primary"
              size="sm"
              icon={<MapPin size={14} />}
              onClick={() => navigate('/map')}
            >
              View on Map
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={<Download size={14} />}>{t('export_data', 'Export Data')}</Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>

        {/* ── CARD 1: Telemetry Location Scope Selector ────────────────────── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F1F5F9',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <Layers size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                  Telemetry Location Scope
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 500 }}>
                  Filter DWLR monitoring stations & GIS map points across India
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* State Filter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                }}
              >
                <Filter size={14} style={{ color: '#94A3B8' }} />
                <span style={{ color: '#64748B', fontWeight: 600 }}>State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedLocationId('all');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#0F172A',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: 0,
                    boxShadow: 'none',
                  }}
                >
                  <option value="all">All States ({availableStates.length - 1})</option>
                  {availableStates.filter(s => s !== 'all').map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search map location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: '34px',
                    paddingRight: '14px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#0F172A',
                    width: '220px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location Selector Controls Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'flex-end' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Select Map Point / DWLR Monitoring Station ({filteredDistricts.length + 1} Points Available)
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <option value="all">All India (Regional Baseline - National Aggregated DWLR Average)</option>
                {filteredDistricts.map(d => (
                  <option key={d.id} value={d.id}>
                    [{d.state}] {d.name} — Risk: {d.riskLevel.toUpperCase()} | Depth: {d.groundwaterDepth}m BGL | Sensors: {d.activeSensors}/{d.totalSensors}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Status Info Badge */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Radio size={16} style={{ color: selectedDistrict ? '#059669' : '#2563EB' }} />
                <div>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                    {selectedDistrict ? `${selectedDistrict.name}, ${selectedDistrict.state}` : 'National Aggregate'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                    {selectedDistrict
                      ? `Lat ${selectedDistrict.coordinates.lat}° N, Lng ${selectedDistrict.coordinates.lng}° E`
                      : `${MOCK_DISTRICTS.length} DWLR Map Points Active`}
                  </span>
                </div>
              </div>
              {selectedDistrict && (() => {
                const badgeStyle = getRiskBadgeColor(selectedDistrict.riskLevel);
                return (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: badgeStyle.bg,
                      color: badgeStyle.color,
                      border: `1px solid ${badgeStyle.border}`,
                    }}
                  >
                    {selectedDistrict.riskLevel.toUpperCase()}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Location Key Stats Summary Pills (if specific location is selected) */}
          {selectedDistrict && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '14px',
                paddingTop: '16px',
                borderTop: '1px solid #F1F5F9',
              }}
            >
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Water Table</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#1E3A8A', marginTop: '4px', display: 'block' }}>{selectedDistrict.groundwaterDepth} m BGL</span>
              </div>
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Annual Extraction</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#7F1D1D', marginTop: '4px', display: 'block' }}>{selectedDistrict.extractionRate} MCM/yr</span>
              </div>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Natural Recharge</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#064E3B', marginTop: '4px', display: 'block' }}>{selectedDistrict.rechargeRate} MCM/yr</span>
              </div>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deficit Multiplier</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#7C2D12', marginTop: '4px', display: 'block' }}>{deficitRatio}×</span>
              </div>
            </div>
          )}
        </div>

        {/* ── CARD 2: Question Selector Tabs ──────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: '12px',
            background: '#FFFFFF',
            padding: '18px 24px',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
          }}
        >
          {questions.map(q => {
            const isSelected = activeQuestion === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestion(q.id as QuestionTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
                  background: isSelected ? '#EFF6FF' : '#F8FAFC',
                  boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.12)' : 'none',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <q.icon size={18} style={{ color: isSelected ? '#2563EB' : '#94A3B8', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#1D4ED8' : '#334155', lineHeight: 1.3 }}>
                  {q.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── CARD 3: Diagnostic Response Panel & Charts ───────────────────── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '28px 32px',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
          }}
        >
          {/* Diagnostic Header */}
          <div
            style={{
              paddingBottom: '20px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{currentQ.title}</h2>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '3px 10px',
                    borderRadius: '6px',
                  }}
                >
                  {selectedDistrict ? `${selectedDistrict.name} Telemetry` : 'All India Baseline'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', fontWeight: 500, margin: '6px 0 0 0' }}>{currentQ.sub}</p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563EB',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '5px 14px',
                borderRadius: '8px',
                flexShrink: 0,
              }}
            >
              {t('analytical_diagnostic', 'Analytical Diagnostic')}
            </span>
          </div>

          {/* ── QUESTION 1: Depletion Trend ────────────────────────────── */}
          {activeQuestion === 'depletion' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
              <WaterLevelChart
                labels={telemetryData.labels}
                depthData={telemetryData.depth}
                height={270}
              />
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 14px 0',
                    }}
                  >
                    <Droplets size={14} color="#3B82F6" /> {t('hydro_timeline', 'Hydrological Timeline')}
                  </p>
                  <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                    Analysis for <strong style={{ color: '#0F172A', fontWeight: 800 }}>{selectedDistrict ? `${selectedDistrict.name} (${selectedDistrict.state})` : 'All Regional Stations'}</strong> indicates a seasonal depth trajectory peaking at{' '}
                    <strong style={{ color: '#0F172A', fontWeight: 800 }}>{latestDepth}m BGL</strong>.
                    {selectedDistrict && selectedDistrict.riskLevel === 'critical'
                      ? ' High-frequency extraction in crop irrigation belts has caused acute groundwater table stress.'
                      : ' Monitored DWLR telemetry sensors report standard aquifer recovery following monsoon replenishment cycles.'}
                  </p>
                </div>
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                >
                  <span>Audit Horizon: 12-Month</span>
                  <span
                    onClick={() => navigate('/map')}
                    style={{ color: '#2563EB', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    GIS Map View <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 2: Water Balance ──────────────────────────────── */}
          {activeQuestion === 'balance' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
              <ExtractionChart 
                labels={telemetryData.labels} 
                extractionData={telemetryData.extraction} 
                rechargeData={telemetryData.recharge} 
                height={260} 
              />
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 14px 0',
                    }}
                  >
                    <Activity size={14} color="#3B82F6" /> {t('balance_auditing', 'Balance Auditing')}
                  </p>
                  <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                    Groundwater extraction at <strong style={{ color: '#0F172A', fontWeight: 800 }}>{selectedDistrict ? selectedDistrict.name : 'monitored basins'}</strong> averages <strong style={{ color: '#0F172A', fontWeight: 800 }}>{latestExtraction} MCM/yr</strong>, while active natural recharge replenishment is recorded at <strong style={{ color: '#0F172A', fontWeight: 800 }}>{latestRecharge} MCM/yr</strong>. 
                    This creates a water deficit ratio multiplier of <strong style={{ color: '#0F172A', fontWeight: 800 }}>{deficitRatio}×</strong>.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                >
                  <span>Balance Category: {Number(deficitRatio) > 2 ? 'Deficit Warning' : 'Balanced'}</span>
                  <span onClick={() => navigate('/decision-support')} style={{ color: '#2563EB', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Advisories <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 3: Rainfall Correlation ───────────────────────── */}
          {activeQuestion === 'rainfall' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
              <RainfallChart 
                labels={telemetryData.labels} 
                data={telemetryData.rainfall} 
                height={260} 
              />
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 14px 0',
                    }}
                  >
                    <HelpCircle size={14} color="#3B82F6" /> {t('precip_audits', 'Precipitation Audits')}
                  </p>
                  <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                    Telemetry at <strong style={{ color: '#0F172A', fontWeight: 800 }}>{selectedDistrict ? `${selectedDistrict.name} station` : 'regional stations'}</strong> records total annual precipitation of <strong style={{ color: '#0F172A', fontWeight: 800 }}>{totalRainfall} mm</strong>. Peak recharge correlates with monsoon months (Jul–Sep) with an estimated 30–45 day percolation delay.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                >
                  <span>Source Index: IMD / DWLR Telemetry</span>
                  <span onClick={() => navigate('/risk-assessment')} style={{ color: '#2563EB', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Risk Monitor <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 4: Basin Comparison ──────────────────────────── */}
          {activeQuestion === 'comparison' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
              <RiskDistributionChart 
                data={[
                  MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical').length,
                  MOCK_DISTRICTS.filter(d => d.riskLevel === 'high').length,
                  MOCK_DISTRICTS.filter(d => d.riskLevel === 'moderate').length,
                  0,
                  MOCK_DISTRICTS.filter(d => d.riskLevel === 'low' || d.riskLevel === 'stable').length,
                ]} 
                height={240} 
              />
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 14px 0',
                    }}
                  >
                    <ShieldAlert size={14} color="#3B82F6" /> {t('basin_distribution', 'Basin Category Distribution')}
                  </p>
                  <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                    Out of <strong style={{ color: '#0F172A', fontWeight: 800 }}>{MOCK_DISTRICTS.length}</strong> monitored aquifer map points across India, <strong style={{ color: '#DC2626', fontWeight: 800 }}>{MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical').length}</strong> locations are currently classified in the critical risk zone.
                    {selectedDistrict && (
                      <span style={{ display: 'block', marginTop: '12px', padding: '12px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE', color: '#1E3A8A', fontWeight: 700, fontSize: '12.5px' }}>
                        Current Point: {selectedDistrict.name} ({selectedDistrict.state}) is in {selectedDistrict.riskLevel.toUpperCase()} status (Health Score: {selectedDistrict.healthScore}/100).
                      </span>
                    )}
                  </p>
                </div>
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#64748B',
                    fontWeight: 600,
                  }}
                >
                  <span>Scope: All India GIS Map Points</span>
                  <span onClick={() => navigate('/risk-assessment')} style={{ color: '#2563EB', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open Risk Matrix <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </PageContainer>
  );
}
