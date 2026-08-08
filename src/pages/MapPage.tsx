import React, { useState, useMemo } from 'react';
import { NationalMap } from '@/components/map/NationalMap';
import { LayerControl, MapToolbar } from '@/components/map/LayerControl';
import { DistrictPanel } from '@/components/map/DistrictPanel';
import { useApp } from '@/contexts/AppContext';
import { MOCK_DISTRICTS } from '@/constants/mockData';
import {
  Search, RefreshCcw, MapPin, Grid, Layers,
  Droplets, Activity, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

// Indian States represented in MOCK_DISTRICTS
const MONITORED_STATES = Array.from(new Set(MOCK_DISTRICTS.map(d => d.state))).sort();

export function MapPage() {
  const { state: appState, selectDistrict } = useApp();
  const { t } = useLanguage();

  // Centralized GIS Filter State
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('all');
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [activeBasemap, setActiveBasemap] = useState<'light' | 'satellite' | 'terrain'>('light');
  const [heatmapParameter, setHeatmapParameter] = useState<'risk' | 'depth' | 'extraction' | 'rainfall'>('risk');

  // Filter districts list based on selected state for the district dropdown
  const availableDistricts = useMemo(() => {
    if (selectedState === 'all') return [];
    return MOCK_DISTRICTS.filter(d => d.state === selectedState).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedState]);

  // Handle State Dropdown Change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedState(val);
    setSelectedDistrictId('all');
    selectDistrict(null);
  };

  // Handle District Dropdown Change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDistrictId(val);
    if (val === 'all') {
      selectDistrict(null);
    } else {
      const match = MOCK_DISTRICTS.find(d => d.id === val);
      if (match) selectDistrict(match);
    }
  };

  // Toggle Risk Selection
  const toggleRiskSelection = (risk: string) => {
    setSelectedRisks(prev =>
      prev.includes(risk) ? prev.filter(r => r !== risk) : [...prev, risk]
    );
  };

  // Autocomplete Search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchSuggestions([]);
      return;
    }

    const matches: string[] = [];
    MOCK_DISTRICTS.forEach(d => {
      if (d.name.toLowerCase().includes(query.toLowerCase()) && !matches.includes(d.name)) {
        matches.push(d.name);
      }
      if (d.state.toLowerCase().includes(query.toLowerCase()) && !matches.includes(d.state)) {
        matches.push(d.state);
      }
    });

    setSearchSuggestions(matches.slice(0, 5));
  };

  // Select Search Suggestion
  const handleSelectSuggestion = (val: string) => {
    setSearchQuery(val);
    setSearchSuggestions([]);

    if (MONITORED_STATES.includes(val)) {
      setSelectedState(val);
      setSelectedDistrictId('all');
      selectDistrict(null);
    } else {
      const match = MOCK_DISTRICTS.find(d => d.name.toLowerCase() === val.toLowerCase());
      if (match) {
        setSelectedState(match.state);
        setSelectedDistrictId(match.id);
        selectDistrict(match);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedState('all');
    setSelectedDistrictId('all');
    setSelectedRisks([]);
    setSearchQuery('');
    setSearchSuggestions([]);
    selectDistrict(null);
  };

  // Filtered metrics calculation
  const filteredMetrics = useMemo(() => {
    const matched = MOCK_DISTRICTS.filter(d => {
      if (selectedState !== 'all' && d.state !== selectedState) return false;
      if (selectedDistrictId !== 'all' && d.id !== selectedDistrictId) return false;
      if (selectedRisks.length > 0 && !selectedRisks.includes(d.riskLevel)) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = d.name.toLowerCase().includes(q);
        const matchState = d.state.toLowerCase().includes(q);
        if (!matchName && !matchState) return false;
      }
      return true;
    });

    const totalBasins = matched.length;
    if (totalBasins === 0) {
      return { totalBasins: 0, avgDepth: 0, avgDeficit: 0, activeSensors: 0 };
    }

    const totalDepth = matched.reduce((acc, d) => acc + d.groundwaterDepth, 0);
    const totalDeficit = matched.reduce((acc, d) => acc + (d.extractionRate - d.rechargeRate), 0);
    const totalSensors = matched.reduce((acc, d) => acc + d.activeSensors, 0);

    return {
      totalBasins,
      avgDepth: +(totalDepth / totalBasins).toFixed(1),
      avgDeficit: +(totalDeficit / totalBasins).toFixed(1),
      activeSensors: totalSensors,
    };
  }, [selectedState, selectedDistrictId, selectedRisks, searchQuery]);

  const riskLabelMap: Record<string, string> = {
    critical: t('risk_critical', 'CRITICAL'),
    high:     t('risk_high', 'HIGH'),
    moderate: t('risk_moderate', 'MODERATE'),
    stable:   t('risk_stable', 'STABLE'),
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#EEF2F7', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP FILTER CONTROL BAR ── */}
      <div style={{
        position: 'absolute', top: '16px', left: '60px', right: '380px', zIndex: 1001,
        background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(15,23,42,0.08)', padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '170px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('search_state_district_ph', 'Search state, district...')}
            style={{
              width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: '8px', paddingLeft: '32px', paddingRight: '10px',
              paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', color: '#1E293B',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          {searchSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 1002,
            }}>
              {searchSuggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  style={{
                    padding: '8px 12px', fontSize: '12px', color: '#334155',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <MapPin size={11} color="#94A3B8" />
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* State Select */}
        <select
          value={selectedState}
          onChange={handleStateChange}
          style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
            padding: '6px 10px', fontSize: '12px', fontWeight: 600, color: '#334155',
            outline: 'none', cursor: 'pointer', fontFamily: 'inherit', minWidth: '130px',
          }}
        >
          <option value="all">{t('all_states', 'All States')}</option>
          {MONITORED_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* District Select */}
        <select
          value={selectedDistrictId}
          onChange={handleDistrictChange}
          disabled={selectedState === 'all'}
          style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
            padding: '6px 10px', fontSize: '12px', fontWeight: 600, color: '#334155',
            outline: 'none', cursor: selectedState === 'all' ? 'not-allowed' : 'pointer',
            opacity: selectedState === 'all' ? 0.5 : 1, fontFamily: 'inherit', minWidth: '130px',
          }}
        >
          <option value="all">{t('all_districts', 'All Districts')}</option>
          {availableDistricts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Divider */}
        <div style={{ height: '20px', width: '1px', background: '#E2E8F0' }} />

        {/* Risk Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['critical', 'high', 'moderate', 'stable'].map(risk => {
            const isSelected = selectedRisks.includes(risk);
            const colors: Record<string, { activeBg: string; activeText: string }> = {
              critical: { activeBg: '#EF4444', activeText: '#FFFFFF' },
              high:     { activeBg: '#F97316', activeText: '#FFFFFF' },
              moderate: { activeBg: '#3B82F6', activeText: '#FFFFFF' },
              stable:   { activeBg: '#10B981', activeText: '#FFFFFF' },
            };
            const c = colors[risk];
            return (
              <button
                key={risk}
                onClick={() => toggleRiskSelection(risk)}
                style={{
                  padding: '5px 10px', fontSize: '10.5px', fontWeight: 700,
                  borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: isSelected ? c.activeBg : '#F8FAFC',
                  color: isSelected ? c.activeText : '#64748B',
                  border: `1px solid ${isSelected ? c.activeBg : '#E2E8F0'}`,
                  boxShadow: isSelected ? `0 2px 6px ${c.activeBg}40` : 'none',
                }}
              >
                {riskLabelMap[risk] || risk}
              </button>
            );
          })}
        </div>

        {/* Reset Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetFilters}
          icon={<RefreshCcw size={11} />}
          style={{ fontSize: '11px', padding: '4px 10px' }}
        >
          {t('reset_filters', 'Reset')}
        </Button>
      </div>

      {/* ── TOP RIGHT CONTROLS: Basemap Switcher & Layer Selector ── */}
      <div style={{
        position: 'absolute', top: '16px', right: '16px', zIndex: 1001,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        {/* Basemap Switcher */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(15,23,42,0.08)', overflow: 'hidden', display: 'flex', padding: '3px',
        }}>
          {(['light', 'satellite', 'terrain'] as const).map(mapType => (
            <button
              key={mapType}
              onClick={() => setActiveBasemap(mapType)}
              style={{
                padding: '5px 10px', fontSize: '10.5px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer',
                borderRadius: '6px', border: 'none', transition: 'all 0.15s',
                background: activeBasemap === mapType ? '#2563EB' : 'transparent',
                color: activeBasemap === mapType ? '#FFFFFF' : '#64748B',
              }}
            >
              {t(`basemap_${mapType}`, mapType.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Layer Control Dropdown Button */}
        <LayerControl />
      </div>

      {/* ── LEFT SIDE FLOATING DIAGNOSTICS CARD ── */}
      <div style={{
        position: 'absolute', top: '76px', left: '60px', zIndex: 1000,
        width: '230px', background: '#FFFFFF', border: '1px solid #E8EDF3',
        borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
        pointerEvents: 'auto',
      }}>
        <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px 0' }}>
          {t('triage_scope_diag', 'Triage Scope Diagnostics')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: t('scope_basins', 'Scope Basins'),   value: filteredMetrics.totalBasins, icon: Grid,           color: '#3B82F6' },
            { label: t('avg_depth', 'Average Depth'),  value: `${filteredMetrics.avgDepth}m`, icon: Droplets,       color: '#0284C7' },
            { label: t('deficit_ratio', 'Deficit Ratio'),  value: `${filteredMetrics.avgDeficit} MCM`, icon: AlertTriangle, color: '#EF4444' },
            { label: t('active_sensors', 'Active Sensors'), value: filteredMetrics.activeSensors, icon: Activity,        color: '#10B981' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '8px', borderBottom: idx < 3 ? '1px solid #F1F5F9' : 'none' }}>
              <span style={{ color: '#64748B', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <item.icon size={13} color={item.color} />
                {item.label}
              </span>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HEATMAP METRIC PARAMETER TOGGLE (Floating Bottom Left) ── */}
      {appState.activeLayers.includes('heatmap') && (
        <div style={{
          position: 'absolute', bottom: '150px', left: '16px', zIndex: 1000,
          background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '12px',
          padding: '14px', boxShadow: '0 4px 16px rgba(15,23,42,0.08)', width: '180px',
        }}>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={12} color="#2563EB" /> {t('heatmap_metric', 'Heatmap Metric')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(['risk', 'depth', 'extraction', 'rainfall'] as const).map(param => (
              <button
                key={param}
                onClick={() => setHeatmapParameter(param)}
                style={{
                  textAlign: 'left', padding: '6px 10px', fontSize: '12px',
                  borderRadius: '6px', border: 'none', cursor: 'pointer',
                  textTransform: 'capitalize', fontWeight: heatmapParameter === param ? 700 : 500,
                  background: heatmapParameter === param ? '#EFF6FF' : 'transparent',
                  color: heatmapParameter === param ? '#1D4ED8' : '#475569',
                }}
              >
                {param === 'depth' ? t('water_level', 'Water Level') : t(param, param)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAP CANVAS ── */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', zIndex: 10 }}>
        <NationalMap
          selectedState={selectedState}
          selectedDistrictId={selectedDistrictId}
          selectedRisks={selectedRisks}
          searchQuery={searchQuery}
          activeLayers={appState.activeLayers}
          activeBasemap={activeBasemap}
          heatmapParameter={heatmapParameter}
        />
      </div>

      {/* Zoom controls & Compass */}
      <MapToolbar />

      {/* Spatiotemporal legend */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px', zIndex: 1000,
        background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '12px',
        padding: '14px 16px', boxShadow: '0 4px 16px rgba(15,23,42,0.08)', width: '190px',
        pointerEvents: 'none',
      }}>
        <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px 0' }}>
          {appState.activeLayers.includes('rainfall') ? t('rainfall_scale', 'Rainfall Scale (mm)') : t('aquifer_risk_index', 'Aquifer Risk Index')}
        </p>
        {appState.activeLayers.includes('rainfall') ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#2563EB' }} /><span>Over 1000 mm</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#60A5FA' }} /><span>500 - 1000 mm</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#DBEAFE' }} /><span>Below 500 mm</span></div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /><span>{t('risk_critical_moratorium', 'Critical Moratorium')}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} /><span>{t('risk_high_deficit', 'High Deficit Risk')}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} /><span>{t('risk_moderate_stress', 'Moderate Stress')}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /><span>{t('risk_stable_recharge', 'Stable Recharge')}</span></div>
          </div>
        )}
      </div>

      {/* Floating details overlay on marker selection */}
      {appState.selectedDistrict && (
        <DistrictPanel />
      )}
    </div>
  );
}

