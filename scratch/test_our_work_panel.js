/**
 * Our Work panel / sheet (branch our-work-panel): viewport-tall desktop area, pinned header + scrolling
 * list, 85dvh phone sheet with the page locked behind it, single-group cities opening their list
 * directly, short campus names, compact rows without the shared stand-in photo, scope chips only when
 * a row differs. (The live layout is also checked in a real browser at 1440×900 and 390×844.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProjectRows, hasOwnPhoto, PLACEHOLDER_PHOTOS, projectPhotos } from '../src/data/showcaseProjects.js';
import { getBrowsableProjects, projectsInCity, getGroups, listName, typicalScope, scopeDiffers } from '../src/data/projectBrowse.js';
import { presenceNavReducer, INITIAL_PRESENCE_NAV, sheetLevel } from '../src/lib/presenceNavigation.js';
import { historyDepth } from '../src/lib/useSheetHistory.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};
const all = getBrowsableProjects();
const page = read('../src/pages/Presence.jsx');
const browser = read('../src/components/presence/ProjectBrowser.jsx');
const sheet = read('../src/components/presence/ProjectSheet.jsx');
const css = read('../src/styles/index.css');

console.log('\n1. Panel / sheet height never exceeds the viewport');
assert(/lg:h-\[calc\(100dvh-5rem\)\]/.test(page) && /data-map-area=""/.test(page), 'Desktop: the map + panel area is exactly 100dvh minus the header (h-20 = 5rem)');
assert(/<aside[\s\S]*?className="relative z-30 w-\[400px\] shrink-0 h-full min-h-0 flex flex-col overflow-hidden/.test(page) && !/lg:sticky lg:top-24 max-h/.test(page), 'Desktop panel fills that area (h-full) and never grows past it; it does not scroll itself');
assert(/const MAX_SHARE = 0\.85;/.test(sheet) && /Math\.min\(vh - TOP_GAP, Math\.round\(vh \* MAX_SHARE\)\)/.test(sheet), 'Phone sheet: full height at most 85 % of the screen');
for (const [label, vh] of [['desktop 1440×900', 900], ['phone 390×844', 844]]) {
  const fullH = Math.max(320, Math.min(vh - 72, Math.round(vh * 0.85)));
  assert(label.startsWith('desktop') ? 900 - 80 <= vh : fullH <= vh && fullH <= Math.round(vh * 0.85), `${label}: ${label.startsWith('desktop') ? `area ${vh - 80}px` : `sheet ${fullH}px`} ≤ viewport ${vh}px`);
}
assert(/@media \(max-width: 1023px\) \{\s*html\[data-map-card="open"\] \{ overflow: hidden; overscroll-behavior: none; \}/.test(css), 'Phone: the page behind the open sheet is locked');
assert(/className="flex-1 min-h-0 flex flex-col overflow-hidden px-4"/.test(sheet), 'Sheet body does not scroll (only the list inside does)');

console.log('\n2. Pinned header + scrolling body, thin scrollbar, bottom fade');
assert(/const Layout = \(\{ header, scrollKey, children \}\) => \(/.test(browser) && /data-panel-header=""/.test(browser) && /data-panel-scroll=""/.test(browser), 'Every level: pinned header + scrolling body');
assert((browser.match(/<Layout/g) || []).length === 4, 'Used by all four levels (city, group, project, cluster)');
assert(/role="tablist"[\s\S]*?<\/>\s*\);\s*return \(\s*<Layout scrollKey=\{`\$\{focusKey\}\|\$\{tab\}`\} header=\{header\}>/.test(browser), 'Group list: back link, title and status tabs are in the pinned header');
assert(/header=\{<TopBar backLabel=\{`\$\{owner\} · \$\{project\.city\}`\}/.test(browser), 'Project detail: back link + close pinned');
assert(/panel-scroll h-full overflow-y-auto overscroll-contain/.test(browser) && /\.panel-scroll::-webkit-scrollbar \{ width: 6px; \}/.test(css) && /scrollbar-color: rgba\(255, 255, 255, 0\.18\) transparent;/.test(css) && /::-webkit-scrollbar-button \{ display: none;/.test(css) && /border-radius: 9999px/.test(css), 'Thin themed scrollbar: 6 px, rounded, no arrows; thin + rgba(255,255,255,.18) where only the standard properties work');
assert(/data-scroll-fade=\{more \? 'on' : 'off'\}/.test(browser) && /el\.scrollTop \+ el\.clientHeight < el\.scrollHeight - 4/.test(browser) && /if \(next !== moreRef\.current\)/.test(browser), 'Bottom fade while more is below, hidden at the end (state changes only when it flips)');
assert(/useEffect\(\(\) => \{\s*if \(!isDesktop \|\| \(!nav\.stateCode && !selectedCity\)\) return;[\s\S]*?if \(Math\.abs\(delta\) <= 2\) return;[\s\S]*?prefers-reduced-motion: reduce\)'\)\.matches \? 'auto' : 'smooth'/.test(page), 'Desktop: opening a state / city scrolls the area under the header (skipped if aligned; reduced motion = instant)');

console.log('\n3. A city with one client group opens its list directly');
const run = (actions, from = INITIAL_PRESENCE_NAV) => actions.reduce(presenceNavReducer, from);
let n = run([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota', groupId: 'client:ALLEN Career Institute' }]);
assert(sheetLevel(n) === 'group' && n.autoGroup && historyDepth(n) === 1, 'Kota (one group) → its list, one level / one history entry');
const withProject = presenceNavReducer(n, { type: 'selectProject', projectId: 'allen-kota-sankalp' });
assert(withProject.autoGroup && historyDepth(withProject) === 2, 'Project from that list: two levels');
assert(sheetLevel(presenceNavReducer(withProject, { type: 'back' })) === 'group', 'Back: project → list');
const closed = presenceNavReducer(n, { type: 'back' });
assert(sheetLevel(closed) === null && closed.stateCode === 'IN-RJ', 'Back from the direct-opened list closes to the map (no city summary)');
n = run([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' }, { type: 'openGroup', groupId: 'g' }]);
assert(!n.autoGroup && historyDepth(n) === 2 && sheetLevel(presenceNavReducer(n, { type: 'back' })) === 'city', 'A city with several groups keeps the summary step (list → back → summary)');
assert(getGroups(projectsInCity(all, 'IN-RJ', 'Kota')).length === 1 && /const singleGroupOf = \(stateCode, city\) => \{[\s\S]*?cityGroups\.length === 1 \? cityGroups\[0\]\.id : null;/.test(page), 'The page opens the group directly when the city has exactly one');
assert(/backLabel="Map"/.test(browser) && /<StatTiles projects=\{group\.projects\} compact \/>/.test(browser) && /autoGroup=\{nav\.autoGroup\}/.test(page), 'Direct-opened list: "‹ Map" back link and the city\'s stat tiles in its header');

console.log('\n4. Short campus names in client + city lists (full name in the detail)');
const byId = (id) => all.find((p) => p.id === id);
assert(listName(byId('allen-ahmedabad-sadhya-sbr')) === 'Sadhya SBR' && listName(byId('allen-ahmedabad-maninagar')) === 'Maninagar Campus' && listName(byId('allen-ahmedabad-gandhinagar')) === 'Gandhinagar Campus', 'Sadhya SBR, Maninagar Campus, Gandhinagar Campus');
assert(listName(byId('allen-kota-sankalp')) === 'Sankalp' && listName(byId('allen-mumbai-manpada')) === 'Thane – Manpada Campus' && listName(byId('allen-panaji-centre')) === 'Panaji Centre', 'Kota: "Sankalp"; a satellite town keeps its place ("Thane – Manpada Campus")');
assert(all.every((p) => !listName(p).startsWith('ALLEN ') && !listName(p).startsWith(`${p.city} – `)), 'No list name keeps "ALLEN " or "<City> – "');
assert(/<ProjectRow key=\{p\.id\} project=\{p\} onOpen=\{onOpenProject\} group=\{group\} short \/>/.test(browser) && /\{heading\(project\.name\)\}/.test(browser) && /<span className="sr-only">\{project\.name\}<\/span>/.test(browser), 'Lists use the short name (screen readers hear the full one); the detail heading is the full name');

console.log('\n5. Compact rows: no thumbnail for the shared stand-in photo');
assert(all.every((p) => !hasOwnPhoto(p)) && all.every((p) => projectPhotos(p).every((src) => PLACEHOLDER_PHOTOS.includes(src))), 'All ALLEN rows only have the shared photo → no thumbnails');
assert(hasOwnPhoto({ photos: ['/images/real-site.jpg'] }) && hasOwnPhoto({ photos: [PLACEHOLDER_PHOTOS[0], '/images/real.jpg'] }) && !hasOwnPhoto({ photos: [] }), 'A real photo brings the thumbnail back by itself');
assert(/const thumb = hasOwnPhoto\(project\) \? projectPhotos\(project\)\[0\] : null;/.test(browser) && /loading="lazy"/.test(browser), 'Rows read hasOwnPhoto (thumbnails lazy-loaded when shown)');

console.log('\n6. Scope chips only when a row\'s work differs from its group');
const kotaGroup = getGroups(projectsInCity(all, 'IN-RJ', 'Kota'))[0];
assert(typicalScope(kotaGroup.projects).join() === 'Full wiring,Lighting' && kotaGroup.typicalScope.join() === 'Full wiring,Lighting', 'Group typical work: Full wiring + Lighting');
assert(kotaGroup.projects.every((p) => !scopeDiffers(p, kotaGroup)), 'Every Kota row matches → no chips');
assert(scopeDiffers({ ...kotaGroup.projects[0], scope: ['Full wiring', 'Lighting', 'DB panels'] }, kotaGroup) && !scopeDiffers({ ...kotaGroup.projects[0], scope: ['Lighting', 'Full wiring'] }, kotaGroup), 'Extra work (DB panels) shows chips; the same work in another order does not');
assert(/\{\(!group \|\| scopeDiffers\(project, group\)\) && <ScopeChips scope=\{project\.scope\} inline \/>\}/.test(browser), 'Rows render chips only when scopeDiffers');
assert(getProjectRows().length === 98, 'Data unchanged (98 rows)');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
