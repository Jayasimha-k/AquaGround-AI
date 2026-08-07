import React, { useState } from 'react';
import { FileText, Download, Search, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MOCK_REPORTS, MOCK_DISTRICTS } from '@/constants/mockData';
import { generateCGWBReportPDF } from '@/services/pdfReportService';
import type { Report } from '@/types';

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
  const [selected, setSelected] = useState<Report>(MOCK_REPORTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(MOCK_DISTRICTS[0].id);

  const selectedDistrictObj = MOCK_DISTRICTS.find(d => d.id === selectedDistrictId) || MOCK_DISTRICTS[0];

  const handleGeneratePDF = (districtObj = selectedDistrictObj) => {
    const depth = districtObj.groundwaterDepth;
    const isCritical = districtObj.riskLevel === 'critical' || districtObj.riskLevel === 'high';
    
    generateCGWBReportPDF({
      district: districtObj.name,
      state: districtObj.state,
      water_level_mbgl: depth,
      soe_pct: Number(((districtObj.extractionRate / Math.max(1, districtObj.rechargeRate)) * 100).toFixed(1)),
      gsi_score: districtObj.healthScore,
      status: isCritical ? "Critical Moratorium Zone" : "Safe Sustainable Zone",
      ai_summary: `Official CGWB telemetry audit for ${districtObj.name} (${districtObj.state}) indicates average groundwater table depth of ${depth}m BGL with active sensor array diagnostics.`,
      recommendations: [
        `Mandate micro-irrigation and crop rotation protocols across ${districtObj.name} agricultural blocks.`,
        `Deploy ${Math.round(districtObj.totalSensors * 1.5)} additional artificial recharge check dams along river tributaries.`,
        `Enforce real-time telemetry extraction capping for commercial industrial consumers.`
      ]
    });
  };


  const filtered = MOCK_REPORTS.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterType === 'all' || r.type === filterType;
    return matchSearch && matchFilter;
  });

  const typeStyle = TYPE_STYLE[selected.type] ?? TYPE_STYLE.monthly;

  return (
    <PageContainer
      title="CGWB Survey & Audit Repository"
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
          <Button variant="secondary" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>
            Print View
          </Button>
          <Button variant="primary" size="sm" icon={<FileText size={14} />} onClick={() => handleGeneratePDF(selectedDistrictObj)}>
            Export CGWB PDF Report
          </Button>
        </div>
      }

    >
      {/* 2-column: document list | detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>

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
                placeholder="Search audit database by document title..."
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
              <option value="all">All Documents</option>
              <option value="monthly">Monthly Survey</option>
              <option value="quarterly">Quarterly Audit</option>
              <option value="annual">Annual Report</option>
              <option value="custom">Ad-hoc Survey</option>
              <option value="alert">Alert Log</option>
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

        {/* ── Right: Document Preview ───────────────────────────────────── */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 500 }}>

          {/* Document header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Survey Period',  value: selected.period },
              { label: 'Document Size',  value: selected.fileSize },
              { label: 'Total Pages',    value: `${selected.pages} pp` },
              { label: 'Verified By',    value: selected.generatedBy },
            ].map(item => (
              <div key={item.label} style={{ background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 5px 0' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* PDF Preview visual */}
          <div style={{
            flex: 1, background: '#F8FAFC', border: '1px dashed #CBD5E1',
            borderRadius: '12px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
            padding: '32px', position: 'relative', overflow: 'hidden', minHeight: '140px',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#2563EB', borderRadius: '12px 12px 0 0' }} />
            <FileText size={36} style={{ color: '#93C5FD' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#334155', margin: '0 0 4px 0' }}>
                CGWB Official Hydrological PDF Audit
              </p>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, fontFamily: 'monospace' }}>
                {selected.fileSize} · {selected.pages} pages
              </p>
            </div>
            <div style={{ width: '140px', height: '6px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '75%', background: 'linear-gradient(90deg, #3B82F6, #6366F1)', borderRadius: '99px' }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '10px' }}>
            <Button
              variant="primary"
              icon={<Download size={15} />}
              fullWidth
              onClick={() => handleGeneratePDF(selectedDistrictObj)}

            >
              Export CGWB Report PDF
            </Button>
            <Button variant="secondary" icon={<Printer size={15} />} onClick={() => window.print()} />
          </div>
        </div>

      </div>
    </PageContainer>
  );
}

