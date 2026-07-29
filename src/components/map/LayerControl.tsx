// =============================================================================
// LayerControl — Map layer toggle panel (Light Enterprise Theme)
// =============================================================================

import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { MAP_LAYERS } from '@/constants';
import { useApp } from '@/contexts/AppContext';
import type { LayerId } from '@/types';

const GROUP_LABELS: Record<string, string> = {
  data: 'Data Overlays',
  boundary: 'Boundaries',
  infrastructure: 'Infrastructure',
  base: 'Basemaps',
};

export function LayerControl() {
  const { state, toggleLayer } = useApp();
  const [open, setOpen] = useState(false);

  // Group layers that exist in constants
  const grouped = MAP_LAYERS.reduce<Record<string, typeof MAP_LAYERS>>((acc, layer) => {
    if (!acc[layer.group]) acc[layer.group] = [];
    acc[layer.group].push(layer);
    return acc;
  }, {});

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 h-9 bg-white border border-gray-200 rounded-md text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
      >
        <Layers size={13} className="text-gray-500" />
        Layers
        <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
          {state.activeLayers.length}
        </span>
        {open ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
      </button>

      {/* Layer Panel */}
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-gray-700 max-h-[350px] overflow-y-auto">
          {Object.entries(grouped).map(([group, layers]) => (
            <div key={group} className="border-b border-gray-100 last:border-0 pb-1 mb-1">
              <div className="px-3 pt-2 pb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {GROUP_LABELS[group]}
                </p>
              </div>
              {layers.map(layer => {
                const isActive = state.activeLayers.includes(layer.id as LayerId);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id as LayerId)}
                    className={[
                      'flex items-center gap-3 w-full px-3 py-1.5 text-xs transition-colors cursor-pointer',
                      isActive
                        ? 'text-blue-700 bg-blue-50/50 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {/* Toggle indicator */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0 transition-all"
                      style={{
                        background: isActive ? layer.color : 'transparent',
                        border: `1.5px solid ${isActive ? layer.color : '#9CA3AF'}`,
                      }}
                    />
                    <span className="flex-1 text-left">{layer.label}</span>
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
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1.5">
      {/* Zoom controls */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm flex flex-col">
        <button 
          title="Zoom In" 
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-semibold border-b border-gray-100 cursor-pointer"
        >
          +
        </button>
        <button 
          title="Zoom Out" 
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-semibold cursor-pointer"
        >
          −
        </button>
      </div>

      {/* Compass */}
      <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-md text-gray-500 text-xs font-semibold shadow-sm select-none">
        N
      </div>
    </div>
  );
}
