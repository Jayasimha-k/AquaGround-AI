import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar, NotificationPanel } from './TopBar';
import { AIAssistant } from '../ui/AIAssistant';

export function AppLayout() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#EEF2F7',
    }}>
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main column ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
      }}>
        <TopBar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <Outlet />
        </main>
      </div>

      {/* ── Overlays ──────────────────────────────────────────────────── */}
      <NotificationPanel />
      <AIAssistant />
    </div>
  );
}
