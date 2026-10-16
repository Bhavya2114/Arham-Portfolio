/**
 * Project Discovery Map Verification Suite: India → State → City → Project
 *
 * Verifies:
 * 1. Navigation reducer: state/city/project selection, back/reset order, coverage guard.
 * 2. Project marker eligibility: published + verified coordinates only; missing/invalid
 *    coordinates, drafts and non-matching cities excluded; confidentiality preserved.
 * 3. Validation rejects malformed coordinates; empty production dataset yields no pins.
 * 4. Screen-space clustering behaviour.
 * 5. City-level zoom scale and UI wiring (pins from project coordinates only, empty state,
 *    details open only after a pin, image failure handling, homepage untouched).
 *
 * Mock records below exist ONLY inside this test; they are never added to PROJECTS.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { presenceNavReducer, INITIAL_PRESENCE_NAV } from '../src/lib/presenceNavigation.js';
import { clusterPoints } from '../src/lib/markerClustering.js';
import { kmPerUnitAt, projectLatLon } from '../src/lib/mapProjection.js';
import { PROJECTS } from '../src/data/projects.js';
import { PRESENCE_COVERAGE } from '../src/data/presenceCoverage.js';
import {
  hasVerifiedCoordinates,
  getMappedProjectsByStateAndCity,
  getPublishedProjectsByStateAndCity,
} from '../src/data/projectSelectors.js';
import { validateProjectRecord } from '../src/data/projectValidation.js';

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

const run = (actions) => actions.reduce(presenceNavReducer, INITIAL_PRESENCE_NAV);

console.log('1. Navigation Reducer:');
let s = run([{ type: 'selectState', stateCode: 'IN-MH' }]);
assert(s.stateCode === 'IN-MH' && s.city === null, 'Selecting a state sets state only');
s = presenceNavReducer(s, { type: 'selectCity', stateCode: 'IN-MH', city: 'Pune' });
assert(s.city === 'Pune' && s.projectId === null, 'Selecting a city does not open project details');
s = presenceNavReducer(s, { type: 'selectProject', projectId: 'p1' });
assert(s.projectId === 'p1', 'Selecting a project pin opens its details');
s = presenceNavReducer(s, { type: 'back' });
assert(s.projectId === null && s.city === 'Pune', 'Back closes details and keeps the city');
s = presenceNavReducer(s, { type: 'back' });
assert(s.city === null && s.stateCode === 'IN-MH', 'Back from city returns to the state');
s = presenceNavReducer(s, { type: 'back' });
assert(s.stateCode === null, 'Back from state returns to India');
assert(presenceNavReducer(INITIAL_PRESENCE_NAV, { type: 'selectProject', projectId: 'p1' }) === INITIAL_PRESENCE_NAV, 'Project selection requires a selected city');
assert(run([{ type: 'selectCity', stateCode: 'IN-MH', city: 'Jaipur' }]) === INITIAL_PRESENCE_NAV, 'City from another state is rejected');
assert(run([{ type: 'selectCity', stateCode: 'IN-RJ', city: 'Jaisalmer' }]) === INITIAL_PRESENCE_NAV, 'Unapproved city (Jaisalmer) is rejected');
assert(run([{ type: 'selectState', stateCode: 'IN-KA' }]) === INITIAL_PRESENCE_NAV, 'Non-coverage state is rejected');
assert(run([{ type: 'selectCity', stateCode: 'IN-UP', city: 'Lucknow' }]) === INITIAL_PRESENCE_NAV, 'Uttar Pradesh accepts no city');
s = run([{ type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'selectProject', projectId: 'x' }, { type: 'selectState', stateCode: 'IN-GJ' }]);
assert(s.stateCode === 'IN-GJ' && s.city === null && s.projectId === null, 'Switching state clears city and project');
s = run([{ type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'selectProject', projectId: 'x' }, { type: 'selectState', stateCode: 'IN-RJ' }]);
assert(s.stateCode === 'IN-RJ' && s.city === null && s.projectId === null, '"Back to state" from a city clears city and project');
s = run([{ type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'showCluster', projectIds: ['a', 'b'] }]);
assert(s.clusterIds.length === 2 && s.projectId === null, 'Same-site cluster opens a chooser');
s = presenceNavReducer(s, { type: 'selectProject', projectId: 'a' });
assert(s.projectId === 'a' && s.clusterIds === null, 'Choosing from the cluster opens that project');
assert(run([{ type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'reset' }]) === INITIAL_PRESENCE_NAV, 'Reset returns to India');

console.log('\n2. Project Marker Eligibility (test-only mock records):');
const base = { stateCode: 'IN-MH', city: 'Pune', category: 'lighting', description: 'Test-only record.', images: [], isClientConfidential: false };
const mock = [
  { ...base, id: 't-mapped', name: 'Mapped', status: 'published', coordinates: { lat: 18.52, lon: 73.86 } },
  { ...base, id: 't-nocoords', name: 'No coords', status: 'published' },
  { ...base, id: 't-badcoords', name: 'Bad coords', status: 'published', coordinates: { lat: '18.5', lon: 73.8 } },
  { ...base, id: 't-outside', name: 'Outside India', status: 'published', coordinates: { lat: 51.5, lon: -0.1 } },
  { ...base, id: 't-draft', name: 'Draft', status: 'draft', coordinates: { lat: 18.53, lon: 73.85 } },
  { ...base, id: 't-other-city', name: 'Other city', city: 'Nagpur', status: 'published', coordinates: { lat: 21.15, lon: 79.08 } },
  { ...base, id: 't-confidential', name: 'Confidential', status: 'published', isClientConfidential: true, clientName: 'Hidden Client', coordinates: { lat: 18.51, lon: 73.87 } },
];
const mapped = getMappedProjectsByStateAndCity('IN-MH', 'Pune', mock);
assert(mapped.map((p) => p.id).sort().join(',') === 't-confidential,t-mapped', 'Only published Pune records with valid coordinates become pins');
assert(getPublishedProjectsByStateAndCity('IN-MH', 'Pune', mock).length === 5, 'Records without coordinates stay published (counted as unmapped)');
assert(mapped.every((p) => p.clientName === undefined), 'Confidential client names are stripped from pin data');
assert(!hasVerifiedCoordinates({}) && !hasVerifiedCoordinates({ coordinates: { lat: NaN, lon: 73 } }), 'Missing / NaN coordinates are rejected');
assert(getMappedProjectsByStateAndCity('IN-MH', 'Pune', []).length === 0, 'Empty dataset yields no pins');

console.log('\n3. Validation & Production Data:');
assert(!validateProjectRecord({ ...mock[2] }).isValid, 'Validation flags non-numeric coordinates');
assert(!validateProjectRecord({ ...mock[3] }).isValid, 'Validation flags coordinates outside India');
assert(validateProjectRecord({ ...mock[0] }).isValid, 'Validation accepts a well-formed record with coordinates');
assert(validateProjectRecord({ ...mock[1] }).isValid, 'Coordinates remain optional for publication');
assert(Array.isArray(PROJECTS) && PROJECTS.length === 0, 'Production PROJECTS remains empty (no fabricated records)');
const totalPins = PRESENCE_COVERAGE.flatMap((e) => e.cities.map((c) => getMappedProjectsByStateAndCity(e.stateCode, c).length)).reduce((a, b) => a + b, 0);
assert(totalPins === 0, 'No project pins exist for any of the 27 approved cities');

console.log('\n4. Clustering:');
const pts = [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 1, y: 0 }, { id: 'c', x: 100, y: 0 }];
assert(clusterPoints(pts, 10, 36).length === 2, 'Points within 36px merge; distant point stays separate');
assert(clusterPoints(pts, 100, 36).length === 3, 'Zooming in (more px per unit) splits the cluster');
assert(clusterPoints([{ id: 'a', x: 5, y: 5 }, { id: 'b', x: 5, y: 5 }], 1000, 36).length === 1, 'Identical sites always cluster (chooser needed)');
assert(clusterPoints([], 10).length === 0, 'No points, no clusters');

console.log('\n5. City Scale & UI Wiring:');
const cityViewKm = 15 * kmPerUnitAt(19);
assert(cityViewKm > 45 && cityViewKm < 70, `City view spans ~${cityViewKm.toFixed(0)} km (geographic city scale)`);
const pune = projectLatLon(18.5214, 73.8545);
assert(Number.isFinite(pune.x) && Number.isFinite(pune.y), 'Projection available for project coordinates');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const pageSrc = read('../src/pages/Presence.jsx');
assert(mapSrc.includes('STATE_FIT_MAX_ZOOM') && !mapSrc.includes('CITY_VIEW_UNITS'), 'State-fit zoom kept; no city-view zoom level');
assert(pageSrc.includes('projectLatLon(p.coordinates.lat, p.coordinates.lon)'), 'Pins are projected from each project\'s own coordinates');
assert(!/projectMarkers[^;]*CITY_COORDINATES/.test(pageSrc), 'City coordinates are never used to build project pins');
assert(pageSrc.includes('getMappedProjectsByStateAndCity'), 'Page uses the verified-coordinates selector');
assert(mapSrc.includes('data-project-id') && mapSrc.includes('— project location'), 'Project pins are labelled, focusable buttons');
assert(mapSrc.includes('projects close together'), 'Clusters have an accessible label');
const detailsSrc = read('../src/components/presence/ProjectDetails.jsx');
assert(detailsSrc.includes('onError') && detailsSrc.includes('Project photographs will be added when approved.'), 'Image failures / missing images handled without placeholder photos');
assert(detailsSrc.includes('project photograph'), 'Gallery provides descriptive alt text');
const statusSrc = read('../src/components/presence/CityStatus.jsx');
assert(statusSrc.includes('Project locations will appear here as approved project information becomes available.'), 'City empty state copy');
assert(!pageSrc.includes('<CityDetails'), 'The removed CityDetails component is not used');
const previewSrc = read('../src/sections/PresenceTeaser.jsx');
assert(!previewSrc.includes('PresenceMap') && !previewSrc.includes('ProjectDetails'), 'Homepage teaser stays lightweight (static image, no map)');
assert(read('../src/App.jsx').includes("lazy(() => import('./pages/Presence'))"), 'Presence route remains lazy-loaded');

console.log('\n6. City Selection Without Zoom (restored behaviour):');
// The map's target view depends only on the selected state, so a city click cannot change the zoom.
assert(mapSrc.includes('const getTargetView = useCallback(() => getStateFitView(selectedCode), [selectedCode, getStateFitView]);'), 'Map target view depends only on the selected state (city click cannot change zoom)');
assert(!mapSrc.includes('data-city-area') && !pageSrc.includes('focusPoint'), 'No city boundary or city-level map view');
assert(pageSrc.includes('const detailsOpen = Boolean((selectedCity && !projectCardOnly) ||'), 'Selecting a city opens the project panel / sheet (cities without published gallery projects use the floating project card instead)');
assert(pageSrc.includes('<CityProjectList city={selectedCity} projects={cityProjects}'), "City panel lists that city's verified projects");
assert(pageSrc.includes('getPublishedProjectsByStateAndCity(selectedState.code, selectedCity)'), 'City list uses verified (published) records only');
assert(pageSrc.includes('aria-label="Previous project"') && pageSrc.includes('aria-label="Next project"') && pageSrc.includes('All projects in {selectedProject.city}'), 'Projects can be stepped through one by one and back to the list');
assert(detailsSrc.includes('export const CityProjectList') && detailsSrc.includes('{CITY_EMPTY_STATE_COPY}') && detailsSrc.includes('data-empty-state="city"'), 'Empty city shows the existing empty-state copy');
const markersMemo = (pageSrc.match(/const projectMarkers = useMemo\(([\s\S]*?)\);/) || [])[1] || '';
assert(!/candidateProjectLocations/.test(detailsSrc + mapSrc) && /stateMappedProjects/.test(markersMemo) && !/campus|candidate/i.test(markersMemo), 'Candidate campus records never become project pins (pins built only from verified projects)');
assert(pageSrc.includes('selectedState.cities.flatMap((c) => getMappedProjectsByStateAndCity(selectedState.code, c))'), 'State view shows verified project pins for all its cities');
let n = run([{ type: 'selectState', stateCode: 'IN-MH' }, { type: 'selectProject', projectId: 'p9', city: 'Pune' }]);
assert(n.city === 'Pune' && n.projectId === 'p9', 'Pin at state level opens the project and selects its city');
assert(run([{ type: 'selectState', stateCode: 'IN-MH' }, { type: 'selectProject', projectId: 'p9', city: 'Jaipur' }]).projectId === null, 'Project with a city outside the state is rejected');
n = presenceNavReducer(n, { type: 'back' });
assert(n.city === 'Pune' && n.projectId === null, 'Back from a project returns to the city project list');
n = presenceNavReducer(n, { type: 'back' });
assert(n.city === null && n.stateCode === 'IN-MH', 'Back from the city list returns to the state');
const twoInPune = [
  { ...base, id: 't-1', name: 'One', status: 'published', coordinates: { lat: 18.52, lon: 73.86 } },
  { ...base, id: 't-2', name: 'Two', status: 'published' },
];
assert(getPublishedProjectsByStateAndCity('IN-MH', 'Pune', twoInPune).map((p) => p.id).join(',') === 't-1,t-2', "A city's verified projects are returned individually (with or without a map location)");
assert(!read('../src/pages/Home.jsx').includes('CityProjectList'), 'Homepage untouched');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
