// =============================================================================
// SectionHeader — Professional enterprise card section header
// =============================================================================

import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  border?: boolean;
}

export function SectionHeader({ title, subtitle, action, className = '', border = false }: SectionHeaderProps) {
  return (
    <div
      className={[
        'flex items-start justify-between gap-3',
        border ? 'pb-3 mb-4 border-b border-slate-100' : '',
        className,
      ].join(' ')}
    >
      <div className="min-w-0">
        <h2 className="text-[13.5px] font-bold text-slate-800 tracking-tight leading-snug truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[11.5px] text-slate-400 font-medium leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
