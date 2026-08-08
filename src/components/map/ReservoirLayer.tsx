// =============================================================================
// ReservoirLayer.tsx — Live CWC/NWIC Reservoir Storage Overlay
// Fetches data from our FastAPI proxy at /api/v1/reservoirs, which in turn
// calls the CWC Reservoir Storage Monitoring API.
// Refreshes automatically every 5 minutes.
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { RESERVOIR_API_URL } from '@/constants';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ReservoirData {
  id: string;
  name: string;
  state: string;
  river: string;
  lat: number;
  lng: number;
  /** Current live storage in MCM */
  liveStorage: number;
  /** Total capacity in MCM */
  totalCapacity: number;
  /** % of total capacity currently filled */
  levelPercent: number;
  /** Normal storage at Full Reservoir Level (MCM) */
  frlStorage: number;
  lastUpdated: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getReservoirColor(pct: number): string {
  if (pct >= 75) return '#10b981'; // green  – good storage
  if (pct >= 50) return '#3b82f6'; // blue   – adequate
  if (pct >= 25) return '#f59e0b'; // amber  – low
  return '#ef4444';                 // red    – critical
}

function getRadius(totalCapacity: number): number {
  if (totalCapacity > 5000) return 14;
  if (totalCapacity > 1000) return 10;
  if (totalCapacity > 200) return 7;
  return 5;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ── Component ─────────────────────────────────────────────────────────────────
interface ReservoirLayerProps {
  visible: boolean;
}

export function ReservoirLayer({ visible }: ReservoirLayerProps) {
  const map = useMap();
  const [reservoirs, setReservoirs] = useState<ReservoirData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(RESERVOIR_API_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ReservoirData[] = await res.json();
      setReservoirs(json);
      setLastFetched(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load reservoir data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh
  useEffect(() => {
    if (!visible) return;
    fetchData();
    const timer = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [visible, fetchData]);

  // Suppress interaction events so the map still pans correctly
  void map;

  if (!visible) return null;

  return (
    <>
      {/* Status banner – only while loading / errored */}
      {(loading || error) && (
        <div
          style={{
            position: 'absolute', bottom: 90, right: 16, zIndex: 1100,
            background: error ? '#FEF2F2' : '#EFF6FF',
            border: `1px solid ${error ? '#FECACA' : '#BFDBFE'}`,
            borderRadius: 10, padding: '8px 14px',
            fontSize: 12, fontWeight: 600,
            color: error ? '#B91C1C' : '#1D4ED8',
            boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {error
            ? `⚠ Reservoir API error: ${error}`
            : '⟳ Loading live reservoir data…'}
        </div>
      )}

      {/* Markers */}
      {reservoirs.map((r) => {
        const color = getReservoirColor(r.levelPercent);
        const radius = getRadius(r.totalCapacity);
        return (
          <CircleMarker
            key={r.id}
            center={[r.lat, r.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.85,
              color: '#fff',
              weight: 1.5,
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -radius]}
              opacity={1}
              sticky
            >
              <div style={{ minWidth: 180, fontFamily: 'inherit' }}>
                {/* Header */}
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A', marginBottom: 4 }}>
                  💧 {r.name}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>
                  {r.state} · {r.river} River
                </div>
                {/* Storage bar */}
                <div style={{ background: '#F1F5F9', borderRadius: 4, height: 6, marginBottom: 6, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(r.levelPercent, 100)}%`,
                      background: color,
                      height: '100%',
                      borderRadius: 4,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11 }}>
                  <span style={{ color: '#64748B' }}>Live Storage</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{r.liveStorage.toFixed(0)} MCM</span>
                  <span style={{ color: '#64748B' }}>Capacity</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{r.totalCapacity.toFixed(0)} MCM</span>
                  <span style={{ color: '#64748B' }}>Fill Level</span>
                  <span style={{ fontWeight: 700, color }}>
                    {r.levelPercent.toFixed(1)}%
                  </span>
                </div>
                {lastFetched && (
                  <div style={{ marginTop: 6, fontSize: 10, color: '#94A3B8' }}>
                    Updated {lastFetched.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {/* Floating legend chip */}
      {reservoirs.length > 0 && (
        <div
          style={{
            position: 'absolute', bottom: 90, left: 16, zIndex: 1100,
            background: '#FFFFFF', border: '1px solid #E8EDF3',
            borderRadius: 10, padding: '10px 14px',
            boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
            fontSize: 11, minWidth: 170,
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live Reservoir Storage
          </p>
          {[
            { color: '#10b981', label: '≥ 75% Full' },
            { color: '#3b82f6', label: '50–75%' },
            { color: '#f59e0b', label: '25–50%' },
            { color: '#ef4444', label: '< 25% (Critical)' },
          ].map(({ color: c, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
              <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, borderTop: '1px solid #F1F5F9', paddingTop: 6, fontSize: 10, color: '#94A3B8' }}>
            {reservoirs.length} reservoirs · auto-refresh 5 min
          </div>
        </div>
      )}
    </>
  );
}
