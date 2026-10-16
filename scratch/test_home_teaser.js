/**
 * Homepage "Our work across India" teaser (theme-light-in-dark).
 *
 * The interactive map lives only on /presence: the homepage shows a static image of its overview
 * (WebP + PNG fallback, lazy, fixed width / height), the stats from one constant, and links to
 * /presence. Also checks that no map code is on the homepage and that the homepage sections
 * alternate between the two navy shades (tonal dark; no light sections).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};

const teaser = read('../src/sections/PresenceTeaser.jsx');
const home = read('../src/pages/Home.jsx');
const { PRESENCE_TEASER_STATS, PRESENCE_OVERVIEW_IMAGE } = await import(pathToFileURL(path.resolve(here, '../src/data/presenceTeaser.js')).href);

// Image header sizes (PNG IHDR; WebP VP8X / VP8L / VP8 headers).
const pngSize = (buf) => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });
const webpSize = (buf) => {
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
  return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
};

console.log('\n1. Content');
assert(/>\s*Our work across India\s*</.test(teaser) && /Electrical wiring and lighting projects in cities across the country\./.test(teaser), 'Heading and the short line under it');
assert(PRESENCE_TEASER_STATS.length === 2 && PRESENCE_TEASER_STATS[0].value === '27+' && PRESENCE_TEASER_STATS[0].label === 'Cities' && PRESENCE_TEASER_STATS[1].value === '10' && PRESENCE_TEASER_STATS[1].label === 'States', 'Stats "27+ Cities" and "10 States" from one constant');
assert(/PRESENCE_TEASER_STATS\.map/.test(teaser) && /font-heading text-4xl sm:text-5xl font-bold/.test(teaser) && /<dt className="text-sm text-muted-dark">/.test(teaser), 'Numbers in Sora (font-heading), muted labels');
assert(/<Button as=\{Link\} to="\/presence" variant="primary"[\s\S]*?>\s*Explore our work\s*<\/Button>/.test(teaser) && /icon=\{ArrowRight\} iconPosition="right"/.test(teaser), 'Primary yellow "Explore our work →" button to /presence');
assert(/<Link\s+to="\/presence"[\s\S]*?<picture>/.test(teaser), 'The image links to /presence too');

console.log('\n2. Static image');
assert(/<source srcSet=\{PRESENCE_OVERVIEW_IMAGE\.webp\} type="image\/webp" \/>/.test(teaser) && /src=\{PRESENCE_OVERVIEW_IMAGE\.png\}/.test(teaser), 'WebP with a PNG fallback (<picture>)');
assert(/loading="lazy"/.test(teaser) && /width=\{PRESENCE_OVERVIEW_IMAGE\.width\}/.test(teaser) && /height=\{PRESENCE_OVERVIEW_IMAGE\.height\}/.test(teaser), 'Lazy-loaded, with width / height (no layout shift)');
const webp = fs.readFileSync(path.resolve(here, '../public', PRESENCE_OVERVIEW_IMAGE.webp.slice(1)));
const png = fs.readFileSync(path.resolve(here, '../public', PRESENCE_OVERVIEW_IMAGE.png.slice(1)));
const ws = webpSize(webp);
const ps = pngSize(png);
assert(webp.toString('ascii', 0, 4) === 'RIFF' && webp.toString('ascii', 8, 12) === 'WEBP' && ws.w === PRESENCE_OVERVIEW_IMAGE.width * 2 && ws.h === PRESENCE_OVERVIEW_IMAGE.height * 2, `WebP is real and 2x the declared size (${ws.w}×${ws.h})`);
assert(png.readUInt32BE(0) === 0x89504e47 && ps.w === PRESENCE_OVERVIEW_IMAGE.width && ps.h === PRESENCE_OVERVIEW_IMAGE.height, `PNG fallback matches the declared size (${ps.w}×${ps.h})`);
assert(webp.length < 200 * 1024 && png.length < 250 * 1024, `Optimised sizes (WebP ${Math.round(webp.length / 1024)} KB, PNG ${Math.round(png.length / 1024)} KB)`);

console.log('\n3. No map on the homepage');
assert(!/IndiaMapSvg|PresenceMap|PresencePreview|presenceCoverage|cityCoordinates/.test(teaser + home), 'No SVG map component or map data imported by the homepage');
assert(!fs.existsSync(path.resolve(here, '../src/sections/PresencePreview.jsx')), 'Old interactive homepage map section removed');
if (process.env.BUILD_DIR) {
  const assets = path.resolve(process.env.BUILD_DIR, 'assets');
  const homeChunk = fs.readdirSync(assets).find((f) => /^Home-.*\.js$/.test(f));
  const code = fs.readFileSync(path.join(assets, homeChunk), 'utf-8');
  assert(homeChunk && !/india-states-layer|INDIA_MAP_STATES|regionEdges|india-map-worked-fill/.test(code), `Home chunk (${homeChunk}) carries no map code`);
}

console.log('\n4. Tonal dark rhythm (navy-950 / navy-800, no light sections)');
const sections = [...home.matchAll(/<(Hero|CompanyIntroduction|ServicesOverview|ProjectPreview|PresenceTeaser)\b|<section[\s\S]*?className="([^"]+)"/g)].map((m) => m[1] || 'EnquirySection');
const sectionClass = (src) => (src.match(/<section[\s\S]*?className="([^"]+)"/) || ['', ''])[1];
const shadeOf = (cls) => (/\bbg-navy-950\b/.test(cls) ? '950' : /\bbg-navy-800\b/.test(cls) ? '800' : `other(${cls.match(/\bbg-[\w-]+/)?.[0] || 'none'})`);
const shades = {
  Hero: shadeOf(sectionClass(read('../src/sections/Hero.jsx'))),
  CompanyIntroduction: shadeOf(sectionClass(read('../src/sections/CompanyIntroduction.jsx'))),
  ServicesOverview: shadeOf(sectionClass(read('../src/sections/ServicesOverview.jsx'))),
  ProjectPreview: shadeOf(sectionClass(read('../src/sections/ProjectPreview.jsx'))),
  PresenceTeaser: shadeOf(sectionClass(teaser)),
  EnquirySection: shadeOf((home.match(/<section\s+id="contact"\s+className="([^"]+)"/) || ['', ''])[1]),
};
const order = sections.map((name) => shades[name]);
const footerShade = shadeOf((read('../src/components/layout/Footer.jsx').match(/<footer className="([^"]+)"/) || ['', ''])[1]);
assert(sections.join(',') === 'Hero,CompanyIntroduction,ServicesOverview,ProjectPreview,PresenceTeaser,EnquirySection' && order.join(',') === '950,800,950,800,950,800' && footerShade === '950',
  `Sections alternate navy-950 / navy-800 (${sections.map((n, i) => `${n}:${order[i]}`).join(' ')}), then the navy-950 footer`);
assert(!/\bbg-(white|light|slate-50|slate-100)\b(?!\/)/.test(home + teaser + read('../src/sections/Hero.jsx') + read('../src/sections/CompanyIntroduction.jsx') + read('../src/sections/ServicesOverview.jsx') + read('../src/sections/ProjectPreview.jsx')), 'No white / light backgrounds on the homepage');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
