// =============================================================================
// Module 3: Resource Intelligence (Analytical Intelligence Workspace)
// =============================================================================

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import {
  WaterLevelChart, ExtractionChart, RainfallChart,
  RiskDistributionChart,
} from '@/components/charts';
import { MONTHLY_WATER_LEVEL_DATA, YEARLY_WATER_LEVEL_DATA, MOCK_DISTRICTS } from '@/constants/mockData';
import { Filter, Download, HelpCircle, Activity, Droplets, ArrowUpRight, ShieldAlert } from 'lucide-react';

type QuestionTab = 'depletion' | 'balance' | 'rainfall' | 'comparison';

export function Analytics() {
  const [activeQuestion, setActiveQuestion] = useState<QuestionTab>('depletion');

  // Question metadata
  const questions = [
    { id: 'depletion', label: '1. Water Table Depletion', icon: Droplets, title: 'Is the regional water table depleting over time?', sub: 'Long-term groundwater depth trends below ground level (m BGL)' },
    { id: 'balance', label: '2. Water Balance Index', icon: Activity, title: 'Are extraction rates exceeding natural replenishment?', sub: 'Comparison of annual extraction rate vs natural aquifer recharge (MCM/yr)' },
    { id: 'rainfall', label: '3. Rainfall Correlation', icon: HelpCircle, title: 'How does seasonal precipitation impact recovery?', sub: 'Monthly rainfall distribution and storage index response indices' },
    { id: 'comparison', label: '4. Basin Comparison', icon: ShieldAlert, title: 'Which regional aquifer basins are changing fastest?', sub: 'Direct state and district category classification analysis' },
  ];

  const currentQ = questions.find(q => q.id === activeQuestion) || questions[0];

  return (
    <PageContainer
      title="Resource Intelligence Workspace"
      subtitle="Hydrological analytics tailored to diagnostic resource questions"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Filter size={13} />}>Filter Scope</Button>
          <Button variant="secondary" size="sm" icon={<Download size={13} />}>Export Data</Button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Question Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 border border-slate-200 rounded-md shadow-sm select-none">
          {questions.map(q => {
            const isSelected = activeQuestion === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestion(q.id as QuestionTab)}
                className={[
                  'flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-all cursor-pointer',
                  isSelected 
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                ].join(' ')}
              >
                <q.icon size={15} className={isSelected ? 'text-blue-700' : 'text-slate-400'} />
                <span className="text-xs">{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Response Panel */}
        <div className="card p-6 bg-white space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{currentQ.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{currentQ.sub}</p>
            </div>
            
            {/* Context Badge */}
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded w-fit">
              Analytical Diagnostic
            </span>
          </div>

          {/* ── QUESTION 1: Water Table Depletion ──────────────────────── */}
          {activeQuestion === 'depletion' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WaterLevelChart 
                  labels={MONTHLY_WATER_LEVEL_DATA.labels} 
                  depthData={MONTHLY_WATER_LEVEL_DATA.depth} 
                  height={240} 
                />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded p-4 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                    <Droplets size={11} className="text-blue-600" />
                    Hydrological Timeline
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Analysis indicates a consistent downward trajectory of the regional water table, descending to <span className="font-bold text-slate-900">22.8m BGL</span> in recent audits. 
                    Baseline data shows standard depletion patterns within crop irrigation belts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Audit Horizon: 12-Month</span>
                  <span className="text-blue-600 font-semibold cursor-pointer flex items-center gap-0.5">District Maps <ArrowUpRight size={10} /></span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 2: Water Balance ──────────────────────────────── */}
          {activeQuestion === 'balance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExtractionChart 
                  labels={MONTHLY_WATER_LEVEL_DATA.labels} 
                  extractionData={MONTHLY_WATER_LEVEL_DATA.extraction} 
                  rechargeData={MONTHLY_WATER_LEVEL_DATA.recharge} 
                  height={240} 
                />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded p-4 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                    <Activity size={11} className="text-blue-600" />
                    Balance Auditing
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Groundwater extraction rates in major basins average <span className="font-bold text-slate-900">9.8 MCM/yr</span>, while active recharge replenishment is capped at <span className="font-bold text-slate-900">3.2 MCM/yr</span>. 
                    This establishes an unsustainable water deficit multiplier of <span className="font-bold text-slate-900">3.06×</span>.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Balance Category: Deficit</span>
                  <span className="text-blue-600 font-semibold cursor-pointer flex items-center gap-0.5">Moratoriums <ArrowUpRight size={10} /></span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 3: Rainfall Correlation ───────────────────────── */}
          {activeQuestion === 'rainfall' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RainfallChart 
                  labels={MONTHLY_WATER_LEVEL_DATA.labels} 
                  data={MONTHLY_WATER_LEVEL_DATA.rainfall} 
                  height={240} 
                />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded p-4 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                    <HelpCircle size={11} className="text-blue-600" />
                    Precipitation Audits
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Telemetry shows peak recharge occurs between July and September, correlating with monsoon precipitation cycles. 
                    Basin infiltration rates require up to 45 days delay index to reflect on water table depth.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Source Index: IMD Telemetry</span>
                  <span className="text-blue-600 font-semibold cursor-pointer flex items-center gap-0.5">Correlation Logs <ArrowUpRight size={10} /></span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 4: Basin Comparison ──────────────────────────── */}
          {activeQuestion === 'comparison' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="bg-slate-50 border border-slate-100 rounded p-4 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                    <ShieldAlert size={11} className="text-blue-600" />
                    Basin Category Distribution
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Of the 12 monitored aquifer district coordinates, <span className="font-bold text-red-600">{MOCK_DISTRICTS.filter(d => d.riskLevel === 'critical').length}</span> districts are classified in the critical depletion zone, requiring immediate mitigation directives.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Scope: All India</span>
                  <span className="text-blue-600 font-semibold cursor-pointer flex items-center gap-0.5">Open Risk Monitor <ArrowUpRight size={10} /></span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </PageContainer>
  );
}
