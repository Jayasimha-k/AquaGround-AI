// =============================================================================
// AnimatedCounter — Anime.js numeric counter
// =============================================================================

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { ANIMATION } from '@/constants';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delay?: number;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  delay = 0,
  className = '',
  duration = ANIMATION.COUNTER,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { value: 0 };
    animate(obj, {
      value,
      duration,
      delay,
      ease: 'outExpo',
      onUpdate: () => {
        if (ref.current) {
          const formatted = decimals > 0
            ? obj.value.toFixed(decimals)
            : Math.round(obj.value).toLocaleString('en-IN');
          ref.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });
  }, [value, delay, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
