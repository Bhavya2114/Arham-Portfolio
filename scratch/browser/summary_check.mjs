import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'shots_summary';
fs.mkdirSync(OUT, { recursive: true });
const b = await launch(9445);
let ok = 0, bad = 0;
const check = (c, m) => { if (c) { ok += 1; console.log('  PASS', m); } else { bad += 1; console.log('  FAIL', m); } };
const errors = [];
b.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 160)); });
const SENTENCE = 'Complete wiring and lighting for the entire building.';
const measure = (root) => `(() => {
  const root = document.querySelector('${root}');
  const r = root.getBoundingClientRect();
  const sc = root.querySelector('[data-panel-scroll]');
  const box = root.querySelector('[aria-label="Project photos"]')?.parentElement;
  const wa = [...root.querySelectorAll('a')].find((a) => /WhatsApp/.test(a.textContent));
  const sum = root.querySelector('[data-project-summary]');
  const chips = [...root.querySelectorAll('.rounded-full')].filter((e) => !e.closest('[aria-label="Project photos"]') && !e.closest('button') && e.parentElement?.closest('[data-project-detail]') && /border/.test(e.className)).map((e) => e.textContent.trim());
  const cs = sum ? getComputedStyle(sum) : null;
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight,
    scrolls: sc.scrollHeight > sc.clientHeight + 1, rows: root.querySelectorAll('[data-project-list] li').length, h2: root.querySelector('h2')?.textContent,
    photoH: box ? Math.round(box.getBoundingClientRect().height) : null,
    summary: sum?.textContent, size: cs?.fontSize, color: cs?.color, chips,
    oldChips: /Full wiring|Lighting(?! for)/.test([...root.querySelectorAll('li, span')].filter((e) => e.children.length === 0).map((e) => e.textContent).join('|')),
    waBottom: wa ? Math.round(wa.getBoundingClientRect().bottom) : null, waIn: wa ? wa.getBoundingClientRect().bottom <= sc.getBoundingClientRect().bottom + 1 : null };
})()`;

const SIZES = [
  ['1440', { width: 1440, height: 900, dpr: 1, mobile: false }, 'aside[role=region]'],
  ['1366', { width: 1366, height: 768, dpr: 1, mobile: false }, 'aside[role=region]'],
  ['390', { width: 390, height: 844, dpr: 2, mobile: true }, '[data-sheet-snap]'],
];
for (const [label, size, root] of SIZES) {
  console.log(`\n${label}`);
  const p = await b.newPage(size);
  if (label === '390') await p.s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const ev = (js) => p.evaluate(js);
  const openCity = async (city) => {
    await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => e.getAttribute('aria-label').startsWith('${city},')).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
    await sleep(1300);
  };
  const close = async () => { await ev(`document.querySelector('${root} button[aria-label^="Close"]').click(); true`); await sleep(800); };
  await p.s('Page.navigate', { url: `${BASE}/our-work` }); await sleep(2800);
  await ev(`document.getElementById('IN-RJ').dispatchEvent(new MouseEvent('click', { bubbles: true })); true`); await sleep(1700);
  await openCity('Kota');
  const list = await ev(measure(root));
  for (const [city, pick, name] of [['Jaipur', 'Sarvatra', 'sarvatra'], ['Udaipur', null, 'udaipur'], ['Kota', 'Sankalp', 'sankalp']]) {
    if (!(city === 'Kota' && name === 'sankalp' && false)) { await close(); await openCity(city); }
    if (pick) { await ev(`[...document.querySelectorAll('${root} [data-project-list] li button')].find((x) => /${pick}/.test(x.textContent)).click(); true`); await sleep(1000); }
    const m = await ev(measure(root));
    console.log('   ', name, JSON.stringify(m));
    check(m.summary === SENTENCE && m.size === '15px' && m.color === 'rgb(180, 182, 186)', `${m.h2}: "${m.summary}" (${m.size}, ${m.color})`);
    check(m.chips.length === 1 && /^2022$|^Ongoing$/.test(m.chips[0]) && !m.oldChips, `Only chip: ${JSON.stringify(m.chips)}; no "Full wiring" / "Lighting" chips`);
    if (label !== '390') {
      check(!m.scrolls && m.top === list.top && Math.abs(m.bottom - list.bottom) <= 1 && m.photoH >= 260 && m.waIn, `Tall panel ${m.top}–${m.bottom} (= long list), photo ${m.photoH}px, no scroll, WhatsApp visible`);
    } else {
      check(!m.scrolls && m.waIn && m.waBottom <= m.vh && m.h <= Math.round(m.vh * 0.65) + 1, `Sheet ${m.h}px (≤ 65 %), fits, WhatsApp fully visible (bottom ${m.waBottom} of ${m.vh})`);
    }
    const { data } = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
    fs.writeFileSync(`${OUT}/${label}-${name}.jpg`, Buffer.from(data, 'base64'));
  }
  await p.close();
}
console.log('\nPage errors:', errors.length ? errors : 'none');
console.log(`\n${ok} passed, ${bad} failed`);
b.kill(); process.exit(bad ? 1 : 0);
