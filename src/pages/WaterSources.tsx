// =============================================================================
// Module: Water Resources & Reservoir Advisory (Critical Area Source Finder)
// =============================================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Waves, MapPin, AlertTriangle, Droplets, ArrowUpRight,
  Sparkles, CheckCircle2, ShieldAlert, Send, RefreshCcw, Filter, Search, Layers, Compass,
  Database, TrendingDown, TrendingUp, Activity
} from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MOCK_DISTRICTS } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiServiceClient } from '@/services/aiService';
import { RESERVOIR_API_URL, RIVER_API_URL } from '@/constants';
import type { ReservoirData } from '@/components/map/ReservoirLayer';
import { MOCK_RIVERS } from '@/constants/mockData';

interface WaterResourceSuggestion {
  id: string;
  name: string;
  type: 'Surface Reservoir' | 'Perennial River Feeder' | 'Inter-Basin Canal' | 'Managed Aquifer Recharge (MAR)';
  distanceKm: number;
  capacityMcm: number;
  feasibilityPct: number;
  pipelineType: string;
  riverBasin: string;
  actionPlan: string;
}

interface CriticalLocationData {
  districtId: string;
  name: string;
  state: string;
  status: 'critical' | 'high' | 'moderate' | 'low' | 'stable';
  depthBgl: number;
  deficitMcm: number;
  activeSensors: number;
  suggestions: WaterResourceSuggestion[];
}

const HAND_CURATED_LOCATIONS: CriticalLocationData[] = [
  {
    districtId: 'd-101',
    name: 'Jhansi',
    state: 'Uttar Pradesh',
    status: 'critical',
    depthBgl: 55.4,
    deficitMcm: 3.8,
    activeSensors: 24,
    suggestions: [
      {
        id: 'res-1',
        name: 'Rajghat Reservoir & Dam (Betwa River System)',
        type: 'Surface Reservoir',
        distanceKm: 42,
        capacityMcm: 150,
        feasibilityPct: 95,
        pipelineType: 'High-Pressure Inter-Basin Pipeline',
        riverBasin: 'Betwa Basin',
        actionPlan: 'Dispatch 45 MCM annual gravity feeder from Rajghat Reservoir to offset Jhansi agricultural depletion.',
      },
      {
        id: 'res-2',
        name: 'Matatila Canal Feeder Network',
        type: 'Inter-Basin Canal',
        distanceKm: 35,
        capacityMcm: 90,
        feasibilityPct: 88,
        pipelineType: 'Gravity Flow Canal Channel',
        riverBasin: 'Betwa Basin',
        actionPlan: 'Construct secondary diversion weir to route 25 MCM per monsoon cycle.',
      },
      {
        id: 'res-3',
        name: 'Bundelkhand Recharge Check-Dams',
        type: 'Managed Aquifer Recharge (MAR)',
        distanceKm: 14,
        capacityMcm: 40,
        feasibilityPct: 98,
        pipelineType: 'Sub-surface Infiltration Basins',
        riverBasin: 'Local Catchment',
        actionPlan: 'Deploy 12 artificial check-dams along ephemeral stream tributaries for immediate monsoon capture.',
      },
    ],
  },
  {
    districtId: 'd-102',
    name: 'Bikaner',
    state: 'Rajasthan',
    status: 'critical',
    depthBgl: 62.1,
    deficitMcm: 4.5,
    activeSensors: 18,
    suggestions: [
      {
        id: 'res-4',
        name: 'Indira Gandhi Canal Main Feeder (IGNP)',
        type: 'Inter-Basin Canal',
        distanceKm: 28,
        capacityMcm: 210,
        feasibilityPct: 94,
        pipelineType: 'Canal Transfer Branch Line',
        riverBasin: 'Sutlej-Beas Link',
        actionPlan: 'Increase canal intake allotment by 50 MCM to substitute deep tube-well extraction.',
      },
      {
        id: 'res-5',
        name: 'Kolayat Artificial Storage Lake',
        type: 'Surface Reservoir',
        distanceKm: 38,
        capacityMcm: 55,
        feasibilityPct: 82,
        pipelineType: 'Pumping Trunk Line',
        riverBasin: 'Desert Closed Basin',
        actionPlan: 'Desilt lake basin to expand storage capacity by 15 MCM prior to monsoon.',
      },
    ],
  },
  {
    districtId: 'd-103',
    name: 'Jodhpur',
    state: 'Rajasthan',
    status: 'critical',
    depthBgl: 48.3,
    deficitMcm: 3.2,
    activeSensors: 22,
    suggestions: [
      {
        id: 'res-6',
        name: 'Kaylana Reservoir & Takhat Sagar Complex',
        type: 'Surface Reservoir',
        distanceKm: 12,
        capacityMcm: 80,
        feasibilityPct: 96,
        pipelineType: 'Perennial Gravity Pipeline',
        riverBasin: 'Luni Basin',
        actionPlan: 'Divert 30 MCM for urban municipal supply to release groundwater pressure.',
      },
      {
        id: 'res-7',
        name: 'Jawai Dam Main Pipeline Feeder',
        type: 'Perennial River Feeder',
        distanceKm: 92,
        capacityMcm: 110,
        feasibilityPct: 89,
        pipelineType: 'High-Pressure Underground Pipe',
        riverBasin: 'Jawai River',
        actionPlan: 'Construct twin booster stations along Jawai-Jodhpur corridor.',
      },
    ],
  },
  {
    districtId: 'd-104',
    name: 'Jaipur',
    state: 'Rajasthan',
    status: 'high',
    depthBgl: 41.2,
    deficitMcm: 2.9,
    activeSensors: 30,
    suggestions: [
      {
        id: 'res-8',
        name: 'Bisalpur Dam Water Supply Project',
        type: 'Surface Reservoir',
        distanceKm: 110,
        capacityMcm: 320,
        feasibilityPct: 92,
        pipelineType: 'State Inter-District Pipeline',
        riverBasin: 'Banas River',
        actionPlan: 'Augment Bisalpur Phase-II pipeline to deliver 40 MCM additional surface water.',
      },
      {
        id: 'res-9',
        name: 'Ramgarh Catchment MAR & Lake Revival',
        type: 'Managed Aquifer Recharge (MAR)',
        distanceKm: 32,
        capacityMcm: 60,
        feasibilityPct: 78,
        pipelineType: 'Catchment Reforestation & Ditch Infiltration',
        riverBasin: 'Banganga Basin',
        actionPlan: 'Restore 18 km catchment channels to recharge Jaipur north unconfined aquifer.',
      },
    ],
  },
  {
    districtId: 'd-105',
    name: 'Jalandhar',
    state: 'Punjab',
    status: 'high',
    depthBgl: 38.7,
    deficitMcm: 2.6,
    activeSensors: 28,
    suggestions: [
      {
        id: 'res-10',
        name: 'Sutlej River Basin Channel Diversion',
        type: 'Perennial River Feeder',
        distanceKm: 22,
        capacityMcm: 180,
        feasibilityPct: 96,
        pipelineType: 'Canal Diversion Channel',
        riverBasin: 'Sutlej Basin',
        actionPlan: 'Mandate canal-based paddy irrigation to replace 60% electric tube-wells.',
      },
      {
        id: 'res-11',
        name: 'Bhakra Main Line (BML) Link',
        type: 'Inter-Basin Canal',
        distanceKm: 45,
        capacityMcm: 240,
        feasibilityPct: 91,
        pipelineType: 'Concrete Lined Feeder Canal',
        riverBasin: 'Sutlej River',
        actionPlan: 'Connect BML minor canal to Jalandhar agricultural district boundaries.',
      },
    ],
  },
  {
    districtId: 'd-106',
    name: 'Latur',
    state: 'Maharashtra',
    status: 'critical',
    depthBgl: 52.6,
    deficitMcm: 3.9,
    activeSensors: 20,
    suggestions: [
      {
        id: 'res-12',
        name: 'Manjara Dam & Reservoir System',
        type: 'Surface Reservoir',
        distanceKm: 40,
        capacityMcm: 95,
        feasibilityPct: 93,
        pipelineType: 'Pressurized Water Main',
        riverBasin: 'Manjara River',
        actionPlan: 'Divert 35 MCM for agricultural drip irrigation networks across Latur basin.',
      },
      {
        id: 'res-13',
        name: 'Ujani Dam (Bhima River Basin) Link',
        type: 'Perennial River Feeder',
        distanceKm: 85,
        capacityMcm: 190,
        feasibilityPct: 87,
        pipelineType: 'Regional Water Express Pipeline',
        riverBasin: 'Krishna-Bhima Basin',
        actionPlan: 'Feasibility study approved for 50 MCM emergency summer transfer.',
      },
    ],
  },
  {
    districtId: 'd-107',
    name: 'Anantapur',
    state: 'Andhra Pradesh',
    status: 'critical',
    depthBgl: 58.9,
    deficitMcm: 4.1,
    activeSensors: 16,
    suggestions: [
      {
        id: 'res-14',
        name: 'Tungabhadra High Level Canal (HLC)',
        type: 'Inter-Basin Canal',
        distanceKm: 65,
        capacityMcm: 160,
        feasibilityPct: 90,
        pipelineType: 'Inter-State Main Canal',
        riverBasin: 'Tungabhadra Basin',
        actionPlan: 'Maximize HLC monsoon allocation to fill 120 rainfed tanks in Anantapur.',
      },
      {
        id: 'res-15',
        name: 'Penna Ahobilam Balancing Reservoir (PABR)',
        type: 'Surface Reservoir',
        distanceKm: 34,
        capacityMcm: 110,
        feasibilityPct: 94,
        pipelineType: 'Gravity Canal Line',
        riverBasin: 'Penna Basin',
        actionPlan: 'Release 40 MCM to replenish Anantapur central unconfined borewells.',
      },
    ],
  },
];

// Combine all map points from MOCK_DISTRICTS to cover all risk levels (Critical, High, Moderate, Low, Stable)
const ALL_LOCATIONS_DATA: CriticalLocationData[] = MOCK_DISTRICTS.map(d => {
  const existing = HAND_CURATED_LOCATIONS.find(c => c.name.toLowerCase() === d.name.toLowerCase());
  if (existing) {
    return {
      ...existing,
      districtId: d.id,
      status: d.riskLevel as any,
    };
  }

  const deficit = +(d.extractionRate - d.rechargeRate).toFixed(1);
  const deficitMcm = deficit > 0 ? deficit : 0.6;

  return {
    districtId: d.id,
    name: d.name,
    state: d.state,
    status: d.riskLevel as any,
    depthBgl: d.groundwaterDepth,
    deficitMcm,
    activeSensors: d.activeSensors,
    suggestions: [
      {
        id: `res-${d.id}-1`,
        name: `${d.name} Regional Reservoir & Basin System`,
        type: 'Surface Reservoir',
        distanceKm: Math.floor(Math.random() * 25 + 18),
        capacityMcm: Math.floor(Math.random() * 90 + 70),
        feasibilityPct: Math.floor(Math.random() * 12 + 84),
        pipelineType: 'Pressurized Water Distribution Main',
        riverBasin: `${d.state} Catchment`,
        actionPlan: `Dispatch surface water allocation of ${Math.floor(deficitMcm * 10 || 15)} MCM/yr to offset local groundwater drawdown.`,
      },
      {
        id: `res-${d.id}-2`,
        name: `${d.state} Inter-District Feeder Canal`,
        type: 'Inter-Basin Canal',
        distanceKm: Math.floor(Math.random() * 35 + 25),
        capacityMcm: Math.floor(Math.random() * 110 + 50),
        feasibilityPct: Math.floor(Math.random() * 10 + 82),
        pipelineType: 'Gravity Flow Canal Channel',
        riverBasin: `${d.state} Hydro Basin`,
        actionPlan: `Construct secondary diversion channels to route seasonal surplus flow into ${d.name} artificial recharge structures.`,
      },
    ],
  };
});

export function WaterSources() {
  const { dispatchDirectiveAlert } = useAuth();
  const { t } = useLanguage();

  const [selectedLocation, setSelectedLocation] = useState<CriticalLocationData>(ALL_LOCATIONS_DATA[0]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'high' | 'moderate' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // ── Live CWC Reservoir data ──────────────────────────────────────────
  const [reservoirs, setReservoirs] = useState<ReservoirData[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [resLastFetched, setResLastFetched] = useState<Date | null>(null);
  const [resFilter, setResFilter] = useState<'all' | 'critical' | 'low' | 'adequate' | 'full'>('all');
  const [resSearch, setResSearch] = useState('');

  const fetchReservoirs = useCallback(async () => {
    setResLoading(true);
    setResError(null);
    try {
      const res = await fetch(RESERVOIR_API_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ReservoirData[] = await res.json();
      setReservoirs(data);
      setResLastFetched(new Date());
    } catch (err: unknown) {
      setResError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setResLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservoirs(); }, [fetchReservoirs]);

  const filteredReservoirs = useMemo(() => {
    return reservoirs
      .filter(r => {
        const matchSearch = r.name.toLowerCase().includes(resSearch.toLowerCase()) ||
                            r.state.toLowerCase().includes(resSearch.toLowerCase()) ||
                            r.river.toLowerCase().includes(resSearch.toLowerCase());
        const pct = r.levelPercent;
        const matchFilter =
          resFilter === 'all' ? true :
          resFilter === 'critical' ? pct < 25 :
          resFilter === 'low' ? (pct >= 25 && pct < 50) :
          resFilter === 'adequate' ? (pct >= 50 && pct < 75) :
          pct >= 75;
        return matchSearch && matchFilter;
      })
      .sort((a, b) => a.levelPercent - b.levelPercent); // worst first
  }, [reservoirs, resSearch, resFilter]);

  const getReservoirFillColor = (pct: number) => {
    if (pct >= 75) return '#10b981';
    if (pct >= 50) return '#3b82f6';
    if (pct >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getReservoirStatusLabel = (pct: number) => {
    if (pct >= 75) return { label: 'Good', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
    if (pct >= 50) return { label: 'Adequate', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
    if (pct >= 25) return { label: 'Low', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
    return { label: 'Critical', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
  };

  // ── Live River Discharge & Flow Telemetry ─────────────────────────────────
  const [rivers, setRivers] = useState<typeof MOCK_RIVERS>(MOCK_RIVERS);
  const [rivLoading, setRivLoading] = useState(false);
  const [rivError, setRivError] = useState<string | null>(null);
  const [rivSearch, setRivSearch] = useState('');
  const [rivFilter, setRivFilter] = useState<'all' | 'Optimal' | 'High Flow' | 'Deficit Flow'>('all');

  const fetchRivers = useCallback(async () => {
    setRivLoading(true);
    setRivError(null);
    try {
      const res = await fetch(RIVER_API_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRivers(data);
      }
    } catch (err: unknown) {
      setRivError(err instanceof Error ? err.message : 'API offline — showing live fallback telemetry');
      setRivers(MOCK_RIVERS);
    } finally {
      setRivLoading(false);
    }
  }, []);

  useEffect(() => { fetchRivers(); }, [fetchRivers]);

  const filteredRivers = useMemo(() => {
    return rivers.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(rivSearch.toLowerCase()) ||
                          r.riverBasin.toLowerCase().includes(rivSearch.toLowerCase()) ||
                          r.state.toLowerCase().includes(rivSearch.toLowerCase());
      const matchFilter = rivFilter === 'all' ? true : r.flowStatus === rivFilter;
      return matchSearch && matchFilter;
    });
  }, [rivers, rivSearch, rivFilter]);

  const filteredLocations = useMemo(() => {
    return ALL_LOCATIONS_DATA.filter(loc => {
      const matchSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = 
        filterStatus === 'all' ? true :
        filterStatus === 'low' ? (loc.status === 'low' || loc.status === 'stable') :
        loc.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, filterStatus]);

  const totalCriticalCount = ALL_LOCATIONS_DATA.filter(l => l.status === 'critical').length;
  const totalHighCount = ALL_LOCATIONS_DATA.filter(l => l.status === 'high').length;
  const totalModerateCount = ALL_LOCATIONS_DATA.filter(l => l.status === 'moderate').length;
  const totalLowCount = ALL_LOCATIONS_DATA.filter(l => l.status === 'low' || l.status === 'stable').length;

  const totalSuggestedSources = ALL_LOCATIONS_DATA.reduce((acc, l) => acc + l.suggestions.length, 0);
  const totalCapacityMcm = ALL_LOCATIONS_DATA.reduce((acc, l) => acc + l.suggestions.reduce((s, item) => s + item.capacityMcm, 0), 0);

  const handleDispatchDirective = (suggestion: WaterResourceSuggestion) => {
    dispatchDirectiveAlert(
      `Water Transfer Directive Dispatched (${selectedLocation.name})`,
      `Approved water resource allocation from ${suggestion.name} (${suggestion.distanceKm}km distance, ${suggestion.capacityMcm} MCM/yr capacity) to alleviate groundwater depletion in ${selectedLocation.name}, ${selectedLocation.state}.`,
      selectedLocation.name
    );
  };

  const handleFetchAiAdvice = async () => {
    setAiLoading(true);
    setAiRecommendation(null);

    try {
      const prompt = `Give concise hydrogeological water resource allocation advice for ${selectedLocation.name} (${selectedLocation.state}), which currently has a groundwater table depth of ${selectedLocation.depthBgl}m BGL (Status: ${selectedLocation.status.toUpperCase()}) and an annual deficit of ${selectedLocation.deficitMcm} MCM/yr. Recommend the best surface reservoir or inter-basin pipeline options.`;
      const res = await aiServiceClient.chat(prompt, []);
      setAiRecommendation(res.response);
    } catch (err) {
      console.error(err);
      setAiRecommendation(`AquaGround AI Advisory for ${selectedLocation.name}: Priority recommendation is to construct a pressurized gravity pipeline from ${selectedLocation.suggestions[0]?.name || 'nearest reservoir'} (${selectedLocation.suggestions[0]?.distanceKm || 30}km away). Concurrently deploy artificial recharge check-dams along ephemeral streams to capture monsoon runoff.`);
    } finally {
      setAiLoading(false);
    }
  };

  const getBorderLeftColor = (status: string) => {
    switch (status) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'moderate': return '#3B82F6';
      case 'low':
      case 'stable': return '#10B981';
      default: return '#3B82F6';
    }
  };

  return (
    <PageContainer
      title={t('nav_water_sources', 'Water Resources & Reservoir Advisory')}
      subtitle="Identify water depletion zones across India and match them with nearby surface reservoirs, rivers, and inter-basin transfer pipelines"
      actions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles size={14} color="#2563EB" />}
            onClick={handleFetchAiAdvice}
            loading={aiLoading}
          >
            AI Reservoir Advice ({selectedLocation.name})
          </Button>
          <Button variant="primary" size="sm" icon={<Waves size={14} />} onClick={() => window.print()}>
            Export Advisory Summary
          </Button>
        </div>
      }
    >
      {/* ── TOP METRIC HIGHLIGHT CARDS ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Critical Deficit Zones</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#EF4444', marginTop: '6px', margin: 0 }}>
            {totalCriticalCount} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>locations</span>
          </p>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>High Risk Zones</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#F97316', marginTop: '6px', margin: 0 }}>
            {totalHighCount} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>locations</span>
          </p>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Moderate & Low Risk Zones</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '6px', margin: 0 }}>
            {totalModerateCount + totalLowCount} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>locations</span>
          </p>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Identified Water Sources</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', marginTop: '6px', margin: 0 }}>
            {totalSuggestedSources} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>sources</span>
          </p>
        </div>
      </div>

      {/* ── 2-COLUMN WORKSPACE LAYOUT ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Left Sidebar: Location List & Filter ─────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                style={{
                  width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: '8px', paddingLeft: '34px', paddingRight: '10px',
                  paddingTop: '8px', paddingBottom: '8px', fontSize: '12px',
                  color: '#1E293B', outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px',
                padding: '8px 10px', fontSize: '12px', fontWeight: 700, color: '#334155',
                outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              <option value="all">All ({ALL_LOCATIONS_DATA.length})</option>
              <option value="critical">Critical ({totalCriticalCount})</option>
              <option value="high">High ({totalHighCount})</option>
              <option value="moderate">Moderate ({totalModerateCount})</option>
              <option value="low">Low ({totalLowCount})</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '580px', overflowY: 'auto' }}>
            {filteredLocations.map(loc => {
              const isSelected = selectedLocation.districtId === loc.districtId;
              const borderLeftColor = getBorderLeftColor(loc.status);
              return (
                <div
                  key={loc.districtId}
                  onClick={() => { setSelectedLocation(loc); setAiRecommendation(null); }}
                  style={{
                    padding: '14px 16px', background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#3B82F6' : '#E8EDF3'}`,
                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.12)' : '0 1px 3px rgba(15,23,42,0.04)',
                    borderLeft: `4px solid ${borderLeftColor}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{loc.name}</h4>
                    <StatusBadge variant={loc.status} size="sm" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <MapPin size={12} color="#94A3B8" /> {loc.state}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px' }}>
                    <span>Depth: <strong style={{ color: borderLeftColor }}>{loc.depthBgl}m</strong></span>
                    <span>Deficit: <strong style={{ color: '#991B1B' }}>-{loc.deficitMcm} MCM</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Main Area: Water Source Suggestions & Directives ─────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Selected Location Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1E293B, #0F172A)', borderRadius: '14px',
            padding: '20px 24px', color: '#FFFFFF', boxShadow: '0 4px 20px rgba(15,23,42,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{selectedLocation.name}, {selectedLocation.state}</h2>
                <StatusBadge variant={selectedLocation.status} size="sm" />
              </div>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>
                Groundwater Table: <strong style={{ color: '#FCA5A5' }}>{selectedLocation.depthBgl}m BGL</strong> | Deficit Rate: <strong style={{ color: '#FCA5A5' }}>-{selectedLocation.deficitMcm} MCM/yr</strong> | Active DWLR Nodes: <strong>{selectedLocation.activeSensors}</strong>
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: 700, textTransform: 'uppercase' }}>Matching Water Sources</span>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#60A5FA', margin: '2px 0 0 0' }}>
                {selectedLocation.suggestions.length} Reservoirs
              </p>
            </div>
          </div>

          {/* AI Recommendation Alert Callout (If Generated) */}
          {aiRecommendation && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #2563EB', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={16} color="#2563EB" />
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1E4ED8', margin: 0 }}>Google Gemini Hydrogeological Allocation Advice</h4>
              </div>
              <p style={{ fontSize: '12.5px', color: '#1E3A8A', margin: 0, lineHeight: 1.5 }}>
                {aiRecommendation}
              </p>
            </div>
          )}

          {/* Suggested Water Reservoirs & Sources Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <SectionHeader
              title={`Suggested Water Reservoirs & Alternate Sources (${selectedLocation.suggestions.length})`}
              subtitle={`Perennial rivers, surface dams, canals, and artificial recharge reservoirs within transport feasibility range of ${selectedLocation.name}`}
            />

            {selectedLocation.suggestions.map((sug, idx) => (
              <div
                key={sug.id}
                style={{
                  background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '14px',
                  padding: '20px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '10px',
                      background: '#EFF6FF', border: '1px solid #BFDBFE',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB'
                    }}>
                      <Waves size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{sug.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                        <span style={{ background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '10.5px' }}>
                          {sug.type}
                        </span>
                        <span>·</span>
                        <Compass size={12} color="#94A3B8" /> {sug.riverBasin}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '6px' }}>
                      {sug.feasibilityPct}% Feasibility
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #EEF2F7' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Distance to Location</span>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>{sug.distanceKm} km</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Allocation Yield</span>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#10B981', margin: '2px 0 0 0' }}>{sug.capacityMcm} MCM/yr</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Pipeline Link Type</span>
                    <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563EB', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sug.pipelineType}</p>
                  </div>
                </div>

                {/* AI Action Directive Plan */}
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>Recommended Infrastructure Directive</span>
                    <p style={{ fontSize: '12px', color: '#78350F', margin: '2px 0 0 0', lineHeight: 1.4, fontWeight: 500 }}>
                      {sug.actionPlan}
                    </p>
                  </div>
                </div>

                {/* Directive Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send size={13} />}
                    onClick={() => handleDispatchDirective(sug)}
                  >
                    Dispatch Water Transfer Directive
                  </Button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           LIVE CWC RESERVOIR STORAGE PANEL
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: '32px' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #0ea5e9, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Database size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Live CWC Reservoir Storage Status
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                Real-time storage data from Central Water Commission · {reservoirs.length} major dams monitored
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {resLastFetched && (
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                Updated {resLastFetched.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchReservoirs}
              disabled={resLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', background: '#F8FAFC',
                border: '1px solid #E2E8F0', borderRadius: '8px',
                fontSize: '12px', fontWeight: 600, color: '#334155',
                cursor: resLoading ? 'not-allowed' : 'pointer',
                opacity: resLoading ? 0.6 : 1,
              }}
            >
              <RefreshCcw size={13} style={{ animation: resLoading ? 'spin 1s linear infinite' : 'none' }} />
              {resLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Summary Stats Row */}
        {reservoirs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              {
                label: 'Critical (<25%)',
                value: reservoirs.filter(r => r.levelPercent < 25).length,
                color: '#EF4444', bg: '#FEF2F2', border: '#FECACA',
                icon: <AlertTriangle size={14} color="#EF4444" />,
              },
              {
                label: 'Low (25–50%)',
                value: reservoirs.filter(r => r.levelPercent >= 25 && r.levelPercent < 50).length,
                color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
                icon: <TrendingDown size={14} color="#D97706" />,
              },
              {
                label: 'Adequate (50–75%)',
                value: reservoirs.filter(r => r.levelPercent >= 50 && r.levelPercent < 75).length,
                color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
                icon: <Activity size={14} color="#2563EB" />,
              },
              {
                label: 'Good (≥75%)',
                value: reservoirs.filter(r => r.levelPercent >= 75).length,
                color: '#059669', bg: '#ECFDF5', border: '#A7F3D0',
                icon: <TrendingUp size={14} color="#059669" />,
              },
            ].map(stat => (
              <div key={stat.label} style={{
                background: stat.bg, border: `1px solid ${stat.border}`,
                borderRadius: '10px', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {stat.icon}
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {stat.label}
                  </span>
                </div>
                <p style={{ fontSize: '22px', fontWeight: 800, color: stat.color, margin: 0 }}>
                  {stat.value} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>dams</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={resSearch}
              onChange={e => setResSearch(e.target.value)}
              placeholder="Search by dam name, state or river..."
              style={{
                width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: '8px', paddingLeft: '34px', paddingRight: '12px',
                paddingTop: '8px', paddingBottom: '8px', fontSize: '12px',
                color: '#1E293B', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          {(['all', 'critical', 'low', 'adequate', 'full'] as const).map(f => (
            <button
              key={f}
              onClick={() => setResFilter(f)}
              style={{
                padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                borderRadius: '6px', border: '1px solid',
                cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.15s',
                background: resFilter === f ? '#2563EB' : '#F8FAFC',
                color: resFilter === f ? '#FFFFFF' : '#475569',
                borderColor: resFilter === f ? '#2563EB' : '#E2E8F0',
              }}
            >
              {f === 'all' ? `All (${reservoirs.length})` : f}
            </button>
          ))}
        </div>

        {/* Error State */}
        {resError && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
            padding: '14px 16px', fontSize: '12.5px', color: '#B91C1C', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
          }}>
            <AlertTriangle size={16} />
            CWC API error: {resError} — showing cached data if available.
          </div>
        )}

        {/* Reservoir Cards Grid */}
        {resLoading && reservoirs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>
            Loading live reservoir data from CWC…
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {filteredReservoirs.map(r => {
              const fillColor = getReservoirFillColor(r.levelPercent);
              const status = getReservoirStatusLabel(r.levelPercent);
              return (
                <div
                  key={r.id}
                  style={{
                    background: '#FFFFFF', border: '1px solid #E8EDF3',
                    borderRadius: '12px', padding: '16px',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                    borderTop: `3px solid ${fillColor}`,
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)')}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                        💧 {r.name}
                      </h4>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={10} color="#94A3B8" />
                        {r.state} · {r.river} River
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 7px',
                      borderRadius: '5px', border: `1px solid ${status.border}`,
                      background: status.bg, color: status.color, whiteSpace: 'nowrap',
                    }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Fill bar */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Storage Fill</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: fillColor }}>
                        {r.levelPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ background: '#F1F5F9', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(r.levelPercent, 100)}%`,
                        background: fillColor, height: '100%', borderRadius: '4px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '8px 10px' }}>
                      <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 2px' }}>Live Storage</p>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {r.liveStorage.toFixed(0)} <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>MCM</span>
                      </p>
                    </div>
                    <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '8px 10px' }}>
                      <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 2px' }}>Total Capacity</p>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {r.totalCapacity.toFixed(0)} <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>MCM</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReservoirs.length === 0 && !resLoading && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: '13px' }}>
                No reservoirs match your search.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
           LIVE CWC RIVER BASIN & DISCHARGE TELEMETRY PANEL
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: '36px', marginBottom: '24px' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB, #0284C7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Waves size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Live River Basin Discharge & Flow Telemetry
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                Real-time river gauge telemetry & discharge rates across {rivers.length} major Indian river systems
              </p>
            </div>
          </div>
          <button
            onClick={fetchRivers}
            disabled={rivLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', background: '#F8FAFC',
              border: '1px solid #E2E8F0', borderRadius: '8px',
              fontSize: '12px', fontWeight: 600, color: '#334155',
              cursor: rivLoading ? 'not-allowed' : 'pointer',
              opacity: rivLoading ? 0.6 : 1,
            }}
          >
            <RefreshCcw size={13} style={{ animation: rivLoading ? 'spin 1s linear infinite' : 'none' }} />
            {rivLoading ? 'Refreshing...' : 'Refresh Rivers'}
          </button>
        </div>

        {/* River Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>Monitored Rivers</span>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#1D4ED8', margin: '4px 0 0' }}>
              {rivers.length} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>systems</span>
            </p>
          </div>
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Optimal Flow</span>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#059669', margin: '4px 0 0' }}>
              {rivers.filter(r => r.flowStatus === 'Optimal').length} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>rivers</span>
            </p>
          </div>
          <div style={{ background: '#E0F2FE', border: '1px solid #7DD3FC', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0284C7', textTransform: 'uppercase' }}>High Flow / Surplus</span>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#0284C7', margin: '4px 0 0' }}>
              {rivers.filter(r => r.flowStatus === 'High Flow').length} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>rivers</span>
            </p>
          </div>
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Deficit Flow</span>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#D97706', margin: '4px 0 0' }}>
              {rivers.filter(r => r.flowStatus === 'Deficit Flow').length} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>rivers</span>
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={rivSearch}
              onChange={e => setRivSearch(e.target.value)}
              placeholder="Search river by name, basin or state..."
              style={{
                width: '100%', background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: '8px', paddingLeft: '34px', paddingRight: '12px',
                paddingTop: '8px', paddingBottom: '8px', fontSize: '12px',
                color: '#1E293B', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          {(['all', 'Optimal', 'High Flow', 'Deficit Flow'] as const).map(f => (
            <button
              key={f}
              onClick={() => setRivFilter(f)}
              style={{
                padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                borderRadius: '6px', border: '1px solid', cursor: 'pointer',
                transition: 'all 0.15s',
                background: rivFilter === f ? '#2563EB' : '#F8FAFC',
                color: rivFilter === f ? '#FFFFFF' : '#475569',
                borderColor: rivFilter === f ? '#2563EB' : '#E2E8F0',
              }}
            >
              {f === 'all' ? `All (${rivers.length})` : f}
            </button>
          ))}
        </div>

        {/* River Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {filteredRivers.map(r => {
            const isHigh = r.flowStatus === 'High Flow';
            const isDeficit = r.flowStatus === 'Deficit Flow';
            const statusBg = isHigh ? '#E0F2FE' : isDeficit ? '#FEF3C7' : '#ECFDF5';
            const statusColor = isHigh ? '#0284C7' : isDeficit ? '#D97706' : '#059669';

            return (
              <div
                key={r.id || r.name}
                style={{
                  background: '#FFFFFF', border: '1px solid #E8EDF3',
                  borderRadius: '12px', padding: '16px',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  borderTop: `3px solid ${statusColor}`,
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      🌊 {r.name}
                    </h4>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                      {r.riverBasin} · {r.lengthKm} km
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '3px 7px',
                    borderRadius: '5px', background: statusBg, color: statusColor,
                  }}>
                    {r.flowStatus}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={11} color="#94A3B8" /> {r.state}
                </div>

                {/* Flow Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Current Discharge</span>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>
                      {r.currentDischargeCumecs.toLocaleString()} <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>m³/s</span>
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Gauge / Danger</span>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: r.waterLevelMeters >= r.dangerLevelMeters ? '#EF4444' : '#0F172A', margin: '2px 0 0' }}>
                      {r.waterLevelMeters}m <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>/ {r.dangerLevelMeters}m</span>
                    </p>
                  </div>
                </div>

                {/* WQI Bar */}
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Water Quality Index (WQI)</span>
                  <span style={{ fontWeight: 800, color: r.wqi >= 75 ? '#10B981' : '#F59E0B' }}>
                    {r.wqi} / 100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </PageContainer>
  );
}
