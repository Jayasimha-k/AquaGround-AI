// =============================================================================
// Users Page — User Management (Light Theme)
// =============================================================================

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MOCK_USERS } from '@/constants/mockData';
import { formatDistanceToNow } from 'date-fns';

const ROLE_STYLES: Record<string, string> = {
  admin: 'text-red-700 bg-red-50 border-red-200',
  analyst: 'text-blue-700 bg-blue-50 border-blue-200',
  officer: 'text-green-700 bg-green-50 border-green-200',
  viewer: 'text-gray-600 bg-gray-100 border-gray-200',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  analyst: 'Data Analyst',
  officer: 'Hydrogeologist',
  viewer: 'Viewer / Auditor',
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
          icon={<Plus size={13} />}
          onClick={() => setAddModalOpen(true)}
        >
          Add User Account
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Roles Distribution Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['admin', 'analyst', 'officer', 'viewer'].map(role => (
            <Card key={role} className="p-4 bg-white border border-gray-200 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">
                {MOCK_USERS.filter(u => u.role === role).length}
              </p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-1.5 ${ROLE_STYLES[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            </Card>
          ))}
        </div>

        {/* Search Controls */}
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search accounts by name, email or department…"
            className="w-full bg-white border border-gray-200 rounded-md pl-8 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer / User</th>
                <th>Access Role</th>
                <th>Department</th>
                <th>Scope Jurisdiction</th>
                <th>Account Status</th>
                <th>Last Active Log</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-blue-700">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{user.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${ROLE_STYLES[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="text-xs text-gray-500 max-w-[200px] truncate">{user.department}</td>
                  <td className="text-xs text-gray-500">{user.state ?? 'National (All India)'}</td>
                  <td>
                    <StatusBadge
                      variant={user.status === 'active' ? 'stable' : user.status === 'inactive' ? 'offline' : 'critical'}
                      label={user.status.toUpperCase()}
                      size="sm"
                    />
                  </td>
                  <td className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                  </td>
                  <td>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer" title="Edit Permissions">
                        <Edit2 size={12} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-50 text-red-500 cursor-pointer" title="Deactivate Account">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-xs">
                    No matching user accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        <div className="space-y-4">
          {[
            { label: 'Full Name', placeholder: 'Dr. Rajan Sharma', type: 'text' },
            { label: 'Official Email Address', placeholder: 'rajan.sharma@cgwb.gov.in', type: 'email' },
            { label: 'Department / Agency', placeholder: 'Central Ground Water Board', type: 'text' },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500/50"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Scope Boundary Role</label>
            <select className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-blue-500/50 cursor-pointer">
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
