import React, { useMemo, useRef } from 'react';
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
 * - `variant="dark"` (Our Presence page): a cheap "neon" look —
 *   · other states: cyan outline over a dark land tint, plus a faint second outline 3 px lower;
 *   · worked states: dark olive radial fill (lighter in the centre) with a plain yellow edge;
 *   · fake glow without blur: two wider, faint strokes in the edge yellow under the edge — for the
 *     selected state, or for every worked state when none is selected;
 *   · with a state selected, the other worked states are drawn at 35 % (per-path opacity).
 *   Performance rules: no blur filters, patterns, masks or group opacity, no animation; while
 *   `moving` (zoom / pan / drag) only the state fills and their edges are drawn.
 *   The default `variant="light"` rendering is unchanged.
 * - Dark variant strokes use `non-scaling-stroke` so boundaries stay crisp when the
 *   caller zooms via `viewBox`; `children` render as an overlay (e.g. city markers).
 */

/** Soft, non-neon yellow for worked-state edges and the fake glow — tweak here. */
export const EDGE_YELLOW = '#D9E35A';

/** Dark-variant palette (also used by PresenceMap for the legend, districts and pins). */
export const MAP_COLORS = Object.freeze({
  edge: EDGE_YELLOW,
  cyan: '#3FD0E6',
  land: '#070A1F',
  workedCenter: '#5C7E1C',
  workedEdge: '#2F4A10',
  hoverCenter: '#6A8F22',
  hoverEdge: '#385814',
});

const OTHER_FILL_OPACITY = 0.45;
const ECHO = { offsetPx: 3, opacity: 0.22 }; // faint second cyan outline under other states
const EDGE_WIDTH = 1.5;
const FAKE_GLOW = [[10, 0.07], [5, 0.18]]; // [stroke width px, stroke opacity], widest first
const DIM = 0.35; // other worked states while one is selected

const viewBoxWidth = (vb) => Number(String(vb).trim().split(/[\s,]+/)[2]) || 1;

export const IndiaMapSvg = ({
  activeStateCodes = [],
  selectedStateCode = null,
  onSelectState = null,
  onSelectInactiveState = null,
  className = '',
  ariaLabel = 'Map of India - Project Locations',
  variant = 'light',
  viewBox = INDIA_MAP_VIEWBOX,
  svgClassName = 'w-full h-auto max-h-[580px] drop-shadow-subtle select-none transition-all duration-200',
  pxUnit = null,
  moving = false,
  children = null,
}) => {
  const activeSet = new Set(Array.isArray(activeStateCodes) ? activeStateCodes : []);
  const isDark = variant === 'dark';
  // Map units per screen px (for the echo outline offset); estimated when the caller does not pass it.
  const unit = pxUnit || viewBoxWidth(viewBox) / 800;

  // Latest handlers read through a ref, so the memoised dark-variant paths never call stale ones.
  const live = useRef({});
  live.current = { activeSet, onSelectState, onSelectInactiveState };
  const handleStateClick = (state) => {
    const { activeSet: set, onSelectState: onSel, onSelectInactiveState: onInactive } = live.current;
    if (set.has(state.id) && onSel) {
      onSel(state.id);
    } else if (!set.has(state.id) && onInactive) {
      onInactive(state.id);
    }
  };

  const handleKeyDown = (e, state) => {
    const { activeSet: set, onSelectState: onSel } = live.current;
    if (set.has(state.id) && onSel) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSel(state.id);
      }
    }
  };

  // ---- Light variant (homepage): original rendering, unchanged ----
  const renderLightState = (state) => {
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
  };

  // ---- Dark variant (Our Presence): static elements built once per coverage / selection ----
  const activeKey = isDark ? [...activeSet].sort().join(',') : '';
  const L = useMemo(() => {
    if (!isDark) return null;
    const set = new Set(activeKey ? activeKey.split(',') : []);
    const others = INDIA_MAP_STATES.filter((state) => !set.has(state.id));
    const worked = INDIA_MAP_STATES.filter((state) => set.has(state.id));
    const hero = selectedStateCode ? worked.find((state) => state.id === selectedStateCode) || null : null;
    const dimmed = hero ? worked.filter((state) => state !== hero) : [];
    const lit = hero ? [hero] : worked;

    const common = (state) => ({
      key: state.id,
      id: state.id,
      d: state.d,
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
      vectorEffect: 'non-scaling-stroke',
      onClick: () => handleStateClick(state),
      onKeyDown: (e) => handleKeyDown(e, state),
    });
    const otherState = (state) => (
      <path
        {...common(state)}
        fill={MAP_COLORS.land}
        fillOpacity={OTHER_FILL_OPACITY}
        stroke={MAP_COLORS.cyan}
        strokeWidth={1.5}
        className="cursor-default focus:outline-none"
        aria-hidden="true"
        tabIndex={-1}
      >
        <title>{`${state.name} (${state.type})`}</title>
      </path>
    );
    const workedState = (state, opacity = 1) => (
      <path
        {...common(state)}
        fill="url(#india-map-worked-fill)"
        fillOpacity={opacity}
        stroke="none"
        className="cursor-pointer hover:[fill:url(#india-map-worked-fill-hover)] outline-none focus-visible:stroke-brand-accent focus-visible:[stroke-width:3]"
        role="button"
        tabIndex={0}
        aria-label={`${state.name} (${state.type})`}
        aria-pressed={selectedStateCode === state.id}
      >
        <title>{`${state.name} (${state.type}) • Coverage state`}</title>
      </path>
    );
    const strokes = (states, width, opacity, color) =>
      states.map((state) => (
        <path key={state.id} d={state.d} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={width} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ));

    return {
      echo: strokes(others, 1.5, ECHO.opacity, MAP_COLORS.cyan),
      otherStates: others.map(otherState),
      dimmedStates: dimmed.map((state) => workedState(state, DIM)),
      dimmedEdges: strokes(dimmed, EDGE_WIDTH, DIM, MAP_COLORS.edge),
      litStates: lit.map((state) => workedState(state)),
      fakeGlow: FAKE_GLOW.map(([width, opacity]) => strokes(lit, width, opacity, MAP_COLORS.edge)),
      litEdges: strokes(lit, EDGE_WIDTH, 1, MAP_COLORS.edge),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, activeKey, selectedStateCode]);

  const deco = { 'aria-hidden': 'true', className: 'pointer-events-none' };

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

        {/* Dark variant: worked-state fills (darker at the edge, lighter in the centre) */}
        {isDark && (
          <defs>
            <radialGradient id="india-map-worked-fill" cx="0.5" cy="0.5" r="0.65">
              <stop offset="0%" stopColor={MAP_COLORS.workedCenter} />
              <stop offset="100%" stopColor={MAP_COLORS.workedEdge} />
            </radialGradient>
            <radialGradient id="india-map-worked-fill-hover" cx="0.5" cy="0.5" r="0.65">
              <stop offset="0%" stopColor={MAP_COLORS.hoverCenter} />
              <stop offset="100%" stopColor={MAP_COLORS.hoverEdge} />
            </radialGradient>
          </defs>
        )}

        {/* State Boundaries. Dark order: echo outline → other states → dimmed worked states + edges →
            lit worked states → fake glow → yellow edges. Only worked states are focusable, so their
            tab order is unchanged. */}
        <g id="india-states-layer">
          {!isDark && INDIA_MAP_STATES.map(renderLightState)}
          {isDark && (
            <>
              {!moving && <g {...deco} data-layer="outline-echo" transform={`translate(0 ${ECHO.offsetPx * unit})`}>{L.echo}</g>}
              {L.otherStates}
              {L.dimmedStates}
              <g {...deco} data-layer="dimmed-edges">{L.dimmedEdges}</g>
              {L.litStates}
              {!moving && <g {...deco} data-layer="fake-glow">{L.fakeGlow}</g>}
              <g {...deco} data-layer="edges">{L.litEdges}</g>
            </>
          )}
        </g>

        {children}
      </svg>
    </div>
  );
};

export default IndiaMapSvg;
