import React, { useState } from 'react';
import { Plus, Search, ShieldCheck, UserCheck, Activity, Eye, LogOut, Wrench, Building2, User, KeyRound } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

export interface OfficialUserAccount {
  id: string;
  name: string;
  email: string;
  positionId: string;
  positionTitle: string;
  department: string;
  state?: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const OFFICIAL_POSITIONS = [
  { id: 'nodal_admin', label: 'Nodal Officer / System Administrator', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: ShieldCheck },
  { id: 'regional_director', label: 'Regional Director / Divisional Head', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: Building2 },
  { id: 'senior_hydrogeologist', label: 'Senior Hydrogeologist / Regional Scientist', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: UserCheck },
  { id: 'junior_hydrogeologist', label: 'Junior Hydrogeologist / Assistant Chemist', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', icon: Activity },
  { id: 'vendor_engineer', label: 'Third-Party Vendor Engineer / Maintenance Officer', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: Wrench },
  { id: 'citizen_farmer', label: 'Citizen / Farmer (Public Viewer)', color: '#475569', bg: '#F8FAFC', border: '#E2E8F0', icon: Eye },
];

const INITIAL_OFFICIAL_USERS: OfficialUserAccount[] = [
  {
    id: 'usr-001',
    name: 'Dr. Anand Verma',
    email: 'anand.verma@cgwb.gov.in',
    positionId: 'nodal_admin',
    positionTitle: 'Nodal Officer / System Administrator',
    department: 'Central Ground Water Board (CGWB HQ)',
    state: 'National (All India)',
    status: 'active',
    lastActive: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'usr-002',
    name: 'Smt. Priya Sharma',
    email: 'priya.sharma@cgwb.gov.in',
    positionId: 'regional_director',
    positionTitle: 'Regional Director / Divisional Head',
    department: 'Northern Regional Directorate',
    state: 'Uttar Pradesh & Bihar',
    status: 'active',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'usr-003',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@cgwb.gov.in',
    positionId: 'senior_hydrogeologist',
    positionTitle: 'Senior Hydrogeologist / Regional Scientist',
    department: 'Western Regional Directorate',
    state: 'Rajasthan & Gujarat',
    status: 'active',
    lastActive: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'usr-004',
    name: 'Kavita Mehta',
    email: 'kavita.mehta@cgwb.gov.in',
    positionId: 'junior_hydrogeologist',
    positionTitle: 'Junior Hydrogeologist / Assistant Chemist',
    department: 'Water Quality Analysis Wing',
    state: 'Punjab & Haryana',
    status: 'active',
    lastActive: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'usr-005',
    name: 'Chandan Kumar',
    email: 'chandan.vendor@telemetry-tech.in',
    positionId: 'vendor_engineer',
    positionTitle: 'Third-Party Vendor Engineer / Maintenance Officer',
    department: 'DWLR Telemetry Maintenance Corp',
    state: 'Pan-India Maintenance',
    status: 'active',
    lastActive: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'usr-006',
    name: 'Ramesh Patel',
    email: 'ramesh.farmer@patelfarms.in',
    positionId: 'citizen_farmer',
    positionTitle: 'Citizen / Farmer (Public Viewer)',
    department: 'Public Transparency Portal',
    state: 'Gujarat',
    status: 'active',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function Users() {
  const { currentUser, logout, openProfileModal } = useAuth();
  const { t } = useLanguage();
  const [usersList, setUsersList] = useState<OfficialUserAccount[]>(INITIAL_OFFICIAL_USERS);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Central Ground Water Board');
  const [selectedPositionId, setSelectedPositionId] = useState<string>('senior_hydrogeologist');

  const handleRegisterUser = () => {
    if (!newName || !newEmail) return;
    const pos = OFFICIAL_POSITIONS.find(p => p.id === selectedPositionId) || OFFICIAL_POSITIONS[2];
    const account: OfficialUserAccount = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      positionId: pos.id,
      positionTitle: pos.label,
      department: newDepartment,
      state: 'National HQ',
      status: 'active',
      lastActive: new Date().toISOString()
    };
    setUsersList(prev => [account, ...prev]);
    setNewName('');
    setNewEmail('');
    setAddModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === 'active' ? 'inactive' : 'active'
        };
      }
      return u;
    }));
  };

  const filtered = usersList.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.positionTitle.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title={t('users_title', 'User Management & Auth Control')}
      subtitle={t('users_subtitle', 'Configure administrative roles, user authorization boundaries, and active sessions')}
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<UserCheck size={14} />}
            onClick={() => openProfileModal()}
          >
            {t('officer_profile', 'Officer Profile & Audit Logs')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<LogOut size={14} />}
            onClick={() => logout()}
          >
            {t('lock_session', 'Lock Session / Log Out')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setAddModalOpen(true)}
          >
            {t('add_user', 'Add User Account')}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Blended Light-Mode Active Logged-in Session Banner */}
        {currentUser && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(15,23,42,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: 46, height: 46, borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#FFFFFF', fontSize: '15px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}>
                {currentUser.avatar || 'CG'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {currentUser.name && currentUser.name !== 'Officer' ? currentUser.name : currentUser.email.split('@')[0]}
                  </h3>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '6px',
                    background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                    Active Session • Verified Officer
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
                  {currentUser.email} • <strong style={{ color: '#2563EB', fontWeight: 700 }}>{currentUser.roleTitle}</strong> ({currentUser.department})
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => openProfileModal()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12.5px', fontWeight: 700, color: '#2563EB',
                  background: '#EFF6FF', border: '1px solid #BFDBFE',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <UserCheck size={14} />
                <span>View Profile & Audit Logs</span>
              </button>

              <button
                onClick={() => logout()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12.5px', fontWeight: 700, color: '#DC2626',
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 6 Official Designation Tiers Cards ────────────────────────────────── */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {OFFICIAL_POSITIONS.map(pos => {
              const Icon = pos.icon;
              const count = usersList.filter(u => u.positionTitle === pos.label || u.positionId === pos.id).length;

              return (
                <div
                  key={pos.id}
                  style={{
                    padding: '18px 20px',
                    background: '#FFFFFF',
                    border: '1px solid #E8EDF3',
                    borderLeft: `4px solid ${pos.color}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <p style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', lineHeight: 1, margin: '0 0 8px 0' }}>
                      {count}
                    </p>
                    <span style={{
                      display: 'inline-block', fontSize: '11px', fontWeight: 700,
                      color: pos.color, background: pos.bg, border: `1px solid ${pos.border}`,
                      padding: '3px 9px', borderRadius: '6px', lineHeight: 1.3,
                      whiteSpace: 'normal', wordBreak: 'break-word'
                    }}>
                      {pos.label}
                    </span>
                  </div>
                  <div style={{
                    width: 42, height: 42, borderRadius: '12px', background: pos.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    border: `1px solid ${pos.border}`
                  }}>
                    <Icon size={20} color={pos.color} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Table Workspace ────────────────────────────────────────── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8EDF3',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search accounts by name, email or department..."
              style={{
                width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                borderRadius: '8px', paddingLeft: '40px', paddingRight: '14px',
                paddingTop: '10px', paddingBottom: '10px', fontSize: '13px',
                color: '#0F172A', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', fontWeight: 500
              }}
            />
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E8EDF3' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E8EDF3' }}>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Officer / User</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Designation</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scope Jurisdiction</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Active Log</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const pos = OFFICIAL_POSITIONS.find(p => p.label === user.positionTitle || p.id === user.positionId) || OFFICIAL_POSITIONS[2];
                  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '10px', background: '#EFF6FF',
                            border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px',
                            fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '3px 0 0 0', fontFamily: 'monospace' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, color: pos.color,
                          background: pos.bg, border: `1px solid ${pos.border}`,
                          padding: '4px 10px', borderRadius: '6px', display: 'inline-block',
                        }}>
                          {user.positionTitle}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                        {user.department}
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                        {user.state ?? 'National (All India)'}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <StatusBadge
                          variant={user.status === 'active' ? 'stable' : 'offline'}
                          label={user.status.toUpperCase()}
                        />
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                        {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <button
                          title="Toggle Account Status"
                          onClick={() => handleToggleStatus(user.id)}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1',
                            background: '#F8FAFC', color: '#334155', fontSize: '11.5px', fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Add Officer Account Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Officer Account"
        subtitle="Create system credentials and assign official position scope"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRegisterUser}>Register Account</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Dr. Rajan Sharma"
              style={{
                width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                color: '#0F172A', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Official Email Address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="rajan.sharma@cgwb.gov.in"
              style={{
                width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                color: '#0F172A', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Department / Agency
            </label>
            <input
              type="text"
              value={newDepartment}
              onChange={e => setNewDepartment(e.target.value)}
              placeholder="Central Ground Water Board (CGWB)"
              style={{
                width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
                color: '#0F172A', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Official Designation
            </label>
            <select
              value={selectedPositionId}
              onChange={e => setSelectedPositionId(e.target.value)}
              style={{
                width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1',
                borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px',
                color: '#0F172A', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            >
              {OFFICIAL_POSITIONS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
