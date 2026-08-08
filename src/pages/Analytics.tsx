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
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'moderate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
      case 'stable': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <PageContainer
      title={t('analytics_title', 'Resource Intelligence Workspace')}
      subtitle={t('analytics_subtitle', 'Hydrological analytics & DWLR telemetry trends tailored to diagnostic resource questions')}
      actions={
        <div className="flex items-center gap-3">
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
      <div className="space-y-6 md:space-y-7">

        {/* ── Location & Telemetry Station Scope Selector Bar ────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
          
          {/* Section Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-sm md:text-base leading-snug">Telemetry Location Scope</h3>
                <p className="text-xs text-slate-500 font-medium">Filter DWLR monitoring stations & map points across India</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* State Filter Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs hover:border-slate-300 transition-colors">
                <Filter size={13} className="text-slate-400" />
                <span className="text-slate-500 font-semibold">State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedLocationId('all');
                  }}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">All States ({availableStates.length - 1})</option>
                  {availableStates.filter(s => s !== 'all').map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search map location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white w-48 md:w-56 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Location Selector Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Map Point / DWLR Monitoring Station ({filteredDistricts.length + 1} Points Available)
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
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
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Radio size={15} className={selectedDistrict ? 'text-emerald-600 animate-pulse' : 'text-blue-600'} />
                <div>
                  <span className="block font-extrabold text-slate-800 text-xs">
                    {selectedDistrict ? `${selectedDistrict.name}, ${selectedDistrict.state}` : 'National Aggregate'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedDistrict
                      ? `Lat ${selectedDistrict.coordinates.lat}° N, Lng ${selectedDistrict.coordinates.lng}° E`
                      : `${MOCK_DISTRICTS.length} DWLR Map Points Active`}
                  </span>
                </div>
              </div>
              {selectedDistrict && (
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getRiskBadgeColor(selectedDistrict.riskLevel)}`}>
                  {selectedDistrict.riskLevel.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Location Key Stats Summary Bar if a specific point is selected */}
          {selectedDistrict && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-center">
                <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">Current Water Table</span>
                <span className="text-base font-black text-blue-950 mt-0.5 block">{selectedDistrict.groundwaterDepth} m BGL</span>
              </div>
              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-center">
                <span className="block text-[10px] font-bold text-red-600 uppercase tracking-wider">Annual Extraction</span>
                <span className="text-base font-black text-red-950 mt-0.5 block">{selectedDistrict.extractionRate} MCM/yr</span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-center">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Natural Recharge</span>
                <span className="text-base font-black text-emerald-950 mt-0.5 block">{selectedDistrict.rechargeRate} MCM/yr</span>
              </div>
              <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-center">
                <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider">Deficit Multiplier</span>
                <span className="text-base font-black text-amber-950 mt-0.5 block">{deficitRatio}×</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Question Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
          {questions.map(q => {
            const isSelected = activeQuestion === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestion(q.id as QuestionTab)}
                className={`flex items-center gap-3 p-3.5 rounded-xl text-left cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-300 text-blue-700 shadow-2xs'
                    : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600'
                }`}
              >
                <q.icon size={18} className={isSelected ? 'text-blue-600 shrink-0' : 'text-slate-400 shrink-0'} />
                <span className={`text-xs ${isSelected ? 'font-extrabold text-blue-900' : 'font-semibold text-slate-700'} leading-tight`}>
                  {q.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Response Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-7 shadow-sm">
          <div className="pb-5 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-slate-900">{currentQ.title}</h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {selectedDistrict ? `${selectedDistrict.name} Point Telemetry` : 'All India Regional'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">{currentQ.sub}</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg shrink-0 self-start">
              {t('analytical_diagnostic', 'Analytical Diagnostic')}
            </span>
          </div>

          {/* ── QUESTION 1: Depletion Trend ────────────────────────────── */}
          {activeQuestion === 'depletion' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <WaterLevelChart
                  labels={telemetryData.labels}
                  depthData={telemetryData.depth}
                  height={260}
                />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Droplets size={13} className="text-blue-500" /> {t('hydro_timeline', 'Hydrological Timeline')}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Analysis for <strong className="text-slate-900 font-bold">{selectedDistrict ? `${selectedDistrict.name} (${selectedDistrict.state})` : 'All Regional Stations'}</strong> indicates a seasonal depth trajectory peaking at{' '}
                    <strong className="text-slate-900 font-bold">{latestDepth}m BGL</strong>.
                    {selectedDistrict && selectedDistrict.riskLevel === 'critical'
                      ? ' High-frequency extraction in crop irrigation belts has caused acute groundwater table stress.'
                      : ' Monitored DWLR telemetry sensors report standard aquifer recovery following monsoon replenishment cycles.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Audit Horizon: 12-Month</span>
                  <span
                    onClick={() => navigate('/map')}
                    className="text-blue-600 font-extrabold cursor-pointer flex items-center gap-1 hover:text-blue-700"
                  >
                    GIS Map View <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 2: Water Balance ──────────────────────────────── */}
          {activeQuestion === 'balance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <ExtractionChart 
                  labels={telemetryData.labels} 
                  extractionData={telemetryData.extraction} 
                  rechargeData={telemetryData.recharge} 
                  height={240} 
                />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={13} className="text-blue-500" />
                    {t('balance_auditing', 'Balance Auditing')}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Groundwater extraction at <span className="font-bold text-slate-900">{selectedDistrict ? selectedDistrict.name : 'monitored basins'}</span> averages <span className="font-bold text-slate-900">{latestExtraction} MCM/yr</span>, while active natural recharge replenishment is recorded at <span className="font-bold text-slate-900">{latestRecharge} MCM/yr</span>. 
                    This creates a water deficit ratio multiplier of <span className="font-bold text-slate-900">{deficitRatio}×</span>.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Balance Category: {Number(deficitRatio) > 2 ? 'Deficit Warning' : 'Balanced'}</span>
                  <span onClick={() => navigate('/decision-support')} className="text-blue-600 font-extrabold cursor-pointer flex items-center gap-1 hover:text-blue-700">
                    Advisories <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 3: Rainfall Correlation ───────────────────────── */}
          {activeQuestion === 'rainfall' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <RainfallChart 
                  labels={telemetryData.labels} 
                  data={telemetryData.rainfall} 
                  height={240} 
                />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <HelpCircle size={13} className="text-blue-500" />
                    {t('precip_audits', 'Precipitation Audits')}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Telemetry at <span className="font-bold text-slate-900">{selectedDistrict ? `${selectedDistrict.name} station` : 'regional stations'}</span> records total annual precipitation of <span className="font-bold text-slate-900">{totalRainfall} mm</span>. Peak recharge correlates with monsoon months (Jul–Sep) with an estimated 30–45 day percolation delay.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Source Index: IMD / DWLR Telemetry</span>
                  <span onClick={() => navigate('/risk-assessment')} className="text-blue-600 font-extrabold cursor-pointer flex items-center gap-1 hover:text-blue-700">
                    Risk Monitor <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 4: Basin Comparison ──────────────────────────── */}
          {activeQuestion === 'comparison' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <RiskDistributionChart 
                  data={[
                    MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical').length,
                    MOCK_DISTRICTS.filter(d => d.riskLevel === 'high').length,
                    MOCK_DISTRICTS.filter(d => d.riskLevel === 'moderate').length,
                    0,
                    MOCK_DISTRICTS.filter(d => d.riskLevel === 'low' || d.riskLevel === 'stable').length,
                  ]} 
                  height={220} 
                />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert size={13} className="text-blue-500" />
                    {t('basin_distribution', 'Basin Category Distribution')}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Out of <span className="font-bold text-slate-900">{MOCK_DISTRICTS.length}</span> monitored aquifer map points across India, <span className="font-bold text-red-600">{MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical').length}</span> locations are currently classified in the critical risk zone.
                    {selectedDistrict && (
                      <span className="block mt-2 font-semibold text-blue-900 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                        Current Point: {selectedDistrict.name} ({selectedDistrict.state}) is in {selectedDistrict.riskLevel.toUpperCase()} status (Health Score: {selectedDistrict.healthScore}/100).
                      </span>
                    )}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Scope: All India GIS Map Points</span>
                  <span onClick={() => navigate('/risk-assessment')} className="text-blue-600 font-extrabold cursor-pointer flex items-center gap-1 hover:text-blue-700">
                    Open Risk Matrix <ArrowUpRight size={12} />
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
