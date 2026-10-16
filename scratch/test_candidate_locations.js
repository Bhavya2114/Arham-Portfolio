/**
 * Internal Candidate Locations Suite (ALLEN campuses, Kota & Jaipur) — NOT Arham projects.
 *
 * Verifies:
 * 1. 17 candidate records (8 Kota, 9 Jaipur), none approved, none claiming Arham's work.
 * 2. Coordinates only where a building/point was identified; null when ambiguous or not located;
 *    never a city-centre reference point; always near the right city.
 * 3. Paired/ambiguous campuses are separate records and flagged.
 * 4. Isolation: no source file imports the candidate data; public selectors cannot surface it;
 *    PROJECTS and the approved coverage are unchanged; optional production-build scan (BUILD_DIR).
 * 5. Manual review workflow transitions (no publishing path).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CANDIDATE_PROJECT_LOCATIONS as C,
  CANDIDATE_STATUSES,
  canTransition,
  getCandidateLocationsByCity,
} from '../src/data/candidateProjectLocations.js';
import { PROJECTS } from '../src/data/projects.js';
import { PRESENCE_COVERAGE } from '../src/data/presenceCoverage.js';
import { CITY_COORDINATES } from '../src/data/cityCoordinates.js';
import {
  getPublishedProjects,
  getMappedProjectsByStateAndCity,
  getPublishedProjectsByStateAndCity,
} from '../src/data/projectSelectors.js';

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
const km = (a, b) => {
  const t = (d) => (d * Math.PI) / 180;
  const h = Math.sin(t(b.lat - a.lat) / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(t(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

console.log('1. Records:');
assert(C.length === 17, `17 candidate records (got ${C.length})`);
assert(C.filter((c) => c.city === 'Kota').length === 8 && C.filter((c) => c.city === 'Jaipur').length === 9, '8 Kota + 9 Jaipur');
assert(new Set(C.map((c) => c.id)).size === C.length && C.every((c) => c.id.startsWith('cand-')), 'Unique "cand-" ids');
assert(C.every((c) => ['UNVERIFIED', 'PENDING_REVIEW'].includes(c.status)), 'No candidate is APPROVED or REJECTED in this draft');
assert(C.every((c) => c.arhamWorkConfirmed === false), 'No candidate claims Arham performed work');
assert(C.every((c) => c.stateCode === 'IN-RJ' && c.suppliedAddress && Array.isArray(c.notes) && c.notes.length > 0 && c.sources.length > 0), 'Each record keeps supplied address, notes and sources');
assert(C.every((c) => !('photos' in c) && !('images' in c) && !('description' in c) && !('scope' in c) && !('completionYear' in c) && !('clientName' in c)), 'No photographs, work descriptions, dates or client fields');
assert(C.every((c) => Object.isFrozen(c)), 'Records are frozen');

console.log('\n2. Coordinates:');
const refs = Object.fromEntries(CITY_COORDINATES.map((c) => [c.city, c]));
C.forEach((c) => {
  if (c.coordinates) {
    const okPrecision = c.coordinates.precision === c.locationVerification && ['building', 'point'].includes(c.locationVerification);
    const okSource = /^https:\/\/www\.openstreetmap\.org\/(way|node)\//.test(c.coordinates.source);
    const dCentre = km(c.coordinates, refs[c.city]);
    assert(okPrecision && okSource && !c.ambiguous && dCentre > 0.3 && dCentre < 15, `${c.id}: ${c.coordinates.precision}-level, mapped source, ${dCentre.toFixed(1)} km from city reference (not the centre)`);
  } else {
    assert(['not-located', 'ambiguous'].includes(c.locationVerification), `${c.id}: no coordinates (${c.locationVerification})`);
  }
});
assert(C.filter((c) => c.ambiguous).every((c) => c.coordinates === null), 'Ambiguous records keep coordinates unset');
assert(C.filter((c) => c.status === 'UNVERIFIED').every((c) => c.coordinates === null), 'Unverified records keep coordinates unset');
const located = C.filter((c) => c.coordinates).map((c) => c.id).sort();
assert(located.join(',') === 'cand-jaipur-jln-marg,cand-jaipur-vaishali-nagar,cand-kota-saakar,cand-kota-samarth', `Exactly 4 located candidates (${located.join(', ')})`);
assert(C.filter((c) => c.coordinates?.precision === 'building').length === 2, '2 building-level, 2 point-level');

console.log('\n3. Ambiguity & Separation:');
const byId = Object.fromEntries(C.map((c) => [c.id, c]));
['cand-kota-sankalp', 'cand-kota-sangyan', 'cand-kota-samyak', 'cand-kota-satyarth', 'cand-jaipur-malviya-nagar'].forEach((id) => {
  assert(byId[id]?.ambiguous === true, `${id} flagged ambiguous`);
});
assert(byId['cand-kota-sankalp'].locationCandidates.length === 2, 'Sankalp records both conflicting mapped features for review');
assert(byId['cand-kota-satyarth'] && byId['cand-kota-sammunnat'], 'Satyarth and Sammunnat are separate records');
assert(byId['cand-kota-samyak'] && byId['cand-kota-samarth'] && byId['cand-kota-samyak'].officialAddress !== byId['cand-kota-samarth'].officialAddress, 'Samyak and Samarth are separate records at different addresses');
assert(['cand-jaipur-gopalpura-1', 'cand-jaipur-gopalpura-2', 'cand-jaipur-gopalpura-3'].every((id) => byId[id]), 'Three Gopalpura campuses kept separate');
assert(byId['cand-jaipur-hanuman-nagar'].notes.some((n) => /B-3 & B-4/.test(n)), 'Hanuman Nagar address conflict recorded');

console.log('\n4. Isolation from the Public Site:');
const srcFiles = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
  const full = path.join(dir, d.name);
  if (d.isDirectory()) walk(full); else if (/\.(jsx?|tsx?)$/.test(d.name)) srcFiles.push(full);
});
walk(path.resolve(__dirname, '../src'));
const importers = srcFiles.filter((f) => !f.endsWith('candidateProjectLocations.js') && /^import .*candidateProjectLocations/m.test(fs.readFileSync(f, 'utf-8')));
// Site-owner decision (2026-10-15): the only consumer is the Presence page's city panel (name + address).
assert(importers.map((f) => path.basename(f)).join(',') === 'Presence.jsx', `Only Presence.jsx imports the candidate data (${importers.map((f) => path.basename(f)).join(', ') || 'none'})`);
assert(Array.isArray(PROJECTS) && PROJECTS.length === 0, 'Published PROJECTS remains empty');
assert(C.every((c) => !PROJECTS.some((p) => p.id === c.id)), 'No candidate id in PROJECTS');
assert(getPublishedProjects(C).length === 0, 'Even if passed to public selectors, candidates are not "published"');
assert(getMappedProjectsByStateAndCity('IN-RJ', 'Kota', C).length === 0 && getMappedProjectsByStateAndCity('IN-RJ', 'Jaipur', C).length === 0, 'Candidates cannot become map pins');
assert(getPublishedProjectsByStateAndCity('IN-RJ', 'Jaipur').length === 0 && getMappedProjectsByStateAndCity('IN-RJ', 'Kota').length === 0, 'Public Kota/Jaipur selectors stay empty');
assert(PRESENCE_COVERAGE.length === 11 && PRESENCE_COVERAGE.reduce((s, e) => s + e.cities.length, 0) === 27, 'Approved coverage unchanged (11 states, 27 cities)');
const publicFiles = ['../src/components/map/PresenceMap.jsx', '../src/sections/PresencePreview.jsx', '../src/pages/Home.jsx', '../src/pages/ProjectsGallery.jsx', '../src/App.jsx', '../src/data/projectSelectors.js', '../src/data/projects.js'];
assert(publicFiles.every((f) => !/cand-|candidate/i.test(read(f))), 'Map, homepage, gallery, routes, selectors and projects.js contain no candidate references');
if (process.env.BUILD_DIR) {
  const assets = path.resolve(process.env.BUILD_DIR, 'assets');
  const carriers = fs.readdirSync(assets).filter((f) => /\.js$/.test(f) && /cand-kota|cand-jaipur|ALLEN Sankalp|Samachar Jagat/.test(fs.readFileSync(path.join(assets, f), 'utf-8')));
  assert(carriers.length === 1 && /^Presence-/.test(carriers[0]), `Candidate data ships only in the lazy /presence chunk (${carriers.join(', ') || 'none'})`);
}

console.log('\n4a. Kota / Jaipur City Panels (campus locations, not projects):');
const pageSrcC = read('../src/pages/Presence.jsx');
const listSrc = read('../src/components/presence/ProjectDetails.jsx');
// Mirrors the page: the selected city's group from the existing helper, filtered to the selected state.
const panelFor = (stateCode, city) => (getCandidateLocationsByCity()[city] || []).filter((c) => c.stateCode === stateCode);
const demoAdapterSrc = read('../src/data/demoCampusCards.js');
assert(pageSrcC.includes('getCampusCardsForCity(getCandidateLocationsByCity(), selectedState.code, selectedCity)') && demoAdapterSrc.includes('(recordsByCity[city] || []).filter((c) => c.stateCode === stateCode)'), 'Page uses the existing city-grouping helper, matched by state (via the temporary demo adapter)');
assert(panelFor('IN-RJ', 'Kota').length === 8 && panelFor('IN-RJ', 'Jaipur').length === 9, 'Kota panel lists 8 campus locations, Jaipur lists 9');
assert(panelFor('IN-RJ', 'Kota').map((c) => c.id).join() === C.filter((c) => c.city === 'Kota').map((c) => c.id).join(), 'Kota entries are the existing records (no duplicates or re-creation)');
assert(panelFor('IN-RJ', 'Kota').concat(panelFor('IN-RJ', 'Jaipur')).filter((c) => !c.coordinates).length === 13, 'The 13 records without coordinates are included');
assert(PRESENCE_COVERAGE.flatMap((e) => e.cities.map((city) => [e.stateCode, city])).filter(([s, city]) => !['Kota', 'Jaipur'].includes(city)).every(([s, city]) => panelFor(s, city).length === 0), 'All other 25 approved cities have no campus locations (empty state kept)');
assert(listSrc.includes('{loc.name}') && listSrc.includes('{loc.suppliedAddress}') && !/loc\.(coordinates|notes|status|sources|lat|lon)/.test(listSrc), 'Panel shows only name + supplied address (no coordinates, notes or status)');
assert(listSrc.includes('ALLEN campus locations (') && listSrc.includes("Arham's work at these campuses has not been confirmed."), 'Labelled as campus location records with unconfirmed Arham work');
assert(listSrc.includes('No verified Arham projects are listed for {city} yet.'), 'Verified-project count stays separate (none listed)');
assert(listSrc.includes('projects.length === 0 && campusLocations.length === 0') && listSrc.includes('data-empty-state="city"'), 'Cities without projects or campus records keep the existing empty state');
assert(!/campusLocations[^;\n]*(onSelect|openProject|projectMarkers|selectProject)/.test(pageSrcC + listSrc), 'Campus locations open no project details and create no map pins');

console.log('\n4c. Floating Glass Campus Card:');
const cardSrc = read('../src/components/presence/CampusCard.jsx');
const mapSrcC = read('../src/components/map/PresenceMap.jsx');
assert(cardSrc.includes("import allenCampusImage from '../../../Images/allen image.png';") && fs.existsSync(path.resolve(__dirname, '../Images/allen image.png')), 'Uses the existing local Images/allen image.png via a Vite import');
assert(cardSrc.includes('src={allenCampusImage}') && /object-cover/.test(cardSrc) && /aspect-\[4\/3\]/.test(cardSrc) && /rounded-xl object-cover/.test(cardSrc), 'Image: cover-fit, fixed 4:3 ratio, rounded');
const cardContainerClass = (cardSrc.match(/className=(?:\{`|")flex gap-3 rounded-2xl[^`"]*[`"]/) || [''])[0];
assert(/bg-teal-700\/35/.test(cardContainerClass) && /backdrop-blur-md/.test(cardContainerClass) && /border-teal-200\/25/.test(cardContainerClass) && !/\bbg-white\b/.test(cardContainerClass), 'Translucent teal glass card container (no solid white card)');
assert(cardSrc.includes('{loc.name}') && cardSrc.includes('{loc.suppliedAddress}') && cardSrc.includes('Campus location'), 'Card shows campus name, supplied address and a "Campus location" pill');
assert(!/loc\.(coordinates|notes|status|sources|lat|lon|phone)/.test(cardSrc) && !/tel:/.test(cardSrc), 'No coordinates, notes, status or phone action (no verified phone numbers)');
assert(/encodeURIComponent\(`\$\{loc\.name\}, \$\{loc\.suppliedAddress\}`\)/.test(cardSrc) && cardSrc.includes('https://www.google.com/maps/search/?api=1&query='), 'Directions search the supplied address text only (no invented coordinates)');
assert(!/rating|review|hours|completed|verified project/i.test(cardSrc.replace(/\/\*[\s\S]*?\*\//g, '')), 'No ratings, hours, reviews or completion claims on the card');
assert(cardSrc.includes("Arham's work at this campus has not been confirmed."), 'Unconfirmed Arham work stated (screen-reader text)');
assert(/dx <= -SWIPE_PX\) go\(current \+ 1\)/.test(cardSrc) && /dx >= SWIPE_PX\) go\(current - 1\)/.test(cardSrc), 'Swipe right→left = next, left→right = previous');
assert(cardSrc.includes("e.key === 'ArrowRight'") && cardSrc.includes("e.key === 'ArrowLeft'"), 'Keyboard ←/→ also navigate');
assert(/onPointerDown=\{handlePointerDown\}/.test(cardSrc) && /const handlePointerDown = \(e\) => \{\s*stop\(e\);/.test(cardSrc) && cardSrc.includes("touchAction: 'pan-y'"), 'Swipes are stopped from reaching the map (no accidental pan)');
assert(cardSrc.includes('{current + 1} / {count}') && cardSrc.includes('aria-label={`Show campus ${i + 1} of ${count}: ${l.name}`}'), 'Counter "n / total" and pagination dots');
assert(!/Chevron(Left|Right)|aria-label="(Previous|Next) campus"/.test(cardSrc), 'No large previous / next arrow buttons');
assert(pageSrcC.includes('<CampusCard key={`${nav.stateCode}|${selectedCity}`} city={selectedCity} locations={campusLocations} demo={campusDemo} />'), 'Card is keyed by city, so it resets to 1 / n when the city changes');
assert(/const campusCardOnly = Boolean\(\s*selectedCity && !selectedProject && clusterProjects\.length === 0 && cityProjects\.length === 0 && campusLocations\.length > 0/.test(pageSrcC), 'Card replaces the panel / bottom sheet only for campus-only cities');
assert(mapSrcC.includes('overlay = null,') && mapSrcC.includes('data-map-overlay=') && !mapSrcC.includes('controlsAtTop'), 'Map hosts the card as an overlay (no zoom controls to move out of its way)');
assert(mapSrcC.includes('const getTargetView = useCallback(() => getStateFitView(selectedCode), [selectedCode, getStateFitView]);'), 'Showing the card never changes the map zoom (fit depends only on the state)');
if (process.env.BUILD_DIR) {
  assert(fs.readdirSync(path.resolve(process.env.BUILD_DIR, 'assets')).some((f) => /^allen image-.+\.png$/.test(f)), 'Production build emits the allen image as a hashed Vite asset');
}

console.log('\n4e. Bottom-Anchored Card & Minimal Map Shift:');
const overlayClassSrc = (mapSrcC.match(/const overlayClass = [\s\S]*?;\n/) || [''])[0];
assert(overlayClassSrc.includes("'inset-x-2 bottom-2'") && overlayClassSrc.includes('bottom-3') && !/top-\d/.test(overlayClassSrc), 'Card is always anchored to the bottom of the map container (never the top)');
assert(mapSrcC.includes('className={`absolute z-20 ${overlayClass}') && !/fixed/.test(overlayClassSrc), 'Anchored inside the map container (absolute), not the page / viewport');
assert(mapSrcC.includes('card: { top: w.top + card.offsetTop, left, right: left + card.offsetWidth },'), "Uses the card's actual rendered size and position (layout box)");
assert(read('../src/lib/markerClearance.js').includes('const shiftPx = overlapsX && my > card.top - clearancePx ? my - (card.top - clearancePx) : 0;') && mapSrcC.includes('clearancePx: MARKER_CLEARANCE_PX,'), 'Map shifts only when the selected marker would be under / too close to the card, by just that amount');
assert(mapSrcC.includes('animateTo({ ...v, cy: v.cy + shiftUnits }, {') && mapSrcC.includes('return shiftPx > MIN_SHIFT_PX ? shiftUnits : 0;'), 'Shift is a vertical pan only (zoom unchanged), ignoring sub-pixel amounts');
assert(mapSrcC.includes('if (overlayShifted.current) {') && mapSrcC.includes('animateTo(getTargetView());'), 'Closing the card undoes its own shift (back to the state view)');
assert(mapSrcC.includes('{ duration: MAP_SHIFT_MS, onDone: go }') && mapSrcC.includes("'transition-none translate-y-[calc(100%+1rem)] opacity-0 pointer-events-none'"), 'Card slides up from the bottom after the map adjustment (sequence: scratch/test_overlay_entrance.js)');
assert(/useLayoutEffect\(\(\) => \{\s*if \(!overlayKey\) \{/.test(mapSrcC) && mapSrcC.includes('}, [overlayKey]);'), 'Re-evaluated per city (Kota / Jaipur) — repositions only if needed');
assert(!/Map zoom controls|aria-label="Zoom in"/.test(mapSrcC), 'No zoom control buttons over the map or the card');
const shiftEffect = (mapSrcC.match(/useLayoutEffect\(\(\) => \{[\s\S]*?\}, \[overlayKey\]\);/) || [''])[0].replace(/\/\/.*$/gm, '');
assert(shiftEffect && !/candidate|campus/i.test(shiftEffect), 'Uses only the selected city marker — no campus coordinates or pins');

console.log('\n4d. Campus Card Slide Animation:');
const cssSrc = read('../src/styles/index.css');
assert(cardSrc.includes('const SLIDE_MS = 320;') && /\.campus-slide \{[^}]*animation-duration: 320ms;[^}]*cubic-bezier\(0\.16, 1, 0\.3, 1\)/.test(cssSrc), 'Slide lasts ~320 ms with an ease-out curve');
assert(cardSrc.includes("slide.dir === 'next' ? 'campus-in-from-right' : 'campus-in-from-left'") && cardSrc.includes("slide.dir === 'next' ? 'campus-out-to-left' : 'campus-out-to-right'"), 'Next: out left / in from right; previous: out right / in from left');
assert(cardSrc.includes("setSlide({ from: current, dir: target > current ? 'next' : 'prev' })"), 'Direction follows the target (swipe, ←/→ keys and dots share go())');
assert(/@keyframes campus-in-from-right \{ from \{ transform: translateX\(100%\); opacity: 0\.85; \}/.test(cssSrc) && /@keyframes campus-out-to-left \{[^}]*\} to \{ transform: translateX\(-100%\); opacity: 0\.85; \}/.test(cssSrc), 'Horizontal movement with only a subtle opacity change');
assert(cardSrc.includes('if (target === current || sliding.current) return;') && /sliding\.current\) return;\s*drag\.current =/.test(cardSrc), 'One transition at a time: rapid input and drags are ignored while sliding');
assert(cardSrc.includes('if (!prefersReducedMotion()) {') && cssSrc.includes('prefers-reduced-motion: reduce'), 'Reduced motion: no slide (instant switch), plus the global CSS override');
assert(!/style=\{\{ touchAction: 'pan-y', transform/.test(cardSrc) && cardSrc.includes("style={{ touchAction: 'pan-y' }}"), 'Glass card stays stationary; only its content moves');
assert(cardSrc.includes('className="relative min-w-0 flex-1 overflow-hidden') && cardSrc.includes("style={dragX ? { transform: `translateX(${dragX}px)` } : undefined}"), 'Content is clipped inside the card and follows the finger while dragging');
assert(/aria-hidden="true"\s*className=\{`absolute inset-1 pointer-events-none campus-slide/.test(cardSrc) && cardSrc.includes('tabIndex={ghost ? -1 : undefined}'), 'Outgoing copy is inert (hidden from AT, not clickable or focusable)');
assert(cardSrc.includes('slideTimer.current = setTimeout(') && cardSrc.includes('useEffect(() => () => clearTimeout(slideTimer.current), [])'), 'Slide ends on a timer (works when hidden) and is cleaned up on unmount');
assert(/verified \$\{cityProjects\.length === 1 \? 'project' : 'projects'\}\$\{\s*campusLocations\.length > 0 \? ` · \$\{campusLocations\.length\} campus locations`/.test(pageSrcC), 'Subtitle counts verified projects and campus locations separately');
assert(C.every((c) => c.arhamWorkConfirmed === false && ['UNVERIFIED', 'PENDING_REVIEW'].includes(c.status)), 'Statuses unchanged; Arham work still unconfirmed');

console.log('\n4b. City Lists Without Coordinates & Supplied Details:');
// Exactly as supplied by the site owner (split Kota pairs keep the combined supplied address + group).
const SUPPLIED = {
  'ALLEN Sankalp (Head Office)': 'CP-6, Indra Vihar, Kota, Rajasthan 324005',
  'ALLEN Supath Campus': 'Supath Campus, Baran Road, Naya Nohra, Kota',
  'ALLEN Saakar Campus': 'Plot No. 6, Jhalawar Road, opposite City Mall, Rajeev Gandhi Nagar, Kota',
  'ALLEN Sangyan Campus': 'Block FGH, Plot No. 4, Kunhari/Landmark City Road, Kota',
  'ALLEN Satyarth Campus': 'New Jawahar Nagar and District Center areas, Kota',
  'ALLEN Sammunnat Campus': 'New Jawahar Nagar and District Center areas, Kota',
  'ALLEN Samyak Campus': 'Landmark City, Kunhari, and Indra Vihar areas, Kota',
  'ALLEN Samarth Campus': 'Landmark City, Kunhari, and Indra Vihar areas, Kota',
  'JLN Marg Campus (Sarvatra Head Office)': '11, Samachar Jagat, opposite Vidyashram School, JLN Marg, Bajaj Nagar, Jaipur',
  'Gopalpura Campus 1': 'Surya Nagar, near Ridhi Sidhi, Jaipur',
  'Gopalpura Campus 2': 'Plot No. 49, 10 B Scheme, Gopalpura Bypass, Jaipur',
  'Gopalpura Campus 3 (Pooja Tower)': 'Muktanand Nagar, Gopalpura Bypass, Jaipur',
  'Vaishali Nagar Campus': 'B-41 & 42, Nityanand Nagar-1, Gandhi Path, Jaipur',
  'Hanuman Nagar Campus': 'Plots B-13 & 17, Sirsi Road, Jaipur',
  'Bani Park Campus (Sarvatra-3)': 'K K Tower, Plot No. D200, Kattha Bandha Road/Jhotwara Road, opposite Dudh Mandi, Jaipur',
  'Malviya Nagar Campus': 'Near C-2 Plaza, Apex Circle, Malviya Nagar, Jaipur',
  'Shastri Nagar Campus (Kapish Tower)': 'Subhash Nagar Shopping Centre, Shastri Nagar, Jaipur',
};
assert(C.length === Object.keys(SUPPLIED).length && C.every((c) => SUPPLIED[c.name] === c.suppliedAddress), 'All 17 entries keep the supplied campus names and address details verbatim');
assert(new Set(C.map((c) => c.name)).size === C.length, 'No duplicate campus entries');
assert(['cand-kota-satyarth', 'cand-kota-sammunnat'].every((id) => byId[id].suppliedGroup === 'ALLEN Satyarth & Sammunnat Campuses')
  && ['cand-kota-samyak', 'cand-kota-samarth'].every((id) => byId[id].suppliedGroup === 'ALLEN Samyak & Samarth Campuses'), 'Split Kota pairs record the supplied combined entry');
const groups = getCandidateLocationsByCity();
assert(Object.keys(groups).join(',') === 'Kota,Jaipur' && groups.Kota.length === 8 && groups.Jaipur.length === 9, 'Grouped by city: Kota 8, Jaipur 9');
assert(Object.values(groups).flat().length === C.length, 'City lists include every entry');
const withoutCoords = C.filter((c) => c.coordinates === null);
assert(withoutCoords.length === 13 && withoutCoords.every((c) => groups[c.city].includes(c)), '13 entries without coordinates are still listed under their city');
assert(Object.values(groups).flat().every((c) => typeof c.name === 'string' && c.name && typeof c.suppliedAddress === 'string' && c.suppliedAddress), 'A list entry needs only name + supplied address (coordinates optional)');
assert(C.every((c) => typeof c.locationVerification === 'string' && c.arhamWorkConfirmed === false), 'Location verification is recorded separately from (unconfirmed) Arham work');
assert(getPublishedProjectsByStateAndCity('IN-RJ', 'Kota', C).length === 0 && getPublishedProjectsByStateAndCity('IN-RJ', 'Jaipur', C).length === 0, 'Candidates never appear in the public city project lists');
const presencePage = read('../src/pages/Presence.jsx');
assert(/const cityProjects = useMemo\(\s*\(\) => \(selectedState && selectedCity \? getPublishedProjectsByStateAndCity\(selectedState\.code, selectedCity\)/.test(presencePage), 'Verified-project list still reads published projects only (candidates kept separate)');

console.log('\n5. Review Workflow:');
assert(CANDIDATE_STATUSES.join(',') === 'UNVERIFIED,PENDING_REVIEW,APPROVED,REJECTED', 'Statuses: UNVERIFIED → PENDING_REVIEW → APPROVED | REJECTED');
assert(canTransition('UNVERIFIED', 'PENDING_REVIEW') && canTransition('PENDING_REVIEW', 'APPROVED') && canTransition('PENDING_REVIEW', 'REJECTED'), 'Allowed forward transitions');
assert(!canTransition('UNVERIFIED', 'APPROVED') && !canTransition('APPROVED', 'UNVERIFIED') && !canTransition('REJECTED', 'PENDING_REVIEW'), 'No skipping review, no reopening terminal states');
const reviewDoc = read('../src/data/CANDIDATE_REVIEW.md');
assert(/Arham's work is confirmed/.test(reviewDoc) && /Permission to publish/.test(reviewDoc) && /no code path that converts or publishes/.test(reviewDoc), 'Review doc requires work confirmation + publish permission; no auto-publish');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
