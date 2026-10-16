import React, { useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import PhotoLightbox from './PhotoLightbox';

/**
 * Photo area of the /presence project card: 1–4 photos.
 *
 * - Swipe between photos (touch / pen; mouse drag too), small ‹ › on devices with hover, and an
 *   "n/total" counter in the corner — all hidden with a single photo.
 * - Tap / click a photo to open it full screen (PhotoLightbox); focus returns to it on close.
 * - A subtle dark gradient on the edge next to the text, so bright skies don't make a hard edge.
 * - The strip moves through a ref transform (no React state per move); the photo index changes
 *   only when a swipe / button settles. touch-action pan-y keeps vertical page scrolling; pointer
 *   events stop here, so a photo swipe never switches projects or pans the map.
 */

const SWIPE_PX = 40;

export const ProjectPhotos = ({ photos, alt, className = '', fadeTo = '#0C2530' }) => {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null); // { start, opener } while open
  const trackRef = useRef(null);
  const drag = useRef(null);
  const swiped = useRef(false);
  const count = photos.length;

  const place = (i, dx = 0, follow = false) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = follow ? 'none' : 'transform 250ms ease-out';
    el.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`;
  };
  useLayoutEffect(() => place(index), [index]);

  const go = (i) => setIndex(Math.max(0, Math.min(count - 1, i)));

  const handlePointerDown = (e) => {
    e.stopPropagation();
    swiped.current = false;
    if (count < 2 || (e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('[data-photo-nav]')) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, horizontal: false };
  };
  const handlePointerMove = (e) => {
    e.stopPropagation();
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.horizontal) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      d.horizontal = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    }
    const atEdge = (dx > 0 && index === 0) || (dx < 0 && index === count - 1);
    place(index, atEdge ? dx / 4 : dx, true);
  };
  const handlePointerEnd = (e) => {
    e.stopPropagation();
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.horizontal) return;
    // Suppress only the click this swipe itself may produce; touch swipes often produce none, so
    // the flag must not linger and swallow a later tap or Enter.
    swiped.current = true;
    setTimeout(() => { swiped.current = false; }, 50);
    const dx = e.clientX - d.x;
    const target = dx <= -SWIPE_PX ? index + 1 : dx >= SWIPE_PX ? index - 1 : index;
    if (Math.max(0, Math.min(count - 1, target)) === index) place(index);
    else go(target);
  };

  const open = (i, opener) => {
    if (swiped.current) { swiped.current = false; return; }
    setLightbox({ start: i, opener });
  };

  if (count === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#16404A] to-[#0A1B26] text-teal-100/60 ${className}`} data-photo-placeholder="">
        <Lightbulb className="h-7 w-7" aria-hidden="true" />
        <span className="text-[11px]">Photo coming soon</span>
      </div>
    );
  }

  const nav = 'absolute top-1/2 -translate-y-1/2 hidden [@media(hover:hover)]:inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none group';
  const navDot = 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white group-hover:bg-black/65 group-disabled:opacity-0 group-focus-visible:ring-2 group-focus-visible:ring-[#D9E35A]';

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      data-project-photos={count}
    >
      <div ref={trackRef} className="flex h-full w-full" data-photo-track="">
        {photos.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={(e) => open(i, e.currentTarget)}
            tabIndex={i === index ? 0 : -1}
            aria-hidden={i === index ? undefined : 'true'}
            aria-label={`${alt}: open photo${count > 1 ? ` ${i + 1} of ${count}` : ''} full screen`}
            className="relative h-full w-full shrink-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D9E35A]"
          >
            <img src={src} alt={alt} draggable={false} decoding="async" loading={i === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {/* Soft dark edge towards the text (bottom), so a bright sky never meets the card in a hard line. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3" style={{ background: `linear-gradient(to top, ${fadeTo}cc, transparent)` }} aria-hidden="true" />
      {count > 1 && (
        <>
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white" data-photo-counter="">
            {index + 1}/{count}
          </span>
          <button type="button" data-photo-nav="" className={`${nav} left-1`} disabled={index === 0} onClick={() => go(index - 1)} aria-label="Previous photo">
            <span className={navDot}><ChevronLeft className="h-5 w-5" aria-hidden="true" /></span>
          </button>
          <button type="button" data-photo-nav="" className={`${nav} right-1`} disabled={index === count - 1} onClick={() => go(index + 1)} aria-label="Next photo">
            <span className={navDot}><ChevronRight className="h-5 w-5" aria-hidden="true" /></span>
          </button>
        </>
      )}
      {lightbox && (
        <PhotoLightbox photos={photos} startIndex={lightbox.start} alt={alt} returnFocus={lightbox.opener} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
};

export default ProjectPhotos;
