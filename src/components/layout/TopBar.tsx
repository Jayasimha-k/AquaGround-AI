// =============================================================================
// TopBar — Light enterprise top bar
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, RefreshCw, ChevronDown, X, User } from 'lucide-react';
import { animate } from 'animejs';
import { useApp } from '@/contexts/AppContext';
import { MOCK_ALERTS } from '@/constants/mockData';
import { formatDistanceToNow } from 'date-fns';

export function TopBar() {
  const { state, toggleNotificationPanel, markNotificationsRead } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
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
      animate(searchWrapRef.current, { width: ['260px', '36px'], duration: 220, ease: 'inCubic', onComplete: () => setSearchOpen(false) });
    setSearchQuery('');
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    animate('.refresh-icon', { rotate: [0, 360], duration: 600, ease: 'inOutCubic', onComplete: () => setRefreshing(false) });
  }, []);

  const handleBell = useCallback(() => { toggleNotificationPanel(); markNotificationsRead(); }, [toggleNotificationPanel, markNotificationsRead]);

  return (
    <header className="h-14 flex items-center gap-3 px-5 bg-white border-b border-gray-200 shrink-0 z-20">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium select-none">
        <span className="text-blue-700 font-semibold">CGWB</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700">National Command Center</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div ref={searchWrapRef} style={{ width: 36, overflow: 'hidden' }}
        className="h-8 bg-gray-100 border border-gray-200 rounded-md flex items-center">
        {searchOpen ? (
          <>
            <Search size={13} className="text-gray-400 ml-2.5 shrink-0" />
            <input ref={inputRef} type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search districts, sensors…"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 px-2 outline-none" />
            <button onClick={closeSearch} className="mr-2 text-gray-400 hover:text-gray-600"><X size={13} /></button>
          </>
        ) : (
          <button onClick={openSearch} className="flex items-center justify-center w-full h-full text-gray-500 hover:text-gray-700">
            <Search size={15} />
          </button>
        )}
      </div>

      {/* Refresh */}
      <button onClick={handleRefresh} disabled={refreshing}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
        <RefreshCw size={14} className="refresh-icon" />
      </button>

      {/* Notifications */}
      <button onClick={handleBell}
        className="relative w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
        <Bell size={14} />
        {state.unreadNotifications > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {state.unreadNotifications}
          </span>
        )}
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Profile */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1 transition-colors">
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
          <User size={13} className="text-blue-600" />
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-medium text-gray-800 leading-tight">Dr. Anand Verma</p>
          <p className="text-[10px] text-gray-400 leading-tight">Administrator</p>
        </div>
        <ChevronDown size={13} className="text-gray-400" />
      </div>
    </header>
  );
}

// ── Notification Panel ────────────────────────────────────────────────────────
export function NotificationPanel() {
  const { state, closeNotificationPanel } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    if (state.notificationPanelOpen) {
      panelRef.current.style.display = 'block';
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
        <div className="fixed inset-0 z-30 bg-black/10" onClick={closeNotificationPanel} />
      )}
      <div ref={panelRef} style={{ display: 'none' }}
        className="fixed top-0 right-0 h-full w-80 z-40 bg-white border-l border-gray-200 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900">Alerts</h3>
            <p className="text-xs text-gray-500">{MOCK_ALERTS.filter(a => !a.acknowledged).length} unread</p>
          </div>
          <button onClick={closeNotificationPanel} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-16 p-4 space-y-2">
          {MOCK_ALERTS.map(alert => (
            <div key={alert.id} className={[
              'p-3 rounded-lg border text-sm',
              alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
              alert.severity === 'warning'  ? 'bg-amber-50 border-amber-200' :
                                             'bg-blue-50 border-blue-200',
            ].join(' ')}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">{alert.districtName}</span>
                {!alert.acknowledged && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
