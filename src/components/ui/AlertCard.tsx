// =============================================================================
// AlertCard — Light enterprise alert card
// =============================================================================

import React from 'react';
import { AlertTriangle, Info, Zap } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Alert } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const SEV = {
  critical: { Icon: Zap,           iconCls: 'text-red-500',    bg: 'bg-red-50',   border: 'border-red-200' },
  warning:  { Icon: AlertTriangle, iconCls: 'text-amber-500',  bg: 'bg-amber-50', border: 'border-amber-200' },
  info:     { Icon: Info,          iconCls: 'text-blue-500',   bg: 'bg-blue-50',  border: 'border-blue-200' },
};

interface AlertCardProps { alert: Alert; compact?: boolean; }

export function AlertCard({ alert, compact = false }: AlertCardProps) {
  const cfg = SEV[alert.severity];
  const Icon = cfg.Icon;
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true });

  if (compact) {
    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.border} ${cfg.bg}`}>
        <Icon size={14} className={`${cfg.iconCls} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-800 truncate">{alert.districtName}</span>
            <StatusBadge variant={alert.severity} size="sm" />
          </div>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{alert.message}</p>
          <p className="mt-1 text-xs text-gray-400">{timeAgo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card flex items-start gap-4 p-4 border-l-4 ${cfg.border}`}>
      <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
        <Icon size={16} className={cfg.iconCls} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">{alert.districtName}</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">{alert.state}</span>
          <StatusBadge variant={alert.severity} pulse />
          {alert.acknowledged && <span className="text-xs text-gray-400 ml-auto">Acknowledged</span>}
        </div>
        <p className="mt-0.5 text-sm font-medium text-gray-700">{alert.type}</p>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">{alert.message}</p>
        <p className="mt-1.5 text-xs text-gray-400">{timeAgo}</p>
      </div>
    </div>
  );
}
