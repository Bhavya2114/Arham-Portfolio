import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Phone bottom sheet for Our Work (below `lg`; the desktop shows the same content in a side panel).
 *
 * Two snap points: 'half' (about half the screen; the map stays visible above) and 'full'.
 * Motion is transform-only: the sheet has a fixed height (full) and slides with translateY, so opening,
 * expanding and dragging never change layout. Dragging (the handle strip only, `touch-action: none`)
 * writes the transform straight to the element through a ref: no React render per frame. Full height
 * is at most ~85 % of the screen. The body does not scroll: the content's own pinned header stays put
 * and only its list scrolls; at 'half' the body gets bottom padding equal to the off-screen part so the
 * list's end stays reachable. The page behind is locked while the sheet is open (styles/index.css). Reduced motion: the global rule in styles/index.css removes the transition.
 */
const TOP_GAP = 72; // keeps the sticky site header visible when expanded
const MAX_SHARE = 0.85; // full height is at most ~85 % of the screen
const HALF = 0.5;
const CLOSE_DRAG_PX = 90; // dragged this far below 'half' → close
const EASE = 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)';

const useViewportHeight = () => {
  const [h, setH] = useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight));
  useEffect(() => {
    const onResize = () => setH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return h;
};

export const ProjectSheet = ({ snap = 'half', onSnapChange, onClose, labelledBy, children }) => {
  const vh = useViewportHeight();
  const fullH = Math.max(320, Math.min(vh - TOP_GAP, Math.round(vh * MAX_SHARE)));
  const halfH = Math.round(vh * HALF);
  const offsetFor = (s) => (s === 'full' ? 0 : fullH - halfH);
  const sheetRef = useRef(null);
  const drag = useRef(null);
  const opened = useRef(false);

  const place = (y, animate) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = animate ? EASE : 'none';
    el.style.transform = `translate3d(0, ${y}px, 0)`;
  };

  // Open: start below the screen, then slide to the snap point. Later snap changes animate there.
  useLayoutEffect(() => {
    if (!opened.current) {
      opened.current = true;
      place(fullH, false);
      sheetRef.current?.getBoundingClientRect(); // commit the start position before animating
    }
    place(offsetFor(snap), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, fullH, halfH]);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { startY: e.clientY, base: offsetFor(snap), y: offsetFor(snap), id: e.pointerId, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* already released */ }
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dy) < 4) return;
    d.moved = true;
    d.y = Math.min(fullH, Math.max(0, d.base + dy));
    place(d.y, false);
  };
  const onPointerEnd = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    if (d.y > offsetFor('half') + CLOSE_DRAG_PX) {
      place(fullH, true);
      setTimeout(() => onClose?.(), 200);
      return;
    }
    const next = d.y < offsetFor('half') / 2 ? 'full' : 'half';
    if (next === snap) place(offsetFor(snap), true);
    else onSnapChange?.(next);
  };

  return (
    <section
      ref={sheetRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={labelledBy}
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl border-t border-white/[0.08] bg-surface shadow-[0_-12px_40px_rgba(0,0,0,0.45)] will-change-transform"
      style={{ height: fullH, transform: `translate3d(0, ${fullH}px, 0)` }}
      data-sheet-snap={snap}
    >
      {/* Drag handle strip (also a button: tap to expand / collapse) */}
      <div
        className="shrink-0 flex justify-center select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <button
          type="button"
          onClick={() => onSnapChange?.(snap === 'full' ? 'half' : 'full')}
          aria-label={snap === 'full' ? 'Collapse panel' : 'Expand panel'}
          aria-expanded={snap === 'full'}
          className="flex h-11 w-24 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="h-1.5 w-12 rounded-full bg-white/30" aria-hidden="true" />
        </button>
      </div>
      <div
        className="flex-1 min-h-0 flex flex-col overflow-hidden px-4"
        style={{ paddingBottom: `calc(${snap === 'full' ? 0 : fullH - halfH}px + 1.5rem + env(safe-area-inset-bottom))` }}
        data-sheet-body=""
      >
        {children}
      </div>
    </section>
  );
};

export default ProjectSheet;
