import React, { useState, useRef, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import allenCampusImage from '../../../Images/allen image.png';

/**
 * Floating glass campus card for the /presence map (one ALLEN campus location at a time).
 *
 * - Shows only supplied data: campus name + supplied address. Campus *locations*, not Arham projects:
 *   Arham's work at these campuses is unconfirmed, so nothing here claims it.
 * - The same local image (Images/allen image.png) is used for every campus for now.
 * - Directions open a map search for the supplied address text — no coordinates are used or invented.
 *   No phone action: the records carry no verified phone numbers.
 * - Swipe right→left for the next campus, left→right for the previous one; ←/→ keys and the dots do the
 *   same. Pointer events are stopped here so a swipe never pans the map underneath.
 * - Changing campus slides the card *content* horizontally (~320 ms ease-out) inside the stationary
 *   glass card: next = out to the left / in from the right, previous = the reverse. One transition at a
 *   time; under prefers-reduced-motion the content switches instantly.
 * - `demo` (TEMPORARY, see data/demoCampusCards.js): the cards are Kota's records reused for UI testing
 *   in another city. No visible label; only the carousel's accessible name says so. The real Kota
 *   addresses are kept as-is.
 */

const SWIPE_PX = 40;
const SLIDE_MS = 320;

const directionsUrl = (loc) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name}, ${loc.suppliedAddress}`)}`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const stop = (e) => e.stopPropagation();

/** One campus's content (image + details). `ghost` = the outgoing copy during a slide (inert). */
const CampusSlide = ({ loc, ghost = false }) => (
  <div className="flex gap-3">
    <img
      src={allenCampusImage}
      alt={ghost ? '' : `${loc.name} — campus building`}
      draggable={false}
      loading="lazy"
      decoding="async"
      className="w-20 sm:w-28 aspect-[4/3] shrink-0 self-center rounded-xl object-cover"
    />
    <div className="min-w-0 flex-1 flex flex-col gap-1" {...(ghost ? {} : { 'aria-live': 'polite', 'aria-atomic': 'true' })}>
      <span className="self-start rounded-full border border-teal-100/25 bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-teal-50">
        Campus location
      </span>
      <h3 className="text-sm sm:text-[15px] font-semibold leading-snug text-white line-clamp-2">{loc.name}</h3>
      <p className="text-[11px] sm:text-xs leading-snug text-white/80 line-clamp-3" title={loc.suppliedAddress}>{loc.suppliedAddress}</p>
      {!ghost && <span className="sr-only">Arham's work at this campus has not been confirmed.</span>}
      <a
        href={directionsUrl(loc)}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={stop}
        tabIndex={ghost ? -1 : undefined}
        className="mt-auto self-start inline-flex items-center gap-1.5 min-h-[36px] rounded-lg bg-brand-navy-dark/90 px-3 text-xs font-medium text-white hover:bg-brand-navy-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        aria-label={`Directions to ${loc.name} (opens Google Maps search for the address)`}
      >
        <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
        Directions
      </a>
    </div>
  </div>
);

export const CampusCard = ({ city, locations = [], demo = false }) => {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
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
      // Resist dragging past the first / last campus.
      const atEdge = (dx > 0 && current === 0) || (dx < 0 && current === count - 1);
      setDragX(atEdge ? dx / 4 : dx);
    }
  };

  const handlePointerEnd = (e) => {
    stop(e);
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (d.horizontal) {
      swiped.current = true;
      if (dx <= -SWIPE_PX) go(current + 1);
      else if (dx >= SWIPE_PX) go(current - 1);
    }
    drag.current = null;
    setDragX(0);
  };

  const handleClickCapture = (e) => {
    // A swipe must not also activate the Directions link.
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
    <div className="space-y-1.5" data-campus-card={city} data-campus-demo={demo ? 'true' : undefined}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={demo ? `Demonstration campus cards for ${city}: sample Kota campuses, not located in ${city}` : `ALLEN campus locations in ${city}`}
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
            className={slide ? `campus-slide ${incomingAnim}` : dragX ? '' : 'transition-transform duration-200'}
            style={dragX ? { transform: `translateX(${dragX}px)` } : undefined}
            data-campus-slide={slide ? 'in' : 'idle'}
          >
            <CampusSlide loc={loc} />
          </div>
        </div>
      </div>

      {/* Minimal pagination — on a small dark pill so it stays legible over bright map areas */}
      <div className="flex justify-center" onPointerDown={stop}>
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-navy-dark/70 px-2 text-[11px] text-white/85 backdrop-blur-sm">
        <div className="flex items-center" role="group" aria-label="Choose campus">
          {locations.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show campus ${i + 1} of ${count}: ${l.name}`}
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
