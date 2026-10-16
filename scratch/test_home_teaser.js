/**
 * Homepage "Our work across India" teaser, and the homepage order (site-restructure).
 *
 * The interactive map lives only on /our-work: the homepage shows a static image of its overview
 * (WebP + PNG fallback, lazy, fixed width / height), the stats from one constant, and links to
 * /our-work. Also checks that no map code is on the homepage, and the homepage order: hero → map
 * teaser (right after the hero) → what we do → about → enquiry, alternating the two Graphite shades.
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
assert(/<Button as=\{Link\} to="\/our-work" variant="primary"[\s\S]*?>\s*Explore our work\s*<\/Button>/.test(teaser) && /icon=\{ArrowRight\} iconPosition="right"/.test(teaser), 'Primary yellow "Explore our work →" button to /our-work');
assert(/<Link\s+to="\/our-work"[\s\S]*?<picture>/.test(teaser) && !/\/presence"/.test(teaser), 'The image links to /our-work too');

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

console.log('\n4. Homepage order and Graphite rhythm (bg / bg2 = navy-950 / navy-800, no light sections)');
const SECTION_FILES = { Hero: 'Hero', PresenceTeaser: 'PresenceTeaser', ServicesList: 'ServicesList', AboutArham: 'AboutArham' };
const sections = [...home.matchAll(/<(Hero|PresenceTeaser|ServicesList|AboutArham)\b[^>]*\/>|<section[\s\S]*?className="([^"]+)"/g)].map((m) => m[1] || 'EnquirySection');
const sectionClass = (src) => (src.match(/<section[\s\S]*?className="([^"]+)"/) || ['', ''])[1];
const shadeOf = (cls) => (/\bbg-navy-950\b/.test(cls) ? '950' : /\bbg-navy-800\b/.test(cls) ? '800' : /\bbg-footer\b/.test(cls) ? 'footer' : `other(${cls.match(/\bbg-[\w-]+/)?.[0] || 'none'})`);
const sectionSrc = Object.fromEntries(Object.entries(SECTION_FILES).map(([k, f]) => [k, read(`../src/sections/${f}.jsx`)]));
const shades = {
  ...Object.fromEntries(Object.entries(sectionSrc).map(([k, src]) => [k, shadeOf(sectionClass(src))])),
  EnquirySection: shadeOf((home.match(/<section\s+id="contact"\s+className="([^"]+)"/) || ['', ''])[1]),
};
const order = sections.map((name) => shades[name]);
const footerShade = shadeOf((read('../src/components/layout/Footer.jsx').match(/<footer className="([^"]+)"/) || ['', ''])[1]);
assert(sections.join(',') === 'Hero,PresenceTeaser,ServicesList,AboutArham,EnquirySection', `Order: hero, map teaser (right after the hero), what we do, about, enquiry (${sections.join(', ')})`);
assert(order.join(',') === '950,800,950,800,950' && footerShade === 'footer',
  `Sections alternate navy-950 / navy-800 (${sections.map((n, i) => `${n}:${order[i]}`).join(' ')}), then the #08090A footer`);
assert(!/\bbg-(white|light|slate-50|slate-100)\b(?!\/)/.test(home + Object.values(sectionSrc).join('\n')), 'No white / light backgrounds on the homepage');
assert(['CompanyIntroduction', 'ServicesOverview', 'ProjectPreview'].every((f) => !fs.existsSync(path.resolve(here, `../src/sections/${f}.jsx`))), 'Repeated service / intro / stock-photo sections removed');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
