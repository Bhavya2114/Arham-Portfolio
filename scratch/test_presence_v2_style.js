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
assert(!/rotateX|perspective\(|presence-node-pulse|presence-pin-pulse|presence-layer-in/.test(svgCode + mapCode + css), 'No tilt / 3D transforms and no map CSS animations');
assert(/const moving = isAnimating \|\| isDragging;/.test(mapSrc) && /moving=\{moving\}/.test(mapSrc), 'Map knows when it is zooming, panning or dragging');
assert(/\{!moving && <g \{\.\.\.deco\} data-layer="outline-echo"/.test(svgSrc) && /\{!moving && <g \{\.\.\.deco\} data-layer="fake-glow">/.test(svgSrc) && /const geographyLayer = !moving &&/.test(mapSrc), 'While moving only state fills and their edges are drawn (echo, fake glow, district lines hidden)');
assert(/\{L\.otherStates\}/.test(svgSrc) && /<g \{\.\.\.deco\} data-layer="edges">\{L\.heroEdge\}<\/g>/.test(svgSrc) && /<g \{\.\.\.deco\} data-layer="region-edges">\{L\.regionLines\}<\/g>/.test(svgSrc), 'Fills and edges always drawn');
assert(/const overviewCityLayer = !selectedCode && !moving && overviewCities\.length > 0 &&/.test(mapSrc), 'Overview city dots hidden while moving');

console.log('\n2. Styles');
assert(/cyan: '#3FD0E6'/.test(svgSrc) && /land: '#070A1F'/.test(svgSrc) && /const OTHER_FILL_OPACITY = 0\.45;/.test(svgSrc) && /stroke=\{MAP_COLORS\.cyan\}\s*strokeWidth=\{1\.5\}/.test(svgSrc), 'Other states: cyan 1.5 px outline over #070A1F at 45 %');
assert(/const ECHO = \{ offsetPx: 3, opacity: 0\.22 \};/.test(svgSrc) && /transform=\{`translate\(0 \$\{ECHO\.offsetPx \* unit\}\)`\}/.test(svgSrc), 'Faint second cyan outline 3 px lower (22 %)');
assert(/workedCenter: '#5C7E1C'/.test(svgSrc) && /workedEdge: '#2F4A10'/.test(svgSrc) && /hover:\[fill:url\(#india-map-worked-fill-hover\)\]/.test(svgSrc), 'Worked states: dark olive fill, lighter in the centre; brighter on hover');
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
assert(/const OVERVIEW_CITY = \{ dotPx: 2, haloPx: 6, haloOpacity: 0\.18 \};/.test(mapSrc) && /r=\{OVERVIEW_CITY\.dotPx \* unit\} fill="#FFFFFF"/.test(mapSrc) && /r=\{OVERVIEW_CITY\.haloPx \* unit\} fill="#FFFFFF" fillOpacity=\{OVERVIEW_CITY\.haloOpacity\}/.test(mapSrc), '~4 px white dot over a faint see-through white halo (no blur)');
assert(/<g aria-hidden="true" className="pointer-events-none" data-layer="overview-cities">/.test(mapSrc) && /\{overviewCityLayer\}/.test(mapSrc), 'Overview dots are decorative and not interactive');
assert(/overviewCities=\{overviewCities\}/.test(presenceSrc) && /const overviewCities = useMemo\(/.test(presenceSrc), 'Presence page passes every worked city');
assert(/const r = MARKER_RADIUS_PX \* unit \* \(isSelected \? 1\.3 : 1\);/.test(mapSrc) && /const MARKER_RADIUS_PX = 5;/.test(mapSrc) && /fill="#FFFFFF"\s*stroke=\{MAP_COLORS\.land\}/.test(mapSrc) && /fill="none" stroke=\{MAP_COLORS\.edge\} strokeWidth=\{2\}/.test(mapSrc), 'City pins: 10 px white dots with a thin dark outline; selected bigger with a yellow ring; no pulse');
assert(/const MAP_BACKGROUND = 'radial-gradient\(ellipse at 50% 45%, #0B1030 0%, #070A1F 100%\)';/.test(mapSrc) && /style=\{\{ background: MAP_BACKGROUND,/.test(mapSrc) && !/dot-grid|DOT_GRID/.test(mapSrc), 'Plain navy radial CSS background, no dot grid');
assert(/>\s*Selected\s*</.test(mapSrc) && /border-\[#D9E35A\]/.test(mapSrc) && /Worked locations/.test(mapSrc) && /Other states/.test(mapSrc) && /bg-white border border-\[#070A1F\]/.test(mapSrc), 'Legend: Selected, Worked locations, Other states, City');
assert(!/texture|slab|SLAB/i.test(svgCode + mapCode), 'No texture lines or slab');

console.log('\n3. Structure kept');
assert(/const renderLightState = /.test(svgSrc) && /'fill-blue-50 hover:fill-blue-100'/.test(svgSrc) && /\{!isDark && INDIA_MAP_STATES\.map\(renderLightState\)\}/.test(svgSrc), 'Homepage light variant rendered by its original code path');
assert(/role="button"\s*tabIndex=\{0\}\s*aria-label=\{`\$\{state\.name\} \(\$\{state\.type\}\)`\}\s*aria-pressed=\{selectedStateCode === state\.id\}/.test(svgSrc), 'Worked states keep button role, focus and aria-pressed');
assert(/live\.current = \{ activeSet, onSelectState, onSelectInactiveState \};/.test(svgSrc) && /const L = useMemo\(/.test(svgSrc), 'Static layers memoised; handlers read through a ref');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
