import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'shots_fit';
fs.mkdirSync(OUT, { recursive: true });
const b = await launch(9441);
let ok = 0, bad = 0;
const check = (c, m) => { if (c) { ok += 1; console.log('  PASS', m); } else { bad += 1; console.log('  FAIL', m); } };
const errors = [];
b.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 160)); });

for (const [label, size, root] of [['1440', { width: 1440, height: 900, dpr: 1, mobile: false }, 'aside[role=region]'], ['390', { width: 390, height: 844, dpr: 2, mobile: true }, '[data-sheet-snap]']]) {
  console.log(`\n${label}px`);
  for (const city of ['Udaipur', 'Jodhpur', 'Kota']) {
    const p = await b.newPage(size);
    if (label === '390') await p.s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    const ev = (js) => p.evaluate(js);
    const hist = () => p.s('Page.getNavigationHistory');
    await p.s('Page.navigate', { url: `${BASE}/our-work` }); await sleep(2800);
    await ev(`document.getElementById('IN-RJ').dispatchEvent(new MouseEvent('click', { bubbles: true })); true`); await sleep(1700);
    const base = (await hist()).currentIndex;
    await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => e.getAttribute('aria-label').startsWith('${city},')).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
    await sleep(1300);
    const info = await ev(`(() => {
      const root = document.querySelector('${root}');
      const header = root.querySelector('[data-panel-header]');
      const scroll = root.querySelector('[data-panel-scroll]');
      const rows = [...root.querySelectorAll('[data-project-list] li')];
      const r = root.getBoundingClientRect();
      const last = rows.length ? rows[rows.length - 1].getBoundingClientRect() : null;
      const maxH = ${label === '1440' ? `document.querySelector('[data-map-area]').getBoundingClientRect().height - 24` : `Math.round(innerHeight * 0.65)`};
      return {
        h: Math.round(r.height), maxH: Math.round(maxH), rows: rows.length, scrolls: scroll.scrollHeight > scroll.clientHeight + 1,
        gap: last ? Math.round(r.bottom - last.bottom) : null,
        backLinks: [...header.querySelectorAll('button')].filter((x) => !x.getAttribute('aria-label')).map((x) => x.textContent.trim()),
        context: header.querySelector('[data-project-context]')?.textContent.replace(/\\s+/g, ' ').trim() || null,
        h2: root.querySelector('h2')?.textContent,
        address: !!root.querySelector('a[href*="google.com/maps"]'), photo: !!root.querySelector('[aria-label="Project photos"]'),
        year: !!root.querySelector('[data-project-status] [aria-label="Completed in 2022"]') && /2022/.test(root.innerText),
      };
    })()`);
    if (city === 'Udaipur') {
      check(info.h2 === 'ALLEN Udaipur – Hiran Magri Sector 4 Campus' && info.photo && info.year && info.address, `Udaipur (1 project) opens the project directly: "${info.h2}", photo, year, address + Maps link`);
      check(info.context === 'Udaipur · ALLEN Career Institute' && info.backLinks.length === 0, `Header: "${info.context}", no back link, only ✕`);
      check((await hist()).currentIndex === base + 1, 'One history entry');
      check(info.h <= info.maxH, `Height ${info.h} ≤ max ${info.maxH}`);
      await sleep(300);
      const { data } = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.writeFileSync(`${OUT}/${label}-udaipur.jpg`, Buffer.from(data, 'base64'));
      const h = await hist(); await p.s('Page.navigateToHistoryEntry', { entryId: h.entries[h.currentIndex - 1].id }); await sleep(800);
      check(!(await ev(`!!document.querySelector('${root}')`)), 'One back press closes it');
    } else {
      const n = city === 'Jodhpur' ? 3 : 15;
      check(info.rows === n && info.backLinks.length === 0 && info.h2 === city, `${city} (${n} projects): list opens directly, no "‹ Map" back link (✕ only)`);
      if (n === 3) check(!info.scrolls && info.h < info.maxH - 80 && info.gap <= 32, `Short list → shorter panel: ${info.h}px (max ${info.maxH}), ${info.gap}px below the last row`);
      else check(info.scrolls && info.h >= info.maxH - 2, `Long list → panel at max height ${info.h}px (max ${info.maxH}) and scrolls inside`);
      check((await hist()).currentIndex === base + 1, 'List = one history entry');
      await sleep(300);
      const { data } = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); fs.writeFileSync(`${OUT}/${label}-${city.toLowerCase()}.jpg`, Buffer.from(data, 'base64'));
      await ev(`document.querySelector('${root} [data-project-list] li button').click(); true`); await sleep(900);
      const back = await ev(`[...document.querySelector('${root} [data-panel-header]').querySelectorAll('button')].filter((x) => !x.getAttribute('aria-label')).map((x) => x.textContent.trim())`);
      check(back.join() === city && (await hist()).currentIndex === base + 2, `Project detail keeps its back link "‹ ${back.join()}" (+1 entry)`);
      const h = await hist(); await p.s('Page.navigateToHistoryEntry', { entryId: h.entries[h.currentIndex - 1].id }); await sleep(800);
      check((await ev(`document.querySelector('${root} h2')?.textContent`)) === city, 'Back button: detail → list');
      const h2 = await hist(); await p.s('Page.navigateToHistoryEntry', { entryId: h2.entries[h2.currentIndex - 1].id }); await sleep(800);
      check(!(await ev(`!!document.querySelector('${root}')`)), 'Back button: list → closed');
    }
    await p.close();
  }
}
console.log('\nPage errors:', errors.length ? errors : 'none');
console.log(`\n${ok} passed, ${bad} failed`);
b.kill(); process.exit(bad ? 1 : 0);
