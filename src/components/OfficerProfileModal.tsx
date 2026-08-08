import React, { useState } from 'react';
import { ShieldCheck, UserCheck, MapPin, Building, Mail, Calendar, Clock, RefreshCw, Smartphone, Key, Lock, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export const OfficerProfileModal: React.FC = () => {
  const { currentUser, profileModalOpen, closeProfileModal, loginHistory, fetchAuditLogs } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'audit'>('profile');
  const [refreshing, setRefreshing] = useState(false);

  if (!currentUser) return null;

  const handleRefreshAudit = async () => {
    setRefreshing(true);
    await fetchAuditLogs();
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <Modal
      open={profileModalOpen}
      onClose={closeProfileModal}
      title={t('officer_profile_modal_title', 'Verified Officer Profile & Audit Logs')}
      subtitle={t('officer_profile_modal_sub', 'Central Ground Water Board • Official Credentials & Active Session Security History')}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: 700 }}>
            <CheckCircle2 size={15} />
            <span>Authenticated & Encrypted via CGWB Portal</span>
          </div>
          <Button variant="secondary" onClick={closeProfileModal}>{t('btn_close_profile', 'Close Profile')}</Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Navigation Tab Bar */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'profile' ? '#2563EB' : '#F1F5F9',
              color: activeTab === 'profile' ? '#FFFFFF' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <UserCheck size={15} />
            <span>Officer Details</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('audit');
              fetchAuditLogs();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'audit' ? '#2563EB' : '#F1F5F9',
              color: activeTab === 'audit' ? '#FFFFFF' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Clock size={15} />
            <span>Login Audit History ({loginHistory.length})</span>
          </button>
        </div>

        {/* ── TAB 1: OFFICER PROFILE DETAILS ────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: '14px',
              padding: '24px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(15,23,42,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  color: '#FFFFFF',
                  fontSize: '22px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
                }}>
                  {currentUser.avatar}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                      {currentUser.name}
                    </h2>
                    <span style={{
                      background: '#10B981',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ShieldCheck size={13} />
                      Verified Officer
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0', fontWeight: 500 }}>
                    {currentUser.designation} • {currentUser.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Grid Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', marginBottom: '8px' }}>
                  <Mail size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Official Email</span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{currentUser.email}</p>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>✓ OTP Email Verified</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', marginBottom: '8px' }}>
                  <MapPin size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>District Jurisdiction</span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{currentUser.district || 'National Command Scope'}</p>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '4px', display: 'inline-block' }}>Hydrological Monitoring Zone</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', marginBottom: '8px' }}>
                  <Building size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Department & Role</span>
                </div>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{currentUser.roleTitle}</p>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>{currentUser.department}</p>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', marginBottom: '8px' }}>
                  <Calendar size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Account Commissioned</span>
                </div>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {currentUser.registeredAt ? format(new Date(currentUser.registeredAt), 'PPP') : 'Active Official Account'}
                </p>
                <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>CGWB Clearance Level 3</span>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB 2: ACTUAL LOGIN HISTORY AUDIT LOGS ────────────────────────────── */}
        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Session Audit Trail & Login Logs
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Recorded IP addresses, timestamps, client browsers, and OTP verification status
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw size={13} className={refreshing ? 'spin' : ''} />}
                onClick={handleRefreshAudit}
              >
                Refresh Audit Trail
              </Button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Timestamp</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>IP Address</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Device / Browser</th>
                    <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Login Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((log, idx) => {
                    const isSuccess = log.status === 'OTP Verified' || log.status === 'SUCCESS';
                    const isReset = log.status === 'PASSWORD_RESET';
                    
                    return (
                      <tr
                        key={log.id || idx}
                        style={{
                          borderBottom: idx < loginHistory.length - 1 ? '1px solid #F1F5F9' : 'none',
                          background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>
                          <div>{format(new Date(log.timestamp), 'PPpp')}</div>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12.5px', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
                          {log.ip_address}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Smartphone size={13} color="#64748B" />
                            <span>{log.user_agent}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 800,
                            display: 'inline-block',
                            background: isSuccess ? '#ECFDF5' : isReset ? '#F5F3FF' : '#FEF2F2',
                            color: isSuccess ? '#059669' : isReset ? '#7C3AED' : '#DC2626',
                            border: `1px solid ${isSuccess ? '#A7F3D0' : isReset ? '#DDD6FE' : '#FECACA'}`
                          }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {loginHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '13px' }}>
                        No login history logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
};
