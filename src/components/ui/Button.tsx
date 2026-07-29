// =============================================================================
// Button — Light enterprise button
// =============================================================================

import React from 'react';
import { useRipple } from '@/hooks/useAnime';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700 shadow-sm',
  secondary: 'bg-white hover:bg-blue-50/50 text-blue-600 border border-blue-600 shadow-sm',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent',
  danger:    'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 shadow-sm',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 hover:border-emerald-700 shadow-sm',
  warning:   'bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 hover:border-amber-600 shadow-sm',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded',
  md: 'px-4 py-2 text-xs gap-2 rounded-md',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-md',
};

export function Button({ variant = 'primary', size = 'md', icon, iconPosition = 'left', loading = false, fullWidth = false, children, className = '', disabled, onClick, ...rest }: ButtonProps) {
  const createRipple = useRipple();
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { createRipple(e); onClick?.(e); };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={[
        'relative overflow-hidden font-medium inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && <span className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
