// =============================================================================
// Panel — Light sliding right panel
// =============================================================================

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { animate } from 'animejs';
import { Button } from './Button';

interface PanelProps {
  open: boolean; onClose: () => void;
  title?: string; subtitle?: string;
  children: React.ReactNode;
  width?: string; footer?: React.ReactNode;
}

export function Panel({ open, onClose, title, subtitle, children, width = 'w-96', footer }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      ref.current.style.display = 'flex';
      animate(ref.current, { translateX: ['100%', '0%'], opacity: [0, 1], duration: 300, ease: 'outCubic' });
    } else {
      animate(ref.current, {
        translateX: ['0%', '100%'], opacity: [1, 0], duration: 250, ease: 'inCubic',
        onComplete: () => { if (ref.current) ref.current.style.display = 'none'; },
      });
    }
  }, [open]);

  return (
    <div ref={ref} style={{ display: open ? 'flex' : 'none' }}
      className={`flex-col fixed top-0 right-0 h-full z-40 bg-white border-l border-gray-200 shadow-xl ${width}`}>
      {title && (
        <div className="flex items-start justify-between p-5 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={15} />} />
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
      {footer && <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">{footer}</div>}
    </div>
  );
}
