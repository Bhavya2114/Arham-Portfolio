/**
 * "Graphite" theme (theme-light-in-dark): all dark, no white / light page sections anywhere.
 *
 * bg #0C0D0F / bg2 #141518 (token names navy-950 / navy-800 kept), cards #1B1D21 with a white/7 % border,
 * footer #08090A, text #F1F1EF / #B4B6BA / #8F9298, accent #D9E35A; badges white/6 % + white/14 % border +
 * accent icon; accent icon tiles; outline buttons; #101114 inputs; framed photos; 16 px body copy.
 * (Rendered contrast is checked separately by the page audit in the scratchpad.)
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

const config = (await import(pathToFileURL(path.resolve(here, '../tailwind.config.js')).href)).default;
const c = config.theme.extend.colors;
const CONTENT = ['pages/Services.jsx', 'pages/Contact.jsx', 'pages/NotFound.jsx', 'pages/Home.jsx',
  'sections/Hero.jsx', 'sections/PresenceTeaser.jsx', 'sections/ServicesList.jsx', 'sections/AboutArham.jsx',
  'components/contact/EnquiryForm.jsx', 'components/presence/ProjectBrowser.jsx', 'components/presence/PhotoGallery.jsx', 'components/layout/Footer.jsx', 'components/layout/MobileActionBar.jsx',
  'components/ui/Card.jsx', 'components/ui/Badge.jsx', 'components/ui/SectionHeading.jsx', 'components/ui/PageHero.jsx'];
const src = Object.fromEntries(CONTENT.map((f) => [f, read(`../src/${f}`)]));
const all = Object.values(src).join('\n');

console.log('\n1. Tokens');
assert(c.navy[950] === '#0C0D0F' && c.navy[800] === '#141518' && c.footer === '#08090A', 'bg #0C0D0F, bg2 #141518 (navy-950 / navy-800 names kept), footer #08090A');
assert(c.card === '#1B1D21' && c.heading === '#F1F1EF' && c.body === '#B4B6BA' && c.muted.DEFAULT === '#8F9298' && c.accent.DEFAULT === '#D9E35A' && c.accent.ink === '#14180A', 'Card #1B1D21; text #F1F1EF / #B4B6BA / #8F9298; accent #D9E35A on #14180A');
assert(c.ink === '#F1F1EF' && c.light === '#141518' && c.brand.bg === '#141518' && c.brand.navy === '#F1F1EF' && c.brand.slate === '#B4B6BA' && c.navy[900] === '#101114', 'Legacy light-theme names re-pointed to their graphite equivalents; inputs #101114');
const css = read('../src/styles/index.css');
assert(/background-color: var\(--color-navy-950\);\s*color: var\(--color-body\);/.test(css) && /line-height: 1\.1;\s*color: var\(--color-heading\);/.test(css), 'Page base: navy-950 background, body text; headings #EEF1F7');

console.log('\n2. No light surfaces');
assert(!/(?<![:\w/-])bg-(white|light|slate-50|slate-100|brand-bg)(?![/\w-])/.test(all), 'No white / light / slate tint backgrounds in the content files');
assert(!/\btext-olive\b|\bbg-olive\b|\bborder-olive\b|\bring-olive\b/.test(all), 'Olive links / icons / tints became accent');
assert(/default: 'bg-card border border-white\/\[0\.07\] text-body'/.test(src['components/ui/Card.jsx']) && /dark: 'bg-card border border-white\/\[0\.07\] text-body'/.test(src['components/ui/Card.jsx']), 'Cards: #151C3D with a 1px white/7 % border');
assert(/text-heading/.test(src['components/ui/SectionHeading.jsx']) && /text-body /.test(src['components/ui/SectionHeading.jsx']), 'Section headings #EEF1F7, subtitles body');

console.log('\n3. Sections');
assert(/className="w-full bg-navy-950 /.test(src['components/ui/PageHero.jsx']) && ['pages/Services.jsx', 'pages/Contact.jsx'].every((f) => /<div className="w-full bg-navy-800 flex-1">/.test(src[f])), 'Page hero navy-950, page content navy-800 (alternating)');
assert(/<section[^>]*id="about"[^>]*bg-navy-800/.test(src['sections/AboutArham.jsx']) && /bg-navy-950/.test(src['sections/ServicesList.jsx']), 'Homepage sections use the two shades');

console.log('\n4. Forms, photos, text size');
const form = src['components/contact/EnquiryForm.jsx'];
assert(/const FIELD =\s*'w-full text-base bg-navy-900 \[color-scheme:dark\] border /.test(form) && (form.match(/className=\{`\$\{FIELD\} /g) || []).length === 4 && /'border-white\/\[0\.14\]'/.test(form), 'Inputs (4) #101114 with a white/14 % border (dark native pickers)');
assert(/text-heading placeholder:text-muted focus:outline-none focus:border-ink focus:ring-\[3px\] focus:ring-accent/.test(form), 'Inputs: heading-colour text, muted placeholder, yellow focus ring');
// The photo gallery frames its photos on the container (white/8 % border, rounded), so its own <img>s
// (and its thumbnail buttons / full-screen viewer) are checked separately.
const gallery = src['components/presence/PhotoGallery.jsx'];
assert(/relative overflow-hidden rounded-xl border border-white\/\[0\.08\]/.test(gallery), 'Project photos framed: the gallery has a white/8 % border and rounded corners');
const imgs = Object.entries(src).filter(([f]) => f !== 'components/presence/PhotoGallery.jsx').map(([, v]) => v).join('\n').match(/<img\b[\s\S]*?\/>/g) || [];
assert(imgs.length >= 3 && imgs.filter((t) => !/PRESENCE_OVERVIEW_IMAGE/.test(t)).every((t) => /rounded-xl border border-white\/\[0\.08\]/.test(t)), `Photos framed: white/8 % border + rounded corners (${imgs.length} images; the transparent map teaser excepted)`);
const longParas = [...all.matchAll(/<p\s+className="([^"]*leading-[^"]*)"/g)].map((m) => m[1]).filter((cls) => !/\btext-xs\b(?! sm:)|text-\[1[01]px\]/.test(cls) || /sm:text-base|text-base/.test(cls));
assert(longParas.every((cls) => !/\btext-sm\b/.test(cls)), 'Long paragraphs at least 16 px (text-sm body copy raised to text-base)');
assert(!/\bleading-relaxed\b[^"]*\btext-base\b|\btext-base\b[^"]*\bleading-relaxed\b/.test(all.replace(/text-base sm:text-lg/g, '')), 'Raised paragraphs use line-height 1.65');

console.log('\n5. Graphite details');
const header = read('../src/components/layout/Header.jsx');
const footer = read('../src/components/layout/Footer.jsx');
const badge = src['components/ui/Badge.jsx'];
const button = read('../src/components/ui/Button.jsx');
assert(/<header className="w-full bg-navy-950 border-b border-white\/\[0\.07\] /.test(header) && /<footer className="w-full bg-footer /.test(footer) && !/bg-white rounded-xl/.test(header), 'Header #0C0D0F with a white/7 % bottom border; footer #08090A; no white notice dialog');
assert(/accent: 'bg-white\/\[0\.06\] text-body border-white\/\[0\.14\]'/.test(badge) && /'accent-dark': 'bg-white\/\[0\.06\] text-body border-white\/\[0\.14\]'/.test(badge) && /: 'text-accent';/.test(badge) && /shrink-0 \$\{iconColor\}/.test(badge), 'Badges / eyebrows: white/6 %, white/14 % border, accent icon');
assert((button.match(/'bg-transparent text-heading border border-white\/\[0\.14\] hover:bg-white\/5/g) || []).length === 2, 'Outline buttons: transparent, heading text, white/14 % border');
assert(!/(bg|border|text)-[a-z]+(-\d+)?\/(\d+|\[[\d.]+\])\/\d+/.test(all + read('../src/pages/Contact.jsx')), 'No broken double-opacity classes');
assert(/bg-accent\/10 text-accent/.test(src['sections/ServicesList.jsx']) && /bg-accent\/10 text-accent/.test(src['pages/Services.jsx']) && !/bg-accent\/15/.test(all), 'Icon tiles: accent at 10 % with an accent icon');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
