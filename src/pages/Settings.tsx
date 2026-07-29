// =============================================================================
// Settings Page — System Settings & Configurations (Light Theme)
// =============================================================================

import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Map, Bell, Layers, User,
  Shield
} from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

type Section = 'general' | 'map' | 'notifications' | 'layers' | 'profile' | 'security';

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'general', label: 'General Configuration', icon: SettingsIcon },
  { id: 'map', label: 'Map Interface', icon: Map },
  { id: 'notifications', label: 'Alert Dispatches', icon: Bell },
  { id: 'layers', label: 'Default Layers', icon: Layers },
  { id: 'profile', label: 'User Preferences', icon: User },
  { id: 'security', label: 'Security & Access', icon: Shield },
];

function Toggle({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-xs font-semibold text-slate-900">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={[
          'relative w-9 h-5 rounded-full transition-all duration-200 cursor-pointer shrink-0 ml-4',
          checked ? 'bg-blue-600' : 'bg-slate-300',
        ].join(' ')}
      >
        <span className={[
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
          checked ? 'left-4.5' : 'left-0.5',
        ].join(' ')} />
      </button>
    </div>
  );
}

export function Settings() {
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [settings, setSettings] = useState({
    compactMode: false,
    autoRefresh: true,
    refreshInterval: '60',
    mapAnimation: true,
    clusterMarkers: true,
    showCoordinates: true,
    emailAlerts: true,
    smsAlerts: false,
    criticalOnly: false,
    weeklyDigest: true,
    defaultBaseMap: 'CartoDB Light',
    defaultZoom: '5',
  });

  const set = (key: keyof typeof settings) => (value: boolean | string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <PageContainer 
      title="System Preferences & Configuration" 
      subtitle="Manage map settings, dispatch alert notifications, layer preferences, and credentials"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Sidebar Nav */}
        <div className="md:col-span-1">
          <div className="card p-2 bg-white space-y-0.5">
            {SECTIONS.map(s => {
              const isSelected = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={[
                    'flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer text-left',
                    isSelected
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ].join(' ')}
                >
                  <s.icon size={14} className={isSelected ? 'text-blue-700' : 'text-slate-400'} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration cards workspace */}
        <div className="md:col-span-3 space-y-5">

          {activeSection === 'general' && (
            <div className="card p-6 space-y-4">
              <SectionHeader title="General Preferences" subtitle="Telemetry refresh intervals and density" className="pb-3 border-b border-slate-100" />
              <div className="divide-y divide-slate-100">
                <Toggle label="Compact View Mode" description="Reduce margins to fit more telemetry data on smaller screens" checked={settings.compactMode} onChange={set('compactMode')} />
                <Toggle label="Telemetry Auto-Fetch" description="Poll DWLR sensor records periodically in the background" checked={settings.autoRefresh} onChange={set('autoRefresh')} />
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fetch Frequency</label>
                <select
                  value={settings.refreshInterval}
                  onChange={e => set('refreshInterval')(e.target.value)}
                  className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-600/50 cursor-pointer font-medium"
                >
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="900">15 minutes</option>
                </select>
              </div>
            </div>
          )}

          {activeSection === 'map' && (
            <div className="card p-6 space-y-4">
              <SectionHeader title="Map Control Settings" subtitle="Spatiotemporal rendering defaults" className="pb-3 border-b border-slate-100" />
              <div className="divide-y divide-slate-100">
                <Toggle label="Interactive Zoom Transitions" description="Animate transitions between district coordinate zooms" checked={settings.mapAnimation} onChange={set('mapAnimation')} />
                <Toggle label="DWLR Station Node Clustering" description="Cluster adjacent stations at global zoom coordinates" checked={settings.clusterMarkers} onChange={set('clusterMarkers')} />
                <Toggle label="Coordinate Mouse Tracker" description="Render mouse latitude and longitude coordinates at bottom of map centerpiece" checked={settings.showCoordinates} onChange={set('showCoordinates')} />
              </div>
              
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default Base Layer Layer</label>
                  <select
                    value={settings.defaultBaseMap}
                    onChange={e => set('defaultBaseMap')(e.target.value)}
                    className="w-full max-w-xs bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-600/50 cursor-pointer font-medium"
                  >
                    <option>CartoDB Light</option>
                    <option>OpenStreetMap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default Coordinate Zoom Level</label>
                  <input
                    type="range" min="4" max="12" value={settings.defaultZoom}
                    onChange={e => set('defaultZoom')(e.target.value)}
                    className="w-full max-w-xs accent-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Zoom Coordinate Level {settings.defaultZoom} / 18</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card p-6 space-y-4">
              <SectionHeader title="Dispatch Alert Configuration" subtitle="Configure automated administrative message dispatches" className="pb-3 border-b border-slate-100" />
              <div className="divide-y divide-slate-100">
                <Toggle label="Email Dispatch Alerts" description="Email alerts for critical water level events directly to hydrogeologists" checked={settings.emailAlerts} onChange={set('emailAlerts')} />
                <Toggle label="SMS Dispatch Alerts" description="Send emergency SMS alerts for urgent over-extraction warnings" checked={settings.smsAlerts} onChange={set('smsAlerts')} />
                <Toggle label="Emergency Alert Suppressive Filter" description="Only dispatch notifications for critical incidents" checked={settings.criticalOnly} onChange={set('criticalOnly')} />
                <Toggle label="Weekly Aquifer Summary Compilations" description="Receive compilation of hydrological reports weekly" checked={settings.weeklyDigest} onChange={set('weeklyDigest')} />
              </div>
            </div>
          )}

          {activeSection === 'layers' && (
            <div className="card p-6 space-y-4">
              <SectionHeader title="Default Layer States" subtitle="Layers enabled automatically on spatiotemporal map load" className="pb-3 border-b border-slate-100" />
              <div className="divide-y divide-slate-100">
                {['District Boundaries', 'DWLR Stations', 'Active Telemetry Sensors', 'Risk Overlays', 'Rainfall Contours'].map((layer, i) => (
                  <Toggle key={layer} label={layer} checked={i < 3} onChange={() => {}} />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="card p-6 space-y-4">
              <SectionHeader title="Hydrogeologist User Preferences" subtitle="Administrative profile information" className="pb-3 border-b border-slate-100" />
              <div className="space-y-4 max-w-md">
                {[
                  { label: 'Officer Name', value: 'Dr. Anand Verma' },
                  { label: 'Government Email ID', value: 'anand.verma@cgwb.gov.in' },
                  { label: 'Agency / Board', value: 'Central Ground Water Board (CGWB)' },
                  { label: 'Designation Role', value: 'Senior Hydrogeologist' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600/50"
                    />
                  </div>
                ))}
                <Button variant="primary" className="text-xs py-2 shadow-sm">Save User Profile</Button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card p-6 space-y-5">
              <SectionHeader title="Authentication Security & Logging" subtitle="Administrative portal security parameters" className="pb-3 border-b border-slate-100" />
              <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs text-amber-800 leading-relaxed font-medium">
                Authentication parameters and credentials dispatches are managed globally by the Government of India Single Sign-On (SSO) directory portal. For credential updates, contact the central NIC IT support group.
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-xs font-bold text-blue-900 mb-1">Session Info</p>
                <p className="text-xs text-blue-800 leading-normal font-mono">Logged in as Administrator (National Hydrogeologist) · Central Command Unit Delhi. Active session token verified: Today 09:42 IST</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageContainer>
  );
}
