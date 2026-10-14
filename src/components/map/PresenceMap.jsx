import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, MousePointerClick, Plus, Minus, Maximize2, Move } from 'lucide-react';
import IndiaMapSvg from './IndiaMapSvg';

/**
 * Our Presence Map Canvas — Phase C
 *
 * Dark-themed wrapper around the shared `IndiaMapSvg` geometry for the /presence page.
 * - Selecting a state animates the viewBox to fit that state (instant under reduced motion).
 * - Zoom in / out / fit controls; drag (mouse or one finger) and pinch to pan/zoom once zoomed.
 *   At the India overview the map never captures touch, so the page scrolls normally.
 * - Gold city markers (positions projected from `cityCoordinates.js`) appear only for the
 *   selected state, with enlarged invisible hit areas sized to avoid overlapping neighbours.
 */

// Crops the 1000×1000 source canvas to the geometry extent (x 100–900, y 45–955) plus a small margin.
const BASE = { x: 80, y: 30, w: 840, h: 940 };
const PRESENCE_MAP_VIEWBOX = `${BASE.x} ${BASE.y} ${BASE.w} ${BASE.h}`;
const HOME_VIEW = { cx: BASE.x + BASE.w / 2, cy: BASE.y + BASE.h / 2, k: 1 };
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.6;
const DRAG_THRESHOLD_PX = 6;
const MARKER_RADIUS_PX = 5;
const MAX_HIT_RADIUS_PX = 22;
const MIN_HIT_RADIUS_PX = 12;

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
  onReset,
  markers = [],
  selectedCity = null,
  onSelectCity,
  toolbar = null,
}) => {
  const wrapperRef = useRef(null);
  const [view, setView] = useState(HOME_VIEW);
  const viewRef = useRef(HOME_VIEW);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const commitView = useCallback((next) => {
    viewRef.current = next;
    setView(next);
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setIsAnimating(false);
  }, []);

  const animateTo = useCallback((target) => {
    stopAnimation();
    const to = clampView(target);
    if (prefersReducedMotion()) {
      commitView(to);
      return;
    }
    const from = viewRef.current;
    const duration = 550;
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
      else stopAnimation();
    };
    animationRef.current = requestAnimationFrame(step);
  }, [commitView, stopAnimation]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

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
    const k = Math.min(BASE.w / (box.width * 1.3), BASE.h / (box.height * 1.3));
    return clampView({ cx: box.x + box.width / 2, cy: box.y + box.height / 2, k });
  }, []);

  const selectedCode = selectedState?.code || null;
  useEffect(() => {
    animateTo(getStateFitView(selectedCode));
  }, [selectedCode, animateTo, getStateFitView]);

  // ---- Zoom controls ----
  const isZoomed = view.k > 1.001;
  const zoomBy = (factor) => animateTo({ ...viewRef.current, k: viewRef.current.k * factor });
  const fitView = () => animateTo(getStateFitView(selectedCode));

  // ---- Drag / pinch (only while zoomed) ----
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const suppressClick = useRef(false);

  const beginGesture = () => {
    const svg = wrapperRef.current?.querySelector('svg');
    const ctm = svg?.getScreenCTM();
    if (!ctm) return;
    const v = viewRef.current;
    const vb = toViewBox(v);
    gesture.current = {
      view: v,
      scale: ctm.a,
      originX: ctm.e + ctm.a * vb.x,
      originY: ctm.f + ctm.d * vb.y,
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
    stopAnimation();
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
      g.moved = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
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
    else gesture.current = null;
  };

  const handleClickCapture = (e) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
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

  const markerLayer = markers.length > 0 && (
    <g role="group" aria-label={`Cities in ${selectedState?.name || 'selected state'}`}>
      {markers.map((m) => {
        const isSelected = selectedCity === m.city;
        const r = MARKER_RADIUS_PX * unit * (isSelected ? 1.4 : 1);
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
            <circle
              r={r + 5 * unit}
              className="fill-none stroke-brand-accent opacity-0 group-focus-visible:opacity-100"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
            {isSelected && (
              <circle r={r + 3.5 * unit} className="fill-brand-accent/25 stroke-white" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            )}
            <circle
              r={r}
              className="fill-brand-accent stroke-brand-navy-dark group-hover:fill-amber-300 transition-colors"
              strokeWidth={1.5}
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

  const controlButton =
    'inline-flex items-center justify-center w-11 h-11 text-slate-100 hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent';

  return (
    <div className="relative rounded-2xl border border-white/10 bg-brand-navy/60 p-3 sm:p-6 shadow-[0_0_60px_-20px_rgba(16,185,129,0.25)]">
      {/* Toolbar: selection status, return to India and caller-supplied controls (e.g. location list) */}
      <div className="relative z-20 mb-2 flex flex-wrap items-center justify-between gap-2">
        {selectedState ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 min-h-[44px] rounded-full border border-white/15 bg-brand-navy-dark/90 px-3.5 text-sm font-medium text-slate-100 hover:border-emerald-300/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to India</span>
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-brand-navy-dark/90 px-3 py-1.5 text-sm font-semibold text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
              {selectedState.name}
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-brand-navy-dark/80 px-3 py-1.5 text-xs font-medium text-slate-300">
            <MousePointerClick className="w-3.5 h-3.5 text-brand-accent" aria-hidden="true" />
            Tap a highlighted state to explore
          </span>
        )}
        {/* ml-auto keeps caller controls (and their right-anchored popovers) at the right edge when the row wraps */}
        {toolbar && <div className="ml-auto">{toolbar}</div>}
      </div>

      <div
        ref={wrapperRef}
        className={`relative overflow-hidden rounded-xl ${isZoomed ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ touchAction: isZoomed ? 'none' : 'pan-y pinch-zoom' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={handleClickCapture}
      >
        <IndiaMapSvg
          variant="dark"
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          activeStateCodes={activeStateCodes}
          selectedStateCode={selectedCode}
          onSelectState={onSelectState}
          ariaLabel="Map of India highlighting Arham's coverage states"
          svgClassName="w-full h-auto max-h-[75vh] select-none"
          showGlow={!isZoomed && !isAnimating}
        >
          {markerLayer}
        </IndiaMapSvg>

        {/* Zoom controls */}
        <div
          className="absolute bottom-2 right-2 z-10 flex flex-col overflow-hidden rounded-xl border border-white/15 bg-brand-navy-dark/90 backdrop-blur divide-y divide-white/10"
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

      {/* Legend & attribution */}
      <div className="mt-3 space-y-1.5 text-center">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-400" aria-label="Map legend">
          <li className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-600/70 border border-emerald-300/80" aria-hidden="true" />
            Coverage state
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-100" aria-hidden="true" />
            Selected
          </li>
          {markers.length > 0 ? (
            <li className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-accent border border-brand-navy-dark" aria-hidden="true" />
              City
            </li>
          ) : (
            <li className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#16263A] border border-slate-600" aria-hidden="true" />
              Other states
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
          </p>
        )}
      </div>
    </div>
  );
};

export default PresenceMap;
