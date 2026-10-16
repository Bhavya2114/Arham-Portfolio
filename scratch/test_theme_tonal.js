/**
 * "Tonal dark" theme (theme-light-in-dark): no white / light page sections anywhere.
 *
 * Section shades navy-950 / navy-800, cards #151C3D with a white/7 % border, text #EEF1F7 / #B9C1D3 /
 * #9AA3B8, olive -> accent, dark form fields with a yellow focus ring, framed photos, 16 px body copy.
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
const CONTENT = ['pages/About.jsx', 'pages/Services.jsx', 'pages/Contact.jsx', 'pages/ProjectsGallery.jsx', 'pages/ProjectDetail.jsx', 'pages/NotFound.jsx', 'pages/Home.jsx',
  'sections/Hero.jsx', 'sections/CompanyIntroduction.jsx', 'sections/ServicesOverview.jsx', 'sections/ProjectPreview.jsx', 'sections/PresenceTeaser.jsx',
  'components/contact/EnquiryForm.jsx', 'components/map/ProjectCard.jsx', 'components/ui/Card.jsx', 'components/ui/Badge.jsx', 'components/ui/SectionHeading.jsx', 'components/ui/PageHero.jsx'];
const src = Object.fromEntries(CONTENT.map((f) => [f, read(`../src/${f}`)]));
const all = Object.values(src).join('\n');

console.log('\n1. Tokens');
assert(c.navy[950] === '#070A1F' && c.navy[800] === '#0E1430', 'Section shades: navy-950 #070A1F and navy-800 #0E1430');
assert(c.card === '#151C3D' && c.heading === '#EEF1F7' && c.body === '#B9C1D3' && c.muted.DEFAULT === '#9AA3B8', 'Card #151C3D; text #EEF1F7 / #B9C1D3 / #9AA3B8');
assert(c.ink === '#EEF1F7' && c.light === '#0E1430' && c.brand.bg === '#0E1430' && c.brand.navy === '#EEF1F7' && c.brand.slate === '#B9C1D3', 'Legacy light-theme names re-pointed to their dark equivalents');
const css = read('../src/styles/index.css');
assert(/background-color: var\(--color-navy-950\);\s*color: var\(--color-body\);/.test(css) && /line-height: 1\.1;\s*color: var\(--color-heading\);/.test(css), 'Page base: navy-950 background, body text; headings #EEF1F7');

console.log('\n2. No light surfaces');
assert(!/(?<![:\w/-])bg-(white|light|slate-50|slate-100|brand-bg)(?![/\w-])/.test(all), 'No white / light / slate tint backgrounds in the content files');
assert(!/\btext-olive\b|\bbg-olive\b|\bborder-olive\b|\bring-olive\b/.test(all), 'Olive links / icons / tints became accent');
assert(/default: 'bg-card border border-white\/\[0\.07\] text-body'/.test(src['components/ui/Card.jsx']) && /dark: 'bg-card border border-white\/\[0\.07\] text-body'/.test(src['components/ui/Card.jsx']), 'Cards: #151C3D with a 1px white/7 % border');
assert(/text-heading/.test(src['components/ui/SectionHeading.jsx']) && /text-body /.test(src['components/ui/SectionHeading.jsx']), 'Section headings #EEF1F7, subtitles body');

console.log('\n3. Sections');
assert(/className="w-full bg-navy-950 /.test(src['components/ui/PageHero.jsx']) && /<div className="w-full bg-navy-800 min-h-screen">/.test(src['pages/About.jsx']), 'Page hero navy-950, page content navy-800 (alternating)');
assert(/<section[^>]*id="about"[^>]*bg-navy-800/.test(src['sections/CompanyIntroduction.jsx']) && /bg-navy-950/.test(src['sections/ServicesOverview.jsx']), 'Homepage sections use the two shades');

console.log('\n4. Forms, photos, text size');
const form = src['components/contact/EnquiryForm.jsx'];
assert((form.match(/bg-navy-900 \[color-scheme:dark\] border/g) || []).length === 7 && (form.match(/border-white\/\[0\.12\]/g) || []).length >= 7, 'Inputs #0B1030 with a white/12 % border (dark native pickers)');
assert(/text-brand-navy placeholder:text-muted focus:outline-none focus:border-ink focus:ring-\[3px\] focus:ring-accent/.test(form), 'Inputs: #EEF1F7 text, #9AA3B8 placeholder, yellow focus ring');
const imgs = all.match(/<img\b[\s\S]*?\/>/g) || [];
assert(imgs.length >= 7 && imgs.filter((t) => !/PRESENCE_OVERVIEW_IMAGE/.test(t)).every((t) => /rounded-xl border border-white\/\[0\.08\]/.test(t)), `Photos framed: white/8 % border + rounded corners (${imgs.length} images; the transparent map teaser excepted)`);
const longParas = [...all.matchAll(/<p\s+className="([^"]*leading-[^"]*)"/g)].map((m) => m[1]).filter((cls) => !/\btext-xs\b(?! sm:)|text-\[1[01]px\]/.test(cls) || /sm:text-base|text-base/.test(cls));
assert(longParas.every((cls) => !/\btext-sm\b/.test(cls)), 'Long paragraphs at least 16 px (text-sm body copy raised to text-base)');
assert(!/\bleading-relaxed\b[^"]*\btext-base\b|\btext-base\b[^"]*\bleading-relaxed\b/.test(all.replace(/text-base sm:text-lg/g, '')), 'Raised paragraphs use line-height 1.65');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
