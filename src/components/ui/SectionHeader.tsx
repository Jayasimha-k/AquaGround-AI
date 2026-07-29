// =============================================================================
// SectionHeader — Light enterprise section header
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
    <div className={[
      'flex items-center justify-between',
      border ? 'pb-3 mb-4 border-b border-gray-200' : '',
      className,
    ].join(' ')}>
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
