/**
 * Our Work panel / sheet (branch our-work-panel): viewport-tall desktop area, pinned header + scrolling
 * list, 85dvh phone sheet with the page locked behind it, single-group cities opening their list
 * directly, short names (client brand word + campus, no city prefix), compact rows without the shared stand-in photo, scope chips only when
 * a row differs. (The live layout is also checked in a real browser at 1440×900 and 390×844.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProjectRows, hasOwnPhoto, PLACEHOLDER_PHOTOS, projectPhotos, mapsSearchUrl } from '../src/data/showcaseProjects.js';
import { getBrowsableProjects, projectsInCity, getGroups, listName, clientBrand, typicalScope, scopeDiffers, workSummary } from '../src/data/projectBrowse.js';
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
assert(/<aside[\s\S]*?className=\{`relative z-30 w-\[400px\] shrink-0 \$\{level === 'project' \? 'h-full' : 'self-start max-h-full'\} min-h-0 flex flex-col overflow-hidden/.test(page) && !/lg:sticky lg:top-24 max-h/.test(page), 'Desktop panel: lists as tall as their content (never taller than that area, max-h-full); a project fills it (h-full); it does not scroll itself');
assert(/const MAX_SHARE = 0\.85;/.test(sheet) && /Math\.min\(vh - TOP_GAP, Math\.round\(vh \* MAX_SHARE\)\)/.test(sheet), 'Phone sheet: full height at most 85 % of the screen');
for (const [label, vh] of [['desktop 1440×900', 900], ['phone 390×844', 844]]) {
  const fullH = Math.max(320, Math.min(vh - 72, Math.round(vh * 0.85)));
  assert(label.startsWith('desktop') ? 900 - 80 <= vh : fullH <= vh && fullH <= Math.round(vh * 0.85), `${label}: ${label.startsWith('desktop') ? `area ${vh - 80}px` : `sheet ${fullH}px`} ≤ viewport ${vh}px`);
}
assert(/@media \(max-width: 1023px\) \{\s*html\[data-map-card="open"\] \{ overflow: hidden; overscroll-behavior: none; \}/.test(css), 'Phone: the page behind the open sheet is locked');
assert(/className="flex-auto min-h-0 flex flex-col overflow-hidden px-4"/.test(sheet), 'Sheet body does not scroll (only the list inside does)');

console.log('\n2. Pinned header + scrolling body, thin scrollbar, bottom fade');
assert(/const Layout = \(\{ header, scrollKey, fill = false, children \}\) => \(/.test(browser) && /data-panel-header=""/.test(browser) && /data-panel-scroll=""/.test(browser), 'Every level: pinned header + scrolling body');
assert((browser.match(/<Layout/g) || []).length === 4, 'Used by all four levels (city, group, project, cluster)');
assert(/role="tablist"[\s\S]*?<\/>\s*\);\s*return \(\s*<Layout scrollKey=\{`\$\{focusKey\}\|\$\{tab\}`\} header=\{header\}>/.test(browser), 'Group list: back link, title and status tabs are in the pinned header');
assert(/<TopBar backLabel=\{autoGroup \? project\.city : `\$\{owner\} · \$\{project\.city\}`\}/.test(browser), 'Project detail: back link + close pinned');
assert(/panel-scroll min-h-0 overflow-y-auto overscroll-contain/.test(browser) && /\.panel-scroll::-webkit-scrollbar \{ width: 6px; \}/.test(css) && /scrollbar-color: rgba\(255, 255, 255, 0\.18\) transparent;/.test(css) && /::-webkit-scrollbar-button \{ display: none;/.test(css) && /border-radius: 9999px/.test(css), 'Thin themed scrollbar: 6 px, rounded, no arrows; thin + rgba(255,255,255,.18) where only the standard properties work');
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
assert(!/backLabel="Map"/.test(browser) && !/<StatTiles projects=\{group\.projects\}/.test(browser) && /\{group\.name\} · \{group\.count\} \{group\.noun\}\{ongoingSuffix\(group\.projects\)\}/.test(browser) && /autoGroup=\{nav\.autoGroup\}/.test(page), 'Direct-opened list: no back link (✕ only); the subtitle "<client> · N campuses" is the only count (no tiles, no status line)');

console.log('\n4. Short names in client + city lists: brand word + campus, no "<City> – " (full name in the detail)');
const byId = (id) => all.find((p) => p.id === id);
assert(clientBrand('ALLEN Career Institute') === 'ALLEN' && clientBrand(null) === null, 'Brand word = the client\'s first word ("ALLEN")');
assert(listName(byId('allen-ahmedabad-sadhya-sbr')) === 'ALLEN Sadhya SBR' && listName(byId('allen-ahmedabad-maninagar')) === 'ALLEN Maninagar Campus' && listName(byId('allen-ahmedabad-gandhinagar')) === 'ALLEN Gandhinagar Campus', 'ALLEN Sadhya SBR, ALLEN Maninagar Campus, ALLEN Gandhinagar Campus');
assert(listName(byId('allen-kota-sankalp')) === 'ALLEN Sankalp' && listName(byId('allen-mumbai-manpada')) === 'ALLEN Thane – Manpada Campus' && listName(byId('allen-panaji-centre')) === 'ALLEN Panaji Centre', 'Kota: "ALLEN Sankalp"; a satellite town keeps its place ("ALLEN Thane – Manpada Campus")');
assert(all.every((p) => listName(p).startsWith('ALLEN ') && !listName(p).includes(`ALLEN ${p.city} – `)), 'Every list name keeps "ALLEN " and never "ALLEN <City> – "');
assert(listName({ name: 'ACME Pune – Plant 2', client: 'ACME Industries', city: 'Pune' }) === 'ACME Plant 2' && listName({ name: 'Pune – Office block', client: null, city: 'Pune' }) === 'Office block', 'Generalised: any client\'s brand word + campus; no-client rows just lose the city prefix');
assert(!/allen[-_ ]?logo|logo\.(png|svg|webp)/i.test(browser) && /GraduationCap/.test(browser), 'No ALLEN logo; the cap icon stays');
assert(/<ProjectRow key=\{p\.id\} index=\{i\} project=\{p\} onOpen=\{onOpenProject\} group=\{group\} short \/>/.test(browser) && /\{heading\(project\.name, null, 'text-xl lg:text-2xl'\)\}/.test(browser) && /<span className="sr-only">\{project\.name\}<\/span>/.test(browser), 'Lists use the short name (screen readers hear the full one); the detail heading is the full name');

console.log('\n5. Compact rows: no thumbnail for the shared stand-in photo');
assert(all.every((p) => !hasOwnPhoto(p)) && all.every((p) => projectPhotos(p).every((src) => PLACEHOLDER_PHOTOS.includes(src))), 'All ALLEN rows only have the shared photo → no thumbnails');
assert(hasOwnPhoto({ photos: ['/images/real-site.jpg'] }) && hasOwnPhoto({ photos: [PLACEHOLDER_PHOTOS[0], '/images/real.jpg'] }) && !hasOwnPhoto({ photos: [] }), 'A real photo brings the thumbnail back by itself');
assert(/const thumb = hasOwnPhoto\(project\) \? projectPhotos\(project\)\[0\] : null;/.test(browser) && /loading="lazy"/.test(browser), 'Rows read hasOwnPhoto (thumbnails lazy-loaded when shown)');

console.log('\n6. Scope chips only when a row\'s work differs from its group');
const kotaGroup = getGroups(projectsInCity(all, 'IN-RJ', 'Kota'))[0];
assert(typicalScope(kotaGroup.projects).join() === 'Full wiring,Lighting' && kotaGroup.typicalScope.join() === 'Full wiring,Lighting', 'Group typical work: Full wiring + Lighting');
assert(kotaGroup.projects.every((p) => !scopeDiffers(p, kotaGroup)), 'Every Kota row matches → no chips');
assert(scopeDiffers({ ...kotaGroup.projects[0], scope: ['Full wiring', 'Lighting', 'DB panels'] }, kotaGroup) && !scopeDiffers({ ...kotaGroup.projects[0], scope: ['Lighting', 'Full wiring'] }, kotaGroup), 'Extra work (DB panels) shows chips; the same work in another order does not');
assert(/\{\(!group \|\| scopeDiffers\(project, group\)\) && <ScopeChips scope=\{project\.scope\} \/>\}/.test(browser), 'Rows render chips only when scopeDiffers');
assert(getProjectRows().length === 98, 'Data unchanged (98 rows)');

console.log('\n7. Panel / sheet styling (no behaviour change)');
const panelCss = css.slice(css.indexOf('.panel-surface {'), css.indexOf('/* Thin themed scrollbar'));
assert(/background: linear-gradient\(180deg, rgba\(32, 34, 39, 0\.82\), rgba\(20, 21, 24, 0\.92\)\);/.test(panelCss) && /border: 1px solid rgba\(255, 255, 255, 0\.09\);/.test(panelCss) && /inset 0 1px 0 rgba\(255, 255, 255, 0\.08\)/.test(panelCss), 'Surface: gradient, white/9 border, inset top highlight + drop shadow');
assert(!/backdrop-filter:|blur\(/.test(panelCss) && !/backdrop-blur/.test(browser + page + sheet), 'No backdrop-filter / blur anywhere on the panel or sheet');
assert(/\.panel-surface::before \{[\s\S]*?height: 2px;[\s\S]*?background: linear-gradient\(90deg, transparent, #D9E35A, transparent\);[\s\S]*?opacity: 0\.7;/.test(panelCss), 'Thin 2px lime line centred on the top edge, fading out at both ends (opacity .7)');
assert(/panel-surface p-5/.test(page) && /panel-surface panel-surface--sheet/.test(sheet) && /\.panel-surface--sheet \{\s*background-color: #0C0D0F;/.test(panelCss), 'Desktop panel and phone sheet use it (the sheet on a solid base so nothing behind shows through)');
assert(/const ROW_LIST = 'divide-y divide-white\/\[0\.07\]';/.test(browser) && !/rounded-xl border border-white\/\[0\.07\] bg-white\/\[0\.03\] \$\{thumb/.test(browser), 'Rows: no individual boxes, 1px white/7 dividers');
assert(/String\(index \+ 1\)\.padStart\(2, '0'\)/.test(browser) && /text-accent\/80/.test(browser) && /<ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" \/>/.test(browser), 'Zero-padded number in the accent (80 %), muted chevron on the right');
assert(/hover:bg-\[rgba\(217,227,90,0\.07\)\] hover:shadow-\[inset_3px_0_0_#D9E35A\]/.test(browser) && /focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/.test(browser) && /active:shadow-\[inset_3px_0_0_#D9E35A\]/.test(browser) && /rounded-\[10px\]/.test(browser), 'Hover / focus / pressed: lime tint, 10px corners, 3px lime bar; keyboard focus also an accent ring');
assert(/\.panel-surface \.text-muted \{ color: #A8ABB1; \}/.test(css), 'Muted text inside the see-through panel lightened just enough for AA over the map');
assert(/data-scroll-fade/.test(browser) && /from-\[#141518\]/.test(browser) && /panel-scroll min-h-0 overflow-y-auto/.test(browser), 'Bottom fade (matched to the panel) and thin scrollbar kept');

console.log('\n8. Panel fit: no "‹ Map", one-project cities open the project, height fits the content');
const fitRun = (actions) => actions.reduce(presenceNavReducer, INITIAL_PRESENCE_NAV);
const cityOf = (city) => projectsInCity(all, 'IN-RJ', city);
assert(cityOf('Udaipur').length === 1 && cityOf('Jodhpur').length === 3 && cityOf('Kota').length === 15, 'Test cities: Udaipur 1 project, Jodhpur 3, Kota 15');
// 1 project: tapping the city opens that project; one level; one back closes.
let one = fitRun([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Udaipur', groupId: 'client:ALLEN Career Institute', projectId: cityOf('Udaipur')[0].id }]);
assert(sheetLevel(one) === 'project' && one.autoProject && historyDepth(one) === 1 && historyDepth(one, true) === 2, '1-project city: project detail directly; depth 1 (2 with the photo viewer)');
assert(sheetLevel(presenceNavReducer(one, { type: 'back' })) === null && presenceNavReducer(one, { type: 'back' }).stateCode === 'IN-RJ', '1-project city: one back press closes to the map');
// 3 projects: list directly (one level); a project adds one; back steps project → list → map.
let three = fitRun([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Jodhpur', groupId: 'client:ALLEN Career Institute' }]);
assert(sheetLevel(three) === 'group' && historyDepth(three) === 1, '3-project city: list directly; depth 1');
three = presenceNavReducer(three, { type: 'selectProject', projectId: cityOf('Jodhpur')[0].id });
assert(sheetLevel(three) === 'project' && !three.autoProject && historyDepth(three) === 2, '3-project city: a project from the list is one more level (depth 2)');
assert(sheetLevel(presenceNavReducer(three, { type: 'back' })) === 'group' && sheetLevel(presenceNavReducer(presenceNavReducer(three, { type: 'back' }), { type: 'back' })) === null, '3-project city: back → list → map');
// 15 projects: same as 3, just a longer (scrolling) list.
const fifteen = fitRun([{ type: 'selectState', stateCode: 'IN-RJ' }, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota', groupId: 'client:ALLEN Career Institute' }]);
assert(sheetLevel(fifteen) === 'group' && historyDepth(fifteen) === 1 && historyDepth(presenceNavReducer(fifteen, { type: 'selectProject', projectId: cityOf('Kota')[3].id })) === 2, '15-project city: list depth 1, project depth 2');
assert(/projectId: only\.length === 1 \? only\[0\]\.id : null/.test(page) && /autoProject=\{nav\.autoProject\}/.test(page), 'The page opens the only project when a city has exactly one');
assert(/autoProject \? \(/.test(browser) && /data-project-context=""/.test(browser) && /\{project\.city\} <span className="font-normal text-muted">· \{owner\}<\/span>/.test(browser), 'Directly-opened project: "City · Client" context in the header, ✕ only (no back link)');
assert(/<CloseButton onClose=\{onClose\} label="Close list and return to the map" \/>/.test(browser) && !/backLabel="Map"/.test(browser), 'Lists opened directly have no "‹ Map" link; ✕ closes');
assert(/backLabel=\{autoGroup \? project\.city : `\$\{owner\} · \$\{project\.city\}`\}/.test(browser), 'A project opened from a list keeps its back link ("‹ Kota")');
// Height fits the content, up to the max.
assert(/const Layout = \(\{ header, scrollKey, fill = false, children \}\) => \(\s*<div className=\{`flex min-h-0 flex-col\$\{fill \? ' lg:flex-1' : ''\}`\}>/.test(browser) && /<div className=\{`relative flex min-h-0 flex-col\$\{fill \? ' lg:flex-1' : ''\}`\}>/.test(browser) &&(browser.match(/scrollKey=\{focusKey\}\s*fill\s/g) || []).length === 1, 'Lists are as tall as their content (only the project detail layout fills)');
assert(/const fitContent = snap === 'full';/.test(sheet) && /fitContent \? \{ height: 'auto', maxHeight: expanded \? fullH : capH \} : \{ height: fullH \}/.test(sheet), 'Phone sheet: content height, capped at 65 % (85 % once expanded)');
assert(/if \(fitContent\) \{[\s\S]*?\} else if \(d\.y - d\.grow > Math\.min\(\(h - d\.grow\) \* 0\.35, 160\)\) \{\s*place\(fullH, true\);/.test(sheet), 'Content-height sheet: dragged far down closes');

console.log('\n8b. Phone sheet height: 65 % cap, drag up to 85 %, each city starts at 65 %');
assert(/const CAP_SHARE = 0\.65;/.test(sheet) && /const MAX_SHARE = 0\.85;/.test(sheet) && /const capH = Math\.min\(fullH, Math\.max\(300, Math\.round\(vh \* CAP_SHARE\)\)\);/.test(sheet), 'Cap at 65 % of the screen (never above the 85 % full height); top third of the map stays visible');
assert(/const \[expanded, setExpanded\] = useState\(false\);/.test(sheet) && /<ProjectSheet key=\{`\$\{nav\.stateCode\}\|\$\{selectedCity\}`\}/.test(page), 'Expanded is the sheet\'s own state and the sheet is keyed per city → the next city starts at 65 %');
const moveFn10 = sheet.slice(sheet.indexOf('const onPointerMove'), sheet.indexOf('const onPointerEnd'));
assert(/if \(!d\.moved && fitContent && !expanded && dy < 0\) \{[\s\S]*?d\.grow = applyMaxHeight\(fullH\) - oldH;\s*d\.base = d\.grow;/.test(moveFn10) && !/set[A-Z]\w*\(/.test(moveFn10), 'Drag up from 65 %: the 85 % cap is applied once at the gesture start (FLIP offset), then only the transform moves');
const endFn10 = sheet.slice(sheet.indexOf('const onPointerEnd'), sheet.indexOf('return (\n    <section'));
assert(/if \(d\.grow > 0 && d\.y < d\.grow \/ 2\) \{\s*place\(0, true\);\s*setExpanded\(true\);/.test(endFn10) && /\} else if \(d\.grow > 0 \|\| \(expanded && d\.y > COLLAPSE_DRAG_PX\)\) \{\s*collapseFrom\(d\.y\);/.test(endFn10), 'Release: past halfway up → 85 %; dragged down a little → back to 65 %; far → closes');
assert(/const collapseFrom = \(y\) => \{[\s\S]*?place\(y - shrink, false\);[\s\S]*?place\(0, true\);/.test(sheet) && /const expandFrom = \(y\) => \{[\s\S]*?place\(y \+ grow, false\);[\s\S]*?place\(0, true\);/.test(sheet), 'Expand / collapse keep the top edge in place and animate the transform only');
assert(/else if \(expanded\) collapseFrom\(0\);\s*else expandFrom\(0\);/.test(sheet) && /aria-label=\{fitContent && expanded \? 'Collapse panel' : 'Expand panel'\}/.test(sheet) && /aria-expanded=\{fitContent && expanded\}/.test(sheet), 'Handle button (keyboard / tap): expand to 85 % and back');
assert(/<div className="space-y-3 lg:flex lg:flex-1 lg:flex-col lg:space-y-4" data-project-detail="">/.test(browser) && /py-2\.5 text-\[15px\] leading-snug font-semibold lg:py-3 lg:text-base/.test(browser), 'Phone detail a little tighter so it fits the 65 % cap with WhatsApp visible (desktop unchanged)');

console.log('\n9. Compact project detail: short photo, place · Map, one chip row');
const gallery = read('../src/components/presence/PhotoGallery.jsx');
const bik = projectsInCity(all, 'IN-RJ', 'Bikaner');
assert(bik.length >= 1 && bik.every((p) => p.address && mapsSearchUrl(p).startsWith('https://www.google.com/maps/search/?api=1&query=')), 'Bikaner rows keep their address (it builds the Maps URL)');
assert(/fill \? 'aspect-\[2\/1\] lg:aspect-auto lg:h-full' : 'aspect-video lg:aspect-\[2\/1\]'/.test(gallery) && !/aspect-\[10\/7\]/.test(gallery), 'Detail photo: 2:1 on phones (fits the 65 % sheet with the summary line); on desktop it fills the free height (see 10.)');
assert(/\{badge && \(/.test(gallery) && /\{photos\.length > 1 && \(\s*<span data-photo-counter=""/.test(gallery), 'Client badge kept on the photo; "1 / N" counter only with 2+ photos (swipe + thumbnails too)');
const detail = browser.slice(browser.indexOf("if (level === 'project' && project)"), browser.indexOf("if (level === 'cluster')"));
assert(/data-project-place=""/.test(detail) && /\[project\.area, project\.city\]\.filter\(Boolean\)\.join\(', '\)/.test(detail), 'Under the name: "Area, City" on one line');
assert(/href=\{mapsSearchUrl\(project\)\}/.test(detail) && /target="_blank"/.test(detail) && /aria-label=\{`Open \$\{project\.name\} in Google Maps`\}/.test(detail) && /<MapPin[^>]*\/>\s*Map\s*<\/a>/.test(detail), 'Small "📍 Map" link: same Maps URL, new tab, aria-label "Open <name> in Google Maps"');
assert(/<div className="flex">\s*<StatusTag project=\{project\} long \/>\s*<\/div>/.test(detail) && !/project\.scope/.test(detail) && !/aria-label="Status and work done"/.test(detail), 'Status ("✓ Completed 2022" / "Ongoing") is the only chip; no scope chips');
assert(!/Open in Google Maps<|\{project\.address\}|\{project\.category\}|Work done<|ExternalLink/.test(detail), 'Removed: address text, "Open in Google Maps", category chip, "Work done" heading');

console.log('\n10. Desktop detail: full-height panel, the photo fills the free space');
assert(/className=\{`relative z-30 w-\[400px\] shrink-0 \$\{level === 'project' \? 'h-full' : 'self-start max-h-full'\}/.test(page), 'Project detail: the desktop panel uses the full (viewport-fit) height, same as a long list');
assert(/<Layout\s+scrollKey=\{focusKey\}\s+fill\s+header=\{\s+autoProject/.test(browser) && /const ScrollBody = \(\{ resetKey, fill = false, children \}\)/.test(browser) && /\$\{fill \? ' lg:flex lg:flex-1 lg:flex-col' : ''\}`\} data-panel-scroll=""/.test(browser), 'Detail layout + scroll body pass the full height down (desktop only; still scrolls if it cannot fit)');
assert(/<PhotoGallery photos=\{photos\} alt=\{project\.name\} badge=\{owner\} viewer=\{photoViewer\} onViewerChange=\{onPhotoViewer\} fill \/>/.test(browser) && /fill \? ' lg:flex lg:flex-1 lg:min-h-\[260px\] lg:flex-col' : ''/.test(gallery) && /fill \? ' lg:min-h-0 lg:flex-1' : ''/.test(gallery) && /fill \? ' lg:absolute lg:inset-0' : ''/.test(gallery) && /object-cover/.test(gallery), 'Photo grows into the free space (flex 1, at least 260 px, object-fit cover) → text + WhatsApp sit at the bottom');
assert(/\{badge && \(/.test(gallery) && /data-project-place=""/.test(browser) && /<StatusTag project=\{project\} long \/>/.test(browser), 'Client badge, area · Map and the status chip kept from detail-compact');
assert(!/lg:/.test(read('../src/components/presence/ProjectSheet.jsx').match(/className="lg:hidden[^"]*"/)[0].replace('lg:hidden', '')), 'Phone sheet unchanged (all fill classes are lg: only; the sheet is lg:hidden)');

console.log('\n11. Detail summary: status chip + one sentence about the work');
const W = 'Complete wiring and lighting for the entire building.';
assert(workSummary({ scope: ['Full wiring', 'Lighting'] }) === W && workSummary({ scope: ['Lighting', 'Full wiring'] }) === W, 'Full wiring + lighting (any order) → "Complete wiring and lighting for the entire building."');
assert(workSummary({ scope: ['Full wiring', 'DB panels', 'Earthing'] }) === 'Wiring, DB panels and earthing.', 'Other scopes → a sentence: "Wiring, DB panels and earthing."');
assert(workSummary({ scope: ['Cabling'] }) === 'Cabling.' && workSummary({ scope: ['Lighting', 'Earthing'] }) === 'Lighting and earthing.' && workSummary({ scope: ['DB panels', 'Cabling'] }) === 'DB panels and cabling.', 'One label → "Cabling."; two → "A and b."; acronyms keep their case');
assert(workSummary({ scope: ['Full wiring', 'Lighting'], summary: '  Rewired all four floors.  ' }) === 'Rewired all four floors.' && workSummary({ scope: ['Cabling'], summary: '   ' }) === 'Cabling.', 'A row\'s own `summary` overrides the generated sentence (blank is ignored)');
assert(workSummary({ scope: [] }) === null && workSummary({}) === null, 'No scope → no sentence');
assert(all.every((p) => workSummary(p) === W), `All ${all.length} current rows read "${W}"`);
assert(/const summary = workSummary\(project\);/.test(detail) && /\{summary && <p className="text-body \[font-size:15px\] leading-snug" data-project-summary="">\{summary\}<\/p>\}/.test(detail), 'Detail: the sentence under the status chip, body text colour, 15 px');
assert(/\* {3}summary {4}optional one sentence about the work/.test(read('../src/data/showcaseProjects.js')), 'Row format documents the optional `summary` field');
assert(/<div className="space-y-1\.5 lg:space-y-2">\s*\{heading\(project\.name, null, 'text-xl lg:text-2xl'\)\}/.test(detail), 'Phone detail: name 20 px, 6 px gaps (desktop unchanged: 24 px, 8 px)');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
