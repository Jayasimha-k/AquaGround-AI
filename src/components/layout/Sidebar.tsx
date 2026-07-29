// =============================================================================
// Sidebar — National Operations Center Sidebar & Future AI Hub
// =============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, BarChart3, TrendingUp,
  AlertTriangle, Brain, FileText, Users, Settings,
  ChevronLeft, ChevronRight, Droplets, LogOut, User,
  Sparkles, Info, HelpCircle
} from 'lucide-react';
import { animate } from 'animejs';
import { useApp } from '@/contexts/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Map, BarChart3, TrendingUp,
  AlertTriangle, Brain, FileText, Users, Settings,
};

// Custom labels for CGWB Operations Modules
const MODULE_LABELS: Record<string, string> = {
  dashboard: 'National Operations Center',
  map: 'Operations Map',
  analytics: 'Resource Intelligence',
  predictions: 'Prediction Center',
  risk: 'Risk Monitor',
  recommendations: 'Decision Center',
  reports: 'Reports',
  users: 'User Management',
  settings: 'Settings',
};

const FUTURE_ROADMAP = [
  { title: 'Explainable AI (XAI)', desc: 'Provides clear mathematical and physical explanations behind forecast confidence scores.' },
  { title: 'Digital Twin of India', desc: 'Real-time hydrological simulation mapping for trans-boundary river basins.' },
  { title: 'Gemini AI Assistant', desc: 'Natural language interface for CGWB officers to query aquifer telemetry data directly.' },
  { title: 'Scenario Simulation', desc: 'Simulate crop pattern changes and monsoon deficits to model future water table impacts.' },
];

export function Sidebar() {
  const { state, toggleSidebar } = useApp();
  const { sidebarCollapsed } = state;
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  useEffect(() => {
    if (!sidebarRef.current) return;
    animate(sidebarRef.current, {
      width: sidebarCollapsed ? 56 : 220,
      duration: 220, ease: 'outCubic',
    });
  }, [sidebarCollapsed]);

  const primaryNavIds = ['dashboard', 'map', 'analytics', 'predictions', 'risk', 'recommendations', 'reports'];
  const secondaryNavIds = ['users', 'settings'];

  const primaryItems = [
    { id: 'dashboard', label: MODULE_LABELS.dashboard, path: '/', icon: 'LayoutDashboard' },
    { id: 'map', label: MODULE_LABELS.map, path: '/map', icon: 'Map' },
    { id: 'analytics', label: MODULE_LABELS.analytics, path: '/analytics', icon: 'BarChart3' },
    { id: 'predictions', label: MODULE_LABELS.predictions, path: '/predictions', icon: 'TrendingUp' },
    { id: 'risk', label: MODULE_LABELS.risk, path: '/risk', icon: 'AlertTriangle' },
    { id: 'recommendations', label: MODULE_LABELS.recommendations, path: '/recommendations', icon: 'Brain' },
    { id: 'reports', label: MODULE_LABELS.reports, path: '/reports', icon: 'FileText' },
  ];

  const secondaryItems = [
    { id: 'users', label: MODULE_LABELS.users, path: '/users', icon: 'Users' },
    { id: 'settings', label: MODULE_LABELS.settings, path: '/settings', icon: 'Settings' },
  ];

  const renderNavList = (items: typeof primaryItems) => (
    items.map((item) => {
      const Icon = ICON_MAP[item.icon];
      const isActive = item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path);

      return (
        <NavLink key={item.id} to={item.path}
          title={sidebarCollapsed ? item.label : undefined}
          className={[
            'flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-md transition-all duration-100 group relative',
            isActive
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100/30'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
          ].join(' ')}
        >
          {isActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r" />
          )}
          {Icon && <Icon size={14} className={`shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />}
          {!sidebarCollapsed && (
            <span className="text-xs tracking-wide">{item.label}</span>
          )}
        </NavLink>
      );
    })
  );

  return (
    <aside
      ref={sidebarRef}
      style={{ width: 220 }}
      className="flex flex-col h-full bg-white border-r border-slate-200 shrink-0 overflow-hidden z-30 relative select-none"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-200 shrink-0 bg-slate-50/50">
        <div className="w-6.5 h-6.5 rounded bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
          <Droplets size={13} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-xs font-extrabold text-slate-900 tracking-tight whitespace-nowrap">AquaGround AI</p>
            <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase whitespace-nowrap">National Command Center</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-3.5 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {renderNavList(primaryItems)}

        {/* Active AI Console Section */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {!sidebarCollapsed ? (
            <p className="px-4.5 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={10} className="text-blue-500" />
              <span>AI Assistant Console</span>
            </p>
          ) : (
            <div className="flex justify-center py-1">
              <Sparkles size={12} className="text-blue-500" />
            </div>
          )}
          
          <button
            onClick={() => setRoadmapOpen(true)}
            className={[
              'flex items-center gap-2.5 mx-2 w-[calc(100%-16px)] px-2.5 py-2 rounded-md transition-all text-left cursor-pointer',
              'text-slate-500 hover:bg-blue-50/50 hover:text-blue-700',
            ].join(' ')}
          >
            <Sparkles size={14} className="shrink-0 text-blue-500" />
            {!sidebarCollapsed && (
              <span className="text-xs">Active Assistant</span>
            )}
          </button>
        </div>

        {/* Administration Section */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {!sidebarCollapsed && (
            <p className="px-4.5 pb-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Administration
            </p>
          )}
          {renderNavList(secondaryItems)}
        </div>
      </div>

      {/* Bottom Profile Details */}
      <div className="border-t border-slate-200 p-2.5 bg-slate-50/50">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-100/75 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
            <User size={13} className="text-blue-600" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate leading-normal">Dr. Anand Verma</p>
              <p className="text-[9px] text-slate-400 font-medium truncate leading-none mt-0.5">Senior Hydrogeologist</p>
            </div>
          )}
          {!sidebarCollapsed && <LogOut size={13} className="text-slate-400 shrink-0" />}
        </div>
      </div>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 z-50 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
        aria-label="Toggle Navigation Sidebar"
      >
        {sidebarCollapsed
          ? <ChevronRight size={11} className="text-slate-500" />
          : <ChevronLeft size={11} className="text-slate-500" />}
      </button>

      {/* Active AI assistant Modal */}
      <Modal
        open={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
        title="AI Assistant — Gemini Integration Console"
        subtitle="Active services and pipeline statuses for the Central Ground Water Board platform"
        footer={<Button variant="secondary" onClick={() => setRoadmapOpen(false)}>Acknowledge</Button>}
      >
        <div className="space-y-4 font-sans">
          <div className="bg-green-50 border border-green-200 text-green-800 rounded p-3 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>AI Service Active · Model: gemini-1.5-flash</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Explain Hydrological Risk', desc: 'Provides clear structural explanations behind critical and high risk classifications.' },
              { title: 'Executive Report Generator', desc: 'Assembles regional aquifer indicators into official reports ready for printing/exporting.' },
              { title: 'District Summary Compiler', desc: 'Summarizes water level depth and telemetry health trajectories for active basins.' },
              { title: 'Interactive Officer Chat', desc: 'Allows natural language chat using historical context and ground truth datasets.' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 border border-slate-150 rounded-md bg-slate-50">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-blue-500" />
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </aside>
  );
}
