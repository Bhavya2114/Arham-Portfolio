import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Project photos: swipe between them (native horizontal scroll-snap, so the finger drives the browser's
 * own scrolling — no JS per frame), a "1 / 6" counter (2+ photos only), a badge (client) on the photo, a thumbnail strip,
 * and a full-screen viewer on tap. The index is read from the scroll position once per frame at most and
 * stored only when it changes.
 */
const useSnapIndex = (ref, count) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
        setIndex((prev) => (prev === i ? prev : Math.min(count - 1, Math.max(0, i))));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref, count]);
  return index;
};

const scrollToIndex = (el, i, smooth = true) => el?.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });

const Lightbox = ({ photos, start, alt, onClose }) => {
  const trackRef = useRef(null);
  const closeRef = useRef(null);
  const index = useSnapIndex(trackRef, photos.length);
  const indexRef = useRef(index);
  indexRef.current = index;
  useEffect(() => {
    scrollToIndex(trackRef.current, start, false);
    closeRef.current?.focus();
    // Escape closes only the viewer (captured before the page's own Escape = "back one level").
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === 'ArrowRight') scrollToIndex(trackRef.current, Math.min(photos.length - 1, indexRef.current + 1));
      else if (e.key === 'ArrowLeft') scrollToIndex(trackRef.current, Math.max(0, indexRef.current - 1));
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div className="flex items-center justify-between px-3 py-2 text-white">
        <span className="text-sm tabular-nums" aria-live="polite">{index + 1} / {photos.length}</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>
      <div ref={trackRef} className="flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory overscroll-contain [scrollbar-width:none]">
        {photos.map((src, i) => (
          <div key={src + i} className="w-full h-full shrink-0 snap-center flex items-center justify-center p-2">
            <img src={src} alt={`${alt} — photo ${i + 1} of ${photos.length}`} className="max-w-full max-h-full object-contain" decoding="async" />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="hidden sm:flex justify-center gap-3 py-3">
          <button type="button" onClick={() => scrollToIndex(trackRef.current, Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous photo" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scrollToIndex(trackRef.current, Math.min(photos.length - 1, index + 1))} disabled={index === photos.length - 1} aria-label="Next photo" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <ChevronRight className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * `viewer` / `onViewerChange` (optional): the page can own the viewer state (Our Work does, so the
 * viewer is a browser-history level and the phone's back button closes it). Without them the gallery
 * keeps the state itself.
 */
export const PhotoGallery = ({ photos, alt, badge, viewer: viewerProp, onViewerChange, fill = false }) => {
  const trackRef = useRef(null);
  const index = useSnapIndex(trackRef, photos.length);
  const [localViewer, setLocalViewer] = useState(null); // index the full-screen viewer opened at
  const controlled = viewerProp !== undefined;
  const viewer = controlled ? viewerProp : localViewer;
  const setViewer = controlled ? onViewerChange : setLocalViewer;
  const openerRef = useRef(null);

  // However the viewer closes (its close button, Escape, the phone's back button), focus returns to
  // the photo it was opened from.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (viewer !== null) wasOpen.current = true;
    else if (wasOpen.current) {
      wasOpen.current = false;
      requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }));
    }
  }, [viewer]);

  if (photos.length === 0) return null;
  const closeViewer = () => setViewer(null);

  return (
    // `fill` (project detail): 16:9 on phones; on desktop the photo fills the free height (at least 180 px; it absorbs any shortage so the detail never scrolls), cropped to cover.
    <div className={`space-y-2${fill ? ' lg:flex lg:flex-1 lg:min-h-[180px] lg:flex-col' : ''}`}>
      <div className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-black/30${fill ? ' lg:min-h-0 lg:flex-1' : ''}`}>
        <div ref={trackRef} className={`flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none]${fill ? ' lg:absolute lg:inset-0' : ''}`} aria-label="Project photos">
          {photos.map((src, i) => (
            <button
              key={src + i}
              type="button"
              ref={i === index ? openerRef : undefined}
              onClick={() => setViewer(i)}
              className="w-full h-full shrink-0 snap-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
              aria-label={`View photo ${i + 1} of ${photos.length} full screen`}
            >
              <img
                src={src}
                alt={`${alt} — photo ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width="800"
                height="450"
                className={`block w-full object-cover ${fill ? 'aspect-video lg:aspect-auto lg:h-full' : 'aspect-video lg:aspect-[2/1]'}`}
              />
            </button>
          ))}
        </div>
        {badge && (
          <span className="pointer-events-none absolute left-2 top-2 max-w-[70%] truncate rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">{badge}</span>
        )}
        {photos.length > 1 && (
          <span data-photo-counter="" className="pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
            <Camera className="w-3.5 h-3.5" aria-hidden="true" />
            {index + 1} / {photos.length}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Photo thumbnails">
          {photos.map((src, i) => (
            <li key={src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollToIndex(trackRef.current, i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`block h-14 w-14 overflow-hidden rounded-lg border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${i === index ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={src} alt="" loading="lazy" decoding="async" width="56" height="56" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewer !== null && <Lightbox photos={photos} start={viewer} alt={alt} onClose={closeViewer} />}
    </div>
  );
};

export default PhotoGallery;
