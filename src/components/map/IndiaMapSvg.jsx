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
 */
export const IndiaMapSvg = ({
  activeStateCodes = [],
  selectedStateCode = null,
  onSelectState = null,
  className = '',
  ariaLabel = 'Map of India - Project Locations',
}) => {
  const activeSet = new Set(Array.isArray(activeStateCodes) ? activeStateCodes : []);

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
        viewBox={INDIA_MAP_VIEWBOX}
        className="w-full h-auto max-h-[580px] drop-shadow-subtle select-none transition-all duration-200"
        role="region"
        aria-label={ariaLabel}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="india-map-title">{ariaLabel}</title>
        <desc id="india-map-desc">
          Administrative vector map of India showing 28 states and 8 union territories with verified boundaries.
        </desc>

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

            if (isSelected) {
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
              ? 'focus-visible:stroke-amber-500 focus-visible:stroke-2 focus-visible:outline-none'
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
                role={isActive ? 'button' : undefined}
                aria-hidden={!isActive ? 'true' : undefined}
                tabIndex={isActive ? 0 : -1}
                aria-label={isActive ? `${state.name} (${state.type})` : undefined}
                aria-pressed={isActive ? isSelected : undefined}
                onClick={() => handleStateClick(state)}
                onKeyDown={(e) => handleKeyDown(e, state)}
              >
                <title>{`${state.name} (${state.type})${isActive ? ' • Verified Projects' : ''}`}</title>
              </path>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default IndiaMapSvg;
