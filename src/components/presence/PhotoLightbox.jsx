import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Simple full-screen photo viewer for the /presence project card.
 *
 * - Dark overlay, photo fitted to the screen (object-contain), "n / total" counter.
 * - Swipe (touch / mouse drag), ‹ › buttons and ←/→ keys between photos; ✕, Escape or a tap on the
 *   backdrop closes it. Page scroll is locked while open.
 * - Modal dialog: focus moves to the close button, Tab is trapped inside, and on close focus returns
 *   to `returnFocus` (the photo that opened it). Keys are handled in a window capture listener and
 *   stopped there, so Escape / arrows never reach the page (which uses Escape to go back a level).
 * - Swipe offset follows the pointer through a ref transform (no React state per move); opening
 *   fades in (opacity only). No blur.
 */

const SWIPE_PX = 50;

export const PhotoLightbox = ({ photos, startIndex = 0, alt, onClose, returnFocus }) => {
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const imgRef = useRef(null);
  const drag = useRef(null);
  const count = photos.length;
  const live = useRef({});
  live.current = { index, count, onClose };

  const go = (i) => setIndex((current) => Math.max(0, Math.min(live.current.count - 1, typeof i === 'function' ? i(current) : i)));

  // Lock page scroll; focus the close button; restore both on close.
  useLayoutEffect(() => {
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const opener = returnFocus;
    return () => {
      body.style.overflow = previous;
      opener?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keys: Escape closes, ←/→ switch, Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e) => {
      if (!dialogRef.current) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); live.current.onClose(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go((i) => i + 1); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go((i) => i - 1); return; }
      if (e.key === 'Tab') {
        const items = [...dialogRef.current.querySelectorAll('button:not([disabled])')];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (!dialogRef.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setOffset = (px, follow) => {
    const el = imgRef.current;
    if (!el) return;
    el.style.transition = follow ? 'none' : 'transform 200ms ease-out';
    el.style.transform = px ? `translateX(${px}px)` : '';
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (count < 2 || (e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button')) return;
    drag.current = { id: e.pointerId, x: e.clientX, moved: false };
  };
  const handlePointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 8) {
      d.moved = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    }
    if (d.moved) setOffset(dx, true);
  };
  const handlePointerEnd = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setOffset(0);
    if (!d.moved) return;
    d.swiped = true;
    const dx = e.clientX - d.x;
    if (dx <= -SWIPE_PX) go((i) => i + 1);
    else if (dx >= SWIPE_PX) go((i) => i - 1);
    // A swipe must not count as a backdrop tap.
    dialogRef.current.dataset.swiped = 'true';
  };
  const handleBackdropClick = (e) => {
    e.stopPropagation();
    if (dialogRef.current?.dataset.swiped === 'true') { dialogRef.current.dataset.swiped = ''; return; }
    // Only a tap on the dark backdrop (not the photo or a button) closes.
    if (e.target === e.currentTarget || e.target.dataset?.backdrop === '') onClose();
  };

  const arrow = 'absolute top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9E35A]';

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt}: photo ${index + 1} of ${count}`}
      className="presence-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10 select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClick={handleBackdropClick}
      data-lightbox=""
    >
      <div className="flex h-full w-full items-center justify-center" data-backdrop="">
        <img
          ref={imgRef}
          key={index}
          src={photos[index]}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full rounded-lg object-contain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        />
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close photo"
        className="absolute right-3 top-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9E35A]"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
      {count > 1 && (
        <>
          <button type="button" className={`${arrow} left-3`} disabled={index === 0} onClick={(e) => { e.stopPropagation(); go(index - 1); }} aria-label="Previous photo">
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button type="button" className={`${arrow} right-3`} disabled={index === count - 1} onClick={(e) => { e.stopPropagation(); go(index + 1); }} aria-label="Next photo">
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums text-white" data-lightbox-counter="">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>,
    document.body
  );
};

export default PhotoLightbox;
