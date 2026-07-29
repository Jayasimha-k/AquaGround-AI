// =============================================================================
// Timeline — Light HITL timeline
// =============================================================================

import React from 'react';
import { CheckCircle, Clock, XCircle, Edit, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { DecisionStatus } from '@/types';

interface TimelineEvent {
  id: string; title: string; subtitle?: string; description?: string;
  timestamp: string; status?: DecisionStatus | 'info' | 'alert'; actor?: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<any>; color: string; bg: string; border: string }> = {
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  modified: { icon: Edit,        color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-200' },
  rejected: { icon: XCircle,     color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200' },
  pending:  { icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  info:     { icon: CheckCircle, color: 'text-gray-500',  bg: 'bg-gray-100', border: 'border-gray-200' },
  alert:    { icon: AlertCircle, color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200' },
};

export function Timeline({ events, className = '' }: { events: TimelineEvent[]; className?: string }) {
  return (
    <div className={`space-y-0 ${className}`}>
      {events.map((event, idx) => {
        const cfg = STATUS_CONFIG[event.status ?? 'info'];
        const Icon = cfg.icon;
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border ${cfg.bg} ${cfg.border} shrink-0`}>
                <Icon size={13} className={cfg.color} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            <div className={`pb-4 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{event.title}</p>
                  {event.subtitle && <p className="text-xs text-gray-500 mt-0.5">{event.subtitle}</p>}
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </span>
              </div>
              {event.description && <p className="mt-1 text-xs text-gray-500 leading-relaxed">{event.description}</p>}
              {event.actor && <p className="mt-0.5 text-xs text-gray-400">— {event.actor}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
