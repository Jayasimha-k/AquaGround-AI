// =============================================================================
// TopBar — Professional enterprise top navigation bar
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, RefreshCw, ChevronDown, X, User, LogOut, ShieldCheck, UserCheck, Clock } from 'lucide-react';
import { animate } from 'animejs';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { OfficerProfileModal } from '@/components/OfficerProfileModal';
import { MOCK_ALERTS } from '@/constants/mockData';
import { formatDistanceToNow } from 'date-fns';

export function TopBar() {
  const { state, toggleNotificationPanel, markNotificationsRead } = useApp();
  const { currentUser, logout, openProfileModal } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    if (searchWrapRef.current)
      animate(searchWrapRef.current, { width: ['36px', '260px'], duration: 260, ease: 'outCubic' });
    setTimeout(() => inputRef.current?.focus(), 40);
  }, []);

  const closeSearch = useCallback(() => {
    if (searchWrapRef.current)
      animate(searchWrapRef.current, {
        width: ['260px', '36px'], duration: 220, ease: 'inCubic',
        onComplete: () => setSearchOpen(false),
      });
    setSearchQuery('');
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    animate('.refresh-icon', {
      rotate: [0, 360], duration: 600, ease: 'inOutCubic',
      onComplete: () => setRefreshing(false),
    });
  }, []);

  const handleBell = useCallback(() => {
    toggleNotificationPanel();
    markNotificationsRead();
  }, [toggleNotificationPanel, markNotificationsRead]);

  return (
    <>
      <header style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
        flexShrink: 0,
        zIndex: 20,
        position: 'relative'
      }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#64748B', userSelect: 'none' }}>
          <span style={{ color: '#2563EB', fontWeight: 700, fontSize: '13.5px' }}>CGWB</span>
          <span style={{ color: '#CBD5E1', fontSize: '16px', fontWeight: 300 }}>/</span>
          <span style={{ color: '#334155', fontWeight: 600 }}>National Command Center</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div
          ref={searchWrapRef}
          style={{
            width: 36, overflow: 'hidden', height: 34,
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {searchOpen ? (
            <>
              <Search size={13} style={{ color: '#94A3B8', marginLeft: '10px', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search districts, sensors…"
                style={{
                  flex: 1, background: 'transparent', fontSize: '13px',
                  color: '#1E293B', border: 'none', outline: 'none',
                  padding: '0 8px', fontFamily: 'inherit', fontWeight: 500,
                }}
              />
              <button
                onClick={closeSearch}
                style={{ marginRight: '8px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <button
              onClick={openSearch}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', height: '100%', background: 'none', border: 'none',
                color: '#94A3B8', cursor: 'pointer',
              }}
            >
              <Search size={15} />
            </button>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh data"
          style={{
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '10px', border: 'none', background: 'none', color: '#94A3B8',
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
        >
          <RefreshCw size={15} className="refresh-icon" />
        </button>

        {/* Notifications */}
        <button
          onClick={handleBell}
          title="Notifications & Multi-Officer Dispatch Alerts"
          style={{
            position: 'relative', width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '10px', border: 'none', background: 'none', color: '#94A3B8',
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
        >
          <Bell size={16} />
          {state.unreadNotifications > 0 && (
            <span style={{
              position: 'absolute', top: '3px', right: '3px',
              width: '16px', height: '16px', background: '#EF4444',
              color: '#FFFFFF', fontSize: '9px', fontWeight: 700,
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 0 0 2px white',
            }}>
              {state.unreadNotifications}
            </span>
          )}
        </button>

        {/* Divider */}
        <div style={{ height: '20px', width: '1px', background: '#E2E8F0', flexShrink: 0 }} />

        {/* Profile Dropdown Trigger */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              padding: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0',
              background: profileMenuOpen ? '#F8FAFC' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
              color: '#FFFFFF', fontSize: '11px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
            }}>
              {currentUser?.avatar || 'AV'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', lineHeight: 1.2, margin: 0 }}>
                  {currentUser?.name || 'Dr. Anand Verma'}
                </p>
                <ShieldCheck size={13} color="#10B981" />
              </div>
              <p style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500, lineHeight: 1.2, margin: 0 }}>
                {currentUser?.roleTitle || 'Senior Hydrogeologist'}
              </p>
            </div>
            <ChevronDown size={13} color="#94A3B8" />
          </div>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                width: '260px', background: '#FFFFFF', border: '1px solid #E2E8F0',
                borderRadius: '12px', boxShadow: '0 10px 25px rgba(15,23,42,0.15)',
                padding: '12px', zIndex: 1000,
              }}
            >
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '8px' }}>
                <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {currentUser?.name}
                </p>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  {currentUser?.email}
                </p>
                <span style={{
                  display: 'inline-block', fontSize: '10px', fontWeight: 700, color: '#059669',
                  background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 6px',
                  borderRadius: '4px', marginTop: '6px'
                }}>
                  ✓ Verified Officer • {currentUser?.district || 'CGWB'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  openProfileModal();
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '8px', border: 'none',
                  background: '#F1F5F9', color: '#1E293B', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s',
                  marginBottom: '6px'
                }}
              >
                <UserCheck size={14} color="#2563EB" />
                <span>Officer Profile & Audit Logs</span>
              </button>

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  logout();
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: '8px', border: 'none',
                  background: '#FEF2F2', color: '#EF4444', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s'
                }}
              >
                <LogOut size={14} />
                <span>Log Out & Lock Workspace</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Render Persistent Officer Profile & Audit Logs Modal */}
      <OfficerProfileModal />
    </>
  );
}


// ── Notification Panel ─────────────────────────────────────────────────────────
export function NotificationPanel() {
  const { state, closeNotificationPanel } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    if (state.notificationPanelOpen) {
      panelRef.current.style.display = 'flex';
      animate(panelRef.current, { translateX: ['100%', '0%'], opacity: [0, 1], duration: 300, ease: 'outCubic' });
    } else {
      animate(panelRef.current, {
        translateX: ['0%', '100%'], opacity: [1, 0], duration: 220, ease: 'inCubic',
        onComplete: () => { if (panelRef.current) panelRef.current.style.display = 'none'; },
      });
    }
  }, [state.notificationPanelOpen]);

  return (
    <>
      {state.notificationPanelOpen && (
        <div
          onClick={closeNotificationPanel}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(15,23,42,0.12)', backdropFilter: 'blur(1px)',
          }}
        />
      )}
      <div
        ref={panelRef}
        style={{
          display: 'none', flexDirection: 'column',
          position: 'fixed', top: 0, right: 0, height: '100%',
          width: '360px', zIndex: 40, background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-8px 0 32px rgba(15,23,42,0.12)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px', borderBottom: '1px solid #F1F5F9',
          background: '#FAFBFC', flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Multi-Officer Alerts & Dispatches
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', fontWeight: 500 }}>
              {MOCK_ALERTS.filter(a => !a.acknowledged).length} unread active alerts
            </p>
          </div>
          <button
            onClick={closeNotificationPanel}
            style={{
              padding: '6px', borderRadius: '8px', border: 'none',
              background: 'none', cursor: 'pointer', color: '#94A3B8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Alert list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MOCK_ALERTS.map(alert => {
            const isCritical = alert.severity === 'critical';
            const isWarning  = alert.severity === 'warning';
            const leftColor  = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6';
            const bgColor    = isCritical ? '#FFF5F5' : isWarning ? '#FFFBF0' : '#F0F7FF';
            return (
              <div
                key={alert.id}
                style={{
                  background: bgColor,
                  border: '1px solid #EEF2F7',
                  borderLeft: `3px solid ${leftColor}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{alert.districtName}</span>
                  {!alert.acknowledged && (
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#EF4444', flexShrink: 0,
                    }} />
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#334155', fontWeight: 500, lineHeight: 1.5, marginBottom: '6px' }}>
                  {alert.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                    SMTP Email Dispatched
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
