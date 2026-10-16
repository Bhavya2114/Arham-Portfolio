import React, { useState, useRef, useEffect } from 'react';

/**
 * Floating glass project card for the /presence map (one project at a time). Same design as the
 * original campus card on main: photo left, text right, bottom-anchored over the map, dots + "n / total"
 * pager below it.
 *
 * - Text: type chip, project name, short location (area + city), "scope · year". No address, no
 *   Directions and no project page link.
 * - Projects come from data/showcaseProjects.js (currently the ALLEN placeholder set); the photo is the
 *   project's first photo.
 * - Controlled (`currentId` / `onChange`), so the map highlights the shown project's pin (or the city
 *   pin) and a tapped project pin switches the card.
 * - Swipe right→left for the next project, left→right for the previous one; ←/→ keys and the dots do
 *   the same. Pointer events are stopped here so a swipe never pans the map underneath. While dragging,
 *   the content follows the finger through a ref-driven transform (no React state per move); the
 *   project index changes only when the swipe settles.
 * - Changing project slides the card *content* horizontally (~320 ms ease-out) inside the stationary
 *   glass card: next = out to the left / in from the right, previous = the reverse. One transition at a
 *   time; under prefers-reduced-motion the content switches instantly.
 */

const SWIPE_PX = 40;
const SLIDE_MS = 320;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const stop = (e) => e.stopPropagation();

/** One project's content (image + details). `ghost` = the outgoing copy during a slide (inert). */
const CampusSlide = ({ loc, ghost = false }) => (
  <div className="flex gap-3">
    <img
      src={loc.photos?.[0]}
      alt={ghost ? '' : loc.name}
      draggable={false}
      loading="lazy"
      decoding="async"
      className="w-20 sm:w-28 aspect-[4/3] shrink-0 self-center rounded-xl object-cover"
    />
    <div className="min-w-0 flex-1 flex flex-col gap-1" {...(ghost ? {} : { 'aria-live': 'polite', 'aria-atomic': 'true' })}>
      <span className="self-start rounded-full border border-teal-100/25 bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-teal-50" data-project-type="">
        {loc.type}
      </span>
      <h3 className="text-sm sm:text-[15px] font-semibold leading-snug text-white line-clamp-2">{loc.name}</h3>
      {loc.location && <p className="text-[11px] sm:text-xs leading-snug text-white/80 line-clamp-3" data-project-location="">{loc.location}</p>}
      <p className="text-[11px] sm:text-xs leading-snug text-white/80" data-project-scope="">{[loc.scope, loc.year].filter(Boolean).join(' · ')}</p>
    </div>
  </div>
);

export const CampusCard = ({ city, projects: locations = [], currentId = null, onChange }) => {
  // Controlled by the page (currentId / onChange) so the map can follow the shown project.
  const index = Math.max(0, locations.findIndex((p) => p.id === currentId));
  const setIndex = (i) => onChange?.(locations[i]?.id);
  // Swipe offset goes straight to the content's transform through this ref (no React state per move);
  // the index only changes when the swipe settles.
  const contentRef = useRef(null);
  const setDragOffset = (px) => {
    const el = contentRef.current;
    if (!el) return;
    // While dragging: follow the finger with no transition. Released: clearing the inline styles lets
    // the `transition-transform duration-200` class ease it back, exactly like the old state version.
    el.style.transition = px ? 'none' : '';
    el.style.transform = px ? `translateX(${px}px)` : '';
  };
  // Active slide: { from: outgoing index, dir: 'next' | 'prev' } — null when idle.
  const [slide, setSlide] = useState(null);
  const sliding = useRef(false); // synchronous lock so rapid input cannot overlap transitions
  const slideTimer = useRef(null);
  const drag = useRef(null);
  const swiped = useRef(false);

  useEffect(() => () => clearTimeout(slideTimer.current), []);

  const count = locations.length;
  if (count === 0) return null;
  const current = Math.min(index, count - 1);
  const loc = locations[current];

  const go = (i) => {
    const target = Math.max(0, Math.min(count - 1, i));
    if (target === current || sliding.current) return;
    if (!prefersReducedMotion()) {
      sliding.current = true;
      setSlide({ from: current, dir: target > current ? 'next' : 'prev' });
      clearTimeout(slideTimer.current);
      // Timer (not animationend) ends the slide, so it also completes if the tab is hidden.
      slideTimer.current = setTimeout(() => {
        sliding.current = false;
        setSlide(null);
      }, SLIDE_MS + 40);
    }
    setIndex(target);
  };

  const handlePointerDown = (e) => {
    stop(e);
    if ((e.pointerType === 'mouse' && e.button !== 0) || sliding.current) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, horizontal: false };
    swiped.current = false;
  };

  const handlePointerMove = (e) => {
    stop(e);
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      d.horizontal = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    }
    if (d.horizontal) {
      // Resist dragging past the first / last project.
      const atEdge = (dx > 0 && current === 0) || (dx < 0 && current === count - 1);
      setDragOffset(atEdge ? dx / 4 : dx);
    }
  };

  const handlePointerEnd = (e) => {
    stop(e);
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    drag.current = null;
    setDragOffset(0);
    if (d.horizontal) {
      swiped.current = true;
      if (dx <= -SWIPE_PX) go(current + 1);
      else if (dx >= SWIPE_PX) go(current - 1);
    }
  };

  const handleClickCapture = (e) => {
    // A swipe must not also count as a click.
    if (swiped.current) {
      swiped.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
  };

  const incomingAnim = slide ? (slide.dir === 'next' ? 'campus-in-from-right' : 'campus-in-from-left') : '';
  const outgoingAnim = slide ? (slide.dir === 'next' ? 'campus-out-to-left' : 'campus-out-to-right') : '';

  return (
    <div className="space-y-1.5" data-campus-card={city} data-project-card={city}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`Arham projects in ${city}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={handleClickCapture}
        style={{ touchAction: 'pan-y' }}
        className="flex gap-3 rounded-2xl border border-teal-200/25 bg-teal-700/35 p-2.5 sm:p-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md select-none cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        {/* The glass card stays put; only its content slides (clipped here). */}
        <div className="relative min-w-0 flex-1 overflow-hidden -m-1 p-1" data-campus-viewport>
          {slide && (
            <div
              aria-hidden="true"
              className={`absolute inset-1 pointer-events-none campus-slide ${outgoingAnim}`}
              data-campus-slide="out"
            >
              <CampusSlide loc={locations[slide.from]} ghost />
            </div>
          )}
          <div
            key={current}
            ref={contentRef}
            className={slide ? `campus-slide ${incomingAnim}` : 'transition-transform duration-200'}
            data-campus-slide={slide ? 'in' : 'idle'}
          >
            <CampusSlide loc={loc} />
          </div>
        </div>
      </div>

      {/* Minimal pagination — on a small dark pill so it stays legible over bright map areas */}
      <div className="flex justify-center" onPointerDown={stop}>
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-navy-dark/70 px-2 text-[11px] text-white/85 backdrop-blur-sm">
        <div className="flex items-center" role="group" aria-label="Choose project">
          {locations.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show project ${i + 1} of ${count}: ${l.name}`}
              aria-current={i === current ? 'true' : undefined}
              className="group p-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <span className={`block h-1.5 rounded-full transition-all ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40 group-hover:bg-white/70'}`} />
            </button>
          ))}
        </div>
        <span className="tabular-nums font-medium pr-1" data-campus-counter>{current + 1} / {count}</span>
        </div>
      </div>
    </div>
  );
};

export default CampusCard;
