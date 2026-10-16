import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

/**
 * Mobile bottom sheet (hidden at `lg` and above) with three snap points: peek, half and full.
 *
 * Gesture separation: only the handle/header strip drags the sheet vertically
 * (`touch-action: none` there); the body scrolls normally, and horizontal strips inside
 * it keep their own `pan-x` scrolling. Expand/collapse and close are also real buttons,
 * so no gesture is required.
 */

const PEEK_HEIGHT = 168;
const HEADER_HEIGHT = 72;
const TOP_GAP = 96; // keeps the sticky site header visible at full height
const SNAPS = ['peek', 'half', 'full'];

const useViewportHeight = () => {
  const [height, setHeight] = useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight));
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return height;
};

export const BottomSheet = ({ open, resetKey, title, subtitle, onClose, label = 'Details', children }) => {
  const viewportHeight = useViewportHeight();
  const [snap, setSnap] = useState('peek');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef(null);

  const fullHeight = Math.max(PEEK_HEIGHT, viewportHeight - TOP_GAP);
  const heights = { peek: PEEK_HEIGHT, half: Math.max(PEEK_HEIGHT, Math.round(viewportHeight * 0.5)), full: fullHeight };

  // A newly selected item always opens at the peek height.
  useEffect(() => {
    setSnap('peek');
  }, [resetKey]);

  const visibleHeight = Math.min(fullHeight, Math.max(0, heights[snap] - dragOffset));

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { startY: e.clientY, pointerId: e.pointerId, offset: 0 };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!drag.current || drag.current.pointerId !== e.pointerId) return;
    // Kept in the ref too: pointerup may run before React re-renders with the latest offset.
    drag.current.offset = Math.max(heights[snap] - fullHeight, e.clientY - drag.current.startY);
    setDragOffset(drag.current.offset);
  };

  const handlePointerEnd = (e) => {
    if (!drag.current || drag.current.pointerId !== e.pointerId) return;
    const finalHeight = heights[snap] - drag.current.offset;
    drag.current = null;
    setIsDragging(false);
    setDragOffset(0);
    if (finalHeight < PEEK_HEIGHT - 60) {
      onClose?.();
      return;
    }
    const nearest = SNAPS.reduce((best, s) => (Math.abs(heights[s] - finalHeight) < Math.abs(heights[best] - finalHeight) ? s : best), 'peek');
    setSnap(nearest);
  };

  const isFull = snap === 'full';
  const toggleExpand = () => setSnap(isFull ? 'peek' : SNAPS[SNAPS.indexOf(snap) + 1]);

  if (!open) return null;

  return (
    <section
      aria-label={label}
      className={`lg:hidden fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-white/[0.08] bg-surface shadow-[0_-12px_40px_rgba(0,0,0,0.45)] ${
        isDragging ? '' : 'transition-[height] duration-300 ease-corporate'
      }`}
      style={{ height: visibleHeight }}
    >
      <div
        className="shrink-0 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none', height: HEADER_HEIGHT }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="flex justify-center pt-2.5 pb-1.5" aria-hidden="true">
          <span className="h-1.5 w-12 rounded-full bg-white/30" />
        </div>
        <div className="flex items-center justify-between gap-2 px-4">
          <div className="min-w-0">
            <p className="text-base font-bold font-heading text-white truncate">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center" onPointerDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={toggleExpand}
              aria-expanded={snap !== 'peek'}
              aria-label={isFull ? 'Collapse details' : 'Expand details'}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full text-slate-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              {isFull ? <ChevronDown className="w-5 h-5" aria-hidden="true" /> : <ChevronUp className="w-5 h-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full text-slate-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">{children}</div>
    </section>
  );
};

export { PEEK_HEIGHT };
export default BottomSheet;
