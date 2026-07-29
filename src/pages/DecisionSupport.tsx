// =============================================================================
// Decision Support Page — Hydrological Intervention Review (Light Theme)
// =============================================================================

import React, { useState } from 'react';
import { Brain, Check, X, Edit, AlertCircle, ChevronRight, FileText, Activity, ShieldAlert } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Timeline } from '@/components/ui/Timeline';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { MOCK_RECOMMENDATIONS, MOCK_DECISIONS, MOCK_DISTRICTS } from '@/constants/mockData';
import type { AIRecommendation, DecisionStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const PRIORITY_COLORS = {
  urgent: { bg: 'bg-red-50/50', border: 'border-red-200', badge: 'critical' as const, dot: 'bg-red-500', label: 'Urgent Action' },
  high: { bg: 'bg-orange-50/50', border: 'border-orange-200', badge: 'high' as const, dot: 'bg-orange-500', label: 'High Priority' },
  medium: { bg: 'bg-blue-50/50', border: 'border-blue-200', badge: 'moderate' as const, dot: 'bg-blue-500', label: 'Medium Priority' },
  low: { bg: 'bg-slate-50/50', border: 'border-slate-200', badge: 'stable' as const, dot: 'bg-slate-500', label: 'Low Priority' },
};

const decisionTimeline = [
  ...MOCK_DECISIONS.map(d => ({
    id: d.id,
    title: `${d.districtName} Directive`,
    subtitle: d.officerName,
    description: d.note || 'Approved without modification.',
    timestamp: d.timestamp,
    status: d.status,
    actor: d.officerName,
  })),
];

// Map mock evidence & recommended actions for demonstration
const MAPPED_DETAILS: Record<string, { reason: string; evidence: string; action: string }> = {
  'rec-1': {
    reason: 'Critical aquifer depletion due to intensive tube-well extraction exceeding recharge rate by 210%.',
    evidence: 'Groundwater table dropped to 42.1m BGL. 3 active telemetry sensor nodes reporting critical status.',
    action: 'Immediate restriction on new commercial tube-well boring and deployment of check-dam recharge basins.',
  },
  'rec-2': {
    reason: 'Rapid drop in post-monsoon storage coefficients within hard-rock basalt aquifers.',
    evidence: 'Telemetry nodes report storage depletion rate of 1.4m per month. High soil dry-index levels.',
    action: 'Implementation of rooftop rainwater harvesting structures and connection to the local distributary canal.',
  },
  'rec-3': {
    reason: 'Severe groundwater deficit in high-density crop irrigation belt during sowing season.',
    evidence: 'Extraction rate recorded at 14.8 MCM/yr against active recharge rate of only 4.2 MCM/yr.',
    action: 'Strict implementation of micro-irrigation systems and mandatory registration of all irrigation borewells.',
  },
};

export function DecisionSupport() {
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(MOCK_RECOMMENDATIONS[0]);
  const [officerNote, setOfficerNote] = useState('');
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: DecisionStatus; label: string } | null>(null);
  const [decisions, setDecisions] = useState<Record<string, DecisionStatus>>({});

  const handleDecision = (action: DecisionStatus) => {
    if (!selectedRec) return;
    setDecisions(prev => ({ ...prev, [selectedRec.id]: action }));
    setConfirmAction(null);
  };

  const details = selectedRec ? (MAPPED_DETAILS[selectedRec.id] ?? {
    reason: selectedRec.summary,
    evidence: `Groundwater depth estimated at critical levels based on telemetry analysis.`,
    action: selectedRec.details,
  }) : null;

  return (
    <PageContainer
      title="Decision Support Workspace"
      subtitle="Hydrological directives review panel and directive dispatch command (Human-in-the-Loop)"
    >
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Left: Directive Recommendations List */}
        <div className="xl:col-span-2 space-y-4">
          <SectionHeader title="Active Telemetry Directives" subtitle="Directives awaiting hydrogeological validation" />
          <div className="space-y-3">
            {MOCK_RECOMMENDATIONS.map(rec => {
              const p = PRIORITY_COLORS[rec.priority];
              const isSelected = selectedRec?.id === rec.id;
              const decision = decisions[rec.id];

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRec(rec)}
                  className={[
                    'cursor-pointer rounded-md border p-4 transition-all duration-150 bg-white',
                    isSelected ? 'ring-2 ring-blue-600/20 border-blue-600 shadow-sm' : 'border-slate-200 hover:shadow-sm',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                      <span className="font-semibold text-slate-900 text-xs">{rec.districtName}</span>
                    </div>
                    {decision ? (
                      <StatusBadge variant={decision} size="sm" />
                    ) : (
                      <StatusBadge variant={p.badge} label={p.label} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{rec.summary}</p>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium">
                    <span>
                      Generated {formatDistanceToNow(new Date(rec.generatedAt), { addSuffix: true })}
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      Review Directive <ChevronRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Directive Action Center */}
        <div className="xl:col-span-3 space-y-5">
          {selectedRec && details ? (
            <>
              {/* Structured Recommendation Workspace */}
              <div className="card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded">
                    <Brain size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{selectedRec.districtName} Directive</h3>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                        Model Confidence: {selectedRec.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {MOCK_DISTRICTS.find(d => d.id === selectedRec.districtId)?.state || 'Monitored'} Aquifer Basin
                    </p>
                  </div>
                </div>

                {/* Structured details replacing paragraphs */}
                <div className="space-y-4">
                  {/* Reason */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-slate-50 pb-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={12} className="text-slate-400 shrink-0" />
                      <span>Reason</span>
                    </div>
                    <div className="md:col-span-3 text-xs text-slate-700 font-medium leading-relaxed">
                      {details.reason}
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-slate-50 pb-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity size={12} className="text-slate-400 shrink-0" />
                      <span>Telemetry Evidence</span>
                    </div>
                    <div className="md:col-span-3 text-xs text-slate-600 leading-relaxed font-mono">
                      {details.evidence}
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pb-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} className="text-slate-400 shrink-0" />
                      <span>Recommended Action</span>
                    </div>
                    <div className="md:col-span-3 text-xs text-blue-900 bg-blue-50/50 border border-blue-100 rounded p-3 leading-relaxed font-semibold">
                      {details.action}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hydrogeologist Observational sign-off */}
              <div className="card p-5">
                <SectionHeader title="Officer Dispatch Observations" subtitle="Hydrological logs and observations to attach to command record" className="mb-3.5" />
                <textarea
                  value={officerNote}
                  onChange={e => setOfficerNote(e.target.value)}
                  placeholder="Enter hydrological observations, operational exceptions, or local field coordinates..."
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 resize-none outline-none focus:border-blue-600/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="card p-4">
                <SectionHeader title="Directive Action Dispatch" subtitle="Approve, Modify or Reject this recommended directive" className="mb-3.5" />
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => setConfirmAction({ action: 'approved', label: 'Approve' })}
                    className="flex-1 text-xs py-2 shadow-sm"
                  >
                    Approve & Dispatch
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setModifyModalOpen(true)}
                    className="flex-1 text-xs py-2 shadow-sm"
                  >
                    Modify Directive
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setConfirmAction({ action: 'rejected', label: 'Reject' })}
                    className="flex-1 text-xs py-2 shadow-sm"
                  >
                    Reject Directive
                  </Button>
                </div>

                {decisions[selectedRec.id] && (
                  <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded p-2.5">
                    <AlertCircle size={14} className="text-slate-400" />
                    <span>Decision logged:</span>
                    <StatusBadge variant={decisions[selectedRec.id]} size="sm" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card p-8 text-center text-xs text-slate-400 font-medium">
              Select an active telemetry directive from the left list to review details.
            </div>
          )}

          {/* Workflow dispatch timeline */}
          <div className="card p-5">
            <SectionHeader title="Directive Log History" subtitle="Central hydrogeologist directive dispatch timeline" className="mb-4" />
            <Timeline events={decisionTimeline as any} />
          </div>
        </div>

      </div>

      {/* Modify Modal */}
      <Modal
        open={modifyModalOpen}
        onClose={() => setModifyModalOpen(false)}
        title="Modify Hydrological Directive"
        subtitle="Amend recommended directive boundaries and parameters prior to validation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModifyModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { handleDecision('modified'); setModifyModalOpen(false); }}>
              Save Modified Directive
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amended Recommended Action</label>
            <textarea
              defaultValue={selectedRec?.details}
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-800 resize-none outline-none focus:border-blue-600/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amendment Reason Logs</label>
            <input
              type="text"
              placeholder="Observation reason for modification..."
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600/50"
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && handleDecision(confirmAction.action)}
        title={`${confirmAction?.label} Directive`}
        message={`Are you sure you want to perform the ${confirmAction?.label?.toLowerCase()} action for ${selectedRec?.districtName}? This action will be permanently logged in the national command record.`}
        confirmLabel={confirmAction?.label === 'Approve' ? 'Approve & Dispatch' : confirmAction?.label}
        confirmVariant={confirmAction?.action === 'rejected' ? 'danger' : 'primary'}
      />
    </PageContainer>
  );
}
