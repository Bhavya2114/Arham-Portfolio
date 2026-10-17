/**
 * Our Work project browsing (branch our-work-projects): data rows → selectors → filters → map counts →
 * city sheet / panel → group list → project detail, and the navigation between them.
 * (Replaces test_presence_projects.js, which tested the removed floating campus card.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
import { SHOWCASE_PROJECTS, SCOPE_LABELS, USE_PLACEHOLDER_PROJECTS, MAX_PHOTOS, getProjectRows, projectPhotos } from '../src/data/showcaseProjects.js';
import {
  FILTER_ALL, isListable, getBrowsableProjects, groupIdOf, getGroups, getFilterOptions, filterProjects, countByCity, cityKey,
  statesWithProjects, projectsInState, projectsInCity, placeSummary, statusStats, filterByStatus, cityLine, statusLabel, similarProjectText, scopeSummary, statusTabs, statTiles, uniformStatusLine, showClientFilter,
} from '../src/data/projectBrowse.js';
import { presenceNavReducer, INITIAL_PRESENCE_NAV, sheetLevel } from '../src/lib/presenceNavigation.js';
import { getPresenceState } from '../src/data/presenceCoverage.js';
import { historyDepth } from '../src/lib/useSheetHistory.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
const exists = (rel) => fs.existsSync(path.resolve(here, rel));
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};

console.log('\n1. Data rows (one per project)');
const realRows = getProjectRows();
assert(!USE_PLACEHOLDER_PROJECTS && realRows.length === SHOWCASE_PROJECTS.length && realRows.length > 0 && realRows.every((p) => !p.demo), `Only real rows are shown (${realRows.length}; placeholders off)`);
assert(new Set(realRows.map((p) => p.id)).size === realRows.length, 'Unique ids');
assert(realRows.every((p) => p.client === 'ALLEN Career Institute' && p.category === 'Coaching centre' && p.name && p.area), 'Client, category, name and area on every row');
assert(realRows.every((p) => getPresenceState(p.stateCode)?.cities.includes(p.city)), 'Every row is in a worked (coverage) city');
assert(realRows.every((p) => Array.isArray(p.scope) && p.scope.length > 0 && p.scope.every((s) => s in SCOPE_LABELS)), 'Scope uses the fixed list of work types');
assert(realRows.every((p) => ['completed', 'ongoing'].includes(p.status) && (p.status === 'ongoing' || Number.isInteger(p.year))), 'Status completed (with year) or ongoing');
assert(realRows.every((p) => projectPhotos(p).length >= 1 && projectPhotos(p).length <= MAX_PHOTOS) && MAX_PHOTOS === 6, '1–6 photos per project');

// Selector behaviour is also exercised with other kinds of rows (no-client jobs, ongoing work). These
// three rows exist only in this test: they are never part of the site's data.
const TEST_ONLY_ROWS = [
  { id: 'test-commercial-kota', client: null, category: 'Commercial', name: 'Test commercial building', area: 'Talwandi', city: 'Kota', stateCode: 'IN-RJ', scope: ['Full wiring', 'DB panels'], status: 'completed', year: 2021, photos: ['/t.jpg'], lat: null, lng: null },
  { id: 'test-commercial-pune', client: null, category: 'Commercial', name: 'Test office', area: 'Baner', city: 'Pune', stateCode: 'IN-MH', scope: ['Cabling'], status: 'ongoing', year: null, photos: ['/t.jpg'], lat: null, lng: null },
  { id: 'test-residential-kota', client: null, category: 'Residential', name: 'Test home', area: 'Talwandi', city: 'Kota', stateCode: 'IN-RJ', scope: ['Full wiring', 'Lighting'], status: 'ongoing', year: null, photos: ['/t.jpg'], lat: null, lng: null },
];
const rows = [...realRows, ...TEST_ONLY_ROWS];
const kotaAllen = rows.filter((p) => p.client && p.city === 'Kota');

console.log('\n2. Selectors (everything derived from the rows)');
const all = getBrowsableProjects(rows);
assert(all.length === rows.length && !isListable({ ...rows[0], city: 'Indore' }) && !isListable({ ...rows[0], name: '' }), 'Rows outside coverage cities or missing fields are left out');
const opts = getFilterOptions(all);
assert(opts[0].id === FILTER_ALL && opts[0].label === 'All clients' && opts[0].count === all.length, '"All clients" chip first, with the total');
assert(opts.slice(1).map((o) => o.label).join(',') === 'ALLEN Career Institute,Commercial,Residential', `One chip per client / category with projects (${opts.slice(1).map((o) => `${o.label} ${o.count}`).join(', ')})`);
assert(opts.slice(1).reduce((s, o) => s + o.count, 0) === all.length, 'Chip counts add up to the total');
const allen = filterProjects(all, 'client:ALLEN Career Institute');
assert(allen.length === rows.filter((p) => p.client).length && allen.every((p) => groupIdOf(p) === 'client:ALLEN Career Institute'), 'Client filter keeps only that client');
assert(filterProjects(all, 'category:Commercial').every((p) => !p.client && p.category === 'Commercial'), 'Category filter keeps only no-client projects of that category');
const counts = countByCity(all);
assert([...counts.values()].reduce((s, n) => s + n, 0) === all.length && counts.get(cityKey('IN-RJ', 'Kota')) === rows.filter((p) => p.city === 'Kota').length, 'City counts add up and match the rows');
assert(countByCity(allen).get(cityKey('IN-RJ', 'Kota')) === kotaAllen.length, 'City counts follow the filter');
assert(getBrowsableProjects().length === realRows.length && statesWithProjects(filterProjects(all, 'category:Residential')).size < statesWithProjects(all).size, 'A filter narrows the states with projects (the others are dimmed)');
const india = placeSummary(all, 'India');
assert(india.text === `India · ${counts.size} cities · ${all.length} projects`, `Summary pill: "${india.text}"`);
const rj = placeSummary(projectsInState(all, 'IN-RJ'), 'Rajasthan');
assert(/^Rajasthan · \d+ cities · \d+ projects$/.test(rj.text) && placeSummary([rows[0]], 'X').text === 'X · 1 city · 1 project', `State summary and singulars ("${rj.text}")`);
const kota = projectsInCity(all, 'IN-RJ', 'Kota');
const ks = statusStats(kota);
assert(ks.total === kota.length && ks.completed + ks.ongoing === ks.total && ks.ongoing > 0, `Stat tiles: ${ks.total} projects, ${ks.completed} completed, ${ks.ongoing} ongoing`);
const groups = getGroups(kota);
assert(groups[0].name === 'ALLEN Career Institute' && groups[0].line === `${kotaAllen.length} campuses · wiring & lighting`, `Client group row: "${groups[0].name} — ${groups[0].line}"`);
assert(groups.some((g) => g.id === 'category:Commercial' && !g.isClient && /^1 building · /.test(g.line)) && groups.some((g) => g.id === 'category:Residential' && /^1 home · /.test(g.line)), 'No-client projects group by category, with a matching noun');
assert(groups.every((g, i) => i === 0 || groups[i - 1].count >= g.count), 'Groups sorted biggest first');
assert(filterByStatus(groups[0].projects, 'ongoing').length + filterByStatus(groups[0].projects, 'completed').length === groups[0].count && filterByStatus(groups[0].projects, 'all').length === groups[0].count, 'Tabs All / Completed / Ongoing split the group');
assert(cityLine(kota) === 'Electrical work for coaching centres, commercial buildings and homes.', `City line: "${cityLine(kota)}"`);
assert(scopeSummary([{ scope: ['DB panels'] }, { scope: ['DB panels', 'Lighting'] }]) === 'panels & lighting', 'Scope summary: the two most common kinds of work');
const done = rows.find((p) => p.status === 'completed');
const ongoing = rows.find((p) => p.status === 'ongoing');
assert(statusLabel(done) === String(done.year) && statusLabel(done, { long: true }) === `Completed ${done.year}` && statusLabel(ongoing) === 'Ongoing', 'Status tags: "✓ 2022" / "Completed 2022" / "Ongoing"');
assert(similarProjectText(done, 'Arham Power Solutions').includes(`"${done.name}" (${done.area}, ${done.city})`), 'WhatsApp text names the project and its place');
// Adding a row updates every count.
const extra = { ...rows[0], id: 'extra-row', city: 'Patna', stateCode: 'IN-BR', client: null, category: 'Residential' };
const more = getBrowsableProjects([...rows, extra]);
assert(more.length === all.length + 1 && countByCity(more).get(cityKey('IN-BR', 'Patna')) === (counts.get(cityKey('IN-BR', 'Patna')) || 0) + 1 && getFilterOptions(more).find((o) => o.id === 'category:Residential').count === opts.find((o) => o.id === 'category:Residential').count + 1, 'Adding one row updates the city count, the chip counts and the totals');
// 60 rows stay fast.
const big = Array.from({ length: 60 }, (_, i) => ({ ...rows[i % rows.length], id: `bulk-${i}` }));
const t0 = performance.now();
for (let i = 0; i < 50; i += 1) getGroups(projectsInCity(filterProjects(getBrowsableProjects(big), FILTER_ALL), 'IN-RJ', 'Kota'));
const perRun = (performance.now() - t0) / 50;
assert(perRun < 5, `60 rows: filter + city + groups in ${perRun.toFixed(2)} ms`);

console.log('\n2b. Status tabs only for mixed statuses; one status → a single line');
const realKota = projectsInCity(getBrowsableProjects(), 'IN-RJ', 'Kota');
const realAhmedabad = projectsInCity(getBrowsableProjects(), 'IN-GJ', 'Ahmedabad');
assert(statusTabs(realKota).length === 0 && statusTabs(realAhmedabad).length === 0, 'Every row completed (Kota, Ahmedabad) → no tabs row');
assert(uniformStatusLine(realAhmedabad) === '7 projects · all completed' && uniformStatusLine(realKota) === '15 projects · all completed', `One status → one line: "${uniformStatusLine(realAhmedabad)}"`);
const onlyOngoing = [TEST_ONLY_ROWS[1], TEST_ONLY_ROWS[2]];
assert(statusTabs(onlyOngoing).length === 0 && uniformStatusLine(onlyOngoing) === '2 projects · all ongoing' && uniformStatusLine([TEST_ONLY_ROWS[1]]) === '1 project · ongoing', 'All ongoing → no tabs; "2 projects · all ongoing" ("1 project · ongoing")');
const mixed = [...realKota, TEST_ONLY_ROWS[2]];
assert(statusTabs(mixed).map((t) => `${t.label} ${t.count}`).join(', ') === `All ${mixed.length}, Completed ${realKota.length}, Ongoing 1`, `Mixed statuses → tabs come back: ${statusTabs(mixed).map((t) => `${t.label} ${t.count}`).join(', ')}`);
assert(uniformStatusLine(mixed) === null && statTiles(mixed).map((t) => `${t.label} ${t.value}`).join(', ') === `Projects ${mixed.length}, Completed ${realKota.length}, Ongoing 1`, 'Mixed statuses → tiles (Projects, Completed, Ongoing)');
assert(statTiles([TEST_ONLY_ROWS[0], TEST_ONLY_ROWS[2]]).every((t) => t.value > 0) && statusTabs([]).length === 0 && uniformStatusLine([]) === null, 'Tiles hide 0s; an empty list has no tabs and no line');
const browserSrc = read('../src/components/presence/ProjectBrowser.jsx');
assert(/statusTabs\(group\.projects\)/.test(browserSrc) && /\{groupTabs\.length > 0 && \(/.test(browserSrc) && /const line = uniformStatusLine\(projects\);\s*if \(line\) return <p/.test(browserSrc) && (browserSrc.match(/<StatTiles projects=/g) || []).length === 2, 'Sheet / panel: tabs row only when there are tabs; one shared StatTiles (line or tiles) for the city summary and the direct list');

console.log('\n2c. Client filter chips only while there are 2+ clients');
const oneClient = getFilterOptions(getBrowsableProjects());
assert(oneClient.length === 2 && !showClientFilter(oneClient), `Only ALLEN in the data → chips hidden (${oneClient.map((o) => `${o.label} ${o.count}`).join(' · ')})`);
const secondClient = { ...TEST_ONLY_ROWS[0], id: 'test-second-client', client: 'Test Hospital Trust', category: 'Hospital' };
const twoClients = getFilterOptions(getBrowsableProjects([...getProjectRows(), secondClient]));
assert(twoClients.length === 3 && showClientFilter(twoClients) && twoClients.map((o) => o.label).join(',') === 'All clients,ALLEN Career Institute,Test Hospital Trust', 'A second client (test-only row) → chips appear: All clients · ALLEN · the new client');
assert(showClientFilter(getFilterOptions(getBrowsableProjects([...getProjectRows(), TEST_ONLY_ROWS[0]]))), 'A no-client category (e.g. Commercial) also brings the chips back');
assert(/\{showClientFilter\(options\) && \(/.test(read('../src/components/presence/OurWorkToolbar.jsx')) && /<MapPin className="w-4 h-4 text-accent shrink-0"/.test(read('../src/components/presence/OurWorkToolbar.jsx')), 'Toolbar: the summary pill always; chips only via showClientFilter');

console.log('\n3. Navigation: map → city → group → project, back one level at a time');
const run = (actions, from = INITIAL_PRESENCE_NAV) => actions.reduce(presenceNavReducer, from);
let n = run([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }]);
assert(sheetLevel(n) === 'city' && n.groupId === null, 'City opens its summary');
n = presenceNavReducer(n, { type: 'openGroup', groupId: 'client:ALLEN Career Institute' });
assert(sheetLevel(n) === 'group' && n.groupId === 'client:ALLEN Career Institute', 'Group opens its list');
n = presenceNavReducer(n, { type: 'selectProject', projectId: kotaAllen[0].id });
assert(sheetLevel(n) === 'project' && n.groupId === 'client:ALLEN Career Institute' && n.city === 'Kota', 'Row opens the project (group kept)');
n = presenceNavReducer(n, { type: 'back' });
assert(sheetLevel(n) === 'group', 'Back: project → list');
n = presenceNavReducer(n, { type: 'back' });
assert(sheetLevel(n) === 'city', 'Back: list → summary');
n = presenceNavReducer(n, { type: 'back' });
assert(sheetLevel(n) === null && n.stateCode === 'IN-RJ', 'Back: summary → map (state view)');
n = run([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'openGroup', groupId: 'g' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Jaipur' }]);
assert(n.city === 'Jaipur' && n.groupId === null && n.projectId === null, 'A new city starts at its summary');
n = run([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'openGroup', groupId: 'g' }, { type: 'selectProject', projectId: 'x', city: 'Jaipur', groupId: 'category:Commercial' }]);
assert(n.city === 'Jaipur' && n.groupId === 'category:Commercial', 'A pin in another city opens its project under its own city and group');
assert(presenceNavReducer(INITIAL_PRESENCE_NAV, { type: 'openGroup', groupId: 'g' }) === INITIAL_PRESENCE_NAV, 'No group without a city');
n = presenceNavReducer(run([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'openGroup', groupId: 'g' }]), { type: 'closeSheet' });
assert(n.stateCode === 'IN-RJ' && sheetLevel(n) === null, 'Close returns to the state map in one step');

console.log('\n4. Map: counts, filter, dimming');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const svgSrc = read('../src/components/map/IndiaMapSvg.jsx');
const page = read('../src/pages/Presence.jsx');
assert(/\{m\.count > 0 && !moving && \(/.test(mapSrc) && /fill=\{MAP_COLORS\.edge\}/.test(mapSrc.slice(mapSrc.indexOf('data-count-badge'))) && /data-count-badge/.test(mapSrc), 'City pins: yellow count badge, hidden while the map moves');
assert(/fillOpacity=\{m\.dim && !isSelected \? DIM_PIN_OPACITY : 1\}/.test(mapSrc) && /c\.dim \? OVERVIEW_CITY\.dimOpacity/.test(mapSrc), 'Filter dims city pins and overview dots (per element)');
assert(/dimStateCodes = \[\]/.test(svgSrc) && /const lit = hero \? \[hero\] : worked\.filter\(\(state\) => !filteredOut\.has\(state\.id\)\);/.test(svgSrc) && !/<g[^>]*opacity=/.test(svgSrc + mapSrc), 'Filter dims worked states with no matches (per-path fill opacity, no group opacity)');
assert(!/filter=|blur\(|backdrop-blur/.test(svgSrc + mapSrc), 'No blur on the map');
assert(/toolbar=\{<OurWorkToolbar summary=\{summary\} options=\{filterOptions\} filter=\{filter\} onFilter=\{setFilter\} \/>\}/.test(page), 'Summary pill + filter chips above the map');
const toolbar = read('../src/components/presence/OurWorkToolbar.jsx');
assert(/aria-pressed=\{active\}/.test(toolbar) && /overflow-x-auto/.test(toolbar) && /min-h-\[44px\]/.test(toolbar), 'Chips: toggle buttons, horizontally scrollable, 44 px');
assert(/const highlightedProjectId = project && hasSiteCoordinates\(project\) \? project\.id : null;/.test(page) && /cityBeacon=\{!highlightedProjectId\}/.test(page), 'Open project → its pin beacons, or its city pin when it has no coordinates');

console.log('\n5. Sheet / panel');
const sheet = read('../src/components/presence/ProjectSheet.jsx');
assert(/role="dialog"/.test(sheet) && /aria-labelledby=\{labelledBy\}/.test(sheet) && /aria-modal="false"/.test(sheet), 'Sheet is a dialog region labelled by its heading (the map stays usable)');
assert(/transform 250ms/.test(sheet) && !/transition-\[height\]|transition: 'height/.test(sheet) && /style=\{\{ height: fullH,/.test(sheet), 'Open / expand / drag move it with transform only (~250 ms); its height never animates');
const moveFn = sheet.slice(sheet.indexOf('const onPointerMove'), sheet.indexOf('const onPointerEnd'));
assert(/place\(d\.y, false\)/.test(moveFn) && !/set[A-Z]\w*\(/.test(moveFn), 'Dragging writes the transform through a ref (no React render per frame)');
assert(/const HALF = 0\.5;/.test(sheet) && /setSnap\(level === 'city' \? 'half' : 'full'\)/.test(page), 'Half height for a city, full for a list / project (tapping a group expands it)');
assert(/\{isDesktop && level && \(/.test(page) && /w-\[400px\]/.test(page) && /\{!isDesktop && level && \(/.test(page), 'Desktop: the same content in a 400 px side panel; phone: the sheet (never both)');
const browser = read('../src/components/presence/ProjectBrowser.jsx');
assert(/headingRef\.current\?\.focus\(\{ preventScroll: true \}\)/.test(browser) && /tabIndex=\{-1\}/.test(browser), 'Focus moves to the level heading');
assert(/cityPinFor\(city\)\?\.focus\(\{ preventScroll: true \}\)/.test(page), 'Closing returns focus to the city pin');
assert(/if \(e\.key === 'Escape'\) dispatch\(\{ type: 'back' \}\);/.test(page), 'Escape steps back one level');
assert(/html\[data-map-card="open"\] \.mobile-action-bar/.test(read('../src/styles/index.css')) && /if \(selectedCity\) root\.setAttribute\('data-map-card', 'open'\);/.test(page), 'Phone Call / WhatsApp / Enquire bar hides while the sheet is open');
assert(/backLabel=\{city\}/.test(browser) && /backLabel=\{`\$\{owner\} · \$\{project\.city\}`\}/.test(browser), 'Back links: "‹ City" and "‹ Client · City"');
assert(/role="tablist"/.test(browser) && /role="tab"/.test(browser) && /aria-selected=\{tab === t\.id\}/.test(browser), 'Group list tabs All / Completed / Ongoing');
assert(/loading="lazy"/.test(browser) && /h-\[76px\] w-\[76px\]/.test(browser), 'Rows: 76 px lazy thumbnails in a plain list');
assert(!/\.map\([^)]*=>\s*<ul/.test(browser) && !/<button[^>]*>[\s\S]{0,400}<ul/.test(browser.slice(browser.indexOf('const ProjectRow'), browser.indexOf('export const ProjectBrowser'))), 'No list markup inside row buttons');
assert(/similarProjectText\(project, COMPANY\.name\)/.test(browser) && /Ask about a similar project on WhatsApp/.test(browser), 'Primary "Ask about a similar project on WhatsApp" button');
const gallery = read('../src/components/presence/PhotoGallery.jsx');
assert(/snap-x snap-mandatory/.test(gallery) && /\{index \+ 1\} \/ \{photos\.length\}/.test(gallery) && /aria-modal="true"/.test(gallery) && /stopImmediatePropagation/.test(gallery), 'Photos: swipe (scroll-snap), "1 / 6" counter, full-screen viewer whose Escape closes only itself');
assert(/setIndex\(\(prev\) => \(prev === i \? prev/.test(gallery), 'Photo index stored only when it changes');

console.log('\n6. Phone back button: one history entry per sheet level');
const nav0 = { ...INITIAL_PRESENCE_NAV, stateCode: 'IN-RJ' };
assert(historyDepth(nav0) === 0 && historyDepth({ ...nav0, city: 'Kota' }) === 1 && historyDepth({ ...nav0, city: 'Kota', groupId: 'g' }) === 2
  && historyDepth({ ...nav0, city: 'Kota', groupId: 'g', projectId: 'p' }) === 3 && historyDepth({ ...nav0, city: 'Kota', groupId: 'g', projectId: 'p' }, true) === 4,
  'Levels: summary 1, list 2, project 3, photo viewer 4 (state view 0)');
assert(historyDepth({ ...nav0, clusterIds: ['a', 'b'] }) === 1, 'A pin cluster chooser is one level');
// Every reducer `back` removes exactly one level, so N history entries = N back presses.
let walk = run([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'openGroup', groupId: 'g' }, { type: 'selectProject', projectId: 'p' }]);
const depths = [historyDepth(walk)];
while (historyDepth(walk) > 0) { walk = presenceNavReducer(walk, { type: 'back' }); depths.push(historyDepth(walk)); }
assert(depths.join(',') === '3,2,1,0' && walk.stateCode === 'IN-RJ', `Each back removes one level (${depths.join(' → ')}); the last one closes the sheet, the state stays`);
const hook = read('../src/lib/useSheetHistory.js');
assert(/navigate\(here, \{ state: \{ ourWorkLevel: level \} \}\)/.test(hook) && /const here = `\$\{location\.pathname\}\$\{location\.search\}`;/.test(hook), 'Opening a level pushes an entry for the SAME URL (no route change, no reload)');
assert(/navigate\(depth - at\);/.test(hook), 'Closing levels in the page goes back by as many entries');
assert(/if \(navigationType !== 'POP'\) return;/.test(hook) && /stepBackRef\.current\(open - level\);/.test(hook), 'Browser back steps the page back by the levels popped');
assert(/window\.history\.scrollRestoration = 'manual';/.test(hook) && /navigate\(here, \{ replace: true, state: null \}\)/.test(hook), 'No scroll jumps on back; a reload starts closed on a plain entry');
assert(/useSheetHistory\(historyDepth\(nav, viewerOpen\),/.test(page) && /setPhotoViewer\(null\);\s*left -= 1;/.test(page) && /for \(; left > 0; left -= 1\) dispatch\(\{ type: 'back' \}\);/.test(page), 'Page: viewer closes first, then one reducer back per level');
assert(/viewer=\{photoViewer\} onViewerChange=\{onPhotoViewer\}/.test(browser) && /const controlled = viewerProp !== undefined;/.test(gallery), 'The photo viewer is a page-owned level (closable by the back button)');
assert(!/animateTo|setView|viewBox/.test(hook), 'History never touches the map');

console.log('\n7. One way of browsing');
assert(['CampusCard', 'BottomSheet', 'ProjectDetails', 'ProjectGrid', 'BeforeAfterSlider', 'CityStatus'].every((f) => !exists(`../src/components/presence/${f}.jsx`)), 'Old floating card, old sheet, published-project panel and the card list under the map removed');
assert(!/overlay=\{|ProjectGrid|CampusCard/.test(page), 'The page uses only the map + sheet / panel');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
