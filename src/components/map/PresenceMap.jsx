import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { MousePointerClick, Plus, Minus, Maximize2, Move } from 'lucide-react';
import IndiaMapSvg, { MAP_COLORS } from './IndiaMapSvg';
import { startOverlayEntrance, OVERLAY_ENTER } from '../../lib/overlayEntrance.js';
import { isMapBackgroundTap } from '../../lib/mapBackgroundTap.js';
import { createSettleQueue } from '../../lib/viewSettle.js';
import { markerClearanceShift, viewBoxScreenMap } from '../../lib/markerClearance.js';
import { INDIA_MAP_STATES } from './indiaMapGeometry';
import { clusterPoints } from '../../lib/markerClustering.js';
import { kmPerUnitAt } from '../../lib/mapProjection.js';

/**
 * Our Presence Map Canvas — Phase C
 *
 * Dark-themed wrapper around the shared `IndiaMapSvg` geometry for the /presence page.
 * - Selecting a state animates the viewBox to fit that state (instant under reduced motion).
 * - Zoom in / out / fit controls; drag (mouse or one finger) and pinch to pan/zoom once zoomed.
 *   At the India overview the map never captures touch, so the page scrolls normally.
 * - Gold city markers (positions projected from `cityCoordinates.js`) appear only for the
 *   selected state, with enlarged invisible hit areas sized to avoid overlapping neighbours.
 * - Selecting a city only highlights its marker: the map does not zoom or draw a city-level view
 *   (the page lists that city's projects instead).
 *   Project markers (white pins) are drawn only from projects' own verified coordinates,
 *   clustered in screen space when they would overlap.
 * - Optional lazily-loaded `geography` for the selected state draws thin district lines
 *   (clipped to the state outline).
 * - Optional `overlay` (e.g. the floating campus card) is anchored to the bottom of the map container
 *   (full width on narrow maps; on wide maps the bottom corner away from the selected city). If the
 *   selected city marker would sit under or too close to it, the map pans up by just that amount (zoom
 *   unchanged); then the overlay slides up from the bottom edge. Zoom controls move to the top-right.
 */

// Crops the 1000×1000 source canvas to the geometry extent (x 100–900, y 45–955) plus a small margin.
const BASE = { x: 80, y: 30, w: 840, h: 940 };
const PRESENCE_MAP_VIEWBOX = `${BASE.x} ${BASE.y} ${BASE.w} ${BASE.h}`;
const HOME_VIEW = { cx: BASE.x + BASE.w / 2, cy: BASE.y + BASE.h / 2, k: 1 };
const MAX_ZOOM = 320; // lets project sites roughly 1 km+ apart separate on screen
const STATE_FIT_MAX_ZOOM = 8;
const PROJECT_PIN_PX = 9;
const CLUSTER_RADIUS_PX = 36;
const ZOOM_STEP = 1.6;
const DRAG_THRESHOLD_PX = 6;
const MARKER_RADIUS_PX = 5;
// Overview city dots: a small bright white dot, ~3 px across (screen px radius).
const OVERVIEW_CITY = { dotPx: 1.5, opacity: 0.9 };
// Soft halo behind each zoomed city pin: white, ~2.2× the dot, no blur.
const PIN_HALO = { scale: 2.2, opacity: 0.18 };
// Plain navy radial background behind the map (CSS only, static).
const MAP_BACKGROUND = 'radial-gradient(ellipse at 50% 45%, #0B1030 0%, #070A1F 100%)';
// District lines inside the selected state: dark olive, "engraved" into the fill, so the yellow
// outer edge stays the only bright line.
const DISTRICT_LINE = { color: '#1A2A06', opacity: 0.6, width: 0.7 };
const MAX_HIT_RADIUS_PX = 22;
const MIN_HIT_RADIUS_PX = 12;
const MARKER_CLEARANCE_PX = 28; // space kept between the selected city marker and the overlay
const MAP_SHIFT_MS = 240; // short pan that keeps the selected marker above the card; the card enters when it ends
const MIN_SHIFT_PX = 2; // ignore sub-pixel "shifts" (marker already at the clearance boundary)

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const clampView = ({ cx, cy, k }) => {
  const zoom = clamp(k, 1, MAX_ZOOM);
  const w = BASE.w / zoom;
  const h = BASE.h / zoom;
  return {
    cx: clamp(cx, BASE.x + w / 2, BASE.x + BASE.w - w / 2),
    cy: clamp(cy, BASE.y + h / 2, BASE.y + BASE.h - h / 2),
    k: zoom,
  };
};

const toViewBox = ({ cx, cy, k }) => {
  const w = BASE.w / k;
  const h = BASE.h / k;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const PresenceMap = ({
  activeStateCodes,
  selectedState = null,
  onSelectState,
  onSelectInactiveState,
  onBackgroundTap,
  onReset,
  markers = [],
  overviewCities = [],
  selectedCity = null,
  onSelectCity,
  geography = null,
  referenceLat = null,
  projectMarkers = [],
  selectedProjectId = null,
  onSelectProject,
  onSelectCluster,
  footer = null,
  overlay = null,
}) => {
  const wrapperRef = useRef(null);
  const [view, setView] = useState(HOME_VIEW);
  const viewRef = useRef(HOME_VIEW);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const commitView = useCallback((next) => {
    viewRef.current = next;
    setView(next);
  }, []);

  // Listeners for "the view has settled" (lib/viewSettle.js). They stay attached when one animation
  // hands over to the next and are called once the view stops: 'finished' (completed / instant) or
  // 'interrupted' (the user drags or pinches, or the map unmounts).
  const [settle] = useState(createSettleQueue);
  const stopAnimation = useCallback((reason = 'interrupted') => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setIsAnimating(false);
    settle.flush(reason);
  }, [settle]);

  /** Calls `cb(reason)` when the view settles — at once ('finished') if nothing is animating. */
  const whenViewSettles = useCallback((cb) => {
    if (animationRef.current) return settle.add(cb);
    cb('finished');
    return () => {};
  }, [settle]);

  const animateTo = useCallback((target, { duration = 550, onDone = null } = {}) => {
    // A newer animation replaces the running one; settle listeners carry over to it.
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    if (onDone) settle.add(onDone);
    const to = clampView(target);
    if (prefersReducedMotion()) {
      commitView(to);
      stopAnimation('finished');
      return;
    }
    const from = viewRef.current;
    const start = performance.now();
    setIsAnimating(true);
    const step = (now) => {
      // rAF timestamps can precede `start`; clamp so the ease never extrapolates backwards.
      const t = clamp((now - start) / duration, 0, 1);
      const e = 1 - (1 - t) ** 3;
      commitView({
        cx: from.cx + (to.cx - from.cx) * e,
        cy: from.cy + (to.cy - from.cy) * e,
        k: Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e),
      });
      if (t < 1) animationRef.current = requestAnimationFrame(step);
      else stopAnimation('finished');
    };
    animationRef.current = requestAnimationFrame(step);
  }, [commitView, stopAnimation, settle]);

  useEffect(() => () => stopAnimation('interrupted'), [stopAnimation]);

  // Track rendered SVG size to keep markers and hit areas a constant on-screen size.
  useEffect(() => {
    const svg = wrapperRef.current?.querySelector('svg');
    if (!svg || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => setSvgSize({ w: svg.clientWidth, h: svg.clientHeight }));
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const getStateFitView = useCallback((code) => {
    const path = code ? wrapperRef.current?.querySelector(`path[id="${code}"]`) : null;
    if (!path) return HOME_VIEW;
    const box = path.getBBox();
    const k = Math.min(BASE.w / (box.width * 1.3), BASE.h / (box.height * 1.3), STATE_FIT_MAX_ZOOM);
    return clampView({ cx: box.x + box.width / 2, cy: box.y + box.height / 2, k });
  }, []);

  const selectedCode = selectedState?.code || null;
  // The view depends only on the selected state; selecting a city never re-fits or zooms the map.
  const getTargetView = useCallback(() => getStateFitView(selectedCode), [selectedCode, getStateFitView]);

  // India → state fit, driven by the state selection.
  useEffect(() => {
    animateTo(getTargetView());
  }, [getTargetView, animateTo]);

  // ---- Zoom controls ----
  const isZoomed = view.k > 1.001;
  // While zooming, panning or dragging the map draws only state fills and their edges.
  const moving = isAnimating || isDragging;
  const zoomBy = (factor) => animateTo({ ...viewRef.current, k: viewRef.current.k * factor });
  const fitView = () => animateTo(getTargetView());

  // ---- Drag / pinch (only while zoomed) ----
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const suppressClick = useRef(false);

  const beginGesture = () => {
    const svg = wrapperRef.current?.querySelector('svg');
    if (!svg) return;
    const v = viewRef.current;
    const vb = toViewBox(v);
    // From the committed view (not the DOM's CTM, which can trail an animation by a frame).
    const { s, ox, oy } = viewBoxScreenMap(vb, svg.getBoundingClientRect());
    gesture.current = {
      view: v,
      scale: s,
      originX: ox + s * vb.x,
      originY: oy + s * vb.y,
      points: new Map(pointers.current),
      moved: gesture.current?.moved || false,
    };
  };

  const centroid = (map) => {
    const pts = [...map.values()];
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
      spread: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
    };
  };

  const handlePointerDown = (e) => {
    if (!isZoomed || (e.pointerType === 'mouse' && e.button !== 0)) return;
    suppressClick.current = false;
    // A press alone does not stop a running animation (e.g. tapping a city marker during the state
    // zoom lets the zoom finish); it is interrupted only once the press becomes a drag / pinch.
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) gesture.current = null;
    beginGesture();
  };

  const handlePointerMove = (e) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const start = centroid(g.points);
    const now = centroid(pointers.current);
    if (!g.moved) {
      if (Math.hypot(now.x - start.x, now.y - start.y) < DRAG_THRESHOLD_PX && pointers.current.size < 2) return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
      if (animationRef.current) {
        // The drag takes over from a running animation: stop it and re-anchor on the current view.
        stopAnimation('interrupted');
        beginGesture();
        if (gesture.current) gesture.current.moved = true;
        setIsDragging(true);
        return;
      }
      g.moved = true;
      setIsDragging(true);
    }
    const k1 = pointers.current.size > 1 && start.spread > 0
      ? clamp(g.view.k * (now.spread / start.spread), 1, MAX_ZOOM)
      : g.view.k;
    const s1 = g.scale * (k1 / g.view.k);
    const anchorX = toViewBox(g.view).x + (start.x - g.originX) / g.scale;
    const anchorY = toViewBox(g.view).y + (start.y - g.originY) / g.scale;
    const vbX = anchorX - (now.x - g.originX) / s1;
    const vbY = anchorY - (now.y - g.originY) / s1;
    commitView(clampView({ cx: vbX + BASE.w / k1 / 2, cy: vbY + BASE.h / k1 / 2, k: k1 }));
  };

  const handlePointerEnd = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    if (gesture.current?.moved) suppressClick.current = true;
    if (pointers.current.size > 0) beginGesture();
    else {
      gesture.current = null;
      setIsDragging(false);
    }
  };

  const handleClickCapture = (e) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Tap on empty map background (the ocean: the <svg> itself or the viewport box around it) while a
  // state is selected → back to the India view. States, markers, the card and the controls are other
  // targets, so they never count; a drag's click was already cancelled by handleClickCapture.
  const handleViewportClick = (e) => {
    if (!onBackgroundTap || !selectedState) return;
    const svg = wrapperRef.current?.querySelector('svg');
    if (isMapBackgroundTap({ target: e.target, viewport: e.currentTarget, svg, defaultPrevented: e.defaultPrevented })) onBackgroundTap();
  };

  // ---- Markers ----
  const vb = toViewBox(view);
  const pxPerUnit = svgSize.w && svgSize.h ? Math.min(svgSize.w / vb.w, svgSize.h / vb.h) : 1;
  const unit = 1 / pxPerUnit;

  const hitRadiusPx = useMemo(() => {
    const radii = {};
    markers.forEach((m) => {
      const nearest = markers.reduce((min, o) => (o === m ? min : Math.min(min, Math.hypot(o.x - m.x, o.y - m.y))), Infinity);
      radii[m.city] = clamp((nearest * pxPerUnit) / 2, MIN_HIT_RADIUS_PX, MAX_HIT_RADIUS_PX);
    });
    return radii;
  }, [markers, pxPerUnit]);

  const handleMarkerKeyDown = (e, city) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectCity?.(city);
    }
  };

  // India overview: a small bright white dot for every worked city. Decorative (not interactive);
  // hidden while moving and once a state is selected (its cities become pins).
  const overviewCityLayer = !selectedCode && !moving && overviewCities.length > 0 && (
    <g aria-hidden="true" className="pointer-events-none" data-layer="overview-cities">
      {overviewCities.map((c) => (
        <circle key={`${c.stateCode}-${c.city}`} cx={c.x} cy={c.y} r={OVERVIEW_CITY.dotPx * unit} fill="#FFFFFF" fillOpacity={OVERVIEW_CITY.opacity} />
      ))}
    </g>
  );

  const markerLayer = markers.length > 0 && (
    <g role="group" aria-label={`Cities in ${selectedState?.name || 'selected state'}`}>
      {markers.map((m) => {
        const isSelected = selectedCity === m.city;
        const r = MARKER_RADIUS_PX * unit * (isSelected ? 1.3 : 1);
        return (
          <g
            key={m.city}
            transform={`translate(${m.x} ${m.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${m.city}, ${selectedState?.name || ''}`}
            aria-pressed={isSelected}
            className="group cursor-pointer outline-none"
            onClick={() => onSelectCity?.(m.city)}
            onKeyDown={(e) => handleMarkerKeyDown(e, m.city)}
          >
            <title>{m.city}</title>
            <circle r={hitRadiusPx[m.city] * unit} fill="transparent" />
            {!moving && <circle r={r * PIN_HALO.scale} fill="#FFFFFF" fillOpacity={PIN_HALO.opacity} aria-hidden="true" />}
            <circle
              r={r + 5 * unit}
              className="fill-none stroke-brand-accent opacity-0 group-focus-visible:opacity-100"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
            {isSelected && (
              <circle r={r + 3.5 * unit} fill="none" stroke={MAP_COLORS.edge} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            )}
            <circle
              r={r}
              fill="#FFFFFF"
              stroke={MAP_COLORS.land}
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
            {m.count > 0 && (
              <g transform={`translate(${r * 1.1} ${-r * 1.1})`} aria-hidden="true">
                <circle r={7 * unit} className="fill-white" />
                <text textAnchor="middle" dominantBaseline="central" fontSize={9 * unit} className="fill-brand-navy font-bold">
                  {m.count}
                </text>
              </g>
            )}
            {isSelected && (
              <text
                x={r + 7 * unit}
                y={0}
                dominantBaseline="central"
                fontSize={13 * unit}
                stroke="#0B141F"
                strokeWidth={3.5 * unit}
                paintOrder="stroke"
                className="fill-white font-semibold pointer-events-none"
                aria-hidden="true"
              >
                {m.city}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );

  // ---- Geography (district lines) for the selected state ----
  const selectedShape = useMemo(
    () => (selectedCode ? INDIA_MAP_STATES.find((st) => st.id === selectedCode) || null : null),
    [selectedCode]
  );
  const geographyLayer = !moving && selectedShape && geography && geography.stateCode === selectedCode && (
    <g aria-hidden="true" className="pointer-events-none" data-layer="state-geography">
      <defs>
        <clipPath id="presence-selected-state-clip">
          <path d={selectedShape.d} />
        </clipPath>
      </defs>
      <g clipPath="url(#presence-selected-state-clip)">
        <g data-layer="districts">
          {(geography.districts || []).map((dist) => (
            <path
              key={dist.name}
              d={dist.d}
              fill="none"
              stroke={DISTRICT_LINE.color}
              strokeOpacity={DISTRICT_LINE.opacity}
              strokeWidth={DISTRICT_LINE.width}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${dist.name} district`}</title>
            </path>
          ))}
        </g>
      </g>
      {/* Re-draw the state outline above the district lines */}
      <path d={selectedShape.d} fill="none" stroke={MAP_COLORS.edge} strokeWidth={1.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </g>
  );

  // ---- Project markers (verified site coordinates only) ----
  const clusters = useMemo(
    () => clusterPoints(projectMarkers, pxPerUnit, CLUSTER_RADIUS_PX),
    [projectMarkers, pxPerUnit]
  );
  const projectNames = useMemo(
    () => Object.fromEntries(projectMarkers.map((m) => [m.id, m.name])),
    [projectMarkers]
  );

  const openCluster = (cluster) => {
    const pts = projectMarkers.filter((m) => cluster.members.includes(m.id));
    const xs = pts.map((m) => m.x);
    const ys = pts.map((m) => m.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    const current = viewRef.current.k;
    const spread = Math.hypot(spanX, spanY);
    // Would even maximum zoom pull these pins apart on screen? If not (same or very close
    // sites), go straight to the chooser instead of zooming into an empty view.
    const separableAtMax = spread * pxPerUnit * (MAX_ZOOM / current) >= CLUSTER_RADIUS_PX;
    const splitK = current * ((CLUSTER_RADIUS_PX * 1.6) / Math.max(spread * pxPerUnit, 1e-6));
    const targetK = Math.min(MAX_ZOOM, splitK);
    if (separableAtMax && targetK > current * 1.05) {
      animateTo({ cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, k: targetK });
    } else {
      onSelectCluster?.(cluster.members);
    }
  };

  const activateOnKey = (e, fn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const projectLayer = clusters.length > 0 && (
    <g role="group" aria-label={`Project locations in ${selectedState?.name || 'selected state'}`}>
      {clusters.map((c) => {
        const hit = MAX_HIT_RADIUS_PX * unit;
        if (c.members.length > 1) {
          const r = 13 * unit;
          return (
            <g
              key={c.id}
              data-project-ids={c.members.join(' ')}
              transform={`translate(${c.x} ${c.y})`}
              role="button"
              tabIndex={0}
              aria-label={`${c.members.length} projects close together. Zoom in or choose one.`}
              className="group cursor-pointer outline-none"
              onClick={() => openCluster(c)}
              onKeyDown={(e) => activateOnKey(e, () => openCluster(c))}
            >
              <title>{c.members.map((id) => projectNames[id]).join(', ')}</title>
              <circle r={Math.max(hit, r)} fill="transparent" />
              <circle r={r + 5 * unit} className="fill-none stroke-brand-accent opacity-0 group-focus-visible:opacity-100" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              <circle r={r} className="fill-white stroke-brand-navy-dark" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              <text textAnchor="middle" dominantBaseline="central" fontSize={12 * unit} className="fill-brand-navy font-bold pointer-events-none" aria-hidden="true">
                {c.members.length}
              </text>
            </g>
          );
        }
        const id = c.members[0];
        const isSelected = selectedProjectId === id;
        const s = PROJECT_PIN_PX * unit * (isSelected ? 1.35 : 1);
        return (
          <g
            key={c.id}
            data-project-id={id}
            transform={`translate(${c.x} ${c.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${projectNames[id]} — project location`}
            aria-pressed={isSelected}
            className="group cursor-pointer outline-none"
            onClick={() => onSelectProject?.(id)}
            onKeyDown={(e) => activateOnKey(e, () => onSelectProject?.(id))}
          >
            <title>{projectNames[id]}</title>
            <circle r={hit} cy={-s} fill="transparent" />
            <circle r={s + 6 * unit} cy={-s * 1.3} className="fill-none stroke-brand-accent opacity-0 group-focus-visible:opacity-100" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            {/* Pin: tip sits exactly on the verified site coordinate */}
            <path
              d={`M0 0 C ${-s * 0.35} ${-s * 0.6} ${-s} ${-s * 0.95} ${-s} ${-s * 1.6} A ${s} ${s} 0 1 1 ${s} ${-s * 1.6} C ${s} ${-s * 0.95} ${s * 0.35} ${-s * 0.6} 0 0 Z`}
              className={isSelected ? 'fill-brand-accent stroke-white' : 'fill-white stroke-brand-navy-dark group-hover:fill-emerald-50'}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
            <circle r={s * 0.38} cy={-s * 1.6} className={isSelected ? 'fill-white' : 'fill-brand-navy'} />
          </g>
        );
      })}
    </g>
  );

  // Scale bar at city zoom (east–west distance at the reference latitude).
  const scaleBar = (() => {
    if (referenceLat === null || view.k < STATE_FIT_MAX_ZOOM + 0.01 || !svgSize.w) return null;
    const kmPerPx = kmPerUnitAt(referenceLat) * unit;
    const targetKm = kmPerPx * 80;
    const niceKm = [0.5, 1, 2, 5, 10, 20, 50, 100].reduce((best, n) => (n <= targetKm ? n : best), 0.5);
    return { km: niceKm, px: niceKm / kmPerPx };
  })();

  // ---- Bottom-anchored overlay (campus card) ----
  // Always at the bottom of the map container. On wide maps it takes the bottom corner away from the
  // selected city; decided once per city selection so the card does not jump while panning.
  const hasOverlay = Boolean(overlay);
  const overlayKey = hasOverlay ? selectedCity : null;
  const overlayRef = useRef(null);
  // 'reset' = hidden below the map edge, no transition; 'enter' = sliding up / in place.
  const [overlayPhase, setOverlayPhase] = useState('reset');
  const overlayShown = overlayPhase === OVERLAY_ENTER;
  const overlayEntries = useRef(0); // entrances started (exposed for verification)
  const overlaySide = useMemo(() => {
    if (!hasOverlay || svgSize.w < 560) return 'full';
    const m = markers.find((mk) => mk.city === selectedCity);
    return m && (m.x - vb.x) / vb.w < 0.5 ? 'right' : 'left';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOverlay, selectedCity, markers, svgSize.w]);
  const overlayClass = overlaySide === 'full'
    ? 'inset-x-2 bottom-2'
    : `bottom-3 w-[min(24rem,calc(100%-1.5rem))] ${overlaySide === 'right' ? 'right-3' : 'left-3'}`;
  const controlsAtTop = hasOverlay;

  // Pan (map units) needed so the marker sits MARKER_CLEARANCE_PX above the card, measured against the
  // view the map has settled on (viewRef), not an animation frame or a not-yet-rendered viewBox.
  const measureMarkerShift = (m) => {
    const wrapper = wrapperRef.current;
    const card = overlayRef.current;
    const svg = wrapper?.querySelector('svg');
    if (!wrapper || !card || !svg || !m) return 0;
    // Layout box (offset*), unaffected by the card's entrance transform.
    const w = wrapper.getBoundingClientRect();
    const left = w.left + card.offsetLeft;
    const { shiftPx, shiftUnits } = markerClearanceShift({
      marker: m,
      vb: toViewBox(viewRef.current),
      svgRect: svg.getBoundingClientRect(),
      card: { top: w.top + card.offsetTop, left, right: left + card.offsetWidth },
      clearancePx: MARKER_CLEARANCE_PX,
    });
    return shiftPx > MIN_SHIFT_PX ? shiftUnits : 0;
  };

  // On every city selection (also a direct city → city switch while the card is visible): wait until
  // the map has settled (e.g. a state zoom still running), then measure the card's real size against
  // the selected marker. Only if the marker would be hidden by (or within MARKER_CLEARANCE_PX of) the
  // card, pan the map up by exactly that much — zoom (k) unchanged — then replay the card's slide-up
  // entrance (see lib/overlayEntrance.js). A newer selection, Escape or reset deactivates the wait, so
  // a stale callback never moves the map for an old city.
  const overlayShifted = useRef(false);
  useLayoutEffect(() => {
    if (!overlayKey) {
      setOverlayPhase('reset');
      // Card closed (Back / Escape / a city without campus records): undo our own shift, if any.
      if (overlayShifted.current) {
        overlayShifted.current = false;
        animateTo(getTargetView());
      }
      return undefined;
    }
    const m = markers.find((mk) => mk.city === overlayKey);
    overlayEntries.current += 1;
    return startOverlayEntrance({
      waitFor: (go) => {
        let active = true;
        const stopWaiting = whenViewSettles((reason) => {
          if (!active) return;
          // The user took over (drag / pinch): show the card without fighting their gesture.
          if (reason === 'interrupted') {
            go();
            return;
          }
          const shiftUnits = measureMarkerShift(m);
          if (!shiftUnits) {
            go();
            return;
          }
          // Pan only if needed (short, zoom unchanged); the card slides up as soon as the pan ends.
          const v = viewRef.current;
          overlayShifted.current = true;
          animateTo({ ...v, cy: v.cy + shiftUnits }, { duration: MAP_SHIFT_MS, onDone: go });
        });
        return () => {
          active = false;
          stopWaiting();
        };
      },
      setPhase: setOverlayPhase,
      reflow: () => overlayRef.current?.offsetHeight,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayKey]);

  const controlButton =
    'inline-flex items-center justify-center w-11 h-11 text-slate-100 hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent';

  return (
    <div className="relative rounded-2xl border border-white/10 bg-brand-navy/60 p-3 sm:p-6 shadow-[0_0_60px_-20px_rgba(16,185,129,0.25)]">
      {/* Toolbar: selection status. Navigation is by map selection: covered state / city markers
          select; an uncovered state or the empty ocean returns to India. */}
      <div className="relative z-20 mb-2 flex flex-wrap items-center justify-between gap-2">
        {selectedState ? (
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-brand-navy-dark/90 px-3 py-1.5 text-sm font-semibold text-emerald-200 max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {selectedState.name}
                {selectedCity && <span className="text-brand-accent"> · {selectedCity}</span>}
              </span>
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-brand-navy-dark/80 px-3 py-1.5 text-xs font-medium text-slate-300">
            <MousePointerClick className="w-3.5 h-3.5 text-brand-accent" aria-hidden="true" />
            Tap a highlighted state to explore
          </span>
        )}
      </div>

      <div
        ref={wrapperRef}
        className={`relative overflow-hidden rounded-xl ${isZoomed ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ background: MAP_BACKGROUND, touchAction: isZoomed ? 'none' : 'pan-y pinch-zoom' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={handleClickCapture}
        onClick={handleViewportClick}
      >
        <IndiaMapSvg
          variant="dark"
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          activeStateCodes={activeStateCodes}
          selectedStateCode={selectedCode}
          onSelectState={onSelectState}
          onSelectInactiveState={onSelectInactiveState}
          ariaLabel="Map of India highlighting Arham's coverage states"
          svgClassName="w-full h-auto max-h-[75vh] select-none"
          pxUnit={unit}
          moving={moving}
        >
          {geographyLayer}
          {overviewCityLayer}
          {markerLayer}
          {projectLayer}
        </IndiaMapSvg>

        {scaleBar && !overlay && (
          <div className="absolute bottom-2 left-2 z-10 rounded-md bg-brand-navy-dark/80 px-2 py-1 text-[10px] text-slate-300 pointer-events-none" aria-hidden="true">
            <div className="h-1.5 border-x border-b border-slate-300" style={{ width: scaleBar.px }} />
            <span>{scaleBar.km} km</span>
          </div>
        )}

        {overlay && (
          <div
            ref={overlayRef}
            className={`absolute z-20 ${overlayClass} ${
              overlayShown
                ? 'transition-[transform,opacity] duration-300 ease-out translate-y-0 opacity-100'
                : 'transition-none translate-y-[calc(100%+1rem)] opacity-0 pointer-events-none'
            }`}
            data-map-overlay={overlaySide === 'full' ? 'bottom' : `bottom-${overlaySide}`}
            data-overlay-shown={overlayShown ? 'true' : 'false'}
            data-overlay-entries={overlayEntries.current}
          >
            {overlay}
          </div>
        )}

        {/* Zoom controls */}
        <div
          className={`absolute ${controlsAtTop ? 'top-2' : 'bottom-2'} right-2 z-10 flex flex-col overflow-hidden rounded-xl border border-white/15 bg-brand-navy-dark/90 backdrop-blur divide-y divide-white/10`}
          role="group"
          aria-label="Map zoom controls"
        >
          <button type="button" className={controlButton} onClick={() => zoomBy(ZOOM_STEP)} disabled={view.k >= MAX_ZOOM - 0.001} aria-label="Zoom in">
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" className={controlButton} onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={!isZoomed} aria-label="Zoom out">
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={controlButton}
            onClick={fitView}
            aria-label={selectedState ? `Fit map to ${selectedState.name}` : 'Reset map to India'}
          >
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {footer && <div className="mt-3">{footer}</div>}

      {/* Legend & attribution */}
      <div className="mt-3 space-y-1.5 text-center">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-400" aria-label="Map legend">
          <li className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#5C7E1C] border-[1.5px] border-[#D9E35A]" aria-hidden="true" />
            Selected
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#2F4A10] border border-[#D9E35A]/40" aria-hidden="true" />
            Worked locations
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#070A1F]/50 border-[1.5px] border-[#3FD0E6]" aria-hidden="true" />
            Other states
          </li>
          {markers.length > 0 && (
            <li className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#070A1F]" aria-hidden="true" />
              City
            </li>
          )}
          {projectMarkers.length > 0 && (
            <li className="inline-flex items-center gap-1.5">
              <svg viewBox="-10 -26 20 27" className="w-2.5 h-3.5" aria-hidden="true">
                <path d="M0 0 C -3 -5 -9 -9 -9 -15 A 9 9 0 1 1 9 -15 C 9 -9 3 -5 0 0 Z" className="fill-white stroke-brand-navy-dark" strokeWidth="2" />
              </svg>
              Project site
            </li>
          )}
        </ul>
        {isZoomed && (
          <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Move className="w-3 h-3" aria-hidden="true" />
            Drag to pan · pinch or use the controls to zoom
          </p>
        )}
        {markers.length > 0 && (
          <p className="text-[11px] text-slate-500">
            City locations ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded"
            >
              OpenStreetMap contributors
            </a>{' '}
            (ODbL) and Wikipedia
            {geography?.districts?.length > 0 && (
              <>
                {' · '}District boundaries:{' '}
                <a
                  href="https://www.geoboundaries.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded"
                >
                  geoBoundaries
                </a>{' '}
                / LGD (ODbL)
              </>
            )}
          </p>
        )}
        {markers.length === 0 && geography?.districts?.length > 0 && (
          <p className="text-[11px] text-slate-500">
            District boundaries:{' '}
            <a
              href="https://www.geoboundaries.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded"
            >
              geoBoundaries
            </a>{' '}
            / LGD (ODbL)
          </p>
        )}
      </div>
    </div>
  );
};

export default PresenceMap;
