import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar, NotificationPanel } from './TopBar';
import { AIAssistant } from '../ui/AIAssistant';

export function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <div className="relative flex shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Notification panel (portal-like fixed) */}
      <NotificationPanel />

      {/* Floating AI Command Assistant */}
      <AIAssistant />
    </div>
  );
}
