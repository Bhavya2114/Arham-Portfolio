/**
 * /presence project card (presence-projects): main's floating campus card design, with project text.
 *
 * Verifies that the card's look and behaviour are main's (same layout classes, photo size, glass card,
 * bottom-anchored over the map, slide-up entrance, swipe + slide, dots + "n / total" pager), that only
 * the text changed (type chip, name, area + city, "scope · year"; no address / Directions / project
 * link), that the redesign extras are gone (side panel, 55 % cap, refit, context line, ‹ › project
 * buttons, photo gallery, lightbox), and that the data, the card <-> map pin link and the plain hint
 * are kept.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8').replace(/\r\n/g, '\n');
const load = (rel) => import(pathToFileURL(path.resolve(here, rel)).href);
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const exists = (rel) => fs.existsSync(path.resolve(here, rel));

const cardSrc = read('../src/components/presence/CampusCard.jsx');
let mainCard = '';
try { mainCard = execSync('git show main:src/components/presence/CampusCard.jsx', { cwd: repo, encoding: 'utf-8' }).replace(/\r\n/g, '\n'); } catch { /* no git / main */ }
const dataSrc = read('../src/data/showcaseProjects.js');
const pageSrc = read('../src/pages/Presence.jsx');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const statusSrc = read('../src/components/presence/CityStatus.jsx');
const detailSrc = read('../src/pages/ProjectDetail.jsx');
const css = read('../src/styles/index.css');
const data = await load('../src/data/showcaseProjects.js');
const { getPresenceStateCodes, getPresenceState } = await load('../src/data/presenceCoverage.js');

console.log('\n1. Main\'s card design, unchanged');
const sameAsMain = [
  'className="self-start rounded-full border border-teal-100/25 bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-teal-50"',
  'className="text-sm sm:text-[15px] font-semibold leading-snug text-white line-clamp-2"',
  '<div className="inline-flex items-center gap-2 rounded-full bg-brand-navy-dark/70 px-2 text-[11px] text-white/85 backdrop-blur-sm">',
  '{current + 1} / {count}',
  'if (dx <= -SWIPE_PX) go(current + 1);',
  "slide.dir === 'next' ? 'campus-in-from-right' : 'campus-in-from-left'",
  "style={{ touchAction: 'pan-y' }}",
];
assert(mainCard && sameAsMain.every((s) => mainCard.includes(s) && cardSrc.includes(s)), 'Same chip, title, colours, swipe, slide and dots + "n / total" pager as main');
assert(cardSrc.includes('className="flex overflow-hidden rounded-2xl border border-teal-200/25 bg-teal-700/35 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md select-none cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"')
  && mainCard.includes('border border-teal-200/25 bg-teal-700/35') && mainCard.includes('shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md'), 'Same glass card (colours, border, shadow, corners); padding moved onto the text so the photo is edge to edge');
assert(/<div className="w-\[40%\] aspect-\[10\/11\] sm:aspect-square shrink-0" data-project-photo="">/.test(cardSrc) && /className="h-full w-full object-cover"/.test(cardSrc) && /flex-1 flex flex-col gap-1 p-2\.5 sm:p-3/.test(cardSrc) && /absolute inset-0 pointer-events-none campus-slide/.test(cardSrc), 'Bigger photo: full card height on the left, edge to edge, 40 % wide, cover; its frame drives the height');
const moveHandler = (cardSrc.match(/const handlePointerMove = \(e\) => \{[\s\S]*?\n  \};/) || [''])[0];
assert(!/dragX|setDragX/.test(cardSrc) && /setDragOffset\(atEdge \? dx \/ 4 : dx\);/.test(moveHandler) && !/\bset(?!DragOffset\b|PointerCapture\b)[A-Z]\w*\(/.test(moveHandler)
  && /el\.style\.transform = px \? `translateX\(\$\{px\}px\)` : '';/.test(cardSrc) && /ref=\{contentRef\}\s*className=\{slide \? `campus-slide \$\{incomingAnim\}` : 'transition-transform duration-200'\}/.test(cardSrc), 'Swipe follows the finger through a ref transform (no React state per move); eases back with main\'s 200 ms transition');
assert(/backdrop-blur-md/.test(cardSrc), 'Glass blur kept for now (to be replaced by a solid ~92 % background if it lags on phones)');
const mainCssBlock = (s) => (s.match(/\/\* Our Presence campus card:[\s\S]*?@keyframes campus-out-to-right[^\n]*/) || [''])[0];
let mainCss = '';
try { mainCss = execSync('git show main:src/styles/index.css', { cwd: repo, encoding: 'utf-8' }).replace(/\r\n/g, '\n'); } catch { /* no git */ }
assert(mainCss && mainCssBlock(css) && mainCssBlock(css) === mainCssBlock(mainCss), 'Card slide CSS identical to main');
assert(/: `bottom-3 w-\[min\(24rem,calc\(100%-1\.5rem\)\)\] \$\{overlaySide === 'right' \? 'right-3' : 'left-3'\}`;/.test(mapSrc) && /'inset-x-2 bottom-2'/.test(mapSrc) && /className=\{`absolute z-20 \$\{overlayClass\} \$\{/.test(mapSrc), 'Bottom-anchored over the map on phone and desktop, as on main (no height cap)');
assert(/'transition-\[transform,opacity\] duration-300 ease-out translate-y-0 opacity-100 pointer-events-auto'/.test(mapSrc) && /startOverlayEntrance/.test(mapSrc), 'Slide-up entrance kept');

console.log('\n2. Only the text changed');
assert(/\{loc\.type\}/.test(cardSrc) && !/Campus location/.test(cardSrc), 'Chip: the project type ("Coaching centre") instead of "Campus location"');
assert(/\{loc\.name\}<\/h3>/.test(cardSrc) && /data-project-location="">\{loc\.location\}<\/p>/.test(cardSrc) && /\{loc\.scope\}/.test(cardSrc) && /\{loc\.scope \? '\\u00A0' : ''\}<span className="whitespace-nowrap">· \{loc\.year\}<\/span>/.test(cardSrc), 'Name, area + city location, "scope · year" (year kept with the last word, never alone on a new line)');
assert(!/suppliedAddress|Directions|google\.com\/maps|Navigation|View project|\/projects\//.test(code(cardSrc)), 'No address, no Directions, no "View project"');
assert(/src=\{loc\.photos\?\.\[0\]\}/.test(cardSrc) && /alt=\{ghost \? '' : loc\.name\}/.test(cardSrc), 'Photo: the project\'s photo; alt = project name');

console.log('\n3. Redesign extras removed');
assert(!exists('../src/components/presence/CityProjectCard.jsx') && !exists('../src/components/presence/ProjectPhotos.jsx') && !exists('../src/components/presence/PhotoLightbox.jsx'), 'Redesigned card, photo gallery and lightbox removed');
assert(!/isDesktop|PANEL_PX|data-project-panel|presence-panel-in|sidePanelPx/.test(pageSrc + mapSrc + css), 'No desktop side panel (floating card over the map again)');
assert(!/OVERLAY_MAX_FRACTION|max-h-\[55%\]|reserveBottom/.test(mapSrc) && /const getTargetView = useCallback\(\(\) => getStateFitView\(selectedCode\), \[selectedCode, getStateFitView\]\);/.test(mapSrc), 'No 55 % height cap and no state refit above the card');
assert(!/data-card-context|Previous project|Next project/.test(cardSrc) && !/data-card-context/.test(pageSrc), 'No context line and no ‹ › project buttons (swipe + dots, as on main)');
assert(!/getShowcaseProject|showcase/.test(detailSrc), '/projects/:id as on main');

console.log('\n4. Kept: data, card <-> map link, hint');
const P = data.PLACEHOLDER_PROJECTS;
assert(/export const PLACEHOLDER_PROJECTS = /.test(dataSrc) && data.USE_PLACEHOLDER_PROJECTS && P.length === 8 && P[0].name === 'ALLEN Sankalp (Head Office)' && P[0].location === 'Indra Vihar, Kota', 'PLACEHOLDER_PROJECTS kept (8 ALLEN campuses, area + city)');
assert(P.every((p) => p.type === 'Coaching centre' && p.scope === 'Complete wiring of the whole building' && p.year === 2022 && p.photos.length === 1 && !('stats' in p)), 'Each: "Coaching centre", "Complete wiring of the whole building · 2022", its ALLEN photo');
const cities = getPresenceStateCodes().flatMap((s) => getPresenceState(s).cities.map((c) => [s, c]));
assert(cities.every(([s, c]) => data.getShowcaseProjectsForCity(s, c).every((p) => (p.city === c && p.stateCode === s) || p.placeholder)), 'A city shows only its own projects, or the placeholders');
assert(/const index = Math\.max\(0, locations\.findIndex\(\(p\) => p\.id === currentId\)\);/.test(cardSrc) && /currentId=\{cardProject\.id\}/.test(pageSrc) && /onChange=\{setCardProjectId\}/.test(pageSrc), 'Card is controlled by the page (shown project known to the map)');
assert(/cityBeacon=\{!highlightedProjectId\}/.test(pageSrc) && /data-project-beacon=""/.test(mapSrc) && /if \(showShowcaseProject\(projectId\)\) return;/.test(pageSrc), 'Card <-> map: the shown project\'s pin (or the city pin) is highlighted; a pin tap switches the card');
assert(/footer=\{selectedState && !selectedCity \? <StateStatus/.test(pageSrc) && /data-state-hint=""/.test(statusSrc) && !/rounded-xl border/.test(statusSrc), 'Plain-text hint kept (state selected, no city)');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
