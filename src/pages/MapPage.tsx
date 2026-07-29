// =============================================================================
// Module 2: Operations Map (Interactive GIS Workspace)
// =============================================================================

import React, { useState, useMemo } from 'react';
import { NationalMap } from '@/components/map/NationalMap';
import { LayerControl, MapToolbar } from '@/components/map/LayerControl';
import { DistrictPanel } from '@/components/map/DistrictPanel';
import { useApp } from '@/contexts/AppContext';
import { MOCK_DISTRICTS } from '@/constants/mockData';
import {
  Search, RefreshCcw, MapPin, Grid, Layers,
  Droplets, Activity, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Indian States represented in MOCK_DISTRICTS
const MONITORED_STATES = Array.from(new Set(MOCK_DISTRICTS.map(d => d.state))).sort();

export function MapPage() {
  const { state: appState, selectDistrict } = useApp();

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
    setSelectedDistrictId('all'); // reset district on state change
    selectDistrict(null); // clear district side panel selection
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

  // Toggle Risk Selection (Multi-select)
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

    // Match against districts, states, and DWLR nodes
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

    // Check if it is a state
    if (MONITORED_STATES.includes(val)) {
      setSelectedState(val);
      setSelectedDistrictId('all');
      selectDistrict(null);
    } else {
      // Check if it is a district
      const match = MOCK_DISTRICTS.find(d => d.name.toLowerCase() === val.toLowerCase());
      if (match) {
        setSelectedState(match.state);
        setSelectedDistrictId(match.id);
        selectDistrict(match);
      }
    }
  };

  // Reset all filters to original state
  const handleResetFilters = () => {
    setSelectedState('all');
    setSelectedDistrictId('all');
    setSelectedRisks([]);
    setSearchQuery('');
    setSearchSuggestions([]);
    selectDistrict(null);
  };

  // ── DYNAMIC STATISTICS CALCULATION ──────────────────────────────────────────
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

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 flex flex-col">

      {/* ── TOP FLOATING CONTROL BAR: Autocomplete Search & Filters ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-[calc(100%-32px)] max-w-4xl bg-white border border-slate-200 shadow-lg rounded-md p-3 select-none flex flex-col md:flex-row items-center gap-3">
        {/* Autocomplete Search input */}
        <div className="relative w-full md:w-56">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search state, district..."
            className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500/50"
          />
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-md overflow-hidden z-[1002]">
              {searchSuggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  className="px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin size={11} className="text-slate-400" />
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* State Dropdown Selector */}
        <div className="w-full md:w-44">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-600 font-semibold outline-none cursor-pointer focus:border-blue-500/50"
          >
            <option value="all">All States</option>
            {MONITORED_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* District Dropdown Selector */}
        <div className="w-full md:w-44">
          <select
            value={selectedDistrictId}
            onChange={handleDistrictChange}
            disabled={selectedState === 'all'}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-600 font-semibold outline-none cursor-pointer focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Districts</option>
            {availableDistricts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Risk Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['critical', 'high', 'moderate', 'stable'].map(risk => {
            const isSelected = selectedRisks.includes(risk);
            return (
              <button
                key={risk}
                onClick={() => toggleRiskSelection(risk)}
                className={[
                  'px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors cursor-pointer border',
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                ].join(' ')}
              >
                {risk}
              </button>
            );
          })}
        </div>

        {/* Reset Filter Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetFilters}
          icon={<RefreshCcw size={11} />}
          className="w-full md:w-auto text-[11px] py-1 px-2.5 shadow-none"
        >
          Reset
        </Button>
      </div>

      {/* ── TOP RIGHT: DYNAMIC STATISTICS OVERLAY ──────────────────── */}
      <div className="absolute top-20 right-4 z-[1000] w-64 bg-white border border-slate-200 shadow-md rounded-md p-3 select-none pointer-events-none animate-[fadeInUp_0.15s_ease-out]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Triage Scope Diagnostics</p>
        <div className="space-y-2">
          {[
            { label: 'Scope Basins', value: filteredMetrics.totalBasins, icon: Grid, color: 'text-blue-600' },
            { label: 'Average Depth', value: `${filteredMetrics.avgDepth}m`, icon: Droplets, color: 'text-sky-600' },
            { label: 'Deficit Ratio', value: `${filteredMetrics.avgDeficit} MCM`, icon: AlertTriangle, color: 'text-red-500' },
            { label: 'Active Sensors', value: filteredMetrics.activeSensors, icon: Activity, color: 'text-green-600' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <item.icon size={11} className={item.color} />
                {item.label}
              </span>
              <span className="font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BASEMAP SWITCHER OVERLAY (Floating Top Right) ───────────── */}
      <div className="absolute top-4 right-20 z-[1000] bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden flex select-none">
        {(['light', 'satellite', 'terrain'] as const).map(mapType => (
          <button
            key={mapType}
            onClick={() => setActiveBasemap(mapType)}
            className={[
              'px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer border-r last:border-r-0 border-slate-200 transition-colors',
              activeBasemap === mapType ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
            ].join(' ')}
          >
            {mapType}
          </button>
        ))}
      </div>

      {/* ── HEATMAP METRIC PARAMETER TOGGLE (Floating Bottom Right) ── */}
      {appState.activeLayers.includes('heatmap') && (
        <div className="absolute bottom-16 right-4 z-[1000] bg-white border border-slate-200 shadow-md rounded-md p-3 select-none w-48 animate-[fadeInUp_0.15s_ease-out]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Layers size={11} className="text-blue-600" />
            Heatmap Parameter
          </p>
          <div className="space-y-1">
            {(['risk', 'depth', 'extraction', 'rainfall'] as const).map(param => (
              <button
                key={param}
                onClick={() => setHeatmapParameter(param)}
                className={[
                  'w-full text-left px-2 py-1 text-xs rounded transition-colors capitalize font-medium cursor-pointer',
                  heatmapParameter === param ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                ].join(' ')}
              >
                {param === 'depth' ? 'Water Level' : param}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Centerpiece canvas */}
      <div className="flex-1 w-full h-full relative z-10">
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

      {/* Floating Toolbar Controls */}
      <MapToolbar />
      <LayerControl />

      {/* Spatiotemporal legend */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white border border-slate-200 rounded-md p-3.5 shadow-sm select-none animate-[fadeInUp_0.15s_ease-out] w-48 pointer-events-none">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
          {appState.activeLayers.includes('rainfall') ? 'Rainfall Scale (mm)' : 'Aquifer Risk Index'}
        </p>
        {appState.activeLayers.includes('rainfall') ? (
          <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-blue-600" /><span>Over 1000 mm</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-blue-400" /><span>500 - 1000 mm</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-blue-100" /><span>Below 500 mm</span></div>
          </div>
        ) : (
          <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600" /><span>Critical Moratorium</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /><span>High Deficit Risk</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /><span>Moderate Basin Stress</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span>Stable Recharge</span></div>
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
