import React, { useState } from 'react';
import { FileText, Download, Search, Printer, CheckCircle, Clock, AlertCircle, Volume2, VolumeX, BarChart2, TrendingDown } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MOCK_REPORTS, MOCK_DISTRICTS } from '@/constants/mockData';
import { generateCGWBReportPDF } from '@/services/pdfReportService';
import type { Report } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

const TYPE_LABELS: Record<string, string> = {
  monthly:   'Monthly Survey',
  quarterly: 'Quarterly Audit',
  annual:    'Annual Report',
  custom:    'Ad-hoc Survey',
  alert:     'Alert Log',
};

const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  monthly:   { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  quarterly: { color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
  annual:    { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  custom:    { color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4' },
  alert:     { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
};

export function Reports() {
  const { dispatchDirectiveAlert } = useAuth();
  const { t } = useLanguage();
  const { isSpeaking, speakText, stopSpeaking } = useVoiceAssistant();

  const [selected, setSelected] = useState<Report>(MOCK_REPORTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(MOCK_DISTRICTS[0].id);

  const selectedDistrictObj = MOCK_DISTRICTS.find(d => d.id === selectedDistrictId) || MOCK_DISTRICTS[0];

  const handleGeneratePDF = (districtObj = selectedDistrictObj) => {
    const depth = districtObj.groundwaterDepth;
    const isCritical = districtObj.riskLevel === 'critical' || districtObj.riskLevel === 'high';
    const recharge = districtObj.rechargeRate;
    const extraction = districtObj.extractionRate;
    const netBalance = Number((recharge - extraction).toFixed(1));
    const soePct = Number(((extraction / Math.max(1, recharge)) * 100).toFixed(1));
    
    generateCGWBReportPDF({
      district: districtObj.name,
      state: districtObj.state,
      water_level_mbgl: depth,
      soe_pct: soePct,
      gsi_score: districtObj.healthScore,
      recharge_mcm: recharge,
      extraction_mcm: extraction,
      net_balance_mcm: netBalance,
      status: isCritical ? "Critical Moratorium Zone" : "Safe Sustainable Zone",
      ai_summary: `Official CGWB annual hydrological audit for ${districtObj.name} (${districtObj.state}) indicates natural recharge of ${recharge} MCM/yr against extraction of ${extraction} MCM/yr (Net Balance: ${netBalance} MCM/yr, Stage of Extraction: ${soePct}%).`,
      recommendations: [
        `Mandate micro-irrigation and crop rotation protocols across ${districtObj.name} agricultural blocks.`,
        `Deploy ${Math.round(districtObj.totalSensors * 1.5)} additional artificial recharge check dams along river tributaries to offset ${Math.abs(netBalance)} MCM annual deficit.`,
        `Enforce real-time telemetry extraction capping for commercial industrial consumers.`
      ]
    });

    dispatchDirectiveAlert(
      `CGWB Official Annual Survey Report Published (${districtObj.name})`,
      `Official Hydrological Survey & Annual Telemetry Audit generated for ${districtObj.name}, ${districtObj.state}. Recharge: ${recharge} MCM, Extraction: ${extraction} MCM.`,
      districtObj.name
    );
  };

  const handleListenReport = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const summaryText = `CGWB Official Hydrological Survey Report for ${selectedDistrictObj.name}, ${selectedDistrictObj.state}. Groundwater table depth is recorded at ${selectedDistrictObj.groundwaterDepth} meters below ground level. Groundwater Sustainability Score is ${selectedDistrictObj.healthScore} out of 100. Status is ${selectedDistrictObj.riskLevel === 'critical' ? 'Critical' : 'Stable'}.`;
      speakText(summaryText);
    }
  };

  const filtered = MOCK_REPORTS.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterType === 'all' || r.type === filterType;
    return matchSearch && matchFilter;
  });

  const typeStyle = TYPE_STYLE[selected.type] ?? TYPE_STYLE.monthly;

  // Mock 12-month depth trajectory data for visual charts
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseVal = selectedDistrictObj.groundwaterDepth;
  const mockDepths = [
    Number((baseVal - 1.8).toFixed(1)),
    Number((baseVal - 1.2).toFixed(1)),
    Number((baseVal - 0.5).toFixed(1)),
    Number((baseVal + 0.4).toFixed(1)),
    Number((baseVal + 1.2).toFixed(1)),
    Number((baseVal + 2.1).toFixed(1)),
    Number((baseVal + 1.5).toFixed(1)),
    Number((baseVal + 0.2).toFixed(1)),
    Number((baseVal - 0.8).toFixed(1)),
    Number((baseVal - 1.4).toFixed(1)),
    Number((baseVal - 1.9).toFixed(1)),
    Number(baseVal.toFixed(1)),
  ];

  const maxDepth = Math.max(...mockDepths);

  return (
    <PageContainer
      title={t('nav_reports', 'CGWB Survey & Audit Repository')}
      subtitle="Access generated hydrological summaries, district-level audits, and official CGWB PDF reports"
      actions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedDistrictId}
            onChange={e => setSelectedDistrictId(e.target.value)}
            style={{
              background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px',
              padding: '6px 12px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A',
              outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            {MOCK_DISTRICTS.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="sm"
            icon={isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            onClick={handleListenReport}
          >
            {isSpeaking ? t('btn_stop_listen', 'Stop Audio') : t('btn_listen', 'Listen to Summary')}
          </Button>

          <Button variant="secondary" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>
            {t('btn_print', 'Print View')}
          </Button>
          
          <Button variant="primary" size="sm" icon={<FileText size={14} />} onClick={() => handleGeneratePDF(selectedDistrictObj)}>
            {t('btn_export_pdf', 'Export CGWB PDF Report')}
          </Button>
        </div>
      }
    >
      {/* 2-column: document list | detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '20px', alignItems: 'start' }}>

        {/* ── Left: Document List ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Search + Filter bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search_database_ph', 'Search audit database by document title...')}
                style={{
                  width: '100%', background: '#FFFFFF', border: '1px solid #E8EDF3',
                  borderRadius: '10px', paddingLeft: '42px', paddingRight: '16px',
                  paddingTop: '11px', paddingBottom: '11px',
                  fontSize: '13px', color: '#334155', outline: 'none',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.05)', fontFamily: 'inherit',
                }}
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{
                background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px', color: '#334155', outline: 'none',
                cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
                boxShadow: '0 1px 3px rgba(15,23,42,0.05)', flexShrink: 0,
              }}
            >
              <option value="all">{t('filter_all_docs', 'All Documents')}</option>
              <option value="monthly">{t('filter_monthly', 'Monthly Survey')}</option>
              <option value="quarterly">{t('filter_quarterly', 'Quarterly Audit')}</option>
              <option value="annual">{t('filter_annual', 'Annual Report')}</option>
              <option value="custom">{t('filter_adhoc', 'Ad-hoc Survey')}</option>
              <option value="alert">{t('filter_alert_log', 'Alert Log')}</option>
            </select>
          </div>

          {/* Document rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: 600, overflowY: 'auto' }}>
            {filtered.map(report => {
              const isSelected = selected.id === report.id;
              const ts = TYPE_STYLE[report.type] ?? TYPE_STYLE.monthly;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelected(report)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '18px 20px',
                    background: isSelected ? '#F0F7FF' : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#93C5FD' : '#E8EDF3'}`,
                    borderRadius: '12px', cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(37,99,235,0.1)'
                      : '0 1px 3px rgba(15,23,42,0.05)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                    background: isSelected ? '#DBEAFE' : '#F8FAFC',
                    border: `1px solid ${isSelected ? '#93C5FD' : '#E8EDF3'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? '#2563EB' : '#94A3B8',
                  }}>
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 5px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                      <span>Period: {report.period}</span>
                      <span>·</span>
                      <span>{report.fileSize}</span>
                      <span>·</span>
                      <span>{report.pages} pp</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '4px 10px',
                    borderRadius: '6px', flexShrink: 0,
                    color: ts.color, background: ts.bg, border: `1px solid ${ts.border}`,
                  }}>
                    {TYPE_LABELS[report.type]}
                  </span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#94A3B8', background: '#FFFFFF', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
                No survey documents found matching criteria.
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Document Preview & Visual Charts Panel ───────────────── */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 500 }}>

          {/* Document header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
              background: typeStyle.bg, border: `1px solid ${typeStyle.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: typeStyle.color,
            }}>
              <FileText size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                {selected.title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '3px 9px',
                  borderRadius: '6px', color: typeStyle.color,
                  background: typeStyle.bg, border: `1px solid ${typeStyle.border}`,
                }}>
                  {TYPE_LABELS[selected.type]}
                </span>
                <StatusBadge
                  variant={selected.status === 'ready' ? 'stable' : selected.status === 'generating' ? 'moderate' : 'critical'}
                  label={selected.status.toUpperCase()}
                />
              </div>
            </div>
          </div>

          {/* Metadata grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: t('target_district', 'Target District'),  value: `${selectedDistrictObj.name}` },
              { label: t('survey_period', 'Survey Period'),    value: selected.period },
              { label: t('bgl_depth', 'Water Table Depth'), value: `${selectedDistrictObj.groundwaterDepth}m BGL` },
              { label: t('gsi_health_score', 'GSI Health Score'), value: `${selectedDistrictObj.healthScore}/100` },
            ].map(item => (
              <div key={item.label} style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── ANNUAL GROUNDWATER EXTRACTION & RECHARGE CARD ────────── */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingDown size={16} color="#0284C7" />
                Annual Area Assessment (Extraction vs Recharge)
              </span>
              <span style={{
                fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
                background: selectedDistrictObj.extractionRate > selectedDistrictObj.rechargeRate ? '#FEF2F2' : '#ECFDF5',
                color: selectedDistrictObj.extractionRate > selectedDistrictObj.rechargeRate ? '#EF4444' : '#10B981',
                border: `1px solid ${selectedDistrictObj.extractionRate > selectedDistrictObj.rechargeRate ? '#FECACA' : '#A7F3D0'}`
              }}>
                SOE: {((selectedDistrictObj.extractionRate / Math.max(1, selectedDistrictObj.rechargeRate)) * 100).toFixed(1)}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Annual Recharge</span>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#065F46', margin: '3px 0 0 0' }}>
                  {selectedDistrictObj.rechargeRate} <span style={{ fontSize: '11px', fontWeight: 600 }}>MCM</span>
                </p>
              </div>
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>Annual Extraction</span>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#991B1B', margin: '3px 0 0 0' }}>
                  {selectedDistrictObj.extractionRate} <span style={{ fontSize: '11px', fontWeight: 600 }}>MCM</span>
                </p>
              </div>
            </div>

            {/* Visual Extraction vs Recharge comparison bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>Recharge (Green) vs Extraction (Red)</span>
                <span style={{ color: selectedDistrictObj.rechargeRate - selectedDistrictObj.extractionRate < 0 ? '#EF4444' : '#10B981' }}>
                  Net: {(selectedDistrictObj.rechargeRate - selectedDistrictObj.extractionRate).toFixed(1)} MCM
                </span>
              </div>
              <div style={{ display: 'flex', height: '10px', borderRadius: '99px', overflow: 'hidden', background: '#E2E8F0' }}>
                <div
                  title={`Recharge: ${selectedDistrictObj.rechargeRate} MCM`}
                  style={{
                    width: `${Math.min(100, (selectedDistrictObj.rechargeRate / (selectedDistrictObj.rechargeRate + selectedDistrictObj.extractionRate)) * 100)}%`,
                    background: '#10B981',
                  }}
                />
                <div
                  title={`Extraction: ${selectedDistrictObj.extractionRate} MCM`}
                  style={{
                    width: `${Math.min(100, (selectedDistrictObj.extractionRate / (selectedDistrictObj.rechargeRate + selectedDistrictObj.extractionRate)) * 100)}%`,
                    background: '#EF4444',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── VISUAL CHARTS & BAR GRAPHS ─────────────────────────────── */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart2 size={16} color="#2563EB" />
                {t('report_visuals_title', 'District Telemetry & Visual Charts')}
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                CGWB Live
              </span>
            </div>

            {/* 12-Month Water Table Trend Bars */}
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#475569', margin: '0 0 8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('report_water_trend', '12-Month Water Table Depth Trend (m BGL)')}</span>
                <span style={{ color: '#2563EB' }}>Avg: {selectedDistrictObj.groundwaterDepth}m</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px', padding: '4px 0' }}>
                {mockDepths.map((d, i) => {
                  const pct = Math.min(100, Math.max(15, (d / maxDepth) * 100));
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <div
                        title={`${monthLabels[i]}: ${d}m BGL`}
                        style={{
                          width: '100%',
                          height: `${pct}%`,
                          background: d > 15 ? 'linear-gradient(180deg, #F87171, #EF4444)' : 'linear-gradient(180deg, #60A5FA, #2563EB)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                      <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#94A3B8' }}>{monthLabels[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Groundwater Sustainability Index (GSI) Visual Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>{t('report_gsi_meter', 'Groundwater Sustainability Index (GSI)')}</span>
                <span style={{ color: selectedDistrictObj.healthScore < 50 ? '#EF4444' : '#10B981' }}>{selectedDistrictObj.healthScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${selectedDistrictObj.healthScore}%`,
                  background: selectedDistrictObj.healthScore < 50 ? 'linear-gradient(90deg, #EF4444, #F59E0B)' : 'linear-gradient(90deg, #3B82F6, #10B981)',
                  borderRadius: '99px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '10px' }}>
            <Button
              variant="primary"
              icon={<Download size={15} />}
              fullWidth
              onClick={() => handleGeneratePDF(selectedDistrictObj)}
            >
              {t('btn_export_pdf', 'Export CGWB Report PDF')}
            </Button>
            <Button variant="secondary" icon={<Printer size={15} />} onClick={() => window.print()} />
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
