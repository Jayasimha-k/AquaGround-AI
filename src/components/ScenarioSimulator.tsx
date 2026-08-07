import React, { useState, useMemo } from 'react';
import { Sliders, RefreshCw, Cpu, ArrowUpRight, ArrowDownRight, ShieldCheck, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { calculateGSI } from '../utils/gsiCalculator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ScenarioSimulatorProps {
  districtName?: string;
  initialDepthMbgl?: number;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  districtName = "Jaipur",
  initialDepthMbgl = 18.4
}) => {
  const [rainfallAnomaly, setRainfallAnomaly] = useState<number>(0);
  const [extractionReduction, setExtractionReduction] = useState<number>(0);
  const [rechargeStructures, setRechargeStructures] = useState<number>(50);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const simulationData = useMemo(() => {
    let current = initialDepthMbgl;
    const baseCurve: number[] = [];
    const simulatedCurve: number[] = [];

    // Monthly recharge/drawdown rates
    months.forEach((_, idx) => {
      // Monsoon month index: 5,6,7,8 (June to Sep)
      const isMonsoon = idx >= 5 && idx <= 8;
      const baseRecharge = isMonsoon ? -1.8 : 0.45;
      
      // Base trajectory (no policy intervention)
      const baseDelta = baseRecharge + 0.15;
      const baseVal = Math.max(2.0, (baseCurve[idx - 1] || current) + baseDelta);
      baseCurve.push(Number(baseVal.toFixed(2)));

      // Simulated policy trajectory
      const rainMultiplier = isMonsoon ? (1 + rainfallAnomaly / 100) : 1;
      const effectiveRecharge = isMonsoon ? baseRecharge * rainMultiplier : baseRecharge;
      
      // Extraction policy effect (-30% extraction decreases drawdown)
      const extractionEffect = (1 - extractionReduction / 100) * 0.45;
      
      // Check dam effect (each 100 structures adds ~0.25m recharge per month)
      const rechargeStructureEffect = (rechargeStructures / 100) * 0.18;

      const netDelta = (isMonsoon ? effectiveRecharge : extractionEffect) - (isMonsoon ? rechargeStructureEffect : 0) + (isMonsoon ? 0 : 0.1);
      
      current = Math.max(1.5, (simulatedCurve[idx - 1] || initialDepthMbgl) + netDelta);
      simulatedCurve.push(Number(current.toFixed(2)));
    });

    const finalBaseDepth = baseCurve[baseCurve.length - 1];
    const finalSimDepth = simulatedCurve[simulatedCurve.length - 1];

    const gsiResult = calculateGSI(
      finalSimDepth,
      120 + (rechargeStructures * 0.4),
      140 * (1 - extractionReduction / 100),
      -rainfallAnomaly
    );

    return {
      baseCurve,
      simulatedCurve,
      finalBaseDepth,
      finalSimDepth,
      gsiResult
    };
  }, [rainfallAnomaly, extractionReduction, rechargeStructures, initialDepthMbgl]);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Baseline Trajectory (No Action)',
        data: simulationData.baseCurve,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        pointRadius: 3
      },
      {
        label: 'Simulated Policy Trajectory',
        data: simulationData.simulatedCurve,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#475569',
          font: { size: 12, weight: 600 as const },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        padding: 10,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw} m bgl`
        }
      }
    },
    scales: {
      y: {
        reverse: true, // Deeper water table is downwards
        title: {
          display: true,
          text: 'Water Table Depth (m bgl)',
          color: '#64748B',
          font: { size: 11, weight: 600 as const }
        },
        ticks: { color: '#64748B', font: { size: 11 } },
        grid: { color: '#F1F5F9' }
      },
      x: {
        ticks: { color: '#64748B', font: { size: 11 } },
        grid: { color: '#F1F5F9' }
      }
    }
  };

  const depthDelta = simulationData.finalBaseDepth - simulationData.finalSimDepth;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8EDF3',
      borderRadius: '14px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(15,23,42,0.06)'
    }}>

      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid #F1F5F9',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '12px',
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sliders size={20} color="#2563EB" />
          </div>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Interactive "What-If" Policy Simulator
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0', fontWeight: 500 }}>
              Simulate groundwater impacts for district <strong style={{ color: '#2563EB' }}>{districtName}</strong> across climate & policy intervention parameters
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setRainfallAnomaly(0);
            setExtractionReduction(0);
            setRechargeStructures(50);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 700, color: '#475569',
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
        >
          <RefreshCw size={13} />
          <span>Reset Sliders</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>

        {/* Left Column: Sliders */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>

          {/* Slider 1: Rainfall */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>Monsoon Rainfall Anomaly</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: rainfallAnomaly >= 0 ? '#10B981' : '#EF4444' }}>
                {rainfallAnomaly > 0 ? `+${rainfallAnomaly}%` : `${rainfallAnomaly}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={rainfallAnomaly}
              onChange={(e) => setRainfallAnomaly(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#10B981' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>
              <span>Drought (-50%)</span>
              <span>Normal</span>
              <span>Excess (+50%)</span>
            </div>
          </div>

          {/* Slider 2: Extraction */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>Agricultural Extraction Cut</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0284C7' }}>
                -{extractionReduction}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={extractionReduction}
              onChange={(e) => setExtractionReduction(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#0284C7' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>
              <span>Status Quo (0%)</span>
              <span>Micro-irrigation (-25%)</span>
              <span>Cap (-50%)</span>
            </div>
          </div>

          {/* Slider 3: Recharge Dams */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>Check Dams Construction</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>
                {rechargeStructures} units
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={rechargeStructures}
              onChange={(e) => setRechargeStructures(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#2563EB' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8', marginTop: '4px', fontWeight: 500 }}>
              <span>None (0)</span>
              <span>150 Structures</span>
              <span>300 Check Dams</span>
            </div>
          </div>

          {/* Metric Outputs */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>12-Month Water Table Delta:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 800, color: depthDelta >= 0 ? '#059669' : '#DC2626' }}>
                {depthDelta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>{depthDelta >= 0 ? `+${depthDelta.toFixed(2)}m saved` : `${depthDelta.toFixed(2)}m deeper`}</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sustainability Index (GSI):</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: simulationData.gsiResult.color_hex }}>
                {simulationData.gsiResult.gsi_score} / 100 ({simulationData.gsiResult.status_category})
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Chart & Policy Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                12-Month Simulated Water Table Depth (m bgl)
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '3px 9px', borderRadius: '6px' }}>
                Baseline Depth: {initialDepthMbgl}m bgl
              </span>
            </div>
            <div style={{ height: '240px', position: 'relative' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* AI Policy Advisory Card */}
          <div style={{
            marginTop: '16px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Cpu size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E3A8A', display: 'block', marginBottom: '3px' }}>
                AI Hydrogeological Mitigation Recommendation:
              </span>
              <p style={{ fontSize: '12px', color: '#1E293B', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                {depthDelta > 1.0
                  ? `Combining a ${extractionReduction}% extraction cut with ${rechargeStructures} check dam recharge structures offsets drought impact and restores groundwater reserves by ${depthDelta.toFixed(2)}m bgl.`
                  : `Current policy parameters are insufficient to arrest water table depletion in ${districtName}. Increase check dam deployment or mandate micro-irrigation to reach Safe GSI status.`}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
