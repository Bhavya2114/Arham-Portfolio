import React from 'react';
import { ArrowLeft, MousePointerClick } from 'lucide-react';
import IndiaMapSvg from './IndiaMapSvg';

/**
 * Our Presence Map Canvas — Phase B
 *
 * Dark-themed wrapper around the shared `IndiaMapSvg` geometry for the /presence page.
 * Highlights the supplied coverage states and reports state selection upward.
 *
 * Phase boundary: no zoom/pan and no city markers yet. City marker placement is
 * pending verified coordinates (projection calibration is documented in MAP_LICENSE.md).
 */

// Crops the 1000×1000 source canvas to the geometry extent (x 100–900, y 45–955) plus a small margin.
const PRESENCE_MAP_VIEWBOX = '80 30 840 940';

export const PresenceMap = ({
  activeStateCodes,
  selectedState = null,
  onSelectState,
  onReset,
}) => {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-brand-navy/60 p-3 sm:p-6 shadow-[0_0_60px_-20px_rgba(16,185,129,0.25)]">
      {/* Selection status overlay keeps feedback visible next to the map on small screens */}
      <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 z-10 flex items-start justify-between gap-2 pointer-events-none">
        {selectedState ? (
          <>
            <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-brand-navy-dark/90 px-3 py-1.5 text-sm font-semibold text-emerald-200 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
              {selectedState.name}
            </span>
            <button
              type="button"
              onClick={onReset}
              className="pointer-events-auto inline-flex items-center gap-1.5 min-h-[44px] rounded-full border border-white/15 bg-brand-navy-dark/90 px-3.5 text-sm font-medium text-slate-100 backdrop-blur hover:border-emerald-300/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to India</span>
            </button>
          </>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-brand-navy-dark/80 px-3 py-1.5 text-xs font-medium text-slate-300">
            <MousePointerClick className="w-3.5 h-3.5 text-brand-accent" aria-hidden="true" />
            Tap a highlighted state to explore
          </span>
        )}
      </div>

      <IndiaMapSvg
        variant="dark"
        viewBox={PRESENCE_MAP_VIEWBOX}
        activeStateCodes={activeStateCodes}
        selectedStateCode={selectedState?.code || null}
        onSelectState={onSelectState}
        ariaLabel="Map of India highlighting Arham's coverage states"
        className="pt-10 sm:pt-8"
        svgClassName="w-full h-auto max-h-[72vh] select-none"
      />

      {/* Legend */}
      <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-400" aria-label="Map legend">
        <li className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-600/70 border border-emerald-300/80" aria-hidden="true" />
          Coverage state
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-100" aria-hidden="true" />
          Selected
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#16263A] border border-slate-600" aria-hidden="true" />
          Other states
        </li>
      </ul>
    </div>
  );
};

export default PresenceMap;
