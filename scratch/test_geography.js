/**
 * Geographic Boundary Verification Suite: district lines + city areas on /presence
 *
 * Verifies:
 * 1. Every coverage state has a lazily loadable geography module with district lines.
 * 2. District geometry aligns with the existing state outlines (shared projection).
 * 3. City areas: only approved cities; each contains its approved reference point and lies
 *    inside its own state; sources and licences recorded; rejected/unlicensed cities absent.
 * 4. Lazy loading: no static imports of the geography modules; homepage untouched.
 * 5. UI wiring: clipped district layer, selected city highlight, city-area fit, fallback
 *    view + honest copy when no boundary exists, attribution, uncovered-state styling.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { PRESENCE_COVERAGE, getPresenceCities } from '../src/data/presenceCoverage.js';
import { CITY_COORDINATES } from '../src/data/cityCoordinates.js';
import { projectLatLon } from '../src/lib/mapProjection.js';
import { INDIA_MAP_STATES } from '../src/components/map/indiaMapGeometry.js';
import { hasStateGeography } from '../src/data/geo/stateGeography.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (rel) => fs.readFileSync(path.resolve(__dirname, rel), 'utf-8');

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

// Path parsing supports both the source geometry (M/m/l/z) and generated paths (M/L/Z).
const parseRings = (d) => {
  const toks = d.match(/[MmLlZz]|-?\d*\.?\d+/g) || [];
  const rings = [];
  let ring, cmd, x = 0, y = 0, sx = 0, sy = 0, i = 0;
  while (i < toks.length) {
    const t = toks[i];
    if (/[A-Za-z]/.test(t)) { cmd = t; i++; if (cmd === 'z' || cmd === 'Z') { x = sx; y = sy; } continue; }
    const a = +toks[i], b = +toks[i + 1]; i += 2;
    if (cmd === 'M' || cmd === 'm') {
      if (cmd === 'M') { x = a; y = b; } else { x += a; y += b; }
      sx = x; sy = y; ring = [[x, y]]; rings.push(ring); cmd = cmd === 'M' ? 'L' : 'l';
    } else { if (cmd === 'l') { x += a; y += b; } else { x = a; y = b; } ring.push([x, y]); }
  }
  return rings;
};
const inside = (rings, px, py) => {
  let c = false;
  rings.forEach((r) => { for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c; } });
  return c;
};
const distToRings = (rings, px, py) => {
  let m = Infinity;
  rings.forEach((r) => { for (let i = 0; i < r.length - 1; i++) { const [x1, y1] = r[i], [x2, y2] = r[i + 1]; const dx = x2 - x1, dy = y2 - y1; const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1))); m = Math.min(m, Math.hypot(px - x1 - t * dx, py - y1 - t * dy)); } });
  return m;
};

const stateRings = Object.fromEntries(INDIA_MAP_STATES.map((s) => [s.id, parseRings(s.d)]));
const modules = {};
for (const { stateCode } of PRESENCE_COVERAGE) {
  const file = path.resolve(__dirname, `../src/data/geo/states/${stateCode}.js`);
  modules[stateCode] = fs.existsSync(file) ? (await import(pathToFileURL(file).href)).default : null;
}

console.log('1. State Geography Modules & District Lines:');
const EXPECTED_DISTRICTS = { 'IN-RJ': 33, 'IN-MH': 36, 'IN-UP': 75, 'IN-BR': 38, 'IN-GA': 2 };
PRESENCE_COVERAGE.forEach(({ stateCode }) => {
  const m = modules[stateCode];
  assert(m && m.stateCode === stateCode && hasStateGeography(stateCode), `${stateCode}: geography module present and registered`);
  assert(m && Array.isArray(m.districts) && m.districts.length > 0 && m.districts.every((d) => d.name && /^M[\d.]/.test(d.d)), `${stateCode}: ${m?.districts?.length ?? 0} district outlines`);
});
Object.entries(EXPECTED_DISTRICTS).forEach(([code, n]) => {
  assert(modules[code].districts.length === n, `${code} has the ${n} districts of the 2021 dataset`);
});
assert(!hasStateGeography('IN-KA') && !hasStateGeography('IN-DL'), 'No geography modules for uncovered states');

console.log('\n2. District Alignment with State Outlines (shared projection):');
PRESENCE_COVERAGE.forEach(({ stateCode }) => {
  let total = 0, aligned = 0;
  modules[stateCode].districts.forEach((d) => parseRings(d.d).flat().forEach(([x, y]) => {
    total++;
    if (inside(stateRings[stateCode], x, y) || distToRings(stateRings[stateCode], x, y) <= 1.5) aligned++;
  }));
  assert(aligned / total >= 0.98, `${stateCode}: ${((100 * aligned) / total).toFixed(1)}% of district points within the state outline (±1.5 units ≈ 6 km)`);
});

console.log('\n3. City Areas:');
const allCityAreas = PRESENCE_COVERAGE.flatMap(({ stateCode }) => Object.entries(modules[stateCode].cities || {}).map(([city, area]) => ({ stateCode, city, area })));
assert(allCityAreas.length === 27, `27 city outlines (got ${allCityAreas.length})`);
PRESENCE_COVERAGE.forEach(({ stateCode, cities }) => {
  assert(cities.every((c) => modules[stateCode].cities[c]) && Object.keys(modules[stateCode].cities).every((c) => cities.includes(c)), `${stateCode}: every approved city has an outline and no extra cities (${cities.length})`);
});
const shoelace = (r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
assert(new Set(allCityAreas.map((c) => c.stateCode)).size >= 6, 'City areas span at least 6 states');
allCityAreas.forEach(({ stateCode, city, area }) => {
  const approved = getPresenceCities(stateCode).includes(city);
  const ref = CITY_COORDINATES.find((c) => c.stateCode === stateCode && c.city === city);
  const p = projectLatLon(ref.lat, ref.lon);
  const rings = parseRings(area.d);
  const pts = rings.flat();
  const inState = pts.filter(([x, y]) => inside(stateRings[stateCode], x, y) || distToRings(stateRings[stateCode], x, y) <= 0.5).length / pts.length;
  const [minX, minY, maxX, maxY] = area.bbox;
  const bboxOk = pts.every(([x, y]) => x >= minX - 0.01 && x <= maxX + 0.01 && y >= minY - 0.01 && y <= maxY + 0.01);
  const sourceOk = area.source && /^https:\/\//.test(area.source.url) && ['ODbL 1.0', 'MIT', 'CC BY 4.0', 'CC BY-SA 2.5 IN', 'Public domain'].includes(area.source.licence);
  assert(
    approved && inside(rings, p.x, p.y) && inState >= 0.95 && bboxOk && sourceOk && ['municipal', 'municipal-equivalent', 'osm-place-area', 'urban-footprint'].includes(area.kind),
    `${city} (${stateCode}): approved, contains reference point, ${(inState * 100).toFixed(0)}% in state, ${area.kind}, ${area.source.licence}`
  );
});
const official = (k) => ['municipal', 'municipal-equivalent'].includes(k);
assert(allCityAreas.every(({ area }) => area.approximate === !official(area.kind)), 'approximate flag matches outline type for all 27');
assert(allCityAreas.every(({ area }) => (official(area.kind) ? area.confidence === 'high' : ['medium', 'low'].includes(area.confidence))), 'Confidence: official = high, approximate = medium/low');
const approxCount = allCityAreas.filter(({ area }) => area.approximate).length;
assert(approxCount === 19 && allCityAreas.length - approxCount === 8, `8 official and 19 approximate outlines (got ${allCityAreas.length - approxCount} / ${approxCount})`);
const neCities = allCityAreas.filter(({ area }) => /naturalearthdata/.test(area.source.url)).map((c) => c.city);
assert(neCities.length === 15 && allCityAreas.filter(({ area }) => area.source.licence === 'Public domain').length === 15, '15 Natural Earth footprints, all public domain');
const tara = modules['IN-RJ'].cities.Taranagar;
assert(tara.kind === 'urban-footprint' && /GlobalMLBuildingFootprints/.test(tara.source.url) && tara.source.licence === 'ODbL 1.0' && tara.areaKm2 > 2 && tara.areaKm2 < 30, 'Taranagar: building-derived footprint (Microsoft, ODbL), plausible town size');
assert(modules['IN-MH'].cities.Akola.kind === 'urban-footprint' && !/14237563/.test(modules['IN-MH'].cities.Akola.source.ref), 'Akola uses an urban footprint, not the rejected incomplete OSM polygon');
// No district / tehsil passed off as a city: every *approximate* outline must be well under its containing
// district's area. (Official municipal limits can legitimately exceed a 2021 district polygon, e.g. Kolkata.)
allCityAreas.filter(({ area }) => area.approximate || area.kind === 'municipal-equivalent').forEach(({ stateCode, city, area }) => {
  const ref = CITY_COORDINATES.find((c) => c.stateCode === stateCode && c.city === city);
  const p = projectLatLon(ref.lat, ref.lon);
  const dist = modules[stateCode].districts.find((d) => inside(parseRings(d.d), p.x, p.y));
  const cityA = parseRings(area.d).reduce((s2, r) => s2 + shoelace(r), 0);
  const distA = dist ? parseRings(dist.d).reduce((s2, r) => s2 + shoelace(r), 0) : Infinity;
  const ok = city === 'Mumbai' ? area.kind === 'municipal-equivalent' : cityA < 0.5 * distA;
  assert(ok, `${city}: outline is ${(100 * cityA / distA).toFixed(0)}% of ${dist ? dist.name : '?'} district${city === 'Mumbai' ? ' (documented MCGM = two-district equivalence)' : ''}`);
});
const ahm = modules['IN-GJ'].cities.Ahmedabad;
assert(ahm && ahm.source.licence === 'CC BY-SA 2.5 IN' && /datameet/.test(ahm.source.url), 'Ahmedabad included under CC BY-SA 2.5 India (owner-approved)');
const saCities = allCityAreas.filter((c) => /SA/.test(c.area.source.licence)).map((c) => c.city);
assert(saCities.join(',') === 'Ahmedabad', 'Ahmedabad is the only ShareAlike-licensed city area');
const gjText = read('../src/data/geo/states/IN-GJ.js');
assert(
  modules['IN-GJ'].licence?.id === 'CC-BY-SA-2.5-IN' && modules['IN-GJ'].licence.url === 'https://creativecommons.org/licenses/by-sa/2.5/in/' &&
    gjText.includes('LICENCE NOTICE') && gjText.includes('this file as a whole is licensed under Creative Commons Attribution-ShareAlike 2.5 India'),
  'Gujarat geography file is marked CC BY-SA 2.5 India (header notice + licence field)'
);
assert(gjText.includes('/*! @license CC-BY-SA-2.5-IN'), 'Gujarat file carries a minifier-preserved @license comment for the shipped chunk');
assert(
  PRESENCE_COVERAGE.filter(({ stateCode }) => stateCode !== 'IN-GJ').every(({ stateCode }) => !modules[stateCode].licence && !read(`../src/data/geo/states/${stateCode}.js`).includes('LICENCE NOTICE')),
  'No other state file is marked ShareAlike'
);
assert(Object.keys(modules['IN-UP'].cities).length === 0, 'Uttar Pradesh has no city areas');

console.log('\n4. Lazy Loading & Bundle Separation:');
const loaderSrc = read('../src/data/geo/stateGeography.js');
const loaderCodes = [...loaderSrc.matchAll(/'(IN-[A-Z]{2})': \(\) => import\('\.\/states\/\1\.js'\)/g)].map((m) => m[1]).sort();
assert(loaderCodes.join(',') === PRESENCE_COVERAGE.map((e) => e.stateCode).sort().join(','), 'One dynamic import per coverage state');
const srcFiles = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
  const full = path.join(dir, d.name);
  if (d.isDirectory()) walk(full); else if (/\.jsx?$/.test(d.name)) srcFiles.push(full);
});
walk(path.resolve(__dirname, '../src'));
assert(srcFiles.every((f) => !/^import [^;]*geo\/states\//m.test(fs.readFileSync(f, 'utf-8'))), 'No static imports of state geography modules');
const previewSrc = read('../src/sections/PresenceTeaser.jsx');
const homeSrc = read('../src/pages/Home.jsx');
assert(!previewSrc.includes('geo/') && !homeSrc.includes('geo/') && !previewSrc.includes('geography'), 'Homepage (static /presence teaser) does not load geography');

console.log('\n5. UI Wiring:');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const pageSrc = read('../src/pages/Presence.jsx');
const statusSrc = read('../src/components/presence/CityStatus.jsx');
assert(mapSrc.includes('clipPath="url(#presence-selected-state-clip)"') && mapSrc.includes('data-layer="districts"'), 'District lines are clipped to the selected state');
// City selection no longer draws a city-level view: city outlines stay in the data modules but are not rendered.
assert(!mapSrc.includes('data-city-area') && !mapSrc.includes('data-layer="city-areas"'), 'Map renders no city-boundary outlines');
assert(!/CITY_VIEW|CITY_AREA_PADDING|cityBBoxKey|focusPoint/.test(mapSrc), 'Map has no city zoom / city-fit logic');
assert(!pageSrc.includes('focusPoint') && !pageSrc.includes('cityArea'), 'Page passes no city focus or city area to the map');
assert(!/BOUNDARY_NOTES|boundaryStatus/.test(statusSrc + pageSrc), 'No city-boundary notes remain in the UI');
const creditsSrc = read('../src/components/map/MapCredits.jsx');
assert(creditsSrc.includes('geoBoundaries') && creditsSrc.includes('OpenStreetMap contributors') && /<MapCredits cities=\{markers\.length > 0\} districts=\{geography\?\.districts\?\.length > 0\} \/>/.test(mapSrc), 'District and city-area attribution available (Map data popover)');
assert(!mapSrc.includes('data-credit="city-area"'), 'No city-area credit line (no city-area data is displayed)');
assert(/City locations ©/.test(creditsSrc), 'OSM credit refers to city locations only');
assert(read('../src/data/geo/SOURCES.md').includes('ShareAlike notice: `states/IN-GJ.js`'), 'SOURCES.md documents the Gujarat ShareAlike licence');
assert(pageSrc.includes('loadStateGeography(nav.stateCode)') && pageSrc.includes("status: 'error'"), 'Page lazy-loads geography and tolerates load failure');
const mapSvgSrc = read('../src/components/map/IndiaMapSvg.jsx');
assert(mapSvgSrc.includes('fill={MAP_COLORS.land}') && mapSvgSrc.includes('stroke={MAP_COLORS.cyan}') && mapSvgSrc.includes('fill="url(#india-map-worked-fill)"'), 'Uncovered states stay subdued (cyan outline); coverage states highlighted');
assert(fs.existsSync(path.resolve(__dirname, '../src/data/geo/SOURCES.md')), 'Dataset sources and licences recorded');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
