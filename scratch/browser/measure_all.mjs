// Width of "Area, City · Map · ✓ Completed 2022" for every row, using the rendered line's own fonts.
import { launch, sleep } from './cdp.mjs';
const rows = (await import(new URL('../../src/data/showcaseProjects.js', import.meta.url).href)).getProjectRows();
const b = await launch(9447);
const p = await b.newPage({ width: 1440, height: 900, dpr: 1, mobile: false });
const ev = (js) => p.evaluate(js);
await p.s('Page.navigate', { url: 'http://localhost:4173/our-work' }); await sleep(2800);
await ev(`document.getElementById('IN-RJ').dispatchEvent(new MouseEvent('click', { bubbles: true })); true`); await sleep(1700);
await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => e.getAttribute('aria-label').startsWith('Udaipur,')).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`); await sleep(1300);
const places = rows.map((r) => [r.area, r.city].filter(Boolean).join(', '));
const res = await ev(`(() => {
  const pl = document.querySelector('aside [data-project-place]');
  const area = pl.firstElementChild;
  const rest = [...pl.children].slice(1).reduce((w, c) => w + c.getBoundingClientRect().width, 0) + (pl.children.length - 1) * parseFloat(getComputedStyle(pl).columnGap);
  const avail = pl.clientWidth;
  const out = ${JSON.stringify(places)}.map((t) => { area.textContent = t; return [t, Math.round(area.getBoundingClientRect().width + rest)]; });
  return { avail, rest: Math.round(rest), over: out.filter(([, w]) => w > avail).sort((a, b) => b[1] - a[1]), max: out.sort((a, b) => b[1] - a[1]).slice(0, 5) };
})()`);
console.log(JSON.stringify(res, null, 1));
b.kill();
