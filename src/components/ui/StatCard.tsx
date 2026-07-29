// =============================================================================
// StatCard — Clean enterprise stat card
// =============================================================================

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { StatCardData } from '@/types';

const ICON_COLOR: Record<string, string> = {
  royal:    'text-blue-600 bg-blue-50',
  emerald:  'text-green-600 bg-green-50',
  amber:    'text-amber-600 bg-amber-50',
  red:      'text-red-600 bg-red-50',
  sky:      'text-sky-600 bg-sky-50',
  graphite: 'text-gray-500 bg-gray-100',
};

const VALUE_COLOR: Record<string, string> = {
  royal: 'text-gray-900', emerald: 'text-gray-900',
  amber: 'text-gray-900', red: 'text-red-600',
  sky: 'text-gray-900', graphite: 'text-gray-900',
};

interface StatCardProps {
  data: StatCardData;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
}

export function StatCard({ data, Icon }: StatCardProps) {
  const iconClass = ICON_COLOR[data.color] ?? 'text-blue-600 bg-blue-50';
  const valueClass = VALUE_COLOR[data.color] ?? 'text-gray-900';

  return (
    <div className="card p-5 flex flex-col gap-3">
      {/* Icon + Trend */}
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon size={17} />
        </div>
        {data.trend && (
          <span className={[
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
            data.trend === 'up'
              ? (data.color === 'red' || data.color === 'amber' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50')
              : data.trend === 'down'
              ? (data.color === 'emerald' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50')
              : 'text-gray-500 bg-gray-100',
          ].join(' ')}>
            {data.trend === 'up'   && <TrendingUp size={11} />}
            {data.trend === 'down' && <TrendingDown size={11} />}
            {data.trend === 'stable' && <Minus size={11} />}
            {data.delta}
          </span>
        )}
      </div>

      {/* Value + Label */}
      <div>
        <div className={`text-2xl font-bold leading-none ${valueClass}`}>
          {typeof data.value === 'number' ? data.value.toLocaleString('en-IN') : data.value}
          {data.unit && <span className="text-sm font-normal text-gray-500 ml-1">{data.unit}</span>}
        </div>
        <p className="mt-1.5 text-sm text-gray-600">{data.title}</p>
        {data.deltaLabel && <p className="text-xs text-gray-400 mt-0.5">{data.deltaLabel}</p>}
      </div>
    </div>
  );
}
