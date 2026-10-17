/**
 * Phase B Verification Test Suite: Our Presence Foundation & State Selection
 *
 * Verifies:
 * 1. Exact 11-state coverage configuration (no extra states).
 * 2. Exact 27 supplied cities per state (no extra or duplicate cities).
 * 3. Uttar Pradesh is highlighted with zero cities.
 * 4. Coverage codes match registry and map geometry; no coordinates are present.
 * 5. Empty PROJECTS dataset stays neutral.
 * 6. /presence route, lazy loading and navigation item.
 * 7. Shared map component keeps light defaults for the homepage.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PRESENCE_COVERAGE,
  getPresenceStateCodes,
  getPresenceState,
  getPresenceCities,
  getPresenceTotals,
} from '../src/data/presenceCoverage.js';
import { isValidStateCode } from '../src/data/states.js';
import { INDIA_MAP_STATES } from '../src/components/map/indiaMapGeometry.js';
import { PROJECTS } from '../src/data/projects.js';
import { getPublishedProjects, getPublishedProjectsByStateAndCity } from '../src/data/projectSelectors.js';
import { NAV_ITEMS } from '../src/data/navigation.js';

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

const EXPECTED = {
  'IN-RJ': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Sikar', 'Jhunjhunu', 'Taranagar'],
  'IN-MH': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Chhatrapati Sambhaji Nagar', 'Akola', 'Nanded', 'Latur'],
  'IN-GJ': ['Ahmedabad', 'Vadodara'],
  'IN-CT': ['Raipur', 'Bilaspur'],
  'IN-WB': ['Kolkata', 'Siliguri'],
  'IN-UP': [],
  'IN-BR': ['Patna'],
  'IN-JH': ['Ranchi'],
  'IN-OR': ['Bhubaneswar'],
  'IN-AS': ['Guwahati'],
  'IN-GA': ['Panaji'],
};

console.log('1. Exact State Coverage:');
const codes = getPresenceStateCodes();
assert(codes.length === 11, `Exactly 11 coverage states (got ${codes.length})`);
assert(new Set(codes).size === 11, 'No duplicate coverage states');
assert(
  [...codes].sort().join(',') === Object.keys(EXPECTED).sort().join(','),
  'Coverage state set equals the supplied 11 states exactly'
);
const geometryIds = new Set(INDIA_MAP_STATES.map((s) => s.id));
assert(codes.every(isValidStateCode), 'All coverage codes exist in states.js registry');
assert(codes.every((c) => geometryIds.has(c)), 'All coverage codes exist in map geometry');
assert(INDIA_MAP_STATES.length === 36, 'Map geometry still has all 36 state/UT outlines');
assert(getPresenceState('IN-DL') === null && getPresenceState('IN-KA') === null, 'Non-coverage states (Delhi, Karnataka) return null');
assert(getPresenceState('IN-RJ')?.name === 'Rajasthan', 'State names resolve from the registry');
assert(
  ['IN-RJ', 'IN-MH'].every((c) => getPresenceState(c).presenceLevel === 'major') &&
    codes.filter((c) => getPresenceState(c).presenceLevel === 'major').length === 2,
  'Only Rajasthan and Maharashtra are marked major presence'
);

console.log('\n2. Exact City Coverage:');
Object.entries(EXPECTED).forEach(([code, cities]) => {
  const actual = getPresenceCities(code);
  assert(JSON.stringify(actual) === JSON.stringify(cities), `${code} cities match supplied list (${cities.length})`);
});
const allCities = PRESENCE_COVERAGE.flatMap((e) => e.cities);
assert(allCities.length === 27, `Exactly 27 cities in total (got ${allCities.length})`);
assert(new Set(allCities).size === 27, 'No duplicate city names');
assert(getPresenceTotals().stateCount === 11 && getPresenceTotals().cityCount === 27, 'Derived totals are 11 states / 27 cities');
assert(getPresenceCities('IN-DL').length === 0, 'Non-coverage state yields no cities');

console.log('\n3. Uttar Pradesh:');
assert(codes.includes('IN-UP'), 'Uttar Pradesh is highlighted');
assert(getPresenceCities('IN-UP').length === 0, 'Uttar Pradesh has zero cities');

console.log('\n4. No Fabricated Coordinates or Markers:');
const coverageSrc = read('../src/data/presenceCoverage.js');
assert(!/\b(lat|lng|lon|latitude|longitude|coordinates)\s*:/.test(coverageSrc), 'Coverage config contains no coordinate fields');
const presenceMapSrc = read('../src/components/map/PresenceMap.jsx');
// Phase C replaced the Phase B "no markers" rule: markers may only come from the sourced coordinate record.
const presencePageSrc = read('../src/pages/Presence.jsx');
assert(
  presencePageSrc.includes("from '../data/cityCoordinates.js'") && presencePageSrc.includes('projectLatLon'),
  'Marker positions come only from cityCoordinates.js via mapProjection.js'
);
assert(PRESENCE_COVERAGE.every((e) => Object.isFrozen(e) && Object.isFrozen(e.cities)), 'Coverage entries are frozen');

console.log('\n5. Empty Project Dataset Neutrality:');
assert(Array.isArray(PROJECTS) && PROJECTS.length === 0, 'PROJECTS remains empty');
assert(getPublishedProjects().length === 0, 'No published projects');
assert(getPublishedProjectsByStateAndCity('IN-RJ', 'Jaipur').length === 0, 'City project lookup is empty for Jaipur');
const pageSrc = read('../src/pages/Presence.jsx');
const stateNames = ['Rajasthan', 'Maharashtra', 'Gujarat', 'Chhattisgarh', 'West Bengal', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'Odisha', 'Assam', 'Goa'];
assert(stateNames.every((n) => !pageSrc.includes(n)), 'Presence page has no hardcoded state names (uses config)');
assert(pageSrc.includes('projectBrowse.js') && pageSrc.includes('presenceCoverage'), 'Presence page reads shared selectors (projectBrowse.js) and coverage config');

console.log('\n6. Route & Navigation:');
const appSrc = read('../src/App.jsx');
assert(appSrc.includes('<Route path="/our-work" element={<Presence />} />') && appSrc.includes('<Route path="/presence" element={<Navigate to="/our-work" replace />} />'), 'The map page is at /our-work; /presence redirects there');
assert(appSrc.includes("lazy(() => import('./pages/Presence'))"), 'Presence page is lazy loaded');
const presenceNav = NAV_ITEMS.find((i) => i.path === '/our-work');
assert(presenceNav && presenceNav.name === 'Our Work' && NAV_ITEMS[0] === presenceNav, 'Our Work is the first nav item');
assert(read('../public/sitemap.xml').includes('<loc>/our-work</loc>'), 'Sitemap lists /our-work');

console.log('\n7. Homepage Map Preservation:');
const mapSrc = read('../src/components/map/IndiaMapSvg.jsx');
assert(mapSrc.includes("variant = 'dark'") && !/renderLightState/.test(mapSrc), 'IndiaMapSvg is dark-only (the homepage shows a static image of /presence)');
assert(mapSrc.includes('viewBox = INDIA_MAP_VIEWBOX'), 'IndiaMapSvg defaults to the original viewBox');
const previewSrc = read('../src/sections/PresenceTeaser.jsx');
assert(!/IndiaMapSvg|PresenceMap/.test(previewSrc), 'Homepage teaser renders no map component');
assert(previewSrc.includes('PRESENCE_TEASER_STATS') && previewSrc.includes('to="/our-work"'), 'Homepage teaser shows the stats constant and links to /our-work');

console.log('\n8. Single Source of Truth for Coverage:');
const statesSrc = read('../src/data/states.js');
const selectorsSrc = read('../src/data/projectSelectors.js');
assert(!statesSrc.includes('VERIFIED_GEOGRAPHIC_COVERAGE'), 'Obsolete VERIFIED_GEOGRAPHIC_COVERAGE removed from states.js');
assert(!selectorsSrc.includes('VERIFIED_GEOGRAPHIC_COVERAGE'), 'Selectors no longer reference the obsolete coverage list');
assert(selectorsSrc.includes("from './presenceCoverage.js'"), 'Coverage selectors read presenceCoverage.js');
assert(pageSrc.includes('presenceCoverage'), '/presence page reads presenceCoverage.js');
const srcFiles = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
  const full = path.join(dir, d.name);
  if (d.isDirectory()) walk(full);
  else if (/\.(jsx?|md)$/.test(d.name)) srcFiles.push(full);
});
walk(path.resolve(__dirname, '../src'));
// Generated district geography legitimately names Jaisalmer *district*; it must never appear as a city.
const isGeneratedGeography = (f) => /[\\/]data[\\/]geo[\\/]states[\\/]/.test(f);
assert(srcFiles.filter((f) => !isGeneratedGeography(f)).every((f) => !fs.readFileSync(f, 'utf-8').includes('Jaisalmer')), 'No source file mentions Jaisalmer (outside generated district data)');
assert(!read('../src/data/geo/states/IN-RJ.js').includes('"Jaisalmer":'), 'Jaisalmer is not a city-area entry');
assert(!previewSrc.includes('across Rajasthan and Maharashtra'), 'Homepage disclosure no longer hardcodes the old two-state coverage');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
