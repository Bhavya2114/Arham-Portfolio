/**
 * Regression: selecting a city while the state zoom-in is still running.
 *
 * Reproduces the bug (clearance measured against an intermediate zoom frame leaves the marker hidden
 * by the bottom-anchored card) and verifies the fix: the card waits for the view to settle, measures
 * against the final state view, pans only as needed with the zoom unchanged, and ends with the marker
 * exactly MARKER_CLEARANCE_PX (28 px) above the card. Also covers rapid city changes, Escape/reset,
 * a superseding animation (zoom button), a drag interruption and reduced motion.
 *
 * Uses the real helpers (lib/viewSettle.js, lib/markerClearance.js, lib/overlayEntrance.js) with an
 * animation model that mirrors PresenceMap's animateTo / stopAnimation / whenViewSettles.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSettleQueue } from '../src/lib/viewSettle.js';
import { markerClearanceShift, viewBoxScreenMap } from '../src/lib/markerClearance.js';
import { startOverlayEntrance, OVERLAY_ENTER } from '../src/lib/overlayEntrance.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};
const near = (a, b, eps = 0.01) => Math.abs(a - b) <= eps;

// ---- Constants mirrored from PresenceMap ----
const BASE = { w: 840, h: 940 };
const CLEARANCE = 28;
const MIN_SHIFT_PX = 2;
const ZOOM_MS = 550;
const SHIFT_MS = 240;
const toViewBox = ({ cx, cy, k }) => ({ x: cx - BASE.w / k / 2, y: cy - BASE.h / k / 2, w: BASE.w / k, h: BASE.h / k });

// Phone-sized map: svg 390 px wide (constant size; only the viewBox changes), card along the bottom.
const svgRect = { left: 0, top: 0, width: 390, height: (390 * BASE.h) / BASE.w };
const card = { top: svgRect.height - 150, left: 8, right: 382 };
const HOME = { cx: 500, cy: 500, k: 1 };
const STATE_FIT = { cx: 300, cy: 400, k: 2.7 };
const KOTA = { x: 300, y: 500 }; // low in the state: needs a clearance pan at the final view
const JAIPUR = { x: 330, y: 470 };

const markerScreenY = (marker, view) => {
  const { s, oy } = viewBoxScreenMap(toViewBox(view), svgRect);
  return oy + marker.y * s;
};
const clearanceAt = (marker, view) => card.top - markerScreenY(marker, view);

// ---- Fake clock ----
let now = 0;
let timers = [];
let nextId = 1;
const schedule = (fn, ms) => { const id = nextId++; timers.push({ id, at: now + ms, fn }); return id; };
const cancel = (id) => { timers = timers.filter((t) => t.id !== id); };
const advance = (ms) => {
  const end = now + ms;
  for (;;) {
    timers.sort((a, b) => a.at - b.at || a.id - b.id);
    const t = timers[0];
    if (!t || t.at > end) break;
    timers.shift();
    now = t.at;
    t.fn();
  }
  now = end;
};

// ---- Map animation model (mirrors PresenceMap) ----
const createMap = ({ reducedMotion = false } = {}) => {
  const map = { view: { ...HOME }, anim: null, pans: [], settle: createSettleQueue() };
  map.stopAnimation = (reason = 'interrupted') => {
    if (map.anim) cancel(map.anim);
    map.anim = null;
    map.settle.flush(reason);
  };
  map.whenViewSettles = (cb) => {
    if (map.anim) return map.settle.add(cb);
    cb('finished');
    return () => {};
  };
  map.animateTo = (to, { duration = ZOOM_MS, onDone = null } = {}) => {
    if (map.anim) cancel(map.anim);
    map.anim = null;
    if (onDone) map.settle.add(onDone);
    if (reducedMotion) {
      map.view = { ...to };
      map.stopAnimation('finished');
      return;
    }
    const from = { ...map.view };
    const start = now;
    const tick = () => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - t) ** 3;
      map.view = {
        cx: from.cx + (to.cx - from.cx) * e,
        cy: from.cy + (to.cy - from.cy) * e,
        k: Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e),
      };
      if (t < 1) map.anim = schedule(tick, 16);
      else map.stopAnimation('finished');
    };
    map.anim = schedule(tick, 16);
  };
  // The card's layout effect for one city (returns its cleanup, like the effect does).
  map.selectCity = (marker, name) => {
    map.entered = null;
    return startOverlayEntrance({
      setPhase: (p) => { if (p === OVERLAY_ENTER) map.entered = { name, at: now }; },
      reflow: () => {},
      schedule,
      cancel,
      waitFor: (go) => {
        let active = true;
        const stopWaiting = map.whenViewSettles((reason) => {
          if (!active) return;
          if (reason === 'interrupted') { go(); return; }
          const { shiftPx, shiftUnits } = markerClearanceShift({ marker, vb: toViewBox(map.view), svgRect, card, clearancePx: CLEARANCE });
          if (!(shiftPx > MIN_SHIFT_PX)) { go(); return; }
          const v = map.view;
          map.pans.push({ name, at: now, k: v.k });
          map.animateTo({ ...v, cy: v.cy + shiftUnits }, { duration: SHIFT_MS, onDone: go });
        });
        return () => { active = false; stopWaiting(); };
      },
    });
  };
  return map;
};
const reset = () => { now = 0; timers = []; };

console.log('\n1. Reproduction: measuring against an intermediate zoom frame (old behaviour)');
{
  reset();
  const map = createMap();
  map.animateTo(STATE_FIT); // state selected
  advance(200); // city tapped 200 ms into the 550 ms zoom
  const midView = { ...map.view };
  assert(midView.k > 1.5 && midView.k < STATE_FIT.k - 0.3, `Selection happens mid-zoom (k = ${midView.k.toFixed(2)} of ${STATE_FIT.k})`);
  // Old code: measure now, and if a shift is needed animate from the *current* view — which cancels the zoom.
  const old = markerClearanceShift({ marker: KOTA, vb: toViewBox(midView), svgRect, card, clearancePx: CLEARANCE });
  if (old.shiftPx > MIN_SHIFT_PX) map.animateTo({ ...midView, cy: midView.cy + old.shiftUnits }, { duration: SHIFT_MS });
  advance(1000);
  const brokenZoom = !near(map.view.k, STATE_FIT.k);
  const brokenClearance = !near(clearanceAt(KOTA, map.view), CLEARANCE, 0.5);
  assert(brokenZoom || brokenClearance, `Old approach ends wrong (zoom k = ${map.view.k.toFixed(2)}, clearance ${clearanceAt(KOTA, map.view).toFixed(1)} px)`);
  // And the "zoom keeps running" variant (keyboard selection, pan computed at the mid frame, zoom not cancelled):
  const finalNoPan = clearanceAt(KOTA, STATE_FIT);
  assert(finalNoPan < 0, `Without a correct pan, Kota ends ${(-finalNoPan).toFixed(0)} px below the card's top edge (hidden)`);
}

console.log('\n2. Fix: city selected during the zoom');
{
  reset();
  const map = createMap();
  map.animateTo(STATE_FIT);
  advance(200);
  map.selectCity(KOTA, 'Kota');
  advance(100);
  assert(map.pans.length === 0 && map.entered === null, 'Nothing is measured or panned while the zoom is still running');
  advance(300); // zoom done at 550 ms
  assert(map.pans.length === 1 && map.pans[0].at >= ZOOM_MS && near(map.pans[0].k, STATE_FIT.k), 'Clearance pan starts only after the zoom completes, from the final state view');
  advance(SHIFT_MS + 50);
  assert(near(map.view.k, STATE_FIT.k), 'Zoom level is the full state fit (pan did not change k)');
  assert(near(clearanceAt(KOTA, map.view), CLEARANCE), `Kota ends exactly ${CLEARANCE} px above the card (got ${clearanceAt(KOTA, map.view).toFixed(2)})`);
  assert(map.entered?.name === 'Kota' && map.entered.at >= map.pans[0].at + SHIFT_MS, 'Card slides up when the clearance pan ends');
  assert(timers.length === 0 && map.settle.size === 0, 'No timers or listeners left behind');
}

console.log('\n3. Rapid city changes during the zoom');
{
  reset();
  const map = createMap();
  map.animateTo(STATE_FIT);
  advance(100);
  const cleanupA = map.selectCity(JAIPUR, 'Jaipur');
  advance(100);
  cleanupA(); // effect cleanup on the next selection
  map.selectCity(KOTA, 'Kota');
  advance(1000);
  assert(map.pans.every((p) => p.name === 'Kota') && map.pans.length === 1, 'Only the latest city pans; the stale Jaipur wait never moves the map');
  assert(map.entered?.name === 'Kota' && near(clearanceAt(KOTA, map.view), CLEARANCE), 'Latest city ends with the correct clearance');
}

console.log('\n4. Escape / reset during the zoom');
{
  reset();
  const map = createMap();
  map.animateTo(STATE_FIT);
  advance(150);
  const cleanup = map.selectCity(KOTA, 'Kota');
  advance(100);
  cleanup(); // Escape: overlay closes before the zoom ends
  map.animateTo(HOME); // reset to India
  advance(1000);
  assert(map.pans.length === 0 && map.entered === null, 'No pan and no card after Escape / reset');
  assert(near(map.view.k, 1) && near(map.view.cy, HOME.cy), 'Map ends at the India view');
}

console.log('\n5. A superseding animation (zoom button) during the wait');
{
  reset();
  const map = createMap();
  map.animateTo(STATE_FIT);
  advance(200);
  map.selectCity(KOTA, 'Kota');
  advance(100);
  const zoomed = { ...map.view, k: map.view.k * 1.5 };
  map.animateTo(zoomed); // user presses zoom-in while the state zoom runs
  advance(300);
  assert(map.pans.length === 0, 'Wait carries over to the new animation (no measurement mid-animation)');
  advance(1000);
  assert(map.pans.length <= 1 && map.entered?.name === 'Kota', 'Card enters after the new animation settles');
  assert(clearanceAt(KOTA, map.view) >= CLEARANCE - 0.01 || map.pans.length === 0, 'Marker is clear of the card at the settled view');
}

console.log('\n6. Drag interrupts the zoom');
{
  reset();
  const map = createMap();
  map.animateTo(STATE_FIT);
  advance(200);
  map.selectCity(KOTA, 'Kota');
  advance(50);
  map.stopAnimation('interrupted'); // press became a drag
  advance(500);
  assert(map.pans.length === 0 && map.entered?.name === 'Kota', 'Card still enters; no pan fights the user\'s drag');
}

console.log('\n7. Reduced motion');
{
  reset();
  const map = createMap({ reducedMotion: true });
  map.animateTo(STATE_FIT); // instant
  map.selectCity(KOTA, 'Kota');
  assert(map.entered === null, 'Card is not entered during setup (hidden state committed first)');
  advance(0);
  assert(near(map.view.k, STATE_FIT.k) && near(clearanceAt(KOTA, map.view), CLEARANCE) && map.entered?.name === 'Kota', 'Instant pan to the correct clearance, card enters on the next task');
}

console.log('\n8. No zoom running (direct city switch) is unchanged');
{
  reset();
  const map = createMap();
  map.view = { ...STATE_FIT };
  map.selectCity(KOTA, 'Kota');
  assert(map.pans.length === 1 && map.pans[0].at === 0, 'Measured and panned immediately when the map is already settled');
  advance(SHIFT_MS + 20);
  assert(near(clearanceAt(KOTA, map.view), CLEARANCE) && map.entered?.name === 'Kota', 'Correct clearance and entrance');
}

console.log('\n9. PresenceMap wiring');
{
  const src = read('../src/components/map/PresenceMap.jsx');
  assert(/const stopWaiting = whenViewSettles\(\(reason\) => \{\s*if \(!active\) return;/.test(src), 'Card placement waits for the view to settle and ignores stale (inactive) callbacks');
  assert(/const shiftUnits = measureMarkerShift\(m\);/.test(src) && /vb: toViewBox\(viewRef\.current\),/.test(src), 'Clearance measured from the settled view (viewRef), not getScreenCTM');
  assert(!/getScreenCTM/.test(src), 'No DOM CTM reads left (could trail an animation by a frame)');
  assert(/if \(animationRef\.current\) return settle\.add\(cb\);\s*cb\('finished'\);/.test(src), 'whenViewSettles: immediate when idle, otherwise waits on the animation-completion signal');
  assert(/\/\/ A newer animation replaces the running one; settle listeners carry over to it\./.test(src) && /else stopAnimation\('finished'\);/.test(src), 'Listeners carry over to a superseding animation and fire on completion');
  const down = src.slice(src.indexOf('const handlePointerDown'), src.indexOf('const handlePointerMove'));
  assert(!/stopAnimation/.test(down), 'A press alone (e.g. tapping a city marker) no longer freezes the state zoom');
  assert(/if \(animationRef\.current\) \{\s*\/\/ The drag takes over[\s\S]*?stopAnimation\('interrupted'\);\s*beginGesture\(\);/.test(src), 'A drag past the threshold still interrupts the animation and takes over');
  assert(/return \(\) => \{\s*active = false;\s*stopWaiting\(\);\s*\};/.test(src), 'Effect cleanup (new city / Escape / reset) deactivates and unsubscribes the wait');
  assert(!/setTimeout\(/.test(src.slice(src.indexOf('const overlayShifted'), src.indexOf('const controlButton'))), 'No fixed timers in the card placement');
}

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
