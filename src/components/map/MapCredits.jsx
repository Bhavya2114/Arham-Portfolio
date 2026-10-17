import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * "ⓘ Map data" credits for the /presence map (required by the data licences).
 *
 * A tiny, low-contrast button in the top-right corner of the map area (44 px tap target) that toggles
 * a small popover with the credits and their links. It closes on a second tap, on Escape (handled in a
 * capture listener and stopped, so Escape never also steps the page back) or on a tap outside.
 * Top-right, so it never meets the bottom-anchored project card. Pointer events stop here, so a tap
 * never pans the map.
 */

const link = 'underline decoration-slate-600 underline-offset-2 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded';
const stop = (e) => e.stopPropagation();

export const MapCredits = ({ cities = false, districts = false }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    };
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [open]);

  if (!cities && !districts) return null;

  return (
    <div ref={rootRef} className="absolute right-0 top-0 z-30 flex flex-col items-end pointer-events-auto" onPointerDown={stop} onClick={stop} data-map-credits="">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="presence-map-credits"
        className="inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-md px-2 text-[11px] text-muted hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        <Info className="h-3 w-3" aria-hidden="true" />
        Map data
      </button>
      {open && (
        <div
          id="presence-map-credits"
          role="region"
          aria-label="Map data credits"
          className="mr-1 w-64 max-w-[calc(100vw-3rem)] rounded-lg border border-white/10 bg-card/95 p-3 text-left text-[11px] leading-relaxed text-slate-400 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          {cities && (
            <p>
              City locations ©{' '}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className={link}>
                OpenStreetMap contributors
              </a>{' '}
              (ODbL) and Wikipedia
            </p>
          )}
          {districts && (
            <p className={cities ? 'mt-1.5' : ''}>
              District boundaries:{' '}
              <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener noreferrer" className={link}>
                geoBoundaries
              </a>{' '}
              / LGD (ODbL)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapCredits;
