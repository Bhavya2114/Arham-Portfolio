import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Phone bottom sheet for Our Work (below `lg`; the desktop shows the same content in a side panel).
 *
 * Two snap points: 'half' (about half the screen; the map stays visible above) and 'full', where the sheet
 * is only as tall as its content, capped at ~65 % of the screen so the top third of the map always shows
 * (longer content scrolls inside). Dragging the handle up (or tapping it) expands the cap to ~85 %;
 * dragging down returns to 65 % or closes. Each city's sheet starts at 65 % (it is keyed per city).
 * Motion is transform-only: the sheet has a fixed height (full) and slides with translateY, so opening,
 * expanding and dragging never change layout. Dragging (the handle strip only, `touch-action: none`)
 * writes the transform straight to the element through a ref: no React render per frame. Full height
 * is at most ~85 % of the screen. The body does not scroll: the content's own pinned header stays put
 * and only its list scrolls; at 'half' the body gets bottom padding equal to the off-screen part so the
 * list's end stays reachable. The page behind is locked while the sheet is open (styles/index.css). Reduced motion: the global rule in styles/index.css removes the transition.
 */
const TOP_GAP = 72; // keeps the sticky site header visible when expanded
const MAX_SHARE = 0.85; // full height is at most ~85 % of the screen
const CAP_SHARE = 0.65; // a content-height sheet stops here unless the person expands it
const COLLAPSE_DRAG_PX = 48; // an expanded sheet dragged down this far returns to the 65 % cap
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
  // At 'full' the sheet is as tall as its content, up to fullH (short lists → a shorter sheet, no empty
  // space). 'half' (a multi-client city summary) keeps the fixed-height sheet that slides to half.
  const fitContent = snap === 'full';
  const capH = Math.min(fullH, Math.max(300, Math.round(vh * CAP_SHARE)));
  const [expanded, setExpanded] = useState(false); // content-height sheet: 85 % cap instead of 65 %
  const sheetRef = useRef(null);
  const drag = useRef(null);
  const opened = useRef(false);

  const place = (y, animate) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = animate ? EASE : 'none';
    el.style.transform = `translate3d(0, ${y}px, 0)`;
  };

  // The 65 % ↔ 85 % cap changes the sheet's height once (at a gesture's start or end, never per frame);
  // a FLIP keeps its top edge where it was, so all visible motion is still the transform.
  const applyMaxHeight = (px) => {
    const el = sheetRef.current;
    el.style.maxHeight = `${px}px`;
    return el.offsetHeight;
  };
  const expandFrom = (y) => {
    const oldH = sheetRef.current.offsetHeight;
    const grow = applyMaxHeight(fullH) - oldH;
    place(y + grow, false);
    sheetRef.current.getBoundingClientRect();
    place(0, true);
    setExpanded(true);
  };
  const collapseFrom = (y) => {
    const el = sheetRef.current;
    const oldH = el.offsetHeight;
    const shrink = oldH - applyMaxHeight(capH);
    if (y >= shrink) {
      place(y - shrink, false);
      el.getBoundingClientRect();
      place(0, true);
      setExpanded(false);
      return;
    }
    // Not dragged that far yet: slide down first at the tall height, then drop to the cap in place.
    applyMaxHeight(fullH);
    place(shrink, true);
    setTimeout(() => {
      if (!sheetRef.current) return;
      applyMaxHeight(capH);
      place(0, false);
      setExpanded(false);
    }, 260);
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
    drag.current = { startY: e.clientY, base: offsetFor(snap), y: offsetFor(snap), id: e.pointerId, moved: false, grow: 0 };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* already released */ }
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dy) < 4) return;
    if (!d.moved && fitContent && !expanded && dy < 0) {
      // Dragging up from the 65 % cap: switch to the 85 % cap now, shifted down so nothing moves yet;
      // the finger then reveals it through the transform alone.
      const oldH = sheetRef.current.offsetHeight;
      d.grow = applyMaxHeight(fullH) - oldH;
      d.base = d.grow;
    }
    d.moved = true;
    d.y = Math.min(fullH, Math.max(0, d.base + dy));
    place(d.y, false);
  };
  const onPointerEnd = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    if (fitContent) {
      // Content-height sheet: up → 85 %; down a little → back to 65 % (or springs back); far → closes.
      const h = sheetRef.current?.offsetHeight || fullH;
      if (d.grow > 0 && d.y < d.grow / 2) {
        place(0, true);
        setExpanded(true);
      } else if (d.y - d.grow > Math.min((h - d.grow) * 0.35, 160)) {
        place(fullH, true);
        setTimeout(() => onClose?.(), 200);
      } else if (d.grow > 0 || (expanded && d.y > COLLAPSE_DRAG_PX)) {
        collapseFrom(d.y);
      } else place(0, true);
      return;
    }
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
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl panel-surface panel-surface--sheet will-change-transform"
      style={{ ...(fitContent ? { height: 'auto', maxHeight: expanded ? fullH : capH } : { height: fullH }), transform: `translate3d(0, ${fullH}px, 0)` }}
      data-sheet-snap={snap}
      data-sheet-expanded={fitContent && expanded ? '' : undefined}
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
          onClick={() => {
            if (!fitContent) onSnapChange?.('full');
            else if (expanded) collapseFrom(0);
            else expandFrom(0);
          }}
          aria-label={fitContent && expanded ? 'Collapse panel' : 'Expand panel'}
          aria-expanded={fitContent && expanded}
          className="flex h-11 w-24 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="h-1.5 w-12 rounded-full bg-white/30" aria-hidden="true" />
        </button>
      </div>
      <div
        className="flex-auto min-h-0 flex flex-col overflow-hidden px-4"
        style={{ paddingBottom: `calc(${snap === 'full' ? 0 : fullH - halfH}px + ${snap === 'full' ? '1rem' : '1.5rem'} + env(safe-area-inset-bottom))` }}
        data-sheet-body=""
      >
        {children}
      </div>
    </section>
  );
};

export default ProjectSheet;
