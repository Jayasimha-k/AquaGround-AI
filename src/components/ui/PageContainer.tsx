// =============================================================================
// PageContainer — Light enterprise page wrapper
// =============================================================================

import React, { useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

export function PageContainer({ children, className = '', title, subtitle, actions, noPadding = false }: PageContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, { opacity: [0, 1], translateY: [6, 0], duration: 280, ease: 'outCubic' });
  }, []);

  return (
    <div ref={ref} className={`flex flex-col h-full overflow-auto bg-gray-50 ${className}`} style={{ opacity: 0 }}>
      {/* Page Header */}
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <div>
            {title && <h1 className="text-base font-semibold text-gray-900">{title}</h1>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {/* Content */}
      <div className={`flex-1 overflow-auto ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
}
