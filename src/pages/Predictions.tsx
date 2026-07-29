// =============================================================================
// Module 4: Prediction Center (Scenario Planning Simulator)
// =============================================================================

import React, { useState } from 'react';
import { Brain, TrendingDown, TrendingUp, Calendar, Zap, Play, HelpCircle, CheckCircle } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Timeline } from '@/components/ui/Timeline';
import { PredictionChart } from '@/components/charts';
import { MOCK_PREDICTIONS, MOCK_DISTRICTS } from '@/constants/mockData';
import { RISK_COLORS } from '@/constants';
import { format } from 'date-fns';

// Scenario templates for simulator
const SCENARIOS = [
  { id: 's1', title: 'Monsoon Deficit (-20%) with unchecked extraction', effect: 'Drop to 46.2m BGL', risk: 'critical', confidence: 88, color: '#EF4444' },
  { id: 's2', title: 'Normal Monsoon with 15% crop extraction cap', effect: 'Stabilization at 35.8m BGL', risk: 'moderate', confidence: 74, color: '#3B82F6' },
  { id: 's3', title: 'Managed Aquifer Recharge (MAR) + 10% extraction cap', effect: 'Recovery to 32.1m BGL', risk: 'low', confidence: 85, color: '#10B981' },
];

const PIPELINE_EVENTS = [
  {
    id: 'p1', title: 'Telemetry Preprocessing', subtitle: '30-day data packets parsed',
    description: 'Historical depth coordinates normalized, outliers removed.',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), status: 'approved' as const,
    actor: 'Telemetry Ingestion',
  },
  {
    id: 'p2', title: 'Simulation Modeling Run', subtitle: 'Predictive Trend Model v2.1',
    description: 'LSTM neural extrapolation run complete across 6-month horizons.',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'approved' as const,
    actor: 'Predictive Engine',
  },
  {
    id: 'p3', title: 'Confidence Intervals calculation', subtitle: 'Boundary check',
    description: 'Hydrological confidence thresholds calculated.',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), status: 'pending' as const,
    actor: 'Validation Log',
  },
];

export function Predictions() {
  const [selectedId, setSelectedId] = useState(MOCK_PREDICTIONS[0].id);
  const [activeScenario, setActiveScenario] = useState('s2');

  const selectedPred = MOCK_PREDICTIONS.find(p => p.id === selectedId) || MOCK_PREDICTIONS[0];
  const currentScenarioObj = SCENARIOS.find(s => s.id === activeScenario) || SCENARIOS[1];

  // Adjust mock predicted data based on the active scenario for demonstration purposes
  const getScenarioModifiedData = (data: typeof selectedPred.data) => {
    if (activeScenario === 's1') {
      return data.map(d => ({ ...d, predicted: d.predicted + 2.1 }));
    }
    if (activeScenario === 's3') {
      return data.map(d => ({ ...d, predicted: d.predicted - 1.8 }));
    }
    return data.map(d => d.predicted);
  };

  return (
    <PageContainer
      title="Prediction & Simulation Center"
      subtitle="AI-assisted aquifer forecasting and scenario simulation models"
    >
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ── Left Column: Select Monitored Districts ───────────────────── */}
        <div className="xl:col-span-1.5 space-y-4">
          <SectionHeader title="Monitored Districts" subtitle="Select a district to run simulations" />
          <div className="space-y-3">
            {MOCK_PREDICTIONS.map(p => {
              const isSelected = p.id === selectedId;
              const riskColor = RISK_COLORS[p.predictedRisk];
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={[
                    'cursor-pointer rounded border p-4 transition-all duration-150 bg-white border-l-4',
                    isSelected ? 'ring-2 ring-blue-600/20 border-blue-600 shadow-sm' : 'border-slate-200 hover:shadow-sm'
                  ].join(' ')}
                  style={{ borderLeftColor: riskColor }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs">{p.districtName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.state}</p>
                    </div>
                    <StatusBadge variant={p.predictedRisk} size="sm" />
                  </div>
                  
                  <div className="text-[10px] text-slate-500 font-medium">
                    Model version: <span className="font-mono text-slate-600">{p.modelVersion.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center Column: Chart & Scenario Planning Simulator ────────── */}
        <div className="xl:col-span-2.5 space-y-5">
          {/* Mapped Projection Chart */}
          <div className="card p-5 bg-white">
            <div className="pb-4 border-b border-slate-100 mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  6-Month Water Table Trend Projection
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulated water depth (m BGL) for {selectedPred.districtName}
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Confidence Score: {selectedPred.confidenceScore}%
              </span>
            </div>

            <PredictionChart
              labels={selectedPred.data.map(d => format(new Date(d.timestamp), 'MMM yy'))}
              predicted={getScenarioModifiedData(selectedPred.data) as any}
              confLow={selectedPred.data.map(d => d.confidenceLow)}
              confHigh={selectedPred.data.map(d => d.confidenceHigh)}
              height={200}
            />
          </div>

          {/* Scenario Planning Simulator */}
          <div className="card p-5 bg-white space-y-4">
            <SectionHeader 
              title="Scenario Planning Simulator" 
              subtitle="Select variables to model aquifer outcome indices" 
            />
            
            {/* Scenario selector cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SCENARIOS.map(s => {
                const isActive = activeScenario === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveScenario(s.id)}
                    className={[
                      'cursor-pointer rounded border p-3 text-xs flex flex-col justify-between transition-all duration-150 h-28',
                      isActive ? 'border-blue-600 bg-blue-50/20 shadow-sm ring-1 ring-blue-600/30' : 'border-slate-200 hover:shadow-sm bg-white'
                    ].join(' ')}
                  >
                    <p className="font-semibold text-slate-800 leading-normal line-clamp-2">{s.title}</p>
                    <span 
                      className="text-[10px] font-bold mt-2 inline-block px-1.5 py-0.5 rounded self-start border"
                      style={{ color: s.color, backgroundColor: `${s.color}0a`, borderColor: `${s.color}25` }}
                    >
                      {s.effect}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Simulated outcome indicators */}
            <div className="bg-slate-50 border border-slate-100 rounded p-4 text-xs space-y-3">
              <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                <Play size={11} className="text-blue-600" />
                Simulated Outcome Parameters
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Outcome index</div>
                  <p className="font-semibold text-slate-800 mt-0.5 capitalize">{currentScenarioObj.effect}</p>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Projected risk tier</div>
                  <span className="inline-block mt-1"><StatusBadge variant={currentScenarioObj.risk as any} size="sm" /></span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Model probability</div>
                  <p className="font-semibold text-slate-800 mt-0.5">{currentScenarioObj.confidence}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Simulation Log Timeline ───────────────────── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="card p-5 bg-white h-full">
            <SectionHeader title="Simulation Pipeline Logs" subtitle="Model compilation and training runs" className="mb-4" />
            <Timeline events={PIPELINE_EVENTS} />
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
