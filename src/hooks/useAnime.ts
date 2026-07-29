// =============================================================================
// AquaGround AI — Anime.js v4 Animation Hooks
// Using named exports: animate, stagger from 'animejs'
// =============================================================================

import { useEffect, useRef, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { ANIMATION } from '@/constants';

// ── Fade In ───────────────────────────────────────────────────────────────────
export function useFadeIn(delay = 0) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      opacity: [0, 1],
      duration: ANIMATION.BASE,
      delay,
      ease: 'outQuad',
    });
  }, [delay]);

  return ref;
}

// ── Slide In Up ───────────────────────────────────────────────────────────────
export function useSlideInUp(delay = 0) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: ANIMATION.BASE,
      delay,
      ease: 'outCubic',
    });
  }, [delay]);

  return ref;
}

// ── Stagger Children ──────────────────────────────────────────────────────────
export function useStaggerIn(selector: string, containerRef: React.RefObject<HTMLElement | null>, delay = 0) {
  useEffect(() => {
    if (!containerRef.current) return;
    const targets = containerRef.current.querySelectorAll(selector);
    animate(targets, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: ANIMATION.BASE,
      delay: stagger(80, { start: delay }),
      ease: 'outCubic',
    });
  }, [selector, containerRef, delay]);
}

// ── Animated Counter ──────────────────────────────────────────────────────────
export function useCounter(target: number, delay = 0) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { value: 0 };
    animate(obj, {
      value: target,
      duration: ANIMATION.COUNTER,
      delay,
      ease: 'outExpo',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.value).toLocaleString('en-IN');
        }
      },
    });
  }, [target, delay]);

  return ref;
}

// ── Slide In from Left ────────────────────────────────────────────────────────
export function useSlideInLeft(active: boolean) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      opacity: active ? [0, 1] : [1, 0],
      translateX: active ? [-30, 0] : [0, -30],
      duration: ANIMATION.BASE,
      ease: 'outCubic',
    });
  }, [active]);

  return ref;
}

// ── Slide In from Right (Panels) ──────────────────────────────────────────────
export function usePanelSlide(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      translateX: open ? ['100%', '0%'] : ['0%', '100%'],
      opacity: open ? [0, 1] : [1, 0],
      duration: ANIMATION.SLOW,
      ease: open ? 'outCubic' : 'inCubic',
    });
  }, [open]);

  return ref;
}

// ── Scale on Hover ────────────────────────────────────────────────────────────
export function useHoverScale(scale = 1.02) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onEnter = () => animate(el, { scale, duration: ANIMATION.FAST, ease: 'outQuad' });
    const onLeave = () => animate(el, { scale: 1, duration: ANIMATION.FAST, ease: 'outQuad' });

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [scale]);

  return ref;
}

// ── Ripple Button Effect ──────────────────────────────────────────────────────
export function useRipple() {
  const createRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      pointer-events: none;
      transform: scale(0);
    `;
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);

    animate(ripple, {
      scale: [0, 4],
      opacity: [1, 0],
      duration: 600,
      ease: 'outExpo',
      onComplete: () => ripple.remove(),
    });
  }, []);

  return createRipple;
}

// ── Chart Loading Reveal ──────────────────────────────────────────────────────
export function useChartReveal() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      opacity: [0, 1],
      scaleY: [0.8, 1],
      duration: ANIMATION.SLOW,
      ease: 'outCubic',
    });
  }, []);

  return ref;
}

// ── Search Expansion ──────────────────────────────────────────────────────────
export function useSearchExpand(expanded: boolean) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      width: expanded ? ['40px', '280px'] : ['280px', '40px'],
      opacity: expanded ? [0, 1] : [1, 0.6],
      duration: ANIMATION.BASE,
      ease: expanded ? 'outCubic' : 'inCubic',
    });
  }, [expanded]);

  return ref;
}

// ── Loading Shimmer ───────────────────────────────────────────────────────────
export function useLoadingShimmer(isLoading: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (isLoading) {
      ref.current.classList.add('skeleton');
    } else {
      ref.current.classList.remove('skeleton');
      animate(ref.current, {
        opacity: [0.5, 1],
        duration: ANIMATION.BASE,
        ease: 'outQuad',
      });
    }
  }, [isLoading]);

  return ref;
}

// ── Number Formatter ──────────────────────────────────────────────────────────
export function formatCount(value: number): string {
  return value.toLocaleString('en-IN');
}
