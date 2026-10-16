import React, { useLayoutEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';

/**
 * "Lights on" before / after slider for a project photo.
 *
 * - The "after" image sits on top of the "before" image and is clipped by a draggable divider
 *   (clip-path: inset() on the after image). The position is applied through refs — the clip-path
 *   and a transform on the divider — never React state per move.
 * - Mouse and touch: a horizontal drag anywhere on the photo, or on the handle, moves the divider.
 *   Pointer events stop here, so a slider drag never swipes the project cards or pans the map. The
 *   photo keeps touch-action pan-y (a vertical swipe still scrolls the page); the handle itself is
 *   touch-action none. Keyboard: the handle is a slider (←/→, Home/End).
 * - Starts at 50 %. The first time a project's slider is shown it animates once from 0 % to 50 %
 *   (~600 ms) to hint that it can be dragged; skipped under prefers-reduced-motion.
 */

export const SLIDER_START = 50;
const HINT_MS = 600;
const DRAG_START_PX = 6;
const hinted = new Set(); // project ids whose hint already played (once per page visit)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const clampPct = (v) => Math.max(0, Math.min(100, v));

export const BeforeAfterSlider = ({ id, before, after, alt, className = '' }) => {
  const rootRef = useRef(null);
  const afterRef = useRef(null);
  const dividerRef = useRef(null);
  const handleRef = useRef(null);
  const pct = useRef(SLIDER_START);
  const drag = useRef(null);
  const hintFrame = useRef(0);

  const apply = (value) => {
    pct.current = clampPct(value);
    if (afterRef.current) afterRef.current.style.clipPath = `inset(0 0 0 ${pct.current}%)`;
    if (dividerRef.current) dividerRef.current.style.transform = `translateX(${pct.current}%)`;
    handleRef.current?.setAttribute('aria-valuenow', String(Math.round(pct.current)));
  };

  // The user takes over (drag / keys): stop the hint, or cancel it if it has not started yet.
  const hintObserver = useRef(null);
  const stopHint = () => {
    cancelAnimationFrame(hintFrame.current);
    hintFrame.current = 0;
    hintObserver.current?.disconnect();
    hinted.add(id);
  };

  // Layout effect: the start position is set before the first paint (0 % when the hint will play).
  useLayoutEffect(() => {
    const willHint = !prefersReducedMotion() && !hinted.has(id) && typeof IntersectionObserver !== 'undefined';
    apply(willHint ? 0 : SLIDER_START);
    if (!willHint) return undefined;
    const el = rootRef.current;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      hinted.add(id);
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / HINT_MS);
        apply(SLIDER_START * (1 - (1 - t) ** 3));
        hintFrame.current = t < 1 ? requestAnimationFrame(step) : 0;
      };
      hintFrame.current = requestAnimationFrame(step);
    }, { threshold: 0.25 });
    hintObserver.current = io;
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(hintFrame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pctAt = (clientX) => {
    const r = rootRef.current.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const onHandle = handleRef.current?.contains(e.target);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, active: onHandle };
    if (onHandle) {
      stopHint();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
      apply(pctAt(e.clientX));
    }
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) <= Math.abs(dy)) return;
      d.active = true;
      stopHint();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    }
    if (e.cancelable) e.preventDefault();
    apply(pctAt(e.clientX));
  };

  const handlePointerEnd = (e) => {
    e.stopPropagation();
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const handleKeyDown = (e) => {
    const steps = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 };
    if (!(e.key in steps)) return;
    e.preventDefault();
    e.stopPropagation();
    stopHint();
    apply(pct.current + steps[e.key]);
  };

  const label = 'rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white';

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      data-before-after=""
    >
      <img src={before} alt={`${alt} — before`} draggable={false} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <img
        ref={afterRef}
        src={after}
        alt={`${alt} — after`}
        draggable={false}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${SLIDER_START}%)` }}
        data-after=""
      />
      <span className={`absolute left-2 top-2 ${label}`} aria-hidden="true">Before</span>
      <span className={`absolute right-2 top-2 ${label}`} aria-hidden="true">After</span>
      {/* Full-width layer, so translateX(%) moves the divider by a % of the photo width. */}
      <div ref={dividerRef} className="absolute inset-0 pointer-events-none" style={{ transform: `translateX(${SLIDER_START}%)` }} data-divider="">
        <div className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-[#D9E35A]" />
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label="Before / after: drag to compare"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={SLIDER_START}
          onKeyDown={handleKeyDown}
          style={{ touchAction: 'none' }}
          className="pointer-events-auto absolute left-0 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white/90 bg-[#D9E35A] text-[#070A1F] shadow-[0_2px_10px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
