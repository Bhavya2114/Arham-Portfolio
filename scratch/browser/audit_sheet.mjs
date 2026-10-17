import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';

// Reuse the page audit's script (a template literal in contrast_audit_v2.mjs), evaluated as JS so its
// escapes are interpreted exactly as there.
const src = fs.readFileSync(new URL('./contrast_audit_v2.mjs', import.meta.url), 'utf-8');
const start = src.indexOf('const AUDIT = `') + 'const AUDIT = '.length;
const end = src.indexOf('})()`;') + '})()`'.length;
const AUDIT = (0, eval)(src.slice(start, end));

const b = await launch(9395);
let total = 0;
for (const desktop of [false, true]) {
  const p = await b.newPage(desktop ? { width: 1280, height: 900, dpr: 1, mobile: false } : { width: 390, height: 844, dpr: 2, mobile: true });
  if (!desktop) await p.s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const ev = (js) => p.evaluate(js);
  await p.s('Page.navigate', { url: 'http://localhost:4173/our-work' });
  await sleep(2500);
  const audit = async (label) => {
    await sleep(500);
    const r = await ev(AUDIT);
    total += r.fails.length;
    console.log(`[${desktop ? 'desktop' : 'phone'}] ${label}: ${r.fails.length ? `${r.fails.length} below AA` : 'all text AA'}${r.light.length ? ` LIGHT ${r.light.join('; ')}` : ''}`);
    r.fails.forEach((f) => console.log('   ', f.ratio, '<', f.need, f.color, JSON.stringify(f.text), f.cls));
  };
  await audit('India view');
  await ev(`document.getElementById('IN-RJ').dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
  await sleep(1600);
  await ev(`[...document.querySelectorAll('svg [role=button][aria-pressed]')].find((e) => /^Kota,/.test(e.getAttribute('aria-label'))).dispatchEvent(new MouseEvent('click', { bubbles: true })); true`);
  await sleep(900);
  await audit('city summary');
  await ev(`(() => { const g = document.querySelector('[aria-label="Clients in Kota"] button'); if (g) g.click(); return true; })()`);
  await sleep(700);
  await audit('group list');
  await ev(`(() => { const t = [...document.querySelectorAll('[role=tab]')].at(-1); if (t) t.click(); return true; })()`);
  await audit('group list, last status tab');
  await ev(`(() => { const t = document.querySelector('[role=tab]'); if (t) t.click(); return true; })()`);
  await sleep(300);
  await ev(`document.querySelector('[data-project-list] ul button').click(); true`);
  await sleep(800);
  await audit('project detail');
  await p.close();
}
console.log('Total below AA:', total);
b.kill();
process.exit(0);
