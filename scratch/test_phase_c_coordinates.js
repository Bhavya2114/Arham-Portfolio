/**
 * Phase C Verification Test Suite: City Coordinate Research & Projection Validation
 *
 * Verifies:
 * 1. Exactly one coordinate record per coverage city; no extra cities; none for Uttar Pradesh.
 * 2. Every record cites a primary source and an independent cross-check with URLs.
 * 3. Primary and cross-check coordinates agree within 5 km.
 * 4. Both coordinates, projected with mapProjection.js, fall inside the city's own state outline.
 * 5. Approved coordinates are consumed only by the /presence page (markers), with OSM attribution;
 *    the homepage preview does not use them.
 * 6. Phase C UI wiring: markers per state, Uttar Pradesh without markers, zoom controls,
 *    city list alternative, bottom sheet / desktop panel and empty-project neutrality.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CITY_COORDINATES, CITY_COORDINATES_STATUS } from '../src/data/cityCoordinates.js';
import { PRESENCE_COVERAGE, getPresenceState } from '../src/data/presenceCoverage.js';
import { PROJECTS } from '../src/data/projects.js';
import { getPublishedProjectsByStateAndCity } from '../src/data/projectSelectors.js';
import { projectLatLon } from '../src/lib/mapProjection.js';
import { INDIA_MAP_STATES } from '../src/components/map/indiaMapGeometry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

const assert = (condition, description) => {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${description}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${description}`);
  }
};

// Absolute polygon rings from the geometry's M/m/l/z path data
const parseRings = (d) => {
  const toks = d.match(/[MmLlZz]|-?\d*\.?\d+/g);
  const rings = [];
  let ring, cmd, x = 0, y = 0, sx = 0, sy = 0, i = 0;
  while (i < toks.length) {
    const t = toks[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t;
      i++;
      if (cmd === 'z' || cmd === 'Z') { x = sx; y = sy; }
      continue;
    }
    const a = +toks[i], b = +toks[i + 1];
    i += 2;
    if (cmd === 'M' || cmd === 'm') {
      if (cmd === 'M') { x = a; y = b; } else { x += a; y += b; }
      sx = x; sy = y;
      ring = [[x, y]];
      rings.push(ring);
      cmd = cmd === 'M' ? 'L' : 'l';
    } else {
      if (cmd === 'l') { x += a; y += b; } else { x = a; y = b; }
      ring.push([x, y]);
    }
  }
  return rings;
};

const isInside = (rings, px, py) => {
  let inside = false;
  rings.forEach((r) => {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i];
      const [xj, yj] = r[j];
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
  });
  return inside;
};

const haversineKm = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

const ringsByState = Object.fromEntries(INDIA_MAP_STATES.map((s) => [s.id, parseRings(s.d)]));
const key = (stateCode, city) => `${stateCode}|${city}`;

console.log('1. Coverage Completeness:');
const expectedKeys = PRESENCE_COVERAGE.flatMap((e) => e.cities.map((c) => key(e.stateCode, c))).sort();
const actualKeys = CITY_COORDINATES.map((c) => key(c.stateCode, c.city)).sort();
assert(CITY_COORDINATES.length === 27, `27 coordinate records (got ${CITY_COORDINATES.length})`);
assert(actualKeys.join(',') === expectedKeys.join(','), 'Records match the 27 coverage cities exactly (no extras, none missing)');
assert(new Set(actualKeys).size === actualKeys.length, 'No duplicate city records');
assert(!CITY_COORDINATES.some((c) => c.stateCode === 'IN-UP'), 'No coordinate record for Uttar Pradesh');
assert(CITY_COORDINATES_STATUS === 'approved', 'Coordinate record is marked approved');

console.log('\n2. Sources, Agreement & Projection per City:');
CITY_COORDINATES.forEach((c) => {
  const hasSources =
    /^https:\/\/(www\.openstreetmap\.org|en\.wikipedia\.org)\//.test(c.source?.url || '') &&
    /^https:\/\/(www\.openstreetmap\.org|en\.wikipedia\.org)\//.test(c.crossCheck?.url || '') &&
    c.source.name !== c.crossCheck.name;
  const distance = haversineKm(c, c.crossCheck);
  const rings = ringsByState[c.stateCode];
  const p1 = projectLatLon(c.lat, c.lon);
  const p2 = projectLatLon(c.crossCheck.lat, c.crossCheck.lon);
  const inState = isInside(rings, p1.x, p1.y) && isInside(rings, p2.x, p2.y);
  assert(
    hasSources && distance <= 5 && inState,
    `${c.city}: two independent sources, Δ ${distance.toFixed(2)} km, projected inside ${c.stateCode}`
  );
});

console.log('\n3. Coordinate Consumers & Attribution:');
const srcFiles = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
  const full = path.join(dir, d.name);
  if (d.isDirectory()) walk(full);
  else if (/\.jsx$/.test(d.name)) srcFiles.push(full);
});
walk(path.resolve(__dirname, '../src'));
const consumers = srcFiles
  .filter((f) => /from ['"][^'"]*cityCoordinates/.test(fs.readFileSync(f, 'utf-8')))
  .map((f) => path.relative(path.resolve(__dirname, '../src'), f).replace(/\\/g, '/'));
assert(consumers.join(',') === 'pages/Presence.jsx', `Only pages/Presence.jsx reads cityCoordinates.js (got ${consumers.join(', ')})`);
const read = (rel) => fs.readFileSync(path.resolve(__dirname, rel), 'utf-8');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const creditsSrc = read('../src/components/map/MapCredits.jsx');
assert(creditsSrc.includes('https://www.openstreetmap.org/copyright') && creditsSrc.includes('OpenStreetMap contributors'), 'Map shows OpenStreetMap attribution (Map data popover)');
assert(/<MapCredits cities=\{markers\.length > 0\}/.test(mapSrc) && /if \(!cities && !districts\) return null;/.test(creditsSrc), 'Attribution is available whenever markers are visible');

console.log('\n4. Phase C Marker Wiring:');
// Mirrors the marker derivation in Presence.jsx
const markersFor = (code) => {
  const state = getPresenceState(code);
  return CITY_COORDINATES.filter((c) => c.stateCode === code && state.cities.includes(c.city));
};
PRESENCE_COVERAGE.forEach((entry) => {
  assert(markersFor(entry.stateCode).length === entry.cities.length, `${entry.stateCode}: ${entry.cities.length} markers for ${entry.cities.length} supplied cities`);
});
assert(markersFor('IN-UP').length === 0, 'Uttar Pradesh stays highlighted with no city marker');
assert(CITY_COORDINATES.every((c) => getPublishedProjectsByStateAndCity(c.stateCode, c.city).length === 0), 'All marker project counts are 0 (no badges rendered)');
assert(Array.isArray(PROJECTS) && PROJECTS.length === 0, 'PROJECTS remains empty');
assert(!mapSrc.includes('aria-label="Zoom in"') && !mapSrc.includes('aria-label="Zoom out"') && !mapSrc.includes('Fit map to') && !/Map zoom controls/.test(mapSrc), 'Zoom in / out / fit controls removed (no replacement button)');
assert(mapSrc.includes('prefers-reduced-motion'), 'Zoom animation respects prefers-reduced-motion');
assert(mapSrc.includes("touchAction: isZoomed ? 'none' : 'pan-y pinch-zoom'"), 'Map captures touch only while zoomed (page scroll unaffected at overview)');
assert(mapSrc.includes('role="button"') && mapSrc.includes('tabIndex={0}') && mapSrc.includes('aria-pressed={isSelected}'), 'Markers are keyboard-operable buttons');
const pageSrc = read('../src/pages/Presence.jsx');
assert(!/LocationExplorer|Explore locations/.test(pageSrc), '"Explore locations" button removed (navigation is by map selection)');
assert(!pageSrc.includes('States we cover'), 'No permanent "States we cover" grid on the India overview');
// Our Work: the city's sheet (phones) or side panel (desktop) opens once a city is chosen.
assert(/\{isDesktop && level && \(/.test(pageSrc) && /\{!isDesktop && level && \(/.test(pageSrc), 'Desktop side panel and phone sheet render only while a city (or a project in it) is open — never both');
assert(/<aside[\s\S]*?w-\[400px\]/.test(pageSrc) && pageSrc.includes('<ProjectSheet'), 'Desktop ~400 px side panel + phone bottom sheet');
assert((pageSrc.match(/dispatch\(\{ type: 'selectCity'/g) || []).length === 1 && /onSelectCity=\{selectCity\}/.test(pageSrc) && /const selectCity = \(city\) => dispatch\(\{ type: 'selectCity', stateCode: nav\.stateCode, city, groupId: singleGroupOf\(nav\.stateCode, city\) \}\);/.test(pageSrc) && /dispatch\(\{ type: 'selectProject', projectId, city: p\.city, groupId: groupIdOf\(p\), autoGroup \}\)/.test(pageSrc), 'City markers drive the selected city (its only group opens directly); a tapped project pin opens its project in its own city and group (one reducer)');
const sheetSrc = read('../src/components/presence/ProjectSheet.jsx');
assert(sheetSrc.includes('lg:hidden') && /snap === 'full'/.test(sheetSrc) && /const HALF = 0\.5;/.test(sheetSrc), 'Bottom sheet is phone-only with half and full snap points');
assert(sheetSrc.includes("'Collapse panel' : 'Expand panel'") && read('../src/components/presence/ProjectBrowser.jsx').includes('return to the map'), 'Sheet has expand / collapse and close buttons');
const statusSrc = read('../src/components/presence/ProjectBrowser.jsx');
assert(statusSrc.includes('Project photos for ${city} are on the way.'), 'A city without projects shows a compact, honest empty state');
const previewSrc = read('../src/sections/PresenceTeaser.jsx');
assert(!previewSrc.includes('PresenceMap') && !previewSrc.includes('cityCoordinates'), 'Homepage teaser does not use markers or the Phase C map (static image only)');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
