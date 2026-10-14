import React from 'react';
import { INDIA_MAP_VIEWBOX, INDIA_MAP_STATES } from './indiaMapGeometry';

/**
 * Reusable India Map SVG Component — Phase 3.2
 * Renders verified administrative Level-1 boundary geometry for Indian States and Union Territories.
 * 
 * Supports:
 * - Responsive vector scaling preserving 1:1 aspect ratio.
 * - Neutral default appearance matching Arham design tokens when zero project records exist.
 * - Future data-driven state highlighting via `activeStateCodes` prop.
 * - Accessible keyboard navigation and screen reader support for active states.
 * - `variant="dark"` (Our Presence page): navy base, emerald highlights with a soft glow,
 *   and a selected-state outline drawn above neighbouring boundaries. The default
 *   `variant="light"` rendering is unchanged.
 * - Dark variant strokes use `non-scaling-stroke` so boundaries stay crisp when the
 *   caller zooms via `viewBox`; `children` render as an overlay (e.g. city markers).
 */
export const IndiaMapSvg = ({
  activeStateCodes = [],
  selectedStateCode = null,
  onSelectState = null,
  className = '',
  ariaLabel = 'Map of India - Project Locations',
  variant = 'light',
  viewBox = INDIA_MAP_VIEWBOX,
  svgClassName = 'w-full h-auto max-h-[580px] drop-shadow-subtle select-none transition-all duration-200',
  showGlow = true,
  children = null,
}) => {
  const activeSet = new Set(Array.isArray(activeStateCodes) ? activeStateCodes : []);
  const isDark = variant === 'dark';
  const selectedState = isDark && selectedStateCode
    ? INDIA_MAP_STATES.find((state) => state.id === selectedStateCode)
    : null;

  const handleStateClick = (state) => {
    if (activeSet.has(state.id) && onSelectState) {
      onSelectState(state.id);
    }
  };

  const handleKeyDown = (e, state) => {
    if (activeSet.has(state.id) && onSelectState) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectState(state.id);
      }
    }
  };

  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <svg
        viewBox={viewBox}
        className={svgClassName}
        role="region"
        aria-label={ariaLabel}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="india-map-title">{ariaLabel}</title>
        <desc id="india-map-desc">
          Administrative vector map of India showing 28 states and 8 union territories with verified boundaries.
        </desc>

        {/* Dark variant: soft emerald glow beneath highlighted states (decorative) */}
        {isDark && showGlow && (
          <>
            <defs>
              <filter id="india-map-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <g aria-hidden="true" className="pointer-events-none" filter="url(#india-map-glow)">
              {INDIA_MAP_STATES.filter((state) => activeSet.has(state.id)).map((state) => (
                <path key={state.id} d={state.d} className="fill-emerald-500/25" />
              ))}
            </g>
          </>
        )}

        {/* State Boundaries */}
        <g id="india-states-layer">
          {INDIA_MAP_STATES.map((state) => {
            const isActive = activeSet.has(state.id);
            const isSelected = selectedStateCode === state.id;

            // Compute appearance based on publication status
            let fillClass = 'fill-slate-100 transition-colors duration-150';
            let strokeClass = 'stroke-slate-300';
            let strokeWidth = 0.8;
            let cursorClass = 'cursor-default';

            if (isDark) {
              fillClass = 'fill-[#16263A] transition-colors duration-200';
              strokeClass = 'stroke-slate-600/70';
              strokeWidth = 0.6;
              if (isSelected) {
                fillClass = 'fill-emerald-400 transition-colors duration-200';
                strokeClass = 'stroke-emerald-100';
                strokeWidth = 1.4;
                cursorClass = 'cursor-pointer';
              } else if (isActive) {
                fillClass = 'fill-emerald-600/70 hover:fill-emerald-500 transition-colors duration-200';
                strokeClass = 'stroke-emerald-300/80';
                strokeWidth = 1;
                cursorClass = 'cursor-pointer';
              }
            } else if (isSelected) {
              fillClass = 'fill-brand-blue';
              strokeClass = 'stroke-brand-navy';
              strokeWidth = 1.5;
              cursorClass = 'cursor-pointer';
            } else if (isActive) {
              fillClass = 'fill-blue-50 hover:fill-blue-100';
              strokeClass = 'stroke-brand-blue';
              strokeWidth = 1.2;
              cursorClass = 'cursor-pointer';
            }

            const focusClass = isActive
              ? isDark
                ? 'outline-none focus-visible:stroke-brand-accent focus-visible:[stroke-width:3]'
                : 'focus-visible:stroke-amber-500 focus-visible:stroke-2 focus-visible:outline-none'
              : 'focus:outline-none';

            return (
              <path
                key={state.id}
                id={state.id}
                d={state.d}
                className={`${fillClass} ${strokeClass} ${cursorClass} ${focusClass}`}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect={isDark ? 'non-scaling-stroke' : undefined}
                role={isActive ? 'button' : undefined}
                aria-hidden={!isActive ? 'true' : undefined}
                tabIndex={isActive ? 0 : -1}
                aria-label={isActive ? `${state.name} (${state.type})` : undefined}
                aria-pressed={isActive ? isSelected : undefined}
                onClick={() => handleStateClick(state)}
                onKeyDown={(e) => handleKeyDown(e, state)}
              >
                <title>{`${state.name} (${state.type})${isActive ? (isDark ? ' • Coverage state' : ' • Verified Projects') : ''}`}</title>
              </path>
            );
          })}
        </g>

        {/* Dark variant: selected outline drawn above neighbours so shared borders stay crisp */}
        {selectedState && (
          <path
            d={selectedState.d}
            aria-hidden="true"
            className="pointer-events-none fill-none stroke-emerald-50"
            strokeWidth={1.6}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {children}
      </svg>
    </div>
  );
};

export default IndiaMapSvg;
