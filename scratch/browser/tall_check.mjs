// Desktop project detail (current design): full-height panel, the photo absorbs any shortage (≥ 180 px),
// "Area, City · Map · [CalendarCheck] 2022" on one line, the summary sentence, WhatsApp at the bottom.
import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'shots_tall';
fs.mkdirSync(OUT, { recursive: true });
const b = await launch(9444);
let ok = 0, bad = 0;
const check = (c, m) => { if (c) { ok += 1; console.log('  PASS', m); } else { bad += 1; console.log('  FAIL', m); } };
const errors = [];
b.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 160)); });
const ROOT = 'aside[role=region]';
const SENTENCE = 'Complete wiring and lighting for the entire building.';
const measure = `(() => {
  const chipInfo = (el) => { if (!el) return null; const svg = el.querySelector('svg'); const cs = getComputedStyle(el); return { text: el.textContent.trim(), label: el.getAttribute('aria-label'), role: el.getAttribute('role'), icon: svg ? [...svg.classList].find((c) => c.startsWith('lucide-')) : null, iconHidden: svg?.getAttribute('aria-hidden') === 'true', iconPx: svg ? Math.round(svg.getBoundingClientRect().width) : 0, iconColor: svg ? getComputedStyle(svg).color : null, color: cs.color, stroke: svg?.getAttribute('stroke') }; };
  const root = document.querySelector('${ROOT}');
  const r = root.getBoundingClientRect();
  const sc = root.querySelector('[data-panel-scroll]');
  const box = root.querySelector('[aria-label="Project photos"]')?.parentElement;
  const img = root.querySelector('[aria-label="Project photos"] img');
  const wa = [...root.querySelectorAll('a')].find((a) => /WhatsApp/.test(a.textContent));
  const pad = parseFloat(getComputedStyle(root).paddingBottom);
  const place = root.querySelector('[data-project-place]');
  const status = place?.querySelector('[data-project-status]');
  const first = place?.firstElementChild;
  const detail = root.querySelector('[data-project-detail]');
  const chips = detail ? [...detail.querySelectorAll('span, li')].filter((e) => /rounded-full/.test(e.className) && /border/.test(e.className) && !e.closest('[aria-label="Project photos"]')).map((e) => e.textContent.trim()) : [];
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight,
    scrolls: sc.scrollHeight > sc.clientHeight + 1, scrollbar: sc.offsetWidth - sc.clientWidth,
    rows: root.querySelectorAll('[data-project-list] li').length, h2: root.querySelector('h2')?.textContent,
    photoH: box ? Math.round(box.getBoundingClientRect().height) : null, fit: img ? getComputedStyle(img).objectFit : null,
    imgH: img ? Math.round(img.getBoundingClientRect().height) : null,
    badge: box ? [...box.querySelectorAll(':scope > span')].map((s) => s.textContent.trim()) : [],
    place: place?.textContent.replace(/\\s+/g, ' ').trim(),
    oneLine: !!(place && status && first && Math.abs(status.getBoundingClientRect().top - first.getBoundingClientRect().top) < 12),
    statusLast: !!(status && place.lastElementChild === status),
    summary: root.querySelector('[data-project-summary]')?.textContent, chips,
    chip: chipInfo(status?.querySelector('[role=img]')), rowChip: chipInfo(root.querySelector('[data-project-list] li [role=img]')),
    waGap: wa ? Math.round(r.bottom - pad - wa.getBoundingClientRect().bottom) : null,
    waIn: wa ? wa.getBoundingClientRect().bottom <= Math.min(sc.getBoundingClientRect().bottom, innerHeight) + 1 : false };
})()`;

const SIZES = [
  ['1920x800', { width: 1920, height: 800, dpr: 1, mobile: false }],
  ['1440x900', { width: 1440, height: 900, dpr: 1, mobile: false }],
  ['1366x768', { width: 1366, height: 768, dpr: 1, mobile: false }],
  ['1280x720', { width: 1280, height: 720, dpr: 1, mobile: false }],
];
for (const [label, size] of SIZES) {
  console.log(`\n${label}`);
  const p = await b.newPage(size);
  const ev = (js) => p.evaluate(js);
  const openCity = async (city) => {
    await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => e.getAttribute('aria-label').startsWith('${city},')).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
    await sleep(1300);
  };
  const close = async () => { await ev(`document.querySelector('${ROOT} button[aria-label^="Close"]').click(); true`); await sleep(700); };
  await p.s('Page.navigate', { url: `${BASE}/our-work` }); await sleep(2800);
  await ev(`document.getElementById('IN-RJ').dispatchEvent(new MouseEvent('click', { bubbles: true })); true`); await sleep(1700);
  await openCity('Kota');
  const list = await ev(measure);
  check(list.rows === 15 && list.scrolls, `Kota list: 15 rows, full height ${list.h}px, scrolls (lists unchanged)`);
  const rc = list.rowChip;
  check(rc && rc.text === '2022' && rc.label === 'Completed in 2022' && rc.icon === 'lucide-calendar-check' && rc.iconHidden && rc.iconPx === 14 && rc.iconColor === rc.color, `List row chip: [CalendarCheck] "${rc?.text}", aria-label "${rc?.label}"`);
  for (const [city, pick, name] of [['Jaipur', 'Sarvatra', 'sarvatra'], ['Udaipur', null, 'udaipur'], ['Kota', 'Sankalp', 'sankalp']]) {
    await close(); await openCity(city);
    if (pick) { await ev(`[...document.querySelectorAll('${ROOT} [data-project-list] li button')].find((x) => /${pick}/.test(x.textContent)).click(); true`); await sleep(1000); }
    const m = await ev(measure);
    console.log('   ', name, JSON.stringify(m));
    const t = `${label} ${m.h2}`;
    check(m.top === list.top && Math.abs(m.bottom - list.bottom) <= 1, `${t}: panel ${m.top}–${m.bottom} = long-list panel`);
    check(!m.scrolls && m.scrollbar === 0, `${t}: no scrolling, no scrollbar`);
    check(m.photoH >= 180 && m.fit === 'cover' && Math.abs(m.imgH - m.photoH) <= 2 && m.badge.includes('ALLEN Career Institute'), `${t}: photo ${m.photoH}px (≥ 180, cover) with the client badge`);
    check(m.oneLine && m.statusLast && /^\S.*·\s*Map\s*·\s*2022$/.test(m.place), `${t}: "${m.place}" on one line, status last`);
    check(m.summary === SENTENCE && m.chips.length === 1 && m.chips[0] === '2022', `${t}: summary sentence; status is the only chip (no scope chips)`);
    const c = m.chip;
    check(c && c.text === '2022' && c.label === 'Completed in 2022' && c.role === 'img' && c.icon === 'lucide-calendar-check' && c.iconHidden && c.iconPx === 14 && c.iconColor === c.color && c.stroke === 'currentColor', `${t}: chip [CalendarCheck 14px, ${c?.iconColor}] "${c?.text}", aria-label "${c?.label}"`);
    check(m.waIn && m.waGap >= 0 && m.waGap <= 10, `${t}: WhatsApp fully visible at the bottom (${m.waGap}px above the panel padding)`);
    const { data } = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
    fs.writeFileSync(`${OUT}/${label}-${name}.jpg`, Buffer.from(data, 'base64'));
  }
  await close(); await openCity('Jodhpur');
  const short = await ev(measure);
  check(short.rows === 3 && !short.scrolls && short.h < list.h - 80, `Jodhpur list (3) still fits its content: ${short.h}px`);
  await p.close();
}
console.log('\nPage errors:', errors.length ? errors : 'none');
console.log(`\n${ok} passed, ${bad} failed`);
b.kill(); process.exit(bad ? 1 : 0);
