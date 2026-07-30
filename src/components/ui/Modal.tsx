// =============================================================================
// Modal + ConfirmDialog — Light enterprise modal
// =============================================================================

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP: Record<string, string> = {
  sm: '380px',
  md: '520px',
  lg: '680px',
  xl: '860px',
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', background: 'rgba(15,23,42,0.4)',
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#FFFFFF', borderRadius: '16px',
        border: '1px solid #E8EDF3', boxShadow: '0 20px 50px rgba(15,23,42,0.2)',
        width: '100%', maxWidth: SIZE_MAP[size] || '520px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', zIndex: 10000,
      }}>
        {title && (
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '16px', background: '#FFFFFF',
          }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{title}</h2>
              {subtitle && <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px', margin: 0, fontWeight: 500 }}>{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '6px', borderRadius: '8px', border: 'none', background: '#F8FAFC',
                cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '12px', padding: '16px 24px', borderTop: '1px solid #F1F5F9',
            background: '#FAFBFC', flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string;
  confirmLabel?: string; confirmVariant?: 'primary' | 'danger'; loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'primary', loading = false }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button></>}>
      <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>{message}</p>
    </Modal>
  );
}
