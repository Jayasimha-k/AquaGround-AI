// =============================================================================
// Users Page — User Management
// =============================================================================

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ShieldCheck, UserCheck, Activity, Eye } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MOCK_USERS } from '@/constants/mockData';
import { formatDistanceToNow } from 'date-fns';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<any> }> = {
  admin:   { label: 'Administrator',  color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: ShieldCheck },
  analyst: { label: 'Data Analyst',   color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: Activity },
  officer: { label: 'Hydrogeologist', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: UserCheck },
  viewer:  { label: 'Viewer / Auditor', color: '#475569', bg: '#F8FAFC', border: '#E2E8F0', icon: Eye },
};

export function Users() {
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="User Management"
      subtitle="Configure administrative roles, authorization boundaries and access logs"
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setAddModalOpen(true)}
        >
          Add User Account
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Roles Distribution Cards ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {(['admin', 'analyst', 'officer', 'viewer'] as const).map(role => {
            const cfg = ROLE_CONFIG[role];
            const Icon = cfg.icon;
            const count = MOCK_USERS.filter(u => u.role === role).length;

            return (
              <div
                key={role}
                className="card"
                style={{
                  padding: '20px 24px', background: '#FFFFFF',
                  borderLeft: `4px solid ${cfg.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', lineHeight: 1, margin: '0 0 6px 0' }}>
                    {count}
                  </p>
                  <span style={{
                    display: 'inline-block', fontSize: '11px', fontWeight: 700,
                    color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
                    padding: '3px 9px', borderRadius: '6px',
                  }}>
                    {cfg.label}
                  </span>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: '12px', background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color={cfg.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Search Bar & Table Workspace ──────────────────────────────── */}
        <div className="card" style={{ padding: '24px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Search input */}
          <div style={{ position: 'relative', maxWidth: '380px' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search accounts by name, email or department..."
              style={{
                width: '100%', background: '#F8FAFC', border: '1px solid #E8EDF3',
                borderRadius: '10px', paddingLeft: '40px', paddingRight: '14px',
                paddingTop: '10px', paddingBottom: '10px', fontSize: '13px',
                color: '#1E293B', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #E8EDF3' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E8EDF3' }}>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Officer / User</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Role</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scope Jurisdiction</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Active Log</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const cfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.viewer;
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
                          fontSize: '11px', fontWeight: 700, color: cfg.color,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          padding: '4px 10px', borderRadius: '6px', display: 'inline-block',
                        }}>
                          {cfg.label}
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
                          variant={user.status === 'active' ? 'stable' : user.status === 'inactive' ? 'offline' : 'critical'}
                          label={user.status.toUpperCase()}
                        />
                      </td>
                      <td style={{ padding: '16px 18px', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                        {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            title="Edit Permissions"
                            style={{
                              padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0',
                              background: '#FFFFFF', color: '#64748B', cursor: 'pointer', display: 'flex',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            title="Deactivate Account"
                            style={{
                              padding: '6px', borderRadius: '6px', border: '1px solid #FECACA',
                              background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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

      {/* Add User Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Account"
        subtitle="Create system credentials and assign role scope boundaries"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary">Register Account</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Full Name', placeholder: 'Dr. Rajan Sharma', type: 'text' },
            { label: 'Official Email Address', placeholder: 'rajan.sharma@cgwb.gov.in', type: 'email' },
            { label: 'Department / Agency', placeholder: 'Central Ground Water Board', type: 'text' },
          ].map(field => (
            <div key={field.label}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                style={{
                  width: '100%', background: '#F8FAFC', border: '1px solid #E8EDF3',
                  borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
                  color: '#1E293B', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Scope Boundary Role
            </label>
            <select style={{
              width: '100%', background: '#F8FAFC', border: '1px solid #E8EDF3',
              borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
              color: '#1E293B', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box',
            }}>
              <option>Viewer / Auditor</option>
              <option>Hydrogeologist</option>
              <option>Data Analyst</option>
              <option>Administrator</option>
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
