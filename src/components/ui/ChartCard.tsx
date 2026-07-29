// =============================================================================
// ChartCard — Light chart wrapper with period toggle
// =============================================================================

import React, { useState } from 'react';
import { SectionHeader } from './SectionHeader';

type TimePeriod = 'daily' | 'monthly' | 'yearly';

interface ChartCardProps {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
  showPeriodToggle?: boolean; period?: TimePeriod; onPeriodChange?: (p: TimePeriod) => void;
  actions?: React.ReactNode;
}

const PERIODS: { label: string; value: TimePeriod }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export function ChartCard({ title, subtitle, children, className = '', showPeriodToggle = false, period, onPeriodChange, actions }: ChartCardProps) {
  const [localPeriod, setLocalPeriod] = useState<TimePeriod>('monthly');
  const activePeriod = period ?? localPeriod;

  const handlePeriod = (p: TimePeriod) => { setLocalPeriod(p); onPeriodChange?.(p); };

  return (
    <div className={`card p-5 flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <SectionHeader title={title} subtitle={subtitle} />
        <div className="flex items-center gap-2 shrink-0">
          {showPeriodToggle && (
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              {PERIODS.map(({ label, value }) => (
                <button key={value} onClick={() => handlePeriod(value)}
                  className={['px-3 py-1 text-xs font-medium transition-colors',
                    activePeriod === value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
                  ].join(' ')}>
                  {label}
                </button>
              ))}
            </div>
          )}
          {actions}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
