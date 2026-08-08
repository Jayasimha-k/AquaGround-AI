import React, { useState } from 'react';
import { Brain, AlertCircle, ChevronRight, FileText, Activity, ShieldAlert, Sliders, Volume2, VolumeX, Mic, Radio } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Timeline } from '@/components/ui/Timeline';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ScenarioSimulator } from '@/components/ScenarioSimulator';
import { MOCK_RECOMMENDATIONS, MOCK_DECISIONS, MOCK_DISTRICTS } from '@/constants/mockData';
import type { AIRecommendation, DecisionStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

const PRIORITY_STYLE: Record<string, { dot: string; label: string; badge: any }> = {
  urgent: { dot: '#EF4444', label: 'Urgent Action',    badge: 'critical' },
  high:   { dot: '#F97316', label: 'High Priority',    badge: 'high' },
  medium: { dot: '#3B82F6', label: 'Medium Priority',  badge: 'moderate' },
  low:    { dot: '#94A3B8', label: 'Low Priority',     badge: 'stable' },
};

const decisionTimeline = MOCK_DECISIONS.map(d => ({
  id: d.id,
  title: `${d.districtName} Directive`,
  subtitle: d.officerName,
  description: d.note || 'Approved without modification.',
  timestamp: d.timestamp,
  status: d.status,
  actor: d.officerName,
}));

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
  const { currentUser, dispatchDirectiveAlert } = useAuth();
  const { t } = useLanguage();
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(MOCK_RECOMMENDATIONS[0]);
  const [officerNote, setOfficerNote] = useState('');

  const { isSpeaking, isListening, speakText, stopSpeaking, startListening, stopListening } = useVoiceAssistant(
    (spokenText) => setOfficerNote(prev => prev ? `${prev} ${spokenText}` : spokenText)
  );

  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [modifiedActionText, setModifiedActionText] = useState('');
  const [modifyReasonText, setModifyReasonText] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ action: DecisionStatus; label: string } | null>(null);
  const [decisions, setDecisions] = useState<Record<string, DecisionStatus>>({});
  const [timelineEvents, setTimelineEvents] = useState(decisionTimeline);

  const handleDecision = (action: DecisionStatus, noteOverride?: string) => {
    if (!selectedRec) return;

    setDecisions(prev => ({ ...prev, [selectedRec.id]: action }));

    const noteToRecord = noteOverride || officerNote || (
      action === 'approved'
        ? 'Directive approved and dispatched to regional hydrogeology team.'
        : action === 'rejected'
        ? 'Directive rejected after officer technical review.'
        : 'Directive modified and updated parameters saved.'
    );

    const actorName = currentUser ? `${currentUser.name} (${currentUser.roleTitle})` : 'Dr. Officer (Current User)';

    const newTimelineEvent = {
      id: `dec-${Date.now()}`,
      title: `${selectedRec.districtName} Directive`,
      subtitle: actorName,
      description: noteToRecord,
      timestamp: new Date().toISOString(),
      status: action,
      actor: actorName,
    };

    setTimelineEvents(prev => [newTimelineEvent, ...prev]);
    setConfirmAction(null);

    // Trigger Multi-Officer In-App Notification Bell & Automated SMTP Email Dispatch Alert
    dispatchDirectiveAlert(
      `${selectedRec.districtName} Hydrological Directive [${action.toUpperCase()}]`,
      noteToRecord,
      selectedRec.districtName
    );
  };

  const openModifyModal = () => {
    if (selectedRec) {
      setModifiedActionText(selectedRec.details);
      setModifyReasonText('');
    }
    setModifyModalOpen(true);
  };

  const handleSaveModification = () => {
    const combinedNote = modifyReasonText
      ? `Modified Action: "${modifiedActionText}". Reason: ${modifyReasonText}`
      : `Modified Action: "${modifiedActionText}".`;
    handleDecision('modified', combinedNote);
    setModifyModalOpen(false);
  };

  const details = selectedRec ? (MAPPED_DETAILS[selectedRec.id] ?? {
    reason: selectedRec.summary,
    evidence: 'Groundwater depth estimated at critical levels based on telemetry analysis.',
    action: selectedRec.details,
  }) : null;

  return (
    <PageContainer
      title="Decision Support Workspace"
      subtitle="Hydrological directives review panel, policy scenario simulator, and dispatch command"
    >
      {/* ── Top: Policy Scenario Simulator ── */}
      <div style={{ marginBottom: '28px' }}>
        <ScenarioSimulator
          districtName={selectedRec?.districtName || "Jaipur"}
          initialDepthMbgl={18.4}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Left: Directives List ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionHeader
            title="Active Telemetry Directives"
            subtitle="Directives awaiting hydrogeological validation"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOCK_RECOMMENDATIONS.map(rec => {
              const p = PRIORITY_STYLE[rec.priority] ?? PRIORITY_STYLE.medium;
              const isSelected = selectedRec?.id === rec.id;
              const decision = decisions[rec.id];
              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    setSelectedRec(rec);
                    setOfficerNote('');
                  }}
                  style={{
                    cursor: 'pointer', borderRadius: '12px', padding: '18px 20px',
                    background: isSelected ? '#F0F7FF' : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#93C5FD' : '#E8EDF3'}`,
                    boxShadow: isSelected ? '0 4px 16px rgba(37,99,235,0.1)' : '0 1px 3px rgba(15,23,42,0.05)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{rec.districtName}</span>
                    </div>
                    {decision
                      ? <StatusBadge variant={decision} size="sm" />
                      : <StatusBadge variant={p.badge} label={p.label} size="sm" />
                    }
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                    {rec.summary}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', fontWeight: 600 }}>
                    <span>{formatDistanceToNow(new Date(rec.generatedAt), { addSuffix: true })}</span>
                    <span style={{ color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      Review <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Action Center ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {selectedRec && details ? (
            <>
              {/* Directive workspace */}
              <div className="card" style={{ padding: '28px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9', marginBottom: '24px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Brain size={20} color="#2563EB" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {selectedRec.districtName} Directive
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          onClick={() => {
                            if (isSpeaking) stopSpeaking();
                            else speakText(`Hydrogeological Directive for ${selectedRec.districtName}. Reason: ${details.reason}. Recommended Action: ${details.action}`);
                          }}
                        >
                          {isSpeaking ? t('btn_stop_listen', 'Stop Audio') : t('btn_listen', 'Listen to Explanation')}
                        </Button>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 12px', borderRadius: '6px', flexShrink: 0 }}>
                          Confidence: {selectedRec.confidence}%
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, marginTop: '5px' }}>
                      {MOCK_DISTRICTS.find(d => d.id === selectedRec.districtId)?.state || 'Monitored'} Aquifer Basin
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { icon: <ShieldAlert size={14} color="#94A3B8" />, label: 'Reason',               value: details.reason, mono: false },
                    { icon: <Activity    size={14} color="#94A3B8" />, label: 'Telemetry Evidence',    value: details.evidence, mono: true },
                    { icon: <FileText    size={14} color="#94A3B8" />, label: 'Recommended Action',    value: details.action, mono: false, highlight: true },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', paddingBottom: i < 2 ? '20px' : 0, borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {row.icon}
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {row.label}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '13px', lineHeight: 1.7, fontWeight: row.mono ? 500 : 600,
                        color: row.highlight ? '#1D4ED8' : '#334155',
                        fontFamily: row.mono ? 'monospace' : 'inherit',
                        background: row.highlight ? '#EFF6FF' : 'transparent',
                        border: row.highlight ? '1px solid #BFDBFE' : 'none',
                        borderRadius: row.highlight ? '10px' : 0,
                        padding: row.highlight ? '12px 16px' : 0,
                      }}>
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer notes */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <SectionHeader
                    title="Officer Dispatch Observations"
                    subtitle="Hydrological logs to attach to command record"
                  />
                  <Button
                    variant={isListening ? 'primary' : 'secondary'}
                    size="sm"
                    icon={isListening ? <Radio size={14} className="animate-pulse" /> : <Mic size={14} />}
                    onClick={() => {
                      if (isListening) stopListening();
                      else startListening();
                    }}
                  >
                    {isListening ? t('label_speech_listening', 'Listening…') : t('btn_voice_input', 'Speak Prompt (Mic)')}
                  </Button>
                </div>
                <textarea
                  value={officerNote}
                  onChange={e => setOfficerNote(e.target.value)}
                  placeholder="Enter hydrological observations or click mic button above to speak in your regional language..."
                  rows={4}
                  style={{
                    width: '100%', marginTop: '16px', background: '#F8FAFC',
                    border: '1px solid #E8EDF3', borderRadius: '10px',
                    padding: '14px 16px', fontSize: '13px', color: '#334155',
                    resize: 'none', outline: 'none', fontFamily: 'inherit',
                    lineHeight: 1.6, boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Action dispatch */}
              <div className="card" style={{ padding: '24px' }}>
                <SectionHeader
                  title="Directive Action Dispatch"
                  subtitle="Approve, Modify or Reject this recommended directive"
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <Button variant="primary" onClick={() => setConfirmAction({ action: 'approved', label: 'Approve' })} fullWidth>
                    Approve & Dispatch
                  </Button>
                  <Button variant="secondary" onClick={openModifyModal} fullWidth>
                    Modify Directive
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmAction({ action: 'rejected', label: 'Reject' })} fullWidth>
                    Reject Directive
                  </Button>
                </div>
                {decisions[selectedRec.id] && (
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: '10px', padding: '12px 16px' }}>
                    <AlertCircle size={15} color="#94A3B8" />
                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Decision logged:</span>
                    <StatusBadge variant={decisions[selectedRec.id]} size="sm" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: '48px', textAlign: 'center', fontSize: '13.5px', color: '#94A3B8', fontWeight: 500 }}>
              Select an active telemetry directive to review details.
            </div>
          )}

          {/* Timeline */}
          <div className="card" style={{ padding: '24px' }}>
            <SectionHeader
              title="Directive Log History"
              subtitle="Central hydrogeologist directive dispatch timeline"
            />
            <div style={{ marginTop: '16px' }}>
              <Timeline events={timelineEvents as any} />
            </div>
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
            <Button variant="primary" onClick={handleSaveModification}>
              Save Modified Directive
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Amended Recommended Action
            </label>
            <textarea
              value={modifiedActionText}
              onChange={e => setModifiedActionText(e.target.value)}
              rows={3}
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E8EDF3', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#334155', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Amendment Reason Logs
            </label>
            <input
              type="text"
              value={modifyReasonText}
              onChange={e => setModifyReasonText(e.target.value)}
              placeholder="Observation reason for modification..."
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E8EDF3', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#334155', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
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
        message={`Are you sure you want to ${confirmAction?.label?.toLowerCase()} the directive for ${selectedRec?.districtName}? This will be permanently logged in the national command record.`}
        confirmLabel={confirmAction?.label === 'Approve' ? 'Approve & Dispatch' : confirmAction?.label}
        confirmVariant={confirmAction?.action === 'rejected' ? 'danger' : 'primary'}
      />
    </PageContainer>
  );
}
