import React, { useState } from 'react';
import { Brain, Play, CheckCircle } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Timeline } from '@/components/ui/Timeline';
import { PredictionChart } from '@/components/charts';
import { MOCK_PREDICTIONS } from '@/constants/mockData';
import { RISK_COLORS } from '@/constants';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

const SCENARIOS = [
  { id: 's1', title: 'Monsoon Deficit (−20%) with unchecked extraction', effect: 'Drop to 46.2m BGL', risk: 'critical', confidence: 88, color: '#EF4444', bg: '#FEF2F2' },
  { id: 's2', title: 'Normal Monsoon with 15% crop extraction cap', effect: 'Stabilize at 35.8m BGL', risk: 'moderate', confidence: 74, color: '#3B82F6', bg: '#EFF6FF' },
  { id: 's3', title: 'Managed Aquifer Recharge + 10% extraction cap', effect: 'Recovery to 32.1m BGL', risk: 'low', confidence: 85, color: '#10B981', bg: '#ECFDF5' },
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
    id: 'p3', title: 'Confidence Intervals', subtitle: 'Boundary validation',
    description: 'Hydrological confidence thresholds calculated.',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), status: 'pending' as const,
    actor: 'Validation Log',
  },
];

export function Predictions() {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(MOCK_PREDICTIONS[0].id);
  const [activeScenario, setActiveScenario] = useState('s2');

  const selectedPred = MOCK_PREDICTIONS.find(p => p.id === selectedId) || MOCK_PREDICTIONS[0];
  const currentScenario = SCENARIOS.find(s => s.id === activeScenario) || SCENARIOS[1];

  const getScenarioData = (data: typeof selectedPred.data) => {
    if (activeScenario === 's1') return data.map(d => ({ ...d, predicted: d.predicted + 2.1 }));
    if (activeScenario === 's3') return data.map(d => ({ ...d, predicted: d.predicted - 1.8 }));
    return data.map(d => d.predicted);
  };

  return (
    <PageContainer
      title={t('predictions_title', 'Prediction & Simulation Center')}
      subtitle={t('predictions_subtitle', 'AI-assisted aquifer forecasting and scenario simulation models')}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: '20px', minHeight: 580 }}>

        {/* ── Left: District Selector ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionHeader title={t('monitored_districts', 'Monitored Districts')} subtitle={t('select_district_sim', 'Select a district to simulate')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOCK_PREDICTIONS.map(p => {
              const isSelected = p.id === selectedId;
              const riskColor = RISK_COLORS[p.predictedRisk];
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#3B82F6' : '#E8EDF3'}`,
                    borderLeft: `4px solid ${riskColor}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 16px rgba(37,99,235,0.15)' : '0 1px 3px rgba(15,23,42,0.06)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{p.districtName}</h4>
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', fontWeight: 500 }}>{p.state}</p>
                    </div>
                    <StatusBadge variant={p.predictedRisk} size="sm" />
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                    Model: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{p.modelVersion.split(' ')[0]}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center: Chart + Scenarios ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Projection Chart */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={16} color="#3B82F6" />
                  {t('water_table_projection', '6-Month Water Table Projection')}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '5px', fontWeight: 500 }}>
                  Simulated depth (m BGL) for {selectedPred.districtName}
                </p>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700, color: '#2563EB',
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                padding: '4px 10px', borderRadius: '6px',
              }}>
                {t('confidence_score', 'Confidence')}: {selectedPred.confidenceScore}%
              </span>
            </div>
            <PredictionChart
              labels={selectedPred.data.map(d => format(new Date(d.timestamp), 'MMM yy'))}
              predicted={getScenarioData(selectedPred.data) as any}
              confLow={selectedPred.data.map(d => d.confidenceLow)}
              confHigh={selectedPred.data.map(d => d.confidenceHigh)}
              height={220}
            />
          </div>

          {/* Scenario Simulator */}
          <div className="card" style={{ padding: '24px' }}>
            <SectionHeader
              title={t('scenario_simulator_title', 'Scenario Planning Simulator')}
              subtitle={t('scenario_simulator_sub', 'Select variables to model aquifer outcome indices')}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
              {SCENARIOS.map(s => {
                const isActive = activeScenario === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveScenario(s.id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '12px',
                      border: `1.5px solid ${isActive ? s.color : '#E8EDF3'}`,
                      background: isActive ? s.bg : '#FFFFFF',
                      padding: '16px',
                      transition: 'all 0.15s',
                      boxShadow: isActive ? `0 4px 16px ${s.color}22` : 'none',
                    }}
                  >
                    <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                      {s.title}
                    </p>
                    <span style={{
                      display: 'inline-block', fontSize: '11px', fontWeight: 700,
                      color: s.color, background: `${s.color}18`,
                      border: `1px solid ${s.color}40`,
                      padding: '3px 8px', borderRadius: '6px',
                    }}>
                      {s.effect}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Outcome indicators */}
            <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '16px' }}>
              <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 14px 0' }}>
                <Play size={11} color="#3B82F6" /> {t('simulated_outcome', 'Simulated Outcome Parameters')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: t('outcome_index', 'Outcome Index'),     value: currentScenario.effect },
                  { label: t('projected_risk', 'Projected Risk'),     value: <StatusBadge variant={currentScenario.risk as any} size="sm" /> },
                  { label: t('model_probability', 'Model Probability'),  value: `${currentScenario.confidence}%` },
                ].map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 5px 0' }}>
                      {item.label}
                    </p>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Pipeline Timeline ──────────────────────────────────── */}
        <div>
          <div className="card" style={{ padding: '24px', height: '100%' }}>
            <SectionHeader title={t('simulation_pipeline', 'Simulation Pipeline')} subtitle={t('compiled_logs', 'Model compilation and training logs')} />
            <div style={{ marginTop: '16px' }}>
              <Timeline events={PIPELINE_EVENTS} />
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

