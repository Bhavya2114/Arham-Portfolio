/**
 * /presence project card (presence-projects).
 *
 * Verifies the showcase data (one record shape, city-exact matching — no other city's card), the
 * project card (type chip, "scope · year", up to 3 stats, "View project", no address / Directions,
 * pager + swipe, "Projects coming soon"), the "lights on" before / after slider (clip-path + transform
 * through refs, mouse + touch, one-time 0 → 50 % hint, reduced motion), the card <-> map link (beacon
 * on the project pin or its city pin, pin tap switches the card, swipes never move the map), the
 * layout and the motion / blur rules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
const load = (rel) => import(pathToFileURL(path.resolve(here, rel)).href);
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const dataSrc = read('../src/data/showcaseProjects.js');
const cardSrc = read('../src/components/presence/CityProjectCard.jsx');
const sliderSrc = read('../src/components/presence/BeforeAfterSlider.jsx');
const pageSrc = read('../src/pages/Presence.jsx');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const detailSrc = read('../src/pages/ProjectDetail.jsx');
const css = read('../src/styles/index.css');
const data = await load('../src/data/showcaseProjects.js');
const { getPresenceStateCodes, getPresenceState } = await load('../src/data/presenceCoverage.js');

console.log('\n1. Project data');
const [example] = data.SHOWCASE_PROJECTS;
const keys = ['id', 'name', 'city', 'stateCode', 'type', 'scope', 'year', 'stats', 'photo', 'beforePhoto', 'afterPhoto', 'lat', 'lng'];
assert(data.SHOWCASE_PROJECTS.every((p) => keys.every((k) => k in p)), 'Every record has the agreed shape (id, name, city, stateCode, type, scope, year, stats, photos, lat / lng)');
assert(example.type === 'Coaching centre' && example.scope === 'Complete wiring of the whole building' && example.year === 2022
  && example.stats.length === 1 && example.stats[0].label === 'Area' && example.stats[0].value === '10,000 sq ft', 'First real example: coaching centre, complete wiring, 2022, 10,000 sq ft');
assert(example.city === null && example.stateCode === null && /TODO: confirm the city/.test(dataSrc) && /TODO: confirm the project name/.test(dataSrc) && /TODO: confirm\n?/.test(dataSrc), 'City / name / area marked TODO until confirmed (record hidden meanwhile)');
assert(data.SHOWCASE_PROJECTS.every((p) => p.stats.length <= 3), 'At most 3 stats per project');
// Every coverage city: the card gets only that city's records, never another city's.
const cities = getPresenceStateCodes().flatMap((s) => getPresenceState(s).cities.map((c) => [s, c]));
assert(cities.every(([s, c]) => data.getShowcaseProjectsForCity(s, c).every((p) => (p.city === c && p.stateCode === s) || p.placeholder)), 'Each city shows only its own projects (exact city + state match), or the placeholders');
const { SHOWCASE_PROJECTS: realOnly } = data;
assert(cities.every(([s, c]) => realOnly.filter((p) => p.city).every((p) => p.city === c || !data.getShowcaseProjectsForCity(s, c).includes(p))), 'A real project never appears under another city');
assert(data.getShowcaseProjectsForCity('IN-RJ', 'Bikaner').every((p) => p.placeholder && !p.city && !('suppliedAddress' in p)), 'Bikaner shows placeholders only (no Kota record with its Kota address)');

console.log('\n1b. Placeholder projects (ALLEN photos, until real projects are added)');
const P = data.PLACEHOLDER_PROJECTS;
assert(data.USE_PLACEHOLDER_PROJECTS === true && P.length === 8 && P[0].name === 'ALLEN Sankalp (Head Office)' && P.every((p) => /^ALLEN /.test(p.name)), 'One clearly named PLACEHOLDER_PROJECTS set: the 8 ALLEN campuses, as before');
assert(P.every((p) => p.type === 'Coaching centre' && p.scope === 'Complete wiring of the whole building' && p.year === 2022 && p.stats.length === 1 && p.stats[0].label === 'Area' && p.stats[0].value === '10,000 sq ft'), 'Each: "Coaching centre", "Complete wiring of the whole building · 2022", Area 10,000 sq ft');
assert(P.every((p) => /Images\/allen%20image\.png$|Images\/allen image\.png$/.test(decodeURIComponent(p.photo)) || /allen%20image\.png$/.test(p.photo)) && /new URL\('\.\.\/\.\.\/Images\/allen image\.png', import\.meta\.url\)\.href/.test(dataSrc), 'Photo: the ALLEN photo the old campus card used (Images/allen image.png)');
assert(P.every((p) => !data.hasBeforeAfter(p) && !data.hasSiteCoordinates(p)), 'No before / after photos (single photo, slider kept for later) and no coordinates (city pin highlighted)');
assert(cities.every(([s, c]) => data.getShowcaseProjectsForCity(s, c).length === 8), 'Every coverage city shows the same 8 placeholders (no "Projects coming soon" while they are on)');
assert(P.every((p) => data.getShowcaseProject(p.id) === p) && new Set(P.map((p) => p.id)).size === 8, 'Placeholders have unique ids for "View project"');
assert(data.getShowcaseProjectsForCity(null, null).length === 0 && data.getShowcaseProjectsForState('IN-RJ').every((p) => p.city), 'Records without a city are never shown');
assert(data.hasSiteCoordinates({ lat: 26.9, lng: 75.8 }) && !data.hasSiteCoordinates(example) && data.hasBeforeAfter({ beforePhoto: 'a', afterPhoto: 'b' }) && !data.hasBeforeAfter({ beforePhoto: 'a' }), 'Helpers: site coordinates, before / after only with both photos');
assert(!fs.existsSync(path.resolve(here, '../src/data/demoCampusCards.js')) && !fs.existsSync(path.resolve(here, '../src/components/presence/CampusCard.jsx')) && !/CampusCard|getCampusCardsForCity|campusLocations/.test(pageSrc), 'Demo campus cards removed (adapter, card and page use)');

console.log('\n2. Card content');
assert(/data-project-type=""/.test(cardSrc) && /\{project\.type\}/.test(cardSrc) && !/Campus location/.test(cardSrc), 'Type chip instead of "Campus location"');
assert(/\[project\.scope, project\.year\]\.filter\(Boolean\)\.join\(' · '\)/.test(cardSrc), 'Name, then "scope · year"');
assert(/project\.stats\.slice\(0, 3\)/.test(cardSrc) && /text-sm font-bold[^"]*">\{s\.value\}<\/p>\s*<p className="text-\[10px\][^"]*">\{s\.label\}<\/p>/.test(cardSrc), 'Up to 3 stat tiles: value big, label small');
assert(!/suppliedAddress|Directions|google\.com\/maps|Navigation/.test(cardSrc), 'No address line and no Directions button');
assert(/to=\{`\/projects\/\$\{project\.id\}`\}/.test(cardSrc) && /View project\s*<ArrowRight/.test(cardSrc), '"View project →" links to /projects/:id');
assert(/\{index \+ 1\} \/ \{count\}/.test(cardSrc) && /aria-label=\{`Show project \$\{i \+ 1\} of \$\{count\}: \$\{p\.name\}`\}/.test(cardSrc), 'Pager: dots + "n / total"');
assert(/if \(dx <= -SWIPE_PX\) go\(index \+ 1\);\s*else if \(dx >= SWIPE_PX\) go\(index - 1\);/.test(cardSrc) && /e\.key === 'ArrowRight'/.test(cardSrc), 'Swipe (and ←/→) between the city\'s projects');
assert(/const ComingSoonCard = /.test(cardSrc) && /Projects coming soon/.test(cardSrc) && /if \(count === 0\) return <ComingSoonCard city=\{city\} \/>;/.test(cardSrc), 'A city without projects gets a small "Projects coming soon" card');
assert(/Photo coming soon/.test(cardSrc), 'Missing photo: quiet placeholder, no stock image');

console.log('\n3. "Lights on" before / after slider');
assert(/if \(hasBeforeAfter\(project\)\) \{\s*return <BeforeAfterSlider/.test(cardSrc) && /if \(project\.photo\) \{\s*return <img/.test(cardSrc), 'Slider only with both photos; a single photo is shown normally');
assert(/afterRef\.current\.style\.clipPath = `inset\(0 0 0 \$\{pct\.current\}%\)`/.test(sliderSrc) && /dividerRef\.current\.style\.transform = `translateX\(\$\{pct\.current\}%\)`/.test(sliderSrc), 'After image clipped by clip-path: inset(); divider moved by a transform, both through refs');
assert(!/useState/.test(sliderSrc), 'No React state per move (no useState in the slider)');
assert(/onPointerDown=\{handlePointerDown\}/.test(sliderSrc) && /e\.stopPropagation\(\);/.test(sliderSrc) && /style=\{\{ touchAction: 'none' \}\}/.test(sliderSrc) && /style=\{\{ touchAction: 'pan-y' \}\}/.test(sliderSrc), 'Mouse + touch; slider drags never swipe the cards or pan the map; handle is touch-action none');
assert(/>Before<\/span>/.test(sliderSrc) && />After<\/span>/.test(sliderSrc) && /<Lightbulb/.test(sliderSrc) && /rounded-full[^"]*bg-\[#D9E35A\]/.test(sliderSrc), '"Before" / "After" labels and a round EDGE_YELLOW handle with a lightbulb');
assert(/export const SLIDER_START = 50;/.test(sliderSrc) && /const HINT_MS = 600;/.test(sliderSrc) && /apply\(SLIDER_START \* \(1 - \(1 - t\) \*\* 3\)\)/.test(sliderSrc) && /const hinted = new Set\(\);/.test(sliderSrc), 'Starts at 50 %; one-time 0 → 50 % hint (~600 ms) on first view');
assert(/const willHint = !prefersReducedMotion\(\) && !hinted\.has\(id\)/.test(sliderSrc), 'Hint skipped under prefers-reduced-motion');
assert(/role="slider"/.test(sliderSrc) && /aria-valuenow/.test(sliderSrc) && /ArrowLeft: -5, ArrowRight: 5/.test(sliderSrc), 'Keyboard-accessible slider handle');
assert(/aspect-\[2\/1\] sm:aspect-auto sm:h-full sm:min-h-\[13rem\]/.test(cardSrc) && /sm:w-\[52%\]/.test(cardSrc), 'Photo is the main part of the card');

console.log('\n4. Card <-> map');
assert(/const highlightedProjectId = nav\.projectId \|\| \(projectCardOnly && cardProject && hasSiteCoordinates\(cardProject\) \? cardProject\.id : null\);/.test(pageSrc) && /selectedProjectId=\{highlightedProjectId\}/.test(pageSrc) && /cityBeacon=\{!highlightedProjectId\}/.test(pageSrc), 'Card project highlighted: its own pin with lat / lng, otherwise its city pin');
assert(/data-project-beacon=""/.test(mapSrc) && /fill=\{isSelected \? MAP_COLORS\.edge : '#FFFFFF'\}\s*stroke=\{MAP_COLORS\.land\}\s*strokeWidth=\{1\.5\}/.test(mapSrc), 'Project pin highlight reuses the yellow beacon style');
assert(/\.\.\.stateShowcase\.filter\(hasSiteCoordinates\)\.map\(\(p\) => \(\{ id: p\.id, name: p\.name, city: p\.city, \.\.\.projectLatLon\(p\.lat, p\.lng\) \}\)\)/.test(pageSrc), 'Showcase projects with lat / lng get project pins');
assert(/const openProject = \(projectId\) => \{\s*if \(showShowcaseProject\(projectId\)\) return;/.test(pageSrc) && /setCardProjectId\(project\.id\);/.test(pageSrc), 'Tapping a project pin switches the card to that project');
assert(/const overlayKey = hasOverlay \? selectedCity : null;/.test(mapSrc) && /onChange=\{setCardProjectId\}/.test(pageSrc), 'Swiping only changes the highlighted pin: the map shift is keyed per city, not per project (no move / zoom)');

console.log('\n5. Layout and style');
assert(/bottom-3 w-\[min\(28rem,calc\(100%-1\.5rem\)\)\]/.test(mapSrc) && /'inset-x-2 bottom-2'/.test(mapSrc), 'Anchored at the bottom of the map area: full width on phones, max ~28rem on desktop');
assert(/flex flex-col sm:flex-row/.test(cardSrc), 'Phone: photo on top, text below; desktop: photo left, text right');
assert(!/backdrop-blur|blur\(/.test(code(cardSrc) + code(sliderSrc)), 'No blur on the card or slider');
assert(/@keyframes project-card-in-from-right \{ from \{ transform: translateX\(40%\); opacity: 0; \} to \{ transform: translateX\(0\); opacity: 1; \} \}/.test(css) && !/@keyframes campus-/.test(css), 'Card slide: transform + opacity only (old campus keyframes removed)');
assert(/el\.style\.transform = px \? `translateX\(\$\{px\}px\)` : '';/.test(cardSrc) && !/useState/.test(cardSrc), 'Swipe follows the finger through a ref transform (no React state per move)');
assert(/slide\.current\.id === project\.id && !prefersReducedMotion\(\)/.test(cardSrc), 'Reduced motion: no slide animation');

console.log('\n6. /projects/:id');
assert(/const p = project \? null : getShowcaseProject\(id\);\s*return p && \(p\.city \|\| p\.placeholder\) \? p : null;/.test(detailSrc) && /The full project page with photos is coming soon\./.test(detailSrc), 'Showcase projects get a simple placeholder page (only records shown on the map)');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
