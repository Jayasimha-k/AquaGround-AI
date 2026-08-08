import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { MAP_LAYERS } from '@/constants';
import { useApp } from '@/contexts/AppContext';
import type { LayerId } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export function LayerControl() {
  const { state, toggleLayer } = useApp();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const groupLabels: Record<string, string> = {
    data: t('group_data', 'Data Overlays'),
    boundary: t('group_boundary', 'Boundaries'),
    infrastructure: t('group_infra', 'Infrastructure'),
    base: t('group_base', 'Basemaps'),
  };

  const grouped = MAP_LAYERS.reduce<Record<string, typeof MAP_LAYERS>>((acc, layer) => {
    if (!acc[layer.group]) acc[layer.group] = [];
    acc[layer.group].push(layer);
    return acc;
  }, {});

  return (
    <div style={{ position: 'relative' }}>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          height: '32px', padding: '0 12px', background: '#FFFFFF',
          border: '1px solid #E8EDF3', borderRadius: '8px',
          color: '#334155', fontSize: '11.5px', fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
          transition: 'all 0.15s',
        }}
      >
        <Layers size={13} color="#2563EB" />
        <span>{t('label_layers', 'Layers')}</span>
        <span style={{
          background: '#EFF6FF', color: '#1D4ED8', fontSize: '10px',
          fontWeight: 800, padding: '2px 6px', borderRadius: '99px',
          border: '1px solid #BFDBFE',
        }}>
          {state.activeLayers.length}
        </span>
        {open ? <ChevronUp size={12} color="#94A3B8" /> : <ChevronDown size={12} color="#94A3B8" />}
      </button>

      {/* Layer Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '6px',
          width: '230px', background: '#FFFFFF', border: '1px solid #E8EDF3',
          borderRadius: '12px', boxShadow: '0 8px 30px rgba(15,23,42,0.12)',
          padding: '8px 0', zIndex: 1005, maxHeight: '360px', overflowY: 'auto',
        }}>
          {Object.entries(grouped).map(([group, layers]) => (
            <div key={group} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
              <div style={{ padding: '6px 14px 4px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  {groupLabels[group] || group}
                </p>
              </div>
              {layers.map(layer => {
                const isActive = state.activeLayers.includes(layer.id as LayerId);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id as LayerId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '7px 14px', fontSize: '12px',
                      border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                      background: isActive ? '#EFF6FF' : 'transparent',
                      color: isActive ? '#1D4ED8' : '#475569',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: isActive ? layer.color : 'transparent',
                        border: `1.5px solid ${isActive ? layer.color : '#94A3B8'}`,
                      }}
                    />
                    <span style={{ flex: 1, textAlign: 'left' }}>{layer.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MapToolbar ────────────────────────────────────────────────────────────────
export function MapToolbar() {
  return (
    <div style={{
      position: 'absolute', top: '16px', left: '16px', zIndex: 1001,
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {/* Zoom controls */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E8EDF3', borderRadius: '8px',
        overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
        display: 'flex', flexDirection: 'column',
      }}>
        <button
          title="Zoom In"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', border: 'none', background: 'none',
            color: '#334155', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
            borderBottom: '1px solid #F1F5F9',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          +
        </button>
        <button
          title="Zoom Out"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', border: 'none', background: 'none',
            color: '#334155', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          −
        </button>
      </div>

      {/* Compass */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '32px', height: '32px', background: '#FFFFFF', border: '1px solid #E8EDF3',
        borderRadius: '8px', color: '#2563EB', fontSize: '11px', fontWeight: 800,
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)', userSelect: 'none',
      }}>
        N
      </div>
    </div>
  );
}
