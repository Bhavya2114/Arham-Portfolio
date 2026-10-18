// Header + footer logo at 1440 and 390 px: the SVG loads, keeps its 403 × 120 proportions (not squashed),
// is ~44 / ~36 px tall, links Home; the menu still fits on one row. Also checks the icon / preview files are served.
import fs from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'shots_header';
fs.mkdirSync(OUT, { recursive: true });
const b = await launch(9450);
let ok = 0, bad = 0;
const check = (c, m) => { if (c) { ok += 1; console.log('  PASS', m); } else { bad += 1; console.log('  FAIL', m); } };
const errors = [];
b.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.slice(0, 160)); });

const probe = `(() => {
  const one = (sel) => {
    const img = document.querySelector(sel);
    if (!img) return null;
    const r = img.getBoundingClientRect();
    const link = img.closest('a');
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), loaded: img.complete && img.naturalWidth > 0, alt: img.alt, src: img.getAttribute('src'), href: link?.getAttribute('href'), left: Math.round(r.left), right: Math.round(r.right) };
  };
  const header = document.querySelector('header');
  const row = header.querySelector('div.flex');
  const kids = [...row.children].filter((e) => getComputedStyle(e).display !== 'none').map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) }; });
  const navLinks = [...header.querySelectorAll('nav[aria-label="Main Navigation"] a')].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.textContent.trim());
  return { header: one('header img'), footer: one('footer img'), headerH: Math.round(header.getBoundingClientRect().height), kids,
    overflow: document.documentElement.scrollWidth > innerWidth, rowOverflow: row.scrollWidth > row.clientWidth + 1, navLinks,
    menuBtn: !![...header.querySelectorAll('button')].find((x) => /menu/i.test(x.getAttribute('aria-label') || '') && x.getBoundingClientRect().width > 0) };
})()`;

for (const [label, size, wantH] of [['1440', { width: 1440, height: 900, dpr: 1, mobile: false }, 44], ['390', { width: 390, height: 844, dpr: 2, mobile: true }, 36]]) {
  console.log(`\n${label}px`);
  const p = await b.newPage(size);
  await p.s('Page.navigate', { url: `${BASE}/` }); await sleep(2500);
  const m = await p.evaluate(probe);
  console.log('   ', JSON.stringify(m));
  for (const where of ['header', 'footer']) {
    const l = m[where];
    const ratio = l ? l.w / l.h : 0;
    check(l && l.loaded && l.src === '/brand/arham-logo/arham-logo-horizontal-dark.svg' && l.alt === 'Arham Power Solutions' && l.href === '/', `${where}: logo SVG loaded, alt "${l?.alt}", links to Home`);
    check(l && Math.abs(l.h - wantH) <= 0.5 && Math.abs(ratio - 403 / 120) < 0.02, `${where}: ${l?.w}×${l?.h}px (≈ ${wantH} px tall, ratio ${ratio.toFixed(3)} = 403/120: not squashed)`);
  }
  const tops = m.kids.map((k) => k.top);
  const noOverlap = m.kids.every((k, i) => i === 0 || k.left >= m.kids[i - 1].right - 1);
  check(!m.overflow && !m.rowOverflow && noOverlap && Math.max(...m.kids.map((k) => k.bottom)) <= m.headerH + 1, `Header row fits: ${m.kids.length} items side by side, no overflow, header ${m.headerH}px`);
  if (label === '1440') check(m.navLinks.join() === 'Our Work,Services,Contact', `Desktop menu still shows: ${m.navLinks.join(', ')}`);
  else check(m.menuBtn, 'Phone: menu button visible beside the logo');
  const { data } = await p.s('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size.width, height: label === '1440' ? 90 : 72, scale: 1 } });
  fs.writeFileSync(`${OUT}/${label}-header.png`, Buffer.from(data, 'base64'));
  await p.evaluate(`window.scrollTo(0, document.body.scrollHeight); true`); await sleep(600);
  const shot = await p.s('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  fs.writeFileSync(`${OUT}/${label}-footer.jpg`, Buffer.from(shot.data, 'base64'));
  await p.close();
}

console.log('\nServed files');
for (const [url, type] of [['/brand/arham-logo/favicon-32.png', 'image/png'], ['/brand/arham-logo/apple-touch-icon.png', 'image/png'], ['/brand/arham-logo/icon-192.png', 'image/png'], ['/brand/arham-logo/icon-512.png', 'image/png'], ['/brand/arham-logo/og-image.png', 'image/png'], ['/site.webmanifest', ''], ['/brand/arham-logo/arham-logo-horizontal-dark.svg', 'image/svg+xml']]) {
  const r = await fetch(BASE + url);
  check(r.status === 200 && (!type || (r.headers.get('content-type') || '').startsWith(type)), `${url}: ${r.status} ${r.headers.get('content-type')}`);
}
console.log('\nPage errors:', errors.length ? errors : 'none');
console.log(`\n${ok} passed, ${bad} failed`);
b.kill(); process.exit(bad ? 1 : 0);
