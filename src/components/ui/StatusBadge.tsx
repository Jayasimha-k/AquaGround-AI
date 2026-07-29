// =============================================================================
// StatusBadge — Light semantic status pill
// =============================================================================

import React from 'react';

type BadgeVariant =
  | 'critical' | 'high' | 'moderate' | 'low' | 'stable'
  | 'online' | 'offline' | 'warning' | 'maintenance'
  | 'info' | 'pending' | 'approved' | 'modified' | 'rejected'
  | 'ready' | 'generating';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const CONFIG: Record<string, { label: string; dot: string; className: string }> = {
  critical:    { label: 'Critical',     dot: 'bg-red-500',    className: 'badge-critical' },
  high:        { label: 'High',         dot: 'bg-amber-500',  className: 'badge-high' },
  moderate:    { label: 'Moderate',     dot: 'bg-blue-500',   className: 'badge-moderate' },
  low:         { label: 'Low',          dot: 'bg-green-500',  className: 'badge-low' },
  stable:      { label: 'Stable',       dot: 'bg-green-500',  className: 'badge-stable' },
  online:      { label: 'Online',       dot: 'bg-green-500',  className: 'badge-stable' },
  offline:     { label: 'Offline',      dot: 'bg-gray-400',   className: 'badge-offline' },
  warning:     { label: 'Warning',      dot: 'bg-amber-500',  className: 'badge-high' },
  maintenance: { label: 'Maintenance',  dot: 'bg-blue-400',   className: 'badge-moderate' },
  info:        { label: 'Info',         dot: 'bg-sky-500',    className: 'badge-info' },
  pending:     { label: 'Pending',      dot: 'bg-amber-500',  className: 'badge-pending' },
  approved:    { label: 'Approved',     dot: 'bg-green-500',  className: 'badge-approved' },
  modified:    { label: 'Modified',     dot: 'bg-blue-500',   className: 'badge-modified' },
  rejected:    { label: 'Rejected',     dot: 'bg-red-500',    className: 'badge-rejected' },
  ready:       { label: 'Ready',        dot: 'bg-green-500',  className: 'badge-stable' },
  generating:  { label: 'Generating',   dot: 'bg-blue-500',   className: 'badge-moderate' },
};

export function StatusBadge({ variant, label, showDot = true, size = 'sm', pulse = false }: StatusBadgeProps) {
  const cfg = CONFIG[variant] ?? { label: variant, dot: 'bg-gray-400', className: 'badge-offline' };
  const displayLabel = label ?? cfg.label;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={`badge ${cfg.className} ${textSize}`}>
      {showDot && (
        <span className={[
          'w-1.5 h-1.5 rounded-full shrink-0',
          cfg.dot,
          pulse && ['critical', 'high', 'warning'].includes(variant) ? 'animate-pulse' : '',
        ].join(' ')} />
      )}
      {displayLabel}
    </span>
  );
}
