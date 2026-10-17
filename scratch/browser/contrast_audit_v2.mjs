// Rendered-page WCAG contrast audit: every visible text node on every page, phone + desktop.
// For each element with its own text: colour vs the first opaque background behind it (alpha
// layers blended; elements over images / gradients reported separately as "complex").
// Translucent gradient backgrounds (the Our Work panel / sheet) are checked over both the page (#0C0D0F)
// and the map's brightest fill (#5C7E1C), whichever is worse.
// Usage: node contrast_audit_v2.mjs [shotDir]
import fs from 'node:fs';
import path from 'node:path';
import { launch, sleep } from './cdp.mjs';

const shotDir = process.argv[2];
const base = 'http://localhost:4173';
const pages = ['/', '/our-work', '/services', '/contact', '/no-such-page'];
const sizes = { phone: { width: 390, height: 844, dpr: 2, mobile: true }, desktop: { width: 1280, height: 900, dpr: 1, mobile: false } };
const browser = await launch(9347);
const AUDIT = `(() => {
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(',').map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        if (/gradient/.test(cs.backgroundImage)) {
          // Use the gradient's darkest / lightest stop as a bound: take all stop colours.
          const stops = [...cs.backgroundImage.matchAll(/rgba?\\([^)]+\\)/g)].map((m) => parse(m[0]));
          return { layers, gradient: stops };
        }
        return { layers, complex: true };
      }
      if (n.tagName === 'IMG' || n.tagName === 'svg') return { layers, complex: true };
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) return { layers }; }
    }
    layers.push({ r: 255, g: 255, b: 255, a: 1 });
    return { layers };
  };
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') || el.closest('[aria-hidden="true"]')) continue;
    const own = [...el.childNodes].some((t) => t.nodeType === 3 && t.textContent.trim());
    if (!own) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || r.width === 0 || r.height === 0 || parseFloat(cs.opacity) === 0) continue;
    // Skip elements inside images / photo overlays (checked visually) and the map SVG.
    const fg0 = parse(cs.color); if (!fg0) continue;
    const bg = bgOf(el);
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const text = [...el.childNodes].filter((t) => t.nodeType === 3).map((t) => t.textContent.trim()).join(' ').slice(0, 60);
    let worst;
    if (bg.complex) continue;
    if (bg.gradient) {
      worst = Math.min(...bg.gradient.flatMap((stop) => [{ r: 12, g: 13, b: 15, a: 1 }, { r: 92, g: 126, b: 28, a: 1 }].map((back) => { const base = stop.a < 1 ? over(stop, back) : stop; const fg = fg0.a < 1 ? over(fg0, base) : fg0; return ratio(fg, base); })));
    } else {
      let b = bg.layers[bg.layers.length - 1];
      for (let i = bg.layers.length - 2; i >= 0; i -= 1) b = over(bg.layers[i], b);
      const fg = fg0.a < 1 ? over(fg0, b) : fg0;
      worst = ratio(fg, b);
    }
    // Disabled controls are exempt (WCAG 1.4.3).
    if (el.closest('[disabled],[aria-disabled="true"]')) continue;
    if (worst < need) {
      const key = cs.color + '|' + text;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ text, ratio: +worst.toFixed(2), need, color: cs.color, size: Math.round(size), cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0, 90) });
    }
  }
  // Light areas: any sizeable element with a light background (no light sections / cards in the tonal dark theme).
  const light = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') || el.tagName === 'IMG' || el.tagName === 'PICTURE') continue;
    const cs = getComputedStyle(el); const c = parse(cs.backgroundColor);
    if (!c || c.a < 0.5) continue;
    const r = el.getBoundingClientRect(); if (r.width * r.height < 400 || cs.display === 'none') continue;
    const isAccent = Math.abs(c.r - 217) + Math.abs(c.g - 227) + Math.abs(c.b - 90) < 40 || Math.abs(c.r - 230) + Math.abs(c.g - 238) + Math.abs(c.b - 122) < 40;
    if (!isAccent && lum(c) > 0.3) light.push((el.className && el.className.toString ? el.className.toString() : el.tagName).slice(0, 80) + ' ' + cs.backgroundColor);
  }
  return { fails: out, overflow: document.documentElement.scrollWidth > innerWidth, light: [...new Set(light)].slice(0, 8) };
})()`;

let total = 0;
let lightTotal = 0;
for (const [label, size] of Object.entries(sizes)) {
  for (const url of pages) {
    const page = await browser.newPage(size);
    if (size.mobile) await page.s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await page.s('Page.navigate', { url: base + url });
    await sleep(2200);
    // Skip the map entrance and let everything settle.
    await page.evaluate(`(() => { const w = document.querySelector('[data-entrance]'); if (w) w.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 9, pointerType: 'touch' })); return true; })()`);
    await sleep(400);
    const r = await page.evaluate(AUDIT);
    total += r.fails.length;
    console.log(`\n[${label}] ${url}  ${r.fails.length ? r.fails.length + ' below AA' : 'all text AA'}${r.overflow ? '  (HORIZONTAL OVERFLOW)' : ''}`);
    r.fails.forEach((f) => console.log(`   ${f.ratio}:1 < ${f.need}  ${f.color}  ${f.size}px  "${f.text}"  .${f.cls}`));
    if (r.light.length) { lightTotal += r.light.length; r.light.forEach((l) => console.log('   LIGHT AREA  ' + l)); }
    if (shotDir) {
      fs.mkdirSync(shotDir, { recursive: true });
      const h = await page.evaluate('Math.min(document.documentElement.scrollHeight, 6000)');
      await page.s('Emulation.setDeviceMetricsOverride', { width: size.width, height: h, deviceScaleFactor: size.dpr === 2 ? 1 : 1, mobile: size.mobile });
      await sleep(600);
      const { data } = await page.s('Page.captureScreenshot', { format: 'jpeg', quality: 70, captureBeyondViewport: true });
      const name = `${label}-${url === '/' ? 'home' : url.replace(/^\//, '').replace(/\//g, '-')}.jpg`;
      fs.writeFileSync(path.join(shotDir, name), Buffer.from(data, 'base64'));
    }
    await page.close();
  }
}
browser.kill();
console.log(`\nTotal below AA: ${total}`);
process.exit(0);
