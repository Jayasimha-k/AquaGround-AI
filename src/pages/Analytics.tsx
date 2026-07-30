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
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px',
          background: '#FFFFFF', padding: '16px',
          border: '1px solid #E8EDF3', borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
        }}>
          {questions.map(q => {
            const isSelected = activeQuestion === q.id;
            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestion(q.id as QuestionTab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '10px', textAlign: 'left',
                  cursor: 'pointer', border: 'none',
                  background: isSelected ? '#EFF6FF' : 'none',
                  outline: isSelected ? '1.5px solid #BFDBFE' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <q.icon size={16} style={{ color: isSelected ? '#2563EB' : '#94A3B8', flexShrink: 0 }} />
                <span style={{ fontSize: '12.5px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1D4ED8' : '#475569', lineHeight: 1.3 }}>
                  {q.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Response Panel */}
        <div className="card" style={{ background: '#FFFFFF', padding: '28px' }}>
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #F1F5F9', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{currentQ.title}</h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', fontWeight: 500 }}>{currentQ.sub}</p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 12px', borderRadius: '6px', flexShrink: 0 }}>
              Analytical Diagnostic
            </span>
          </div>

          {activeQuestion === 'depletion' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
              <WaterLevelChart
                labels={MONTHLY_WATER_LEVEL_DATA.labels}
                depthData={MONTHLY_WATER_LEVEL_DATA.depth}
                height={260}
              />
              <div style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
                    <Droplets size={12} color="#3B82F6" /> Hydrological Timeline
                  </p>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                    Analysis indicates a consistent downward trajectory, descending to{' '}
                    <strong style={{ color: '#0F172A' }}>22.8m BGL</strong> in recent audits.
                    Baseline data shows standard depletion in crop irrigation belts.
                  </p>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #E8EDF3', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                  <span>Audit Horizon: 12-Month</span>
                  <span style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}>District Maps →</span>
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
