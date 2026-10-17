import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'shots_detail';
fs.mkdirSync(OUT, { recursive: true });
const b = await launch(9442);
let ok = 0, bad = 0;
const check = (c, m) => { if (c) { ok += 1; console.log('  PASS', m); } else { bad += 1; console.log('  FAIL', m); } };
const errors = [];
b.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 160)); });

const SIZES = [
  ['1440', { width: 1440, height: 900, dpr: 1, mobile: false }, 'aside[role=region]'],
  ['1366', { width: 1366, height: 768, dpr: 1, mobile: false }, 'aside[role=region]'],
  ['390', { width: 390, height: 844, dpr: 2, mobile: true }, '[data-sheet-snap]'],
];
for (const [label, size, root] of SIZES) {
  console.log(`\n${label}px`);
  for (const city of ['Bikaner', 'Kota']) {
    const p = await b.newPage(size);
    if (label === '390') await p.s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    const ev = (js) => p.evaluate(js);
    await p.s('Page.navigate', { url: `${BASE}/our-work` }); await sleep(2800);
    await ev(`document.getElementById('IN-RJ').dispatchEvent(new MouseEvent('click', { bubbles: true })); true`); await sleep(1700);
    await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => e.getAttribute('aria-label').startsWith('${city},')).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
    await sleep(1300);
    if (city === 'Kota') {
      await ev(`[...document.querySelectorAll('${root} [data-project-list] li button')].find((x) => /Sankalp/.test(x.textContent)).click(); true`);
      await sleep(1000);
    }
    const info = await ev(`(() => {
      const root = document.querySelector('${root}');
      const scroll = root.querySelector('[data-panel-scroll]');
      const img = root.querySelector('[aria-label="Project photos"] img');
      const ir = img.getBoundingClientRect();
      const map = root.querySelector('a[aria-label$="in Google Maps"]');
      const chips = [...(root.querySelector('[data-project-detail]')?.querySelectorAll('span') || [])].filter((e) => /rounded-full/.test(e.className) && /border/.test(e.className) && !e.closest('[aria-label="Project photos"]')).map((e) => e.textContent.trim());
      const place = root.querySelector('[data-project-place]');
      const onPlace = !!place.querySelector('[data-project-status]');
      const summary = root.querySelector('[data-project-summary]')?.textContent;
      const pr = place.getBoundingClientRect();
      const lineH = parseFloat(getComputedStyle(place).lineHeight) || 24;
      const wa = [...root.querySelectorAll('a')].find((a) => /WhatsApp/.test(a.textContent));
      const r = root.getBoundingClientRect();
      return {
        h2: root.querySelector('h2')?.textContent, ratio: +(ir.width / ir.height).toFixed(2),
        badge: [...root.querySelectorAll('[aria-label="Project photos"] ~ span, .relative > span')].map((s) => s.textContent.trim()).filter(Boolean),
        counter: !!root.querySelector('[data-photo-counter]'), photos: root.querySelectorAll('[aria-label="Project photos"] img').length,
        place: place.textContent.replace(/\\s+/g, ' ').trim(), placeOneLine: pr.height <= lineH * 1.6,
        map: map && { text: map.textContent.trim(), label: map.getAttribute('aria-label'), target: map.target, href: map.href, icon: !!map.querySelector('svg') },
        chips, onPlace, summary, photoBoxH: Math.round(ir.height),
        removed: !/Open in Google Maps|Work done|Coaching centre/i.test(root.innerText),
        scrolls: scroll.scrollHeight > scroll.clientHeight + 1, sh: scroll.scrollHeight, ch: scroll.clientHeight,
        waVisible: wa && wa.getBoundingClientRect().bottom <= Math.min(r.bottom, innerHeight) + 1,
        panelH: Math.round(r.height), vh: innerHeight,
      };
    })()`);
    console.log('   ', JSON.stringify(info));
    const name = city === 'Bikaner' ? 'Bikaner' : 'Sankalp';
    check(new RegExp(name).test(info.h2), `${city}: detail "${info.h2}"`);
    check(label === '390' ? Math.abs(info.ratio - 16 / 9) < 0.05 : info.photoBoxH >= 180, label === '390' ? `Photo ratio ${info.ratio} (16:9)` : `Photo fills the free height: ${info.photoBoxH}px (≥ 180)`);
    check(info.badge.includes('ALLEN Career Institute'), 'Client badge "ALLEN Career Institute" on the photo');
    check(info.photos > 1 ? info.counter : !info.counter, `${info.photos} photo(s): counter ${info.counter ? 'shown' : 'hidden'}`);
    check(info.placeOneLine && info.map && info.map.text === 'Map' && info.map.icon && info.map.target === '_blank' && info.map.label === `Open ${info.h2} in Google Maps` && info.map.href.startsWith('https://www.google.com/maps/search/'), `Place line "${info.place}" with 📍 Map link (${info.map?.label})`);
    check(info.chips.length === 1 && /^\d{4}$|^Ongoing$/.test(info.chips[0]) && info.onPlace && info.summary === 'Complete wiring and lighting for the entire building.', `Status "${info.chips.join(' | ')}" on the area line (only chip) + summary sentence`);
    check(info.removed, 'No address block, "Open in Google Maps", category chip or "Work done"');
    if (label !== '390') check(!info.scrolls && info.waVisible, `Fits without scrolling (content ${info.sh} ≤ ${info.ch}, panel ${info.panelH}px of ${info.vh}); WhatsApp button visible`);
    else console.log(`    phone: content ${info.sh} / ${info.ch} (${info.scrolls ? 'scrolls' : 'fits'})`);
    await sleep(300);
    const { data } = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
    fs.writeFileSync(`${OUT}/${label}-${name.toLowerCase()}.jpg`, Buffer.from(data, 'base64'));
    await p.close();
  }
}
console.log('\nPage errors:', errors.length ? errors : 'none');
console.log(`\n${ok} passed, ${bad} failed`);
b.kill(); process.exit(bad ? 1 : 0);
