import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'shots_sheet';
fs.mkdirSync(OUT, { recursive: true });
const b = await launch(9443);
let ok = 0, bad = 0;
const check = (c, m) => { if (c) { ok += 1; console.log('  PASS', m); } else { bad += 1; console.log('  FAIL', m); } };
const errors = [];
b.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 160)); });

const CASES = [
  ['kota-list', 'IN-RJ', 'Kota', null],
  ['mumbai-list', 'IN-MH', 'Mumbai', null],
  ['kota-sankalp', 'IN-RJ', 'Kota', 'Sankalp'],
  ['udaipur', 'IN-RJ', 'Udaipur', null],
];
const measure = `(() => {
  const s = document.querySelector('[data-sheet-snap]');
  const r = s.getBoundingClientRect();
  const sc = s.querySelector('[data-panel-scroll]');
  const wa = [...s.querySelectorAll('a')].find((a) => /WhatsApp/.test(a.textContent));
  return { top: Math.round(r.top), h: Math.round(r.height), vh: innerHeight, scrolls: sc.scrollHeight > sc.clientHeight + 1,
    rows: s.querySelectorAll('[data-project-list] li').length, h2: s.querySelector('h2')?.textContent,
    expanded: s.hasAttribute('data-sheet-expanded'), header: !!s.querySelector('[data-panel-header]') && s.querySelector('[data-panel-header]').getBoundingClientRect().top >= r.top,
    wa: wa ? Math.round(wa.getBoundingClientRect().bottom) : null, waInScroll: wa ? wa.getBoundingClientRect().bottom <= sc.getBoundingClientRect().bottom + 1 : null };
})()`;

for (const [label, size] of [['390x844', { width: 390, height: 844, dpr: 2, mobile: true }], ['375x667', { width: 375, height: 667, dpr: 2, mobile: true }]]) {
  console.log(`\n${label}`);
  for (const [name, state, city, project] of CASES) {
    const p = await b.newPage(size);
    await p.s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    const ev = (js) => p.evaluate(js);
    const touch = async (type, x, y) => p.s('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    const drag = async (dy) => {
      const hb = await ev(`(() => { const r = document.querySelector('[data-sheet-snap] [aria-expanded]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
      await touch('touchStart', hb.x, hb.y);
      for (let i = 1; i <= 8; i += 1) { await touch('touchMove', hb.x, hb.y + (dy * i) / 8); await sleep(16); }
      await touch('touchEnd'); await sleep(700);
    };
    await p.s('Page.navigate', { url: `${BASE}/our-work` }); await sleep(2800);
    await ev(`document.getElementById('${state}').dispatchEvent(new MouseEvent('click', { bubbles: true })); true`); await sleep(1700);
    await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => e.getAttribute('aria-label').startsWith('${city},')).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
    await sleep(1300);
    if (project) {
      await ev(`[...document.querySelectorAll('[data-sheet-snap] [data-project-list] li button')].find((x) => /${project}/.test(x.textContent)).click(); true`);
      await sleep(1000);
    }
    const m = await ev(measure);
    console.log('   ', name, JSON.stringify(m));
    const cap = Math.round(m.vh * 0.65);
    check(m.h <= cap + 1 && m.top >= m.vh - cap - 1, `${name}: sheet ${m.h}px ≤ 65 % (${cap}px); top at ${m.top}px → map's top ${Math.round((m.top / m.vh) * 100)} % visible`);
    if (name.endsWith('-list')) check(m.scrolls && m.header && m.h >= cap - 2, `${name}: ${m.rows} rows scroll inside under the pinned header`);
    if (name === 'kota-sankalp' || name === 'udaipur') {
      const fits = !m.scrolls && m.wa <= m.vh && m.waInScroll;
      if (label === '390x844') check(fits, `${name}: detail fits, WhatsApp fully visible without scrolling (bottom ${m.wa} of ${m.vh})`);
      else console.log(`    ${name} at ${label}: ${fits ? 'fits' : 'scrolls inside'} (WhatsApp bottom ${m.wa}, sheet ${m.h})`);
    }
    const { data } = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
    fs.writeFileSync(`${OUT}/${label}-${name}.jpg`, Buffer.from(data, 'base64'));
    if (name === 'kota-list') {
      await drag(-260);
      const up = await ev(measure);
      const full = Math.max(320, Math.min(up.vh - 72, Math.round(up.vh * 0.85)));
      check(up.expanded && Math.abs(up.h - full) <= 2 && up.top >= 0, `Drag handle up → expanded to ~85 % (${up.h}px of ${full})`);
      await drag(120);
      const down = await ev(measure);
      check(!down.expanded && Math.abs(down.h - cap) <= 2 && Math.abs(down.top - (down.vh - down.h)) <= 2, `Drag down a little → back to 65 % (${down.h}px), resting at the bottom`);
      await ev(`document.querySelector('[data-sheet-snap] [aria-expanded]').click(); true`); await sleep(500);
      const tapUp = await ev(measure);
      await ev(`document.querySelector('[data-sheet-snap] [aria-expanded]').click(); true`); await sleep(700);
      const tapDown = await ev(measure);
      check(tapUp.expanded && Math.abs(tapUp.h - full) <= 2 && !tapDown.expanded && Math.abs(tapDown.h - cap) <= 2, `Handle button: expand → ${tapUp.h}px, collapse → ${tapDown.h}px`);
      await drag(-260);
      // Next city: Jaipur (another Rajasthan marker) starts at 65 % again.
      await ev(`document.querySelector('[data-sheet-snap] button[aria-label^="Close"]').click(); true`); await sleep(800);
      await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => e.getAttribute('aria-label').startsWith('Jaipur,')).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
      await sleep(1300);
      const next = await ev(measure);
      check(!next.expanded && next.h <= cap + 1, `Next city (${next.h2}) starts at 65 % again (${next.h}px)`);
      await drag(Math.round(next.h * 0.6));
      check(!(await ev(`!!document.querySelector('[data-sheet-snap]')`)), 'Dragging far down closes the sheet');
    }
    await p.close();
  }
}
console.log('\nPage errors:', errors.length ? errors : 'none');
console.log(`\n${ok} passed, ${bad} failed`);
b.kill(); process.exit(bad ? 1 : 0);
