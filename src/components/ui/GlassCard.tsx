// =============================================================================
// GlassCard → Card — Light enterprise card component
// =============================================================================

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  style?: React.CSSProperties;
}

const PADDING = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

export function GlassCard({ children, className = '', hover = false, padding = 'md', onClick, selected = false, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={[
        'card',
        hover ? 'card-hover' : '',
        selected ? 'border-blue-500 ring-1 ring-blue-500/30' : '',
        PADDING[padding],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

// Named alias for clarity
export { GlassCard as Card };
