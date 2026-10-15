/**
 * Presence map navigation by selection (no back buttons).
 *
 * Verifies:
 * 1. No "Back to India" / "Back to [State]" buttons are rendered by the map toolbar or page.
 * 2. Clicking an uncovered state returns to the India view (reset), wired only on /presence.
 * 3. Reducer flows: city → city, state → state, covered → uncovered (reset), Escape (back) never sticks.
 * 4. Selection pill and zoom controls are kept; the "Explore locations" button is removed.
 * 5. Tapping the empty ocean inside the map resets to India (not states, markers, card, controls or
 *    drags); clicking outside the map changes nothing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { presenceNavReducer as reduce, INITIAL_PRESENCE_NAV as INIT } from '../src/lib/presenceNavigation.js';
import { getPresenceStateCodes } from '../src/data/presenceCoverage.js';
import { isMapBackgroundTap } from '../src/lib/mapBackgroundTap.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};

const mapSrc = read('../src/components/map/PresenceMap.jsx');
const svgSrc = read('../src/components/map/IndiaMapSvg.jsx');
const pageSrc = read('../src/pages/Presence.jsx');
const homeSrc = read('../src/sections/PresencePreview.jsx');

console.log('\n1. No redundant back buttons');
assert(!/Back to India|Back to \$\{|backLabel|\bonBack\b/.test(mapSrc), 'PresenceMap renders no back button and takes no onBack / backLabel');
assert(!/Back to India|Back to \$\{|backLabel|onBack=|goBackOneLevel/.test(pageSrc), 'Presence page passes no back handler or label');
assert(!/ArrowLeft/.test(mapSrc), 'Map toolbar no longer imports the back arrow');

console.log('\n2. Uncovered state returns to India');
assert(/onSelectInactiveState = null,/.test(svgSrc) && /else if \(!activeSet\.has\(state\.id\) && onSelectInactiveState\) \{\s*onSelectInactiveState\(state\.id\);/.test(svgSrc), 'IndiaMapSvg forwards clicks on uncovered states only when a handler is given');
assert(/onSelectInactiveState=\{onSelectInactiveState\}/.test(mapSrc), 'PresenceMap passes the handler to the SVG');
assert(pageSrc.includes("onSelectInactiveState={() => dispatch({ type: 'reset' })}"), 'Presence page resets to India on an uncovered state');
assert(!/onSelectInactiveState/.test(homeSrc), 'Homepage preview unchanged (no inactive-state handler)');

console.log('\n3. Reducer flows');
let s = reduce(INIT, { type: 'selectState', stateCode: 'IN-RJ' });
s = reduce(s, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Kota' });
assert(s.stateCode === 'IN-RJ' && s.city === 'Kota', 'State → city selects the city');
s = reduce(s, { type: 'selectCity', stateCode: 'IN-RJ', city: 'Jaipur' });
assert(s.city === 'Jaipur', 'City → another city switches directly');
s = reduce(s, { type: 'selectState', stateCode: 'IN-MH' });
assert(s.stateCode === 'IN-MH' && s.city === null, 'Another covered state clears the previous city');
s = reduce(s, { type: 'selectCity', stateCode: 'IN-MH', city: 'Mumbai' });
s = reduce(s, { type: 'reset' });
assert(s.stateCode === null && s.city === null, 'Uncovered state (reset) returns to India with no city');
assert(!getPresenceStateCodes().includes('IN-MP') && reduce({ ...INIT, stateCode: 'IN-RJ', city: 'Kota' }, { type: 'selectState', stateCode: 'IN-MP' }).city === 'Kota', 'selectState ignores uncovered states, so the page uses reset for them');
s = reduce({ ...INIT, stateCode: 'IN-RJ', city: 'Kota' }, { type: 'back' });
assert(s.stateCode === 'IN-RJ' && s.city === null && reduce(s, { type: 'back' }).stateCode === null, 'Escape (back) goes city → state → India');
assert(reduce({ ...INIT, stateCode: 'IN-RJ', city: 'Kota' }, { type: 'selectState', stateCode: 'IN-RJ' }).city === null, 'Clicking the selected state closes the city');
assert(/if \(e\.key !== 'Escape'\) return;[\s\S]*?dispatch\(\{ type: 'back' \}\)/.test(pageSrc), 'Escape still steps back one level');

console.log('\n4. Kept controls');
assert(/\{selectedState\.name\}\s*\{selectedCity && <span className="text-brand-accent"> · \{selectedCity\}<\/span>\}/.test(mapSrc), 'State · city selection pill kept');
assert(/aria-label="Zoom in"|Zoom in/.test(mapSrc) && /Maximize2/.test(mapSrc), 'Zoom controls kept');
assert(!/LocationExplorer|Explore locations|toolbar=/.test(pageSrc) && !/toolbar/.test(mapSrc), '"Explore locations" button and the unused toolbar slot are removed');

console.log('\n5. Background tap resets; clicks outside the map do not');
{
  // Fake DOM nodes shaped like the map viewport: wrapper div > IndiaMapSvg div > svg > layers.
  const viewport = { name: 'viewport' };
  const svgWrap = { name: 'IndiaMapSvg div' };
  const svg = { name: 'svg', parentElement: svgWrap };
  const tap = (target, defaultPrevented = false) => isMapBackgroundTap({ target, viewport, svg, defaultPrevented });
  assert(tap(svg) && tap(viewport) && tap(svgWrap), 'Tap on empty ocean (the <svg>, its wrapper, or the viewport box) counts as background');
  const others = ['covered state path', 'uncovered state path', 'city marker circle', 'marker hit area', 'project pin', 'campus card', 'Directions link', 'zoom in button', 'fit button'];
  assert(others.every((name) => !tap({ name })), 'State polygons, city markers, pins, the campus card and zoom / fit controls never count');
  assert(!tap(svg, true) && !tap(viewport, true), 'A drag / pan (click cancelled by the drag guard) never counts');
  assert(!tap(null), 'No target → no reset');

  let s5 = reduce({ ...INIT, stateCode: 'IN-RJ', city: 'Kota' }, { type: 'reset' });
  assert(s5.stateCode === null && s5.city === null && s5.projectId === null, 'Reset clears state and city (card closes, map returns to the India view)');

  assert(/const handleViewportClick = \(e\) => \{\s*if \(!onBackgroundTap \|\| !selectedState\) return;\s*const svg = wrapperRef\.current\?\.querySelector\('svg'\);\s*if \(isMapBackgroundTap\(\{ target: e\.target, viewport: e\.currentTarget, svg, defaultPrevented: e\.defaultPrevented \}\)\) onBackgroundTap\(\);/.test(mapSrc), 'Map viewport resets on a background tap only while a state is selected');
  assert(/onClickCapture=\{handleClickCapture\}\s*onClick=\{handleViewportClick\}/.test(mapSrc) && /const handleClickCapture = \(e\) => \{\s*if \(suppressClick\.current\) \{\s*suppressClick\.current = false;\s*e\.stopPropagation\(\);\s*e\.preventDefault\(\);/.test(mapSrc), 'Handler sits on the map viewport only, behind the existing drag guard');
  assert(pageSrc.includes("onBackgroundTap={() => dispatch({ type: 'reset' })}"), 'Page wires the background tap to the shared reset');

  assert(!/document\.addEventListener|createOutsidePress|data-presence-zone/.test(pageSrc) && !/document\.addEventListener/.test(mapSrc), 'No page-level outside-click listener: clicks outside the map leave the selection unchanged');
  assert(!fs.existsSync(path.resolve(here, '../src/lib/outsidePress.js')), 'Obsolete outsidePress.js removed');
}

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
