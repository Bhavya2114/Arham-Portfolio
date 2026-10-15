/**
 * Campus card entrance on every city selection (lib/overlayEntrance.js + PresenceMap wiring),
 * and LocationExplorer removal.
 *
 * Drives the real entrance sequence with a fake clock and a fake card element that records the
 * styles a browser would commit, then checks that each city selection — including a direct
 * city → city switch while the card is visible — produces a fresh hidden → slide-up transition.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startOverlayEntrance, OVERLAY_RESET, OVERLAY_ENTER } from '../src/lib/overlayEntrance.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};

// ---- Fake clock ----
let now = 0;
let timers = [];
let nextId = 1;
const schedule = (fn, ms) => { const id = nextId++; timers.push({ id, at: now + ms, fn }); return id; };
const cancel = (id) => { timers = timers.filter((t) => t.id !== id); };
const advance = (ms) => {
  const end = now + ms;
  for (;;) {
    timers.sort((a, b) => a.at - b.at);
    const t = timers[0];
    if (!t || t.at > end) break;
    timers.shift();
    now = t.at;
    t.fn();
  }
  now = end;
};

// ---- Fake card: models CSS transitions. A transition runs only when the *committed* (reflowed)
// style changes from hidden to shown while transitions are enabled. ----
const card = {
  phase: OVERLAY_RESET, // React state → classes
  committed: 'hidden',  // what the browser last computed
  transitions: [],      // recorded slide-ups { city, at }
  city: null,
};
const commitStyle = () => {
  const target = card.phase === OVERLAY_ENTER ? 'shown' : 'hidden';
  const transitionsOn = card.phase === OVERLAY_ENTER;
  if (target !== card.committed && target === 'shown' && transitionsOn) card.transitions.push({ city: card.city, at: now });
  card.committed = target;
};
const setPhase = (p) => { card.phase = p; }; // React re-render; browser commits on reflow / paint
const reflow = () => commitStyle();
const paint = () => commitStyle();

// Fake map pan mirroring PresenceMap's animateTo: `onDone` fires once when the pan ends, is
// interrupted (drag / newer animation) or is skipped (reduced motion → immediately).
let pan = null;
const stopPan = () => { if (!pan) return; cancel(pan.id); const done = pan.onDone; pan = null; done?.(); };
const animateTo = (ms, onDone) => {
  stopPan();
  if (ms === null) { onDone?.(); return; } // reduced motion
  const id = schedule(() => { const done = pan?.onDone; pan = null; done?.(); }, ms);
  pan = { id, onDone };
};

// Mirrors PresenceMap's layout effect: cancel the previous run, start a new one; pan first if needed.
const SHIFT_MS = 240;
let cancelRun = null;
const selectCity = (city, needsPan = false, panMs = SHIFT_MS) => {
  cancelRun?.();
  card.city = city;
  const waitFor = needsPan ? (go) => { animateTo(panMs, go); return null; } : null;
  cancelRun = startOverlayEntrance({ waitFor, setPhase, reflow, schedule, cancel });
  paint(); // the layout effect's state update is committed before the next paint
};

console.log('\n1. Entrance replays on every city selection, first one included');
selectCity('Kota', true); // first open from the state view: the map pans first
assert(card.phase === OVERLAY_RESET && card.committed === 'hidden', 'Kota: hidden while the map pans');
advance(SHIFT_MS - 1);
assert(card.transitions.length === 0, 'Kota: no slide-up before the pan ends');
advance(1); paint();
assert(card.transitions.length === 1 && card.transitions[0].city === 'Kota' && card.transitions[0].at === SHIFT_MS, `Kota: slides up the moment the ${SHIFT_MS} ms pan ends (was a fixed 560 ms wait)`);

selectCity('Jaipur'); // direct switch, card visible, no pan needed
assert(card.committed === 'hidden', 'Kota → Jaipur: card jumps to hidden before paint (no slide-down)');
const t0 = now;
advance(0); paint();
assert(card.transitions.length === 2 && card.transitions[1].city === 'Jaipur' && card.transitions[1].at === t0, 'Kota → Jaipur: entrance replays immediately without closing the card');

selectCity('Pune'); advance(0); paint();
selectCity('Mumbai', true); advance(SHIFT_MS); paint();
assert(card.transitions.map((t) => t.city).join() === 'Kota,Jaipur,Pune,Mumbai', 'Jaipur → Pune → Mumbai: one slide-up per city (with and without a pan)');

console.log('\n2. Rapid switching never overlaps entrances');
selectCity('Udaipur', true);
advance(100);
selectCity('Bikaner'); // Udaipur's pan is still running
advance(600); paint();
assert(card.transitions.slice(-1)[0].city === 'Bikaner' && !card.transitions.some((t) => t.city === 'Udaipur'), 'A newer selection cancels the pending entrance (Udaipur never slides in)');
selectCity('Sikar', true);
advance(50);
selectCity('Jhunjhunu', true); // newer pan interrupts the older one; its onDone must not enter Sikar
advance(SHIFT_MS); paint();
assert(card.transitions.slice(-1)[0].city === 'Jhunjhunu' && !card.transitions.some((t) => t.city === 'Sikar'), 'Interrupted pan does not let the superseded city slide in');
assert(card.transitions.filter((t) => t.city === 'Jhunjhunu').length === 1, 'Exactly one entrance for the latest city');
selectCity('Taranagar', true);
advance(80);
stopPan(); // user drags the map mid-pan
paint();
assert(card.transitions.slice(-1)[0].city === 'Taranagar', 'A drag that interrupts the pan still brings the card in (never stuck hidden)');
assert(timers.length === 0, 'No timers left behind');

console.log('\n3. Reduced motion and regression guard');
selectCity('Jodhpur', true, null);
assert(card.committed === 'hidden', 'Reduced motion: instant pan still commits the hidden state first (no enter during setup)');
const tJodhpur = now;
advance(0); paint();
assert(card.transitions.slice(-1)[0].city === 'Jodhpur' && card.transitions.slice(-1)[0].at === tJodhpur, 'Reduced motion: pan is instant and the card enters on the next task (CSS makes the slide ~0 ms)');
const noReflow = { committed: 'shown', transitions: 0 };
startOverlayEntrance({
  setPhase: (p) => { if (p === OVERLAY_ENTER && noReflow.committed === 'hidden') noReflow.transitions += 1; },
  reflow: null,
  schedule,
  cancel,
});
advance(0);
assert(noReflow.transitions === 0, 'Hidden state never committed → no transition (why reset is applied before paint and reflowed)');

console.log('\n4. PresenceMap wiring');
const mapSrc = read('../src/components/map/PresenceMap.jsx');
assert(/useLayoutEffect\(\(\) => \{[\s\S]*?return startOverlayEntrance\(\{[\s\S]*?reflow: \(\) => overlayRef\.current\?\.offsetHeight,[\s\S]*?\}, \[overlayKey\]\);/.test(mapSrc), 'Layout effect keyed on the selected city starts the entrance (cleanup cancels the previous one)');
assert(/'transition-\[transform,opacity\] duration-300 ease-out translate-y-0 opacity-100'/.test(mapSrc) && /'transition-none translate-y-\[calc\(100%\+1rem\)\] opacity-0 pointer-events-none'/.test(mapSrc), 'One slide-up style for every entrance: no transition while hidden, 300 ms ease-out in');
assert(/const MAP_SHIFT_MS = 240;/.test(mapSrc) && /animateTo\(\{ \.\.\.v, cy: v\.cy \+ shiftUnits \}, \{ duration: MAP_SHIFT_MS, onDone: go \}\);/.test(mapSrc), 'Card enters when the short (240 ms) pan ends — driven by the pan, not a fixed timer');
assert(!/setTimeout\(/.test(mapSrc.slice(mapSrc.indexOf('const overlayShifted'), mapSrc.indexOf('const controlButton'))), 'No fixed timer in the entrance effect');
assert(/if \(onDone\) settle\.add\(onDone\);/.test(mapSrc) && /commitView\(to\);\s*stopAnimation\('finished'\);\s*return;/.test(mapSrc) && /settle\.flush\(reason\);/.test(mapSrc), 'animateTo signals completion when finished, interrupted or skipped (reduced motion)');
const pageSrc = read('../src/pages/Presence.jsx');
assert(pageSrc.includes('<CampusCard key={`${nav.stateCode}|${selectedCity}`}'), 'Card content remounts per city → carousel resets to 1 / 8; the map is not remounted');
const cardSrc = read('../src/components/presence/CampusCard.jsx');
assert(cardSrc.includes('const SLIDE_MS = 320;') && /campus-in-from-right/.test(cardSrc), 'Horizontal 320 ms campus slide unchanged');

console.log('\n5. LocationExplorer removed');
assert(!fs.existsSync(path.resolve(here, '../src/components/presence/LocationExplorer.jsx')), 'LocationExplorer.jsx deleted');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const refs = walk(path.resolve(here, '../src')).filter((f) => /\.(jsx?|css)$/.test(f) && /LocationExplorer/.test(fs.readFileSync(f, 'utf-8')));
assert(refs.length === 0, `No source file references LocationExplorer (${refs.map((f) => path.basename(f)).join(', ') || 'none'})`);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
