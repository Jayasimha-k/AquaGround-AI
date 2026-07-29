// =============================================================================
// Module 7: Reports (Administrative Document Workspace)
// =============================================================================

import React, { useState } from 'react';
import { FileText, Download, Eye, Search, Printer, FileDown, Filter } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { MOCK_REPORTS } from '@/constants/mockData';
import type { Report } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  monthly: 'Monthly Survey',
  quarterly: 'Quarterly Audit',
  annual: 'Annual Report',
  custom: 'Ad-hoc Survey',
  alert: 'Hydrological Alert Log',
};

const TYPE_COLORS: Record<string, string> = {
  monthly: 'text-blue-700 bg-blue-50 border-blue-200',
  quarterly: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  annual: 'text-amber-700 bg-amber-50 border-amber-200',
  custom: 'text-teal-700 bg-teal-50 border-teal-200',
  alert: 'text-red-700 bg-red-50 border-red-200',
};

export function Reports() {
  const [selected, setSelected] = useState<Report>(MOCK_REPORTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = MOCK_REPORTS.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterType === 'all' || r.type === filterType;
    return matchSearch && matchFilter;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer
      title="Survey Document Repository"
      subtitle="Access generated hydrological summaries, district-level audits, and annual water tables reports"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Printer size={13} />} onClick={handlePrint}>Print View</Button>
          <Button variant="primary" size="sm" icon={<FileText size={13} />}>Generate Survey</Button>
        </div>
      }
    >
      {/* Immersive Document Center split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Side: Directory & Filters */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search audit database by document title..."
                className="w-full bg-white border border-slate-200 rounded pl-8 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-blue-600/50"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2.5 py-2 text-xs text-slate-600 outline-none focus:border-blue-600/50 cursor-pointer font-medium"
            >
              <option value="all">All Documents</option>
              <option value="monthly">Monthly Survey</option>
              <option value="quarterly">Quarterly Audit</option>
              <option value="annual">Annual Report</option>
              <option value="custom">Ad-hoc Survey</option>
              <option value="alert">Hydrological Alert Log</option>
            </select>
          </div>

          {/* Directory Item List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map(report => {
              const isSelected = selected.id === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelected(report)}
                  className={[
                    'flex items-center gap-3.5 p-3.5 rounded border cursor-pointer transition-all duration-150',
                    isSelected
                      ? 'bg-blue-50/50 border-blue-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200',
                  ].join(' ')}
                >
                  <div className={`p-2 rounded shrink-0 ${isSelected ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400 border border-slate-200/50'}`}>
                    <FileText size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-850 truncate">{report.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                      <span>Period: {report.period}</span>
                      <span>·</span>
                      <span>{report.fileSize}</span>
                      <span>·</span>
                      <span>{report.pages} pp</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${TYPE_COLORS[report.type]}`}>
                      {TYPE_LABELS[report.type]}
                    </span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 bg-white border border-dashed rounded-lg">
                No survey documents found in repository matching criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Immersive Document Preview */}
        <div className="xl:col-span-1">
          <div className="card p-5 h-full flex flex-col justify-between bg-white border border-slate-200">
            <div>
              {/* Document Header */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100 mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded border border-blue-100 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs leading-snug truncate">{selected.title}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${TYPE_COLORS[selected.type]}`}>
                      {TYPE_LABELS[selected.type]}
                    </span>
                    <StatusBadge variant={selected.status === 'ready' ? 'stable' : selected.status === 'generating' ? 'moderate' : 'critical'} label={selected.status.toUpperCase()} />
                  </div>
                </div>
              </div>

              {/* Document Parameters */}
              <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                {[
                  { label: 'Survey period', value: selected.period },
                  { label: 'Document size', value: selected.fileSize },
                  { label: 'Total pages', value: `${selected.pages} pp` },
                  { label: 'Verified by', value: selected.generatedBy },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded p-2.5 border border-slate-100">
                    <div className="text-slate-400 font-medium text-[9px] uppercase tracking-wider">{item.label}</div>
                    <div className="font-semibold text-slate-800 mt-1 truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Immersive PDF Viewer Visual */}
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded p-6 flex flex-col items-center justify-center gap-2 select-none h-40">
                <FileText size={24} className="text-slate-300" />
                <p className="text-[11px] text-slate-400 font-bold">Hydrological PDF Audit</p>
                <p className="text-[10px] text-slate-400 font-mono leading-none">{selected.fileSize} · {selected.pages} pages</p>
              </div>
            </div>

            {/* Document Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                icon={<Download size={13} />}
                fullWidth
                disabled={selected.status !== 'ready'}
                className="text-xs py-2 shadow-sm"
              >
                {selected.status === 'generating' ? 'Compiling PDF...' : 'Download Document'}
              </Button>
              <Button 
                variant="secondary" 
                icon={<Printer size={13} />} 
                onClick={handlePrint}
                className="p-2 shadow-sm" 
              />
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
