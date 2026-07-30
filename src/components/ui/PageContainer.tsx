// =============================================================================
// PageContainer — Professional enterprise page wrapper
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

export function PageContainer({
  children,
  className = '',
  title,
  subtitle,
  actions,
  noPadding = false,
}: PageContainerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    animate(contentRef.current, {
      opacity: [0, 1], translateY: [10, 0], duration: 320, ease: 'outCubic',
    });
  }, []);

  return (
    <div className={`flex flex-col min-h-full ${className}`} style={{ background: '#EEF2F7' }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      {(title || actions) && (
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            {title && (
              <h1 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.3px',
                lineHeight: 1.3,
                margin: 0,
              }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{
                marginTop: '4px',
                fontSize: '12.5px',
                color: '#64748B',
                fontWeight: 500,
                lineHeight: 1.4,
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '24px' }}>
              {actions}
            </div>
          )}
        </div>
      )}

      {/* ── Page Content ─────────────────────────────────────────────────────── */}
      <div
        ref={contentRef}
        style={{ opacity: 0, flex: 1, padding: noPadding ? 0 : '28px 32px' }}
      >
        {children}
      </div>
    </div>
  );
}
