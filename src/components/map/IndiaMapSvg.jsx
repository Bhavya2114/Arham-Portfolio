import React, { useMemo, useRef } from 'react';
import { INDIA_MAP_VIEWBOX, INDIA_MAP_STATES } from './indiaMapGeometry';
import { splitRegionEdges, pathCentreX } from './regionEdges';

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
 *     the island territories (LD, AN) only a faint cyan outline, not clickable;
 *   · worked states: one dark olive radial fill for the whole map (lighter over central India);
 *   · the worked region's outer outline gets the yellow edge; borders shared by two worked states
 *     are thinner and dimmer (outline split once per coverage set, see `regionEdges.js`);
 *   · fake glow without blur: two wider, faint strokes in the edge yellow under the edge — around
 *     the selected state, or around the worked region's outer outline when none is selected;
 *   · with a state selected, the other worked states are drawn at 35 % (per-path opacity).
 *   Performance rules: no blur filters, patterns, masks or group opacity, no animation; while
 *   `moving` (zoom / pan / drag) only the state fills and their edges are drawn.
 *   The map is used only on /presence (the homepage shows a static image of it), so the old
 *   light variant was removed; `dark` is the only variant.
 * - Dark variant strokes use `non-scaling-stroke` so boundaries stay crisp when the
 *   caller zooms via `viewBox`; `children` render as an overlay (e.g. city markers).
 */

/** Soft, non-neon yellow for worked-state edges and the fake glow — tweak here. */
export const EDGE_YELLOW = '#D9E35A';

/** Dark-variant palette (also used by PresenceMap for the legend, districts and pins). */
export const MAP_COLORS = Object.freeze({
  edge: EDGE_YELLOW,
  cyan: '#3FD0E6',
  land: '#0C0D0F', // = the page background
  workedCenter: '#5C7E1C',
  workedEdge: '#2F4A10',
  hoverCenter: '#6A8F22',
  hoverEdge: '#385814',
  tapCenter: '#7EA82A',
  tapEdge: '#46691A',
});

const OTHER_FILL_OPACITY = 0.45;
const ECHO = { offsetPx: 3, opacity: 0.22 }; // faint second cyan outline under other states
const EDGE_WIDTH = 1.5;
const SHARED_EDGE = { width: 0.8, opacity: 0.5 }; // borders between two worked states
const FAKE_GLOW = [[10, 0.07], [5, 0.18]]; // [stroke width px, stroke opacity], widest first
const DIM = 0.35; // other worked states while one is selected
// Island territories (Lakshadweep, Andaman & Nicobar): kept, but quiet — faint cyan outline only,
// no fill, no offset echo, not clickable.
const ISLAND_IDS = new Set(['IN-LD', 'IN-AN']);
const ISLAND_LINE = { width: 0.8, opacity: 0.3 };
// One fill gradient for the whole map, in map coordinates: centred on central India, lighter in the
// middle and darker toward the outer edges of the worked region.
const FILL_GRADIENT = { cx: 481, cy: 496, r: 440 };

// Tap feedback: the tapped worked state flashes brighter, and the zoom starts this much later.
const TAP_FLASH_MS = 120;
const TAP_SELECT_DELAY_MS = 60;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const canHover = () => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover)').matches;

const viewBoxWidth = (vb) => Number(String(vb).trim().split(/[\s,]+/)[2]) || 1;

export const IndiaMapSvg = ({
  activeStateCodes = [],
  dimStateCodes = [], // worked states without projects for the current filter: drawn at DIM (per path)
  selectedStateCode = null,
  onSelectState = null,
  onSelectInactiveState = null,
  className = '',
  ariaLabel = 'Map of India - Project Locations',
  variant = 'dark',
  viewBox = INDIA_MAP_VIEWBOX,
  svgClassName = 'w-full h-auto select-none',
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
  const dimKey = (Array.isArray(dimStateCodes) ? [...dimStateCodes] : []).sort().join(',');
  live.current = { activeSet, onSelectState, onSelectInactiveState, selectedStateCode, dimKey };

  // ---- Dark variant: hover / tap highlight ----
  // One extra path drawn over the hovered or tapped worked state with a brighter fill, updated
  // through a ref (no React re-render) and faded with a CSS opacity transition. No filters.
  const highlightRef = useRef(null);
  const highlight = useRef({ hoverId: null, flashTimer: 0 });
  const showHighlight = (state, kind) => {
    const el = highlightRef.current;
    if (!el) return;
    const selected = live.current.selectedStateCode;
    el.setAttribute('d', state.d);
    el.setAttribute('fill', `url(#india-map-worked-fill-${kind})`);
    const filteredOut = live.current.dimKey.split(',').includes(state.id);
    el.setAttribute('fill-opacity', String((selected && selected !== state.id) || (filteredOut && selected !== state.id) ? DIM : 1));
  };
  const handleWorkedPointerEnter = (e, state) => {
    if (e.pointerType !== 'mouse' || !canHover()) return;
    highlight.current.hoverId = state.id;
    if (highlightRef.current?.dataset.flash === 'true') return;
    showHighlight(state, 'hover');
    highlightRef.current.dataset.on = 'true';
  };
  const handleWorkedPointerLeave = (state) => {
    if (highlight.current.hoverId !== state.id) return;
    highlight.current.hoverId = null;
    if (highlightRef.current && highlightRef.current.dataset.flash !== 'true') highlightRef.current.dataset.on = 'false';
  };
  const flashState = (state) => {
    const el = highlightRef.current;
    if (!el) return;
    clearTimeout(highlight.current.flashTimer);
    showHighlight(state, 'tap');
    el.dataset.flash = 'true';
    el.dataset.on = 'false';
    highlight.current.flashTimer = setTimeout(() => {
      el.dataset.flash = 'false';
      const hovered = INDIA_MAP_STATES.find((s) => s.id === highlight.current.hoverId);
      if (hovered) {
        showHighlight(hovered, 'hover');
        el.dataset.on = 'true';
      }
    }, TAP_FLASH_MS);
  };
  // Tap on a worked state: brighten it briefly, then select (zoom) a moment later.
  const handleWorkedClick = (state) => {
    if (prefersReducedMotion()) {
      handleStateClick(state);
      return;
    }
    flashState(state);
    setTimeout(() => handleStateClick(state), TAP_SELECT_DELAY_MS);
  };
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

  // ---- Dark variant (Our Presence): static elements built once per coverage / selection ----
  const activeKey = isDark ? [...activeSet].sort().join(',') : '';
  const regionEdges = useMemo(() => {
    if (!isDark) return null;
    const set = new Set(activeKey ? activeKey.split(',') : []);
    return splitRegionEdges(INDIA_MAP_STATES.filter((state) => set.has(state.id)));
  }, [isDark, activeKey]);
  const L = useMemo(() => {
    if (!isDark) return null;
    const set = new Set(activeKey ? activeKey.split(',') : []);
    const others = INDIA_MAP_STATES.filter((state) => !set.has(state.id) && !ISLAND_IDS.has(state.id));
    const islands = INDIA_MAP_STATES.filter((state) => !set.has(state.id) && ISLAND_IDS.has(state.id));
    const worked = INDIA_MAP_STATES.filter((state) => set.has(state.id));
    // Entrance order: worked states light up roughly west → east.
    const enterOrder = new Map([...worked].sort((a, b) => pathCentreX(a.d) - pathCentreX(b.d)).map((state, i) => [state.id, i]));
    const hero =selectedStateCode ? worked.find((state) => state.id === selectedStateCode) || null : null;
    const filteredOut = new Set(dimKey ? dimKey.split(',') : []);
    // Dimmed: the other worked states while one is selected, and (Our Work filter) worked states with no
    // matching projects. Per-path fill opacity only, never group opacity.
    const dimmed = worked.filter((state) => state !== hero && (hero || filteredOut.has(state.id)));
    const lit = hero ? [hero] : worked.filter((state) => !filteredOut.has(state.id));

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
        onClick={() => handleWorkedClick(state)}
        onPointerEnter={(e) => handleWorkedPointerEnter(e, state)}
        onPointerLeave={() => handleWorkedPointerLeave(state)}
        data-worked=""
        style={{ '--enter-i': enterOrder.get(state.id) }}
        fill="url(#india-map-worked-fill)"
        fillOpacity={opacity}
        stroke="none"
        className="cursor-pointer outline-none focus-visible:stroke-brand-accent focus-visible:[stroke-width:3]"
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
    const line = (key, d, width, opacity) =>
      d ? (
        <path key={key} d={d} fill="none" stroke={MAP_COLORS.edge} strokeOpacity={opacity} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      ) : null;
    // Overview: the region's outer outline is bright, shared borders quiet. With a state selected the
    // region's lines are dimmed and the selected state gets its own full outline (+ fake glow).
    const regionOpacity = hero ? DIM : 1;
    const regionLines = [
      line('shared', regionEdges.shared, SHARED_EDGE.width, SHARED_EDGE.opacity * regionOpacity),
      line('outer', regionEdges.outer, EDGE_WIDTH, regionOpacity),
    ];

    return {
      echo: strokes(others, 1.5, ECHO.opacity, MAP_COLORS.cyan),
      otherStates: others.map(otherState),
      islands: strokes(islands, ISLAND_LINE.width, ISLAND_LINE.opacity, MAP_COLORS.cyan),
      dimmedStates: dimmed.map((state) => workedState(state, DIM)),
      litStates: lit.map((state) => workedState(state)),
      regionLines,
      fakeGlow: FAKE_GLOW.map(([width, opacity]) =>
        hero ? strokes([hero], width, opacity, MAP_COLORS.edge) : line(`glow-${width}`, regionEdges.outer, width, opacity)
      ),
      heroEdge: hero ? strokes([hero], EDGE_WIDTH, 1, MAP_COLORS.edge) : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, activeKey, selectedStateCode, regionEdges, dimKey]);

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

        {/* Dark variant: one worked-state fill for the whole map (map coordinates, lighter over central India) */}
        {isDark && (
          <defs>
            <radialGradient id="india-map-worked-fill" gradientUnits="userSpaceOnUse" cx={FILL_GRADIENT.cx} cy={FILL_GRADIENT.cy} r={FILL_GRADIENT.r}>
              <stop offset="0%" stopColor={MAP_COLORS.workedCenter} />
              <stop offset="100%" stopColor={MAP_COLORS.workedEdge} />
            </radialGradient>
            <radialGradient id="india-map-worked-fill-hover" gradientUnits="userSpaceOnUse" cx={FILL_GRADIENT.cx} cy={FILL_GRADIENT.cy} r={FILL_GRADIENT.r}>
              <stop offset="0%" stopColor={MAP_COLORS.hoverCenter} />
              <stop offset="100%" stopColor={MAP_COLORS.hoverEdge} />
            </radialGradient>
            <radialGradient id="india-map-worked-fill-tap" gradientUnits="userSpaceOnUse" cx={FILL_GRADIENT.cx} cy={FILL_GRADIENT.cy} r={FILL_GRADIENT.r}>
              <stop offset="0%" stopColor={MAP_COLORS.tapCenter} />
              <stop offset="100%" stopColor={MAP_COLORS.tapEdge} />
            </radialGradient>
          </defs>
        )}

        {/* State Boundaries. Dark order: echo outline → other states → worked states (dimmed, then lit)
            → hover / tap highlight → region lines (quiet shared borders, outer outline) → fake glow →
            selected-state edge. Only worked states are focusable, so their tab order is unchanged.
            Entrance animation: CSS keyed on the map wrapper's data-entrance (styles/index.css). */}
        <g id="india-states-layer">
          {isDark && (
            <>
              {!moving && <g {...deco} data-layer="outline-echo" transform={`translate(0 ${ECHO.offsetPx * unit})`}>{L.echo}</g>}
              <g data-layer="other-states">{L.otherStates}</g>
              <g {...deco} data-layer="islands">{L.islands}</g>
              {L.dimmedStates}
              {L.litStates}
              <path ref={highlightRef} className="presence-highlight pointer-events-none" aria-hidden="true" data-layer="state-highlight" />

              <g {...deco} data-layer="region-edges">{L.regionLines}</g>
              {!moving && <g {...deco} data-layer="fake-glow">{L.fakeGlow}</g>}
              <g {...deco} data-layer="edges">{L.heroEdge}</g>
            </>
          )}
        </g>

        {children}
      </svg>
    </div>
  );
};

export default IndiaMapSvg;
