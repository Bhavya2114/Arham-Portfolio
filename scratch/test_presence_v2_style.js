/**
 * /presence map — cheap "neon" styling (presence-neon-v2).
 *
 * Verifies the performance rules (no blur filters, patterns, masks or group opacity, no animation,
 * only fills + edges while moving) and the styles: cyan outlines with a faint echo, one dark olive
 * radial fill for the whole map, a bright outer outline with quieter shared borders, a fake glow made
 * of two faint strokes, 35 % dimming per path, overview city dots,
 * white pins with a yellow ring when selected, a plain CSS navy background and the legend. The
 * homepage light variant keeps its original rendering.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};

const svgSrc = read('../src/components/map/IndiaMapSvg.jsx');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const css = read('../src/styles/index.css');
const presenceSrc = read('../src/pages/Presence.jsx');
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const svgCode = code(svgSrc);
const mapCode = code(mapSrc);

console.log('\n1. Performance rules');
assert(!/feGaussianBlur|<filter|filter=/.test(svgCode + mapCode), 'No SVG blur / filters anywhere on the map');
assert(!/<pattern|<mask|maskImage|WebkitMaskImage/.test(svgCode + mapCode), 'No patterns or masks');
assert((mapCode.match(/<clipPath/g) || []).length === 1 && /presence-selected-state-clip/.test(mapCode) && !/clipPath/.test(svgCode), 'Only the existing district clip-path for the selected state');
assert(!/<g[^>]*\sopacity=\{/.test(svgCode + mapCode), 'No opacity on <g> groups (per-path fill / stroke opacity only)');
assert(!/rotateX|perspective\(|presence-node-pulse|presence-pin-pulse|presence-layer-in/.test(svgCode + mapCode + css) && (css.match(/@keyframes presence-/g) || []).length === 2 && /@keyframes presence-beacon/.test(css) && /@keyframes presence-enter \{\s*from \{ opacity: 0; \}\s*to \{ opacity: 1; \}\s*\}/.test(css), 'No tilt / 3D transforms; map CSS animations are only the pin beacon and the one-time entrance (opacity)');
assert(/const moving = isAnimating \|\| isDragging;/.test(mapSrc) && /moving=\{moving\}/.test(mapSrc), 'Map knows when it is zooming, panning or dragging');
assert(/\{!moving && <g \{\.\.\.deco\} data-layer="outline-echo"/.test(svgSrc) && /\{!moving && <g \{\.\.\.deco\} data-layer="fake-glow">/.test(svgSrc) && /const geographyLayer = !moving &&/.test(mapSrc), 'While moving only state fills and their edges are drawn (echo, fake glow, district lines hidden)');
assert(/\{L\.otherStates\}/.test(svgSrc) && /<g \{\.\.\.deco\} data-layer="edges">\{L\.heroEdge\}<\/g>/.test(svgSrc) && /<g \{\.\.\.deco\} data-layer="region-edges">\{L\.regionLines\}<\/g>/.test(svgSrc), 'Fills and edges always drawn');
assert(/const overviewCityLayer = !selectedCode && !moving && overviewCities\.length > 0 &&/.test(mapSrc), 'Overview city dots hidden while moving');

console.log('\n2. Styles');
assert(/cyan: '#3FD0E6'/.test(svgSrc) && /land: '#070A1F'/.test(svgSrc) && /const OTHER_FILL_OPACITY = 0\.45;/.test(svgSrc) && /stroke=\{MAP_COLORS\.cyan\}\s*strokeWidth=\{1\.5\}/.test(svgSrc), 'Other states: cyan 1.5 px outline over #070A1F at 45 %');
assert(/const ECHO = \{ offsetPx: 3, opacity: 0\.22 \};/.test(svgSrc) && /transform=\{`translate\(0 \$\{ECHO\.offsetPx \* unit\}\)`\}/.test(svgSrc), 'Faint second cyan outline 3 px lower (22 %)');
assert(/workedCenter: '#5C7E1C'/.test(svgSrc) && /workedEdge: '#2F4A10'/.test(svgSrc) && /<radialGradient id="india-map-worked-fill-hover"/.test(svgSrc) && /el\.setAttribute\('fill', `url\(#india-map-worked-fill-\$\{kind\}\)`\);/.test(svgSrc), 'Worked states: dark olive fill, lighter in the centre; brighter on hover (highlight path)');
assert(/const FILL_GRADIENT = \{ cx: 481, cy: 496, r: 440 \};/.test(svgSrc)
  && (svgSrc.match(/<radialGradient id="india-map-worked-fill(-hover)?" gradientUnits="userSpaceOnUse" cx=\{FILL_GRADIENT\.cx\} cy=\{FILL_GRADIENT\.cy\} r=\{FILL_GRADIENT\.r\}>/g) || []).length === 2
  && !/objectBoundingBox|cx="0\.5"/.test(svgCode), 'One gradient for the whole map in map coordinates, centred on central India (fill and hover share the geometry)');
assert(/export const EDGE_YELLOW = '#D9E35A';/.test(svgSrc) && /edge: EDGE_YELLOW/.test(svgSrc) && /const EDGE_WIDTH = 1\.5;/.test(svgSrc), 'One soft yellow edge constant (#D9E35A), 1.5 px');
assert(/const FAKE_GLOW = \[\[10, 0\.07\], \[5, 0\.18\]\];/.test(svgSrc) && /hero \? strokes\(\[hero\], width, opacity, MAP_COLORS\.edge\) : line\(`glow-\$\{width\}`, regionEdges\.outer, width, opacity\)/.test(svgSrc), 'Fake glow: 5 px at 18 % and 10 px at 7 % in the edge yellow, no blur — selected state, or the region outer outline only');
assert(svgSrc.indexOf('{L.litStates}') < svgSrc.indexOf('data-layer="region-edges"') && svgSrc.indexOf('data-layer="region-edges"') < svgSrc.indexOf('data-layer="fake-glow"') && svgSrc.indexOf('data-layer="fake-glow"') < svgSrc.indexOf('data-layer="edges"'), 'Fake glow drawn under the selected edge');
assert(/const SHARED_EDGE = \{ width: 0\.8, opacity: 0\.5 \};/.test(svgSrc) && /line\('shared', regionEdges\.shared, SHARED_EDGE\.width, SHARED_EDGE\.opacity \* regionOpacity\)/.test(svgSrc) && /line\('outer', regionEdges\.outer, EDGE_WIDTH, regionOpacity\)/.test(svgSrc), 'Outer outline 1.5 px bright; borders shared by two worked states 0.8 px at 50 %');
assert(/const regionEdges = useMemo\(\(\) => \{[\s\S]*?splitRegionEdges\([\s\S]*?\}, \[isDark, activeKey\]\);/.test(svgSrc), 'Outer / shared split computed once per coverage set (not per frame)');
assert(/const DIM = 0\.35;/.test(svgSrc) && /dimmedStates: dimmed\.map\(\(state\) => workedState\(state, DIM\)\)/.test(svgSrc) && /const regionOpacity = hero \? DIM : 1;/.test(svgSrc) && /heroEdge: hero \? strokes\(\[hero\], EDGE_WIDTH, 1, MAP_COLORS\.edge\) : null/.test(svgSrc), 'Selected state full brightness; other worked states and region lines at 35 % per path');

const { INDIA_MAP_STATES } = await import(pathToFileURL(path.resolve(here, '../src/components/map/indiaMapGeometry.js')).href);
const { getPresenceStateCodes } = await import(pathToFileURL(path.resolve(here, '../src/data/presenceCoverage.js')).href);
const { splitRegionEdges } = await import(pathToFileURL(path.resolve(here, '../src/components/map/regionEdges.js')).href);
const workedCodes = new Set(getPresenceStateCodes());
const edges = splitRegionEdges(INDIA_MAP_STATES.filter((s) => workedCodes.has(s.id)));
const two = splitRegionEdges([{ d: 'M0 0l10 0l0 10l-10 0z' }, { d: 'M10 0l10 0l0 10l-10 0z' }]);
assert(edges.outer.length > 0 && edges.shared.length > 0 && two.shared === 'M10 0L10 10' && !two.outer.includes('10 0L10 10') && two.outer === 'M0 0L10 0M10 10L0 10 0 0M10 0L20 0 20 10 10 10', 'Edge split: a border between two states is drawn once as shared, everything else as outer');

console.log('\n2b. Overview city dots');
assert(/const OVERVIEW_CITY = \{ dotPx: 1\.5, opacity: 0\.9 \};/.test(mapSrc) && /r=\{OVERVIEW_CITY\.dotPx \* unit\} fill="#FFFFFF" fillOpacity=\{OVERVIEW_CITY\.opacity\}/.test(mapSrc) && !/haloPx|OVERVIEW_CITY\.halo/.test(mapCode), 'Overview: only a ~3 px bright white dot (90 %), no halo');

console.log('\n2c. Zoomed state: districts and pins');
assert(/const DISTRICT_LINE = \{ color: '#1A2A06', opacity: 0\.6, width: 0\.7 \};/.test(mapSrc) && /stroke=\{DISTRICT_LINE\.color\}\s*strokeOpacity=\{DISTRICT_LINE\.opacity\}\s*strokeWidth=\{DISTRICT_LINE\.width\}/.test(mapSrc), 'District lines: dark olive "engraved" lines, 60 %, 0.7 px');
assert(/const PIN_HALO = \{ scale: 2\.2, opacity: 0\.18 \};/.test(mapSrc) && /\{!moving && <circle r=\{r \* PIN_HALO\.scale\} fill="#FFFFFF" fillOpacity=\{PIN_HALO\.opacity\} aria-hidden="true" \/>\}/.test(mapSrc), 'Pin halo: white circle 2.2x the dot at 18 %, no blur, hidden while moving');
assert(/\{isSelected && \(\s*<text[\s\S]*?paintOrder="stroke"[\s\S]*?className="fill-white[^"]*"[\s\S]*?\{m\.city\}/.test(mapSrc), 'Selected pin: city name in white with a dark paint-order outline');
assert(/<g aria-hidden="true" className="pointer-events-none" data-layer="overview-cities">/.test(mapSrc) && /\{overviewCityLayer\}/.test(mapSrc), 'Overview dots are decorative and not interactive');
assert(/overviewCities=\{overviewCities\}/.test(presenceSrc) && /const overviewCities = useMemo\(/.test(presenceSrc), 'Presence page passes every worked city');
assert(/const r = MARKER_RADIUS_PX \* unit \* \(isSelected \? 1\.3 : 1\);/.test(mapSrc) && /const MARKER_RADIUS_PX = 5;/.test(mapSrc) && /fill=\{isSelected \? MAP_COLORS\.edge : '#FFFFFF'\}\s*stroke=\{MAP_COLORS\.land\}/.test(mapSrc), 'City pins: 10 px white dots with a thin dark outline; the selected pin is filled with the edge yellow');
assert(/\{isSelected && !moving && \(\s*<g className="presence-beacon motion-reduce:hidden" aria-hidden="true">\s*<circle r=\{r\} fill="none" stroke=\{MAP_COLORS\.edge\} strokeWidth=\{2\} vectorEffect="non-scaling-stroke" \/>/.test(mapSrc), 'One pulse ring on the selected pin only, removed while moving');
const beacon = (css.match(/@keyframes presence-beacon \{([\s\S]*?)\n\}/) || [])[1] || '';
assert(/0% \{ transform: scale\(1\); opacity: 0\.6; \}/.test(beacon) && /100% \{ transform: scale\(2\.4\); opacity: 0; \}/.test(beacon) && !/(^|[\s{;])(r|stroke-width)\s*:/.test(beacon) && /transform-box: fill-box;\s*transform-origin: center;[\s\S]*?animation: presence-beacon 2s ease-out infinite;/.test(css), 'Pulse: scale 1 to 2.4 while fading 60 % to 0, every 2 s ease-out; animates only transform and opacity');
assert(/@media \(prefers-reduced-motion: reduce\) \{\s*\.presence-beacon \{ animation: none; display: none; \}/.test(css), 'Pulse disabled under prefers-reduced-motion');
assert(/export const PAGE_NAVY = '#070A1F';/.test(mapSrc) && /const MAP_BACKGROUND = `radial-gradient\(ellipse farthest-side at 50% 50%, #0B1030 0%, \$\{PAGE_NAVY\} 100%\)`;/.test(mapSrc) && /style=\{\{\s*background: MAP_BACKGROUND,/.test(mapSrc) && !/dot-grid|DOT_GRID/.test(mapSrc), 'Plain navy radial CSS background (#0B1030 → #070A1F) ending in the page navy, no dot grid');

console.log('\n2d. No boxes around the map');
const presenceCode = code(presenceSrc);
assert(/<div className="relative mx-auto max-w-5xl \[--map-fade:40px\] md:\[--map-fade:80px\]">/.test(mapSrc) && !/rounded-2xl|bg-brand-navy\/60|shadow-\[/.test(mapCode), 'Outer card removed (no border, padding, background, shadow); sensible max width on desktop');
assert(/className=\{`relative overflow-hidden \$\{isZoomed/.test(mapSrc) && !/overflow-hidden rounded-xl/.test(mapSrc), 'Map wrapper keeps overflow-hidden, no rounded box');
assert(/<section aria-labelledby="presence-heading" className="relative overflow-x-clip" style=\{\{ background: PAGE_NAVY \}\}>/.test(presenceSrc) && !/rgba\(16,185,129/.test(presenceCode), 'One page background for the map section; teal ambient glow removed');
const fade = (mapSrc.match(/const EDGE_FADE = \[([\s\S]*?)\]\.join/) || [])[1] || '';
assert((fade.match(/linear-gradient\(to (bottom|top|right|left), \$\{PAGE_NAVY\}, transparent\)/g) || []).length === 4 && /<div className="absolute inset-0 z-10 pointer-events-none" style=\{\{ background: EDGE_FADE \}\} aria-hidden="true" data-layer="edge-fade" \/>/.test(mapSrc), 'Edges hidden by one pointer-events-none overlay: four plain linear gradients, page navy → transparent');
assert(/margin: 'calc\(-1 \* var\(--map-fade\)\)',\s*padding: 'var\(--map-fade\)',/.test(mapSrc) && /overflow-visible/.test(mapSrc), 'Fade band sits outside the content area, so the map itself is never faded (svg spills into it when zoomed)');
assert(/style=\{\{ inset: 'var\(--map-fade\)' \}\} data-map-frame/.test(mapSrc) && /const w = \(card\.offsetParent \|\| wrapper\)\.getBoundingClientRect\(\);/.test(mapSrc), 'Card and scale bar anchored to the map content area (card offsets measured against it)');
assert(/<div className="relative z-20 mb-2 flex/.test(mapSrc) && /<div className="relative z-20 mt-3 space-y-1\.5 text-center">/.test(mapSrc), 'State chip above and legend below float on the page background');
assert(!/Map legend|Worked locations|Other states|Selected city|Project site/.test(mapSrc) && !/<ul/.test(mapCode), 'Legend row and its code removed');
assert(/\{isZoomed && \(\s*<p className="inline-flex items-center gap-1\.5 text-\[11px\] text-slate-500">[\s\S]*?Drag to pan · pinch to zoom/.test(mapSrc), 'Pan hint kept while zoomed');
assert(/<p className="text-\[11px\] text-slate-500">\s*City locations ©/.test(mapSrc) && /href="https:\/\/www\.openstreetmap\.org\/copyright"/.test(mapSrc) && (mapSrc.match(/href="https:\/\/www\.geoboundaries\.org\/"/g) || []).length === 2, 'Attribution (OpenStreetMap / geoBoundaries) kept as small, low-contrast text');

console.log('\n2e. Quiet islands');
assert(/const ISLAND_IDS = new Set\(\['IN-LD', 'IN-AN'\]\);/.test(svgSrc) && /const ISLAND_LINE = \{ width: 0\.8, opacity: 0\.3 \};/.test(svgSrc), 'Lakshadweep and Andaman & Nicobar: faint cyan outline, 0.8 px at 30 %');
assert(/const others = INDIA_MAP_STATES\.filter\(\(state\) => !set\.has\(state\.id\) && !ISLAND_IDS\.has\(state\.id\)\);/.test(svgSrc) && /islands: strokes\(islands, ISLAND_LINE\.width, ISLAND_LINE\.opacity, MAP_COLORS\.cyan\)/.test(svgSrc), 'Islands get no fill and no offset echo (excluded from the other-state layers)');
assert(/<g \{\.\.\.deco\} data-layer="islands">\{L\.islands\}<\/g>/.test(svgSrc) && /vectorEffect="non-scaling-stroke"/.test(svgSrc), 'Islands kept on the map, non-clickable (decorative layer), non-scaling stroke');
assert(!/texture|slab|SLAB/i.test(svgCode + mapCode), 'No texture lines or slab');

console.log('\n3. Structure kept');
assert(/const renderLightState = /.test(svgSrc) && /'fill-blue-50 hover:fill-blue-100'/.test(svgSrc) && /\{!isDark && INDIA_MAP_STATES\.map\(renderLightState\)\}/.test(svgSrc), 'Homepage light variant rendered by its original code path');
assert(/role="button"\s*tabIndex=\{0\}\s*aria-label=\{`\$\{state\.name\} \(\$\{state\.type\}\)`\}\s*aria-pressed=\{selectedStateCode === state\.id\}/.test(svgSrc), 'Worked states keep button role, focus and aria-pressed');
assert(/live\.current = \{ activeSet, onSelectState, onSelectInactiveState, selectedStateCode \};/.test(svgSrc) && /const L = useMemo\(/.test(svgSrc), 'Static layers memoised; handlers read through a ref');

console.log('\n4. Motion (CSS transform / opacity or ref-driven; no per-frame React state; reduced motion off)');
const entranceCss = css.slice(css.indexOf('@keyframes presence-enter'), css.indexOf('.presence-highlight {'));
assert(/new IntersectionObserver\(/.test(mapSrc) && /io\.disconnect\(\);\s*el\.dataset\.entrance = 'play';/.test(mapSrc) && /el\.dataset\.entrance = 'wait';/.test(mapSrc) && /delete el\.dataset\.entrance;/.test(mapSrc), 'Entrance: IntersectionObserver, plays once, driven by a data attribute set through the ref');
assert(/const ENTRANCE = \{ statesFromMs: 250, staggerMs: 80, stateMs: 350, dotsOverlapMs: 150, dotsMs: 300, totalMs: 1500 \};/.test(mapSrc) && /Math\.min\(ENTRANCE\.staggerMs, \(ENTRANCE\.totalMs - fixedMs\) \/ \(count - 1\)\)/.test(mapSrc), 'Entrance timing: outlines 400 ms, states ~80 ms stagger x 350 ms, dots 300 ms, total within 1.5 s');
assert(/\[data-entrance="play"\] \[data-worked\] \{\s*animation: presence-enter 350ms ease-out both;\s*animation-delay: calc\(250ms \+ var\(--enter-i, 0\) \* var\(--enter-stagger, 80ms\)\);/.test(css) && /const enterOrder = new Map\(\[\.\.\.worked\]\.sort\(\(a, b\) => pathCentreX\(a\.d\) - pathCentreX\(b\.d\)\)/.test(svgSrc) && /style=\{\{ '--enter-i': enterOrder\.get\(state\.id\) \}\}/.test(svgSrc), 'Worked states light up one by one, west → east, opacity per path');
assert(!/transform|filter|blur/.test(entranceCss.replace(/\/\*[\s\S]*?\*\//g, '')) && !/<g[^>]*\sopacity=/.test(svgCode + mapCode), 'Entrance animates only opacity, per path (no group opacity, no blur)');
assert(/const handlePointerDown = \(e\) => \{\s*stopEntrance\.current\(\);/.test(mapSrc) && /useEffect\(\(\) => \{\s*if \(selectedCode\) stopEntrance\.current\(\);/.test(mapSrc), 'A tap / selection during the entrance skips to the end state (taps are never blocked)');
assert(/const TAP_FLASH_MS = 120;/.test(svgSrc) && /const TAP_SELECT_DELAY_MS = 60;/.test(svgSrc) && /flashState\(state\);\s*setTimeout\(\(\) => handleStateClick\(state\), TAP_SELECT_DELAY_MS\);/.test(svgSrc) && /<radialGradient id="india-map-worked-fill-tap"/.test(svgSrc), 'Tap feedback: brighter flash on the tapped state; zoom delayed by only 60 ms');
assert(/if \(e\.pointerType !== 'mouse' \|\| !canHover\(\)\) return;/.test(svgSrc) && /matchMedia\?\.\('\(hover: hover\)'\)/.test(svgSrc) && /\.presence-highlight \{\s*opacity: 0;\s*transition: opacity 150ms ease-out;/.test(css) && !/hover:\[fill/.test(svgSrc), 'Desktop hover: only mouse on hover devices, 150 ms opacity transition, nothing on touch');
assert(/<path ref=\{highlightRef\} className="presence-highlight pointer-events-none" aria-hidden="true" data-layer="state-highlight" \/>/.test(svgSrc), 'One highlight path updated through a ref (no React re-render)');
assert(/const RUBBER = \{ maxPx: 30, softnessPx: 120, backMs: 400, easing: 'cubic-bezier\(0\.34, 1\.56, 0\.64, 1\)' \};/.test(mapSrc) && /if \(!isZoomed && e\.pointerType === 'mouse' && e\.button === 0 && !prefersReducedMotion\(\)\)/.test(mapSrc) && /r\.el\.style\.transform = `translate3d\(/.test(mapSrc), 'Rubber band: mouse only at the overview, CSS transform through a ref, max 30 px');
assert(/if \(r\.moved\) \{\s*suppressClick\.current = true;/.test(mapSrc) && /el\.style\.transition = `transform \$\{RUBBER\.backMs\}ms \$\{RUBBER\.easing\}`;/.test(mapSrc), 'Rubber band springs back (400 ms overshoot) and a drag never counts as a click');
assert(/if \(!el \|\| prefersReducedMotion\(\) \|\| typeof IntersectionObserver === 'undefined'\) return undefined;/.test(mapSrc) && /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\[data-entrance\][\s\S]*?\.presence-highlight \{ transition: none; \}/.test(css) && /if \(prefersReducedMotion\(\)\) \{\s*handleStateClick\(state\);\s*return;/.test(svgSrc), 'Reduced motion: no entrance, no rubber band, no tap flash, no hover transition');
assert(/const same = Math\.abs\(from\.cx - to\.cx\) < 1e-6/.test(mapSrc) && /if \(prefersReducedMotion\(\) \|\| same\) \{/.test(mapSrc), 'No pointless animation (and per-frame re-render) when the view does not change');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
