/**
 * /presence project card (presence-projects) — the only place project info is shown.
 *
 * Verifies the showcase data (record shape with photos[] + short location, no stats; city-exact
 * matching; the ALLEN placeholder set), the card content (context line, photo area, chip, name,
 * location, "scope · year", "‹ n / total ›"; no stats, no "View project", no project page), project
 * switching by buttons / keys only, the photo area (1–4 photos, swipe, ‹ › on hover devices, counter,
 * edge gradient, lightbox with focus trap + scroll lock), the before / after slider kept, the phone
 * overlay vs desktop side panel layout, the card <-> map link, the plain hint and the motion rules.
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
const photosSrc = read('../src/components/presence/ProjectPhotos.jsx');
const lightboxSrc = read('../src/components/presence/PhotoLightbox.jsx');
const sliderSrc = read('../src/components/presence/BeforeAfterSlider.jsx');
const statusSrc = read('../src/components/presence/CityStatus.jsx');
const pageSrc = read('../src/pages/Presence.jsx');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
const detailSrc = read('../src/pages/ProjectDetail.jsx');
const css = read('../src/styles/index.css');
const data = await load('../src/data/showcaseProjects.js');
const { getPresenceStateCodes, getPresenceState } = await load('../src/data/presenceCoverage.js');

console.log('\n1. Project data');
const keys = ['id', 'name', 'city', 'stateCode', 'location', 'type', 'scope', 'year', 'photos', 'beforePhoto', 'afterPhoto', 'lat', 'lng'];
const all = [...data.SHOWCASE_PROJECTS, ...data.PLACEHOLDER_PROJECTS];
assert(all.every((p) => keys.every((k) => k in p) && Array.isArray(p.photos) && p.photos.length <= data.MAX_PHOTOS) && data.MAX_PHOTOS === 4, 'Every record: id, name, city, stateCode, location, type, scope, year, photos[] (≤ 4), before / after, lat / lng');
assert(all.every((p) => !('stats' in p)) && !/\bstats\b/.test(code(cardSrc)), 'No stats field and no stat tiles');
const [example] = data.SHOWCASE_PROJECTS;
assert(example.city === null && /TODO: confirm the city/.test(dataSrc) && example.type === 'Coaching centre' && example.year === 2022, 'The coaching-centre example stays hidden until its city / name are confirmed (TODO)');
const cities = getPresenceStateCodes().flatMap((s) => getPresenceState(s).cities.map((c) => [s, c]));
assert(cities.every(([s, c]) => data.getShowcaseProjectsForCity(s, c).every((p) => (p.city === c && p.stateCode === s) || p.placeholder)), 'Each city shows only its own projects (exact city + state), or the placeholders');

console.log('\n1b. Placeholder projects');
const P = data.PLACEHOLDER_PROJECTS;
assert(/export const PLACEHOLDER_PROJECTS = /.test(dataSrc) && data.USE_PLACEHOLDER_PROJECTS === true && P.length === 8 && P[0].name === 'ALLEN Sankalp (Head Office)', 'One clearly named PLACEHOLDER_PROJECTS set: the 8 ALLEN campuses');
assert(P.every((p) => p.photos.length === 1 && /allen(%20| )image\.png$/.test(p.photos[0]) && p.type === 'Coaching centre' && p.scope === 'Complete wiring of the whole building' && p.year === 2022), 'Each: its ALLEN photo in photos: [photo], "Coaching centre", "Complete wiring of the whole building", 2022');
assert(P[0].location === 'Indra Vihar, Kota' && P.every((p) => /^[A-Za-z ]+, Kota$/.test(p.location)), 'Short location: area + city only (e.g. "Indra Vihar, Kota"), no full address / pincode');
assert(cities.every(([s, c]) => data.getShowcaseProjectsForCity(s, c).length === 8) && P.every((p) => !data.hasSiteCoordinates(p) && !data.hasBeforeAfter(p)), 'Same 8 for every city; no coordinates (city pin highlighted), no before / after');

console.log('\n2. Card content');
assert(/data-card-context=""/.test(cardSrc) && /\{city\}<\/span> · \{count\} \{count === 1 \? 'project' : 'projects'\}/.test(cardSrc), 'Context line at the top: "<City> · <n> projects"');
assert(/data-project-type=""/.test(cardSrc) && /<h3[^>]*>\{project\.name\}<\/h3>/.test(cardSrc) && /data-project-location=""/.test(cardSrc) && /\[project\.scope, project\.year\]\.filter\(Boolean\)\.join\(' · '\)/.test(cardSrc), 'Type chip, name, short location, "scope · year"');
assert(!/View project|to=\{`\/projects|Link|suppliedAddress|Directions/.test(code(cardSrc)), 'No "View project" button, no link, no address or Directions');
assert(/aria-label="Previous project"/.test(cardSrc) && /aria-label="Next project"/.test(cardSrc) && /\{index \+ 1\} \/ \{count\}/.test(cardSrc), 'Bottom row: "‹ n / total ›"');
assert(!/onPointerMove|SWIPE_PX|setPointerCapture/.test(cardSrc) && /e\.key === 'ArrowRight'\) \{ e\.preventDefault\(\); go\(index \+ 1\);/.test(cardSrc) && /if \(e\.target !== e\.currentTarget\) return;/.test(cardSrc), 'Projects change only via ‹ › and ←/→ on the focused card — never by swiping the card');

console.log('\n3. Photo area and lightbox');
assert(/\{photos\.map\(\(src, i\) =>/.test(photosSrc) && /\{index \+ 1\}\/\{count\}/.test(photosSrc) && /\{count > 1 && \(/.test(photosSrc), '1–4 photos; "n/total" counter and ‹ › only with more than one photo');
assert(/el\.style\.transform = `translateX\(calc\(\$\{-i \* 100\}% \+ \$\{dx\}px\)\)`/.test(photosSrc) && /style=\{\{ touchAction: 'pan-y' \}\}/.test(photosSrc) && /e\.stopPropagation\(\);/.test(photosSrc), 'Swipe between photos (ref transform, pan-y; stops at the photo area)');
assert(/hidden \[@media\(hover:hover\)\]:inline-flex h-11 w-11/.test(photosSrc), 'Small ‹ › on desktop (hover devices), 44 px tap targets');
assert(/linear-gradient\(to top, \$\{fadeTo\}cc, transparent\)/.test(photosSrc), 'Subtle dark gradient on the photo edge next to the text');
assert(/<img src=\{src\} alt=\{alt\}/.test(photosSrc) && /alt=\{project\.name\}/.test(cardSrc), 'Photo alt text = project name');
assert(/setTimeout\(\(\) => \{ swiped\.current = false; \}, 50\);/.test(photosSrc), 'A swipe never opens the lightbox, and never swallows a later tap');
assert(/createPortal\(/.test(lightboxSrc) && /role="dialog"\s*aria-modal="true"/.test(lightboxSrc) && /object-contain/.test(lightboxSrc) && /bg-black\/90/.test(lightboxSrc), 'Lightbox: modal dialog, dark overlay, photo fitted to the screen');
assert(/body\.style\.overflow = 'hidden';/.test(lightboxSrc) && /body\.style\.overflow = previous;/.test(lightboxSrc), 'Page scroll locked while open');
assert(/closeRef\.current\?\.focus/.test(lightboxSrc) && /e\.key === 'Tab'/.test(lightboxSrc) && /opener\?\.focus\?\.\(/.test(lightboxSrc), 'Focus moves in, is trapped, and returns to the photo on close');
assert(/window\.addEventListener\('keydown', onKey, true\);/.test(lightboxSrc) && /e\.key === 'Escape'\) \{ e\.preventDefault\(\); e\.stopPropagation\(\);/.test(lightboxSrc), 'Escape / ←/→ handled in a capture listener and stopped (Escape never steps the page back)');
assert(/aria-label="Close photo"/.test(lightboxSrc) && /e\.target === e\.currentTarget \|\| e\.target\.dataset\?\.backdrop === ''/.test(lightboxSrc) && /aria-label="Previous photo"/.test(lightboxSrc), 'Close with ✕, Escape or a tap on the backdrop; ‹ › / swipe between photos');
assert(/hasBeforeAfter\(project\) \? \(\s*<BeforeAfterSlider/.test(cardSrc) && /clip-path|clipPath/.test(sliderSrc), 'Before / after slider kept for projects with both photos');

console.log('\n4. Layout');
assert(/const OVERLAY_MAX_FRACTION = 0\.55;/.test(mapSrc) && /absolute z-20 flex max-h-\[55%\] flex-col/.test(mapSrc) && /min-h-\[5rem\] basis-\[11rem\] shrink/.test(cardSrc), 'Phone / tablet: bottom-anchored card, at most ~55 % of the map height, photo on top');
assert(/\(BASE\.h \* free\) \/ \(box\.height \* 1\.3\)/.test(mapSrc) && /getStateFitView\(selectedCode, hasOverlay \? OVERLAY_MAX_FRACTION : 0\)/.test(mapSrc), 'The selected state is fitted above the card, so it stays visible');
assert(/const DESKTOP_QUERY = '\(min-width: 1024px\)';/.test(pageSrc) && /const PANEL_PX = 380;/.test(pageSrc) && /overlay=\{isDesktop \? null : projectCard\}/.test(pageSrc), 'Desktop (lg+): side panel (380 px) next to the map instead of over it');
assert(/className="presence-panel-in relative z-30 shrink-0 self-center"/.test(pageSrc) && /@keyframes presence-panel-in \{\s*from \{ transform: translateX\(32px\); opacity: 0; \}/.test(css) && /\.presence-panel-in \{ animation: presence-panel-in 300ms/.test(css), 'Panel vertically centred, slides in from the right (~300 ms, transform / opacity)');
assert(/w-full aspect-\[16\/10\] shrink-0/.test(cardSrc), 'Desktop panel: 16:10 photo on top, text below');
assert(/sidePanelPx=\{cardPanel \? PANEL_PX : 0\}/.test(pageSrc) && /marginRight: `calc\(-1 \* var\(--map-fade\) - \$\{sidePanelPx\}px\)`/.test(mapSrc), 'Map + panel use the page width: the map\'s fade band runs under the panel (none in the middle)');

console.log('\n5. Card <-> map, hint, project page');
assert(/const highlightedProjectId = nav\.projectId \|\| \(projectCardOnly && cardProject && hasSiteCoordinates\(cardProject\) \? cardProject\.id : null\);/.test(pageSrc) && /cityBeacon=\{!highlightedProjectId\}/.test(pageSrc) && /if \(showShowcaseProject\(projectId\)\) return;/.test(pageSrc), 'Shown project highlights its pin (or the city pin); a project pin tap switches to it');
assert(/footer=\{selectedState && !selectedCity \? <StateStatus/.test(pageSrc) && /className="text-xs text-slate-500 leading-relaxed text-center" data-state-hint=""/.test(statusSrc) && !/rounded-xl border/.test(statusSrc), 'Hint: plain small grey text, only with a state selected and no city');
assert(!/getShowcaseProject|showcase/.test(detailSrc), '/projects/:id is as on main (no showcase placeholder page)');

console.log('\n6. Rules');
assert(!/backdrop-blur|blur\(/.test(code(cardSrc) + code(photosSrc) + code(lightboxSrc)), 'No blur');
const moveHandlers = [photosSrc, lightboxSrc, sliderSrc].map((s) => (s.match(/const handlePointerMove = \(e\) => \{[\s\S]*?\n  \};/) || [''])[0]);
assert(moveHandlers.every((h) => h && !/\bset(?!Offset\b|PointerCapture\b)[A-Z]\w*\(/.test(h)) && !/useState/.test(sliderSrc), 'No React state per move: pointer-move handlers only touch refs (state changes when a swipe settles)');
assert(/@media \(prefers-reduced-motion: reduce\) \{\s*\.presence-panel-in, \.presence-lightbox \{ animation: none; \}/.test(css) && /slide\.current\.id === project\.id && !prefersReducedMotion\(\)/.test(cardSrc), 'Reduced motion: no panel slide, lightbox fade or project slide');
assert(/stepBtn = 'inline-flex h-11 w-11/.test(cardSrc) && /h-12 w-12/.test(lightboxSrc) && /focus-visible:ring-2/.test(cardSrc + photosSrc + lightboxSrc), 'Buttons ≥ 44 px with visible focus rings');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
