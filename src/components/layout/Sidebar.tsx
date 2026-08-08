// =============================================================================
// Sidebar — National Operations Center Sidebar
// =============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, BarChart3, TrendingUp,
  AlertTriangle, Brain, FileText, Users, Settings,
  ChevronLeft, ChevronRight, Droplets, LogOut, User, Sparkles, Waves,
} from 'lucide-react';
import { animate } from 'animejs';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';


const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; color?: string }>> = {
  LayoutDashboard, Map, Waves, BarChart3, TrendingUp,
  AlertTriangle, Brain, FileText, Users, Settings,
};

export function Sidebar() {
  const { state, toggleSidebar, openAiAssistant } = useApp();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { sidebarCollapsed } = state;
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const primaryItems = [
    { id: 'dashboard',       label: t('nav_dashboard', 'Operations Center'),       path: '/',               icon: 'LayoutDashboard' },
    { id: 'map',             label: t('nav_map', 'Operations Map'),                path: '/map',             icon: 'Map' },
    { id: 'water-sources',   label: t('nav_water_sources', 'Water Resources Advisory'), path: '/water-sources', icon: 'Waves' },
    { id: 'analytics',       label: t('nav_analytics', 'Resource Intel'),            path: '/analytics',       icon: 'BarChart3' },
    { id: 'predictions',     label: t('nav_predictions', 'Predictions'),             path: '/predictions',     icon: 'TrendingUp' },
    { id: 'risk',            label: t('nav_risk', 'Risk Monitor'),                  path: '/risk',            icon: 'AlertTriangle' },
    { id: 'recommendations', label: t('nav_decision', 'Decision Center'),           path: '/recommendations', icon: 'Brain' },
    { id: 'reports',         label: t('nav_reports', 'Reports'),                   path: '/reports',         icon: 'FileText' },
  ];

  const secondaryItems = [
    { id: 'users',    label: t('nav_users', 'User Management'), path: '/users',    icon: 'Users' },
    { id: 'settings', label: t('nav_settings', 'Settings'),        path: '/settings', icon: 'Settings' },
  ];


  useEffect(() => {
    if (!sidebarRef.current) return;
    animate(sidebarRef.current, {
      width: sidebarCollapsed ? 68 : 248,
      duration: 220, ease: 'outCubic',
    });
  }, [sidebarCollapsed]);

  const renderNavList = (items: typeof primaryItems) =>
    items.map(item => {
      const Icon = ICON_MAP[item.icon];
      const isActive = item.path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.path);
      const isHovered = hoveredItem === item.id;

      return (
        <NavLink
          key={item.id}
          to={item.path}
          title={sidebarCollapsed ? item.label : undefined}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '2px 10px',
            padding: sidebarCollapsed ? '10px 0' : '10px 14px',
            borderRadius: '10px',
            textDecoration: 'none',
            transition: 'background 0.15s, box-shadow 0.15s',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            background: isActive
              ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
              : isHovered
              ? '#F1F5F9'
              : 'transparent',
            boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
            userSelect: 'none',
          }}
        >
          {Icon && (
            <Icon
              size={16}
              color={isActive ? '#FFFFFF' : isHovered ? '#475569' : '#94A3B8'}
            />
          )}
          {!sidebarCollapsed && (
            <span style={{
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#FFFFFF' : isHovered ? '#1E293B' : '#64748B',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.1px',
            }}>
              {item.label}
            </span>
          )}
        </NavLink>
      );
    });

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: sidebarCollapsed ? 68 : 248,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#FFFFFF',
        borderRight: '1px solid #E8EDF3',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 30,
        position: 'relative',
        boxShadow: '1px 0 6px rgba(15,23,42,0.04)',
      }}
    >
      {/* ── Brand Header ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        height: '60px',
        borderBottom: '1px solid #F1F5F9',
        flexShrink: 0,
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
        }}>
          <Droplets size={15} color="#FFFFFF" />
        </div>
        {!sidebarCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <p style={{
              fontSize: '13.5px', fontWeight: 800, color: '#0F172A',
              letterSpacing: '-0.2px', whiteSpace: 'nowrap', lineHeight: 1.2,
            }}>
              AquaGround AI
            </p>
            <p style={{
              fontSize: '9.5px', color: '#94A3B8', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', marginTop: '2px',
            }}>
              National Command Center
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 0' }}>

        {renderNavList(primaryItems)}

        {/* AI Console section */}
        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
          {!sidebarCollapsed && (
            <p style={{
              padding: '0 20px 8px',
              fontSize: '9.5px', fontWeight: 700, color: '#CBD5E1',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Sparkles size={9} color="#93C5FD" /> AI Console
            </p>
          )}
          <button
            onClick={openAiAssistant}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              margin: '2px 10px', padding: sidebarCollapsed ? '10px 0' : '10px 14px',
              width: 'calc(100% - 20px)', borderRadius: '10px', border: 'none',
              background: 'none', cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.15s',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <Sparkles size={16} color="#3B82F6" />
            {!sidebarCollapsed && (
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#3B82F6' }}>
                Active Assistant
              </span>
            )}
          </button>
        </div>

        {/* Administration section */}
        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
          {!sidebarCollapsed && (
            <p style={{
              padding: '0 20px 8px',
              fontSize: '9.5px', fontWeight: 700, color: '#CBD5E1',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Administration
            </p>
          )}
          {renderNavList(secondaryItems)}
        </div>
      </div>

      {/* ── User Profile ──────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid #F1F5F9',
        padding: '12px',
        flexShrink: 0,
        background: '#FAFBFC',
      }}>
        <div
          onClick={logout}
          title="Click to Log Out"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
            transition: 'background 0.15s',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
            color: '#FFFFFF', fontSize: '11px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
          }}>
            {currentUser?.avatar || 'OF'}
          </div>
          {!sidebarCollapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {currentUser?.name || 'Logged-in Officer'}
                </p>
                <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 500, lineHeight: 1.2, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {currentUser?.roleTitle || 'Hydrogeologist'}
                </p>
              </div>
              <LogOut size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
            </>
          )}
        </div>
      </div>

      {/* ── Collapse Toggle Button ────────────────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        style={{
          position: 'absolute', right: -13, top: 17,
          width: 26, height: 26, borderRadius: '50%',
          background: '#FFFFFF', border: '1.5px solid #CBD5E1',
          boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 100, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.15)'; }}
      >
        {sidebarCollapsed
          ? <ChevronRight size={13} color="#2563EB" />
          : <ChevronLeft size={13} color="#64748B" />}
      </button>


      {/* ── AI Console Modal ───────────────────────────────────────────── */}
      <Modal
        open={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
        title="AI Assistant — Gemini Integration Console"
        subtitle="Active services and pipeline statuses for the Central Ground Water Board platform"
        footer={<Button variant="secondary" onClick={() => setRoadmapOpen(false)}>Acknowledge</Button>}
      >
        <div className="space-y-4">
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: 600 }}>AI Service Active · Model: gemini-1.5-flash</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Explain Hydrological Risk', desc: 'Structural explanations behind critical risk classifications.' },
              { title: 'Executive Report Generator', desc: 'Assembles aquifer indicators into official reports.' },
              { title: 'District Summary Compiler', desc: 'Summarizes water level depth and telemetry trajectories.' },
              { title: 'Interactive Officer Chat', desc: 'Natural language chat using ground truth datasets.' },
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '14px', border: '1px solid #F1F5F9', borderRadius: '10px', background: '#FAFBFC' }}>
                <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Sparkles size={11} color="#3B82F6" /> {item.title}
                </h4>
                <p style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </aside>
  );
}
