/**
 * Site restructure (branch site-restructure): 4 pages, redirects, nav, company details, enquiry form
 * (WhatsApp / email, no backend), phone action bar, slim footer, plain-English copy, no disclaimers.
 * (Replaces the old phase 6 / phase 7 suites, which tested the removed About / Projects pages and the
 * old "delivery unconfigured" form.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NAV_ITEMS } from '../src/data/navigation.js';
import { COMPANY, pageTitle } from '../src/data/company.js';
import { SERVICES, PROCESS_STEPS } from '../src/data/services.js';
import { getProjectRows, SHOWCASE_PROJECTS, USE_PLACEHOLDER_PROJECTS } from '../src/data/showcaseProjects.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
const exists = (rel) => fs.existsSync(path.resolve(here, rel));
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
// Visible text only: JSX source with comments removed.
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const app = read('../src/App.jsx');
const header = read('../src/components/layout/Header.jsx');
const footer = read('../src/components/layout/Footer.jsx');
const layout = read('../src/components/layout/Layout.jsx');
const bar = read('../src/components/layout/MobileActionBar.jsx');
const form = read('../src/components/contact/EnquiryForm.jsx');
const home = read('../src/pages/Home.jsx');
const presence = read('../src/pages/Presence.jsx');
const contact = read('../src/pages/Contact.jsx');
const services = read('../src/pages/Services.jsx');
const notFound = read('../src/pages/NotFound.jsx');
const css = read('../src/styles/index.css');
const index = read('../index.html');

console.log('\n1. Pages and redirects');
assert(['Home', 'Presence', 'Services', 'Contact', 'NotFound'].every((p) => app.includes(`import('./pages/${p}')`)) && !/About|ProjectsGallery|ProjectDetail/.test(app.replace(/\/\*[\s\S]*?\*\//g, '')), '4 pages (+ 404) are routed; About / Projects / ProjectDetail pages gone');
assert(['About', 'ProjectsGallery', 'ProjectDetail'].every((p) => !exists(`../src/pages/${p}.jsx`)), 'Removed page files deleted');
assert(/path="\/presence" element=\{<Navigate to="\/our-work" replace \/>\}/.test(app) && /path="\/projects" element=\{<Navigate to="\/our-work" replace \/>\}/.test(app) && /path="\/projects\/:id" element=\{<Navigate to="\/our-work" replace \/>\}/.test(app) && /path="\/about" element=\{<Navigate to="\/#about" replace \/>\}/.test(app), 'Redirects: /presence, /projects, /projects/:id → /our-work; /about → /#about');
assert(/window\.location\.hash/.test(read('../src/lib/usePageMetadata.js')) && /scrollIntoView/.test(read('../src/lib/usePageMetadata.js')), '/#about (and other #sections) scroll into view on arrival');
const sitemap = read('../public/sitemap.xml');
assert(['/', '/our-work', '/services', '/contact'].every((r) => sitemap.includes(`<loc>${r}</loc>`)) && (sitemap.match(/<loc>/g) || []).length === 4, 'sitemap.xml: the 4 pages');

// Hosting (Vercel): every path that is not a real file serves index.html, so direct visits / refreshes on
// /our-work, /services, /contact and the old /presence, /projects, /about load the app (which redirects).
const vercel = JSON.parse(read('../vercel.json'));
assert(Array.isArray(vercel.rewrites) && vercel.rewrites.length === 1 && vercel.rewrites[0].source === '/(.*)' && vercel.rewrites[0].destination === '/index.html' && !vercel.redirects && !vercel.headers,
  'vercel.json: SPA fallback rewrite to /index.html (real files such as images, sitemap and robots.txt are still served first)');

console.log('\n2. Navigation');
assert(NAV_ITEMS.map((i) => `${i.name}:${i.path}`).join(',') === 'Our Work:/our-work,Services:/services,Contact:/contact', 'Nav: Our Work · Services · Contact');
assert(/whatsappHref\(WHATSAPP_HELLO\)/.test(header) && /aria-label=\{`WhatsApp \$\{COMPANY\.name\}`\}/.test(header) && />\s*Enquire\s*<\/Button>/.test(header) && /variant="primary"/.test(header), 'Header: WhatsApp icon button and the yellow Enquire button');

console.log('\n3. Company details (one config file)');
assert(COMPANY.name === 'Arham Power Solutions' && COMPANY.phoneHref === 'tel:+916378391640' && COMPANY.whatsappUrl === 'https://wa.me/916378391640' && COMPANY.email === 'arhampower@gmail.com', 'Name, phone, WhatsApp and email in src/data/company.js');
const siteFiles = [...walk(path.resolve(here, '../src')), path.resolve(here, '../index.html'), path.resolve(here, '../README.md'), path.resolve(here, '../public/sitemap.xml'), path.resolve(here, '../public/robots.txt')];
const textOf = (f) => fs.readFileSync(f, 'utf-8');
assert(siteFiles.every((f) => !/7878787878|arham@gmail\.com/.test(textOf(f))), 'No placeholder 7878787878 / arham@gmail.com anywhere');
assert(siteFiles.filter((f) => /\.(jsx|html|md)$/.test(f)).every((f) => !/Electrical (&|&amp;|and) Lighting(?! across)|ARHAM — Electrical|Arham Corporate Website/.test(textOf(f).replace(/\/\*[\s\S]*?\*\//g, ''))), 'Old name ("Electrical & Lighting", "ARHAM — Electrical…") gone from pages, index.html and README');
const logoSrc = read('../src/components/ui/BrandLogo.jsx');
assert(/export const LOGO_SRC = '\/brand\/arham-logo\/arham-logo-horizontal-dark\.svg';/.test(logoSrc) && /src=\{LOGO_SRC\}/.test(logoSrc) && /alt=\{COMPANY\.name\}/.test(logoSrc) && COMPANY.name === 'Arham Power Solutions' && exists('../public/brand/arham-logo/arham-logo-horizontal-dark.svg'), 'Logo: the horizontal dark SVG, alt "Arham Power Solutions"');
assert(/width="403"\s*height="120"/.test(logoSrc) && /h-9 w-auto sm:h-11/.test(logoSrc) && /viewBox="0 0 403 120"/.test(read('../public/brand/arham-logo/arham-logo-horizontal-dark.svg')), 'Logo 36 px tall on phones, 44 px from sm, width from its 403 × 120 proportions (not squashed)');
assert(/<Link to="\/"[^>]*>\s*<BrandLogo \/>\s*<\/Link>/.test(read('../src/components/layout/Header.jsx')) && /<Link to="\/"[^>]*>\s*<BrandLogo \/>\s*<\/Link>/.test(read('../src/components/layout/Footer.jsx')), 'Header and footer: the logo links to Home');
assert(/<title>Arham Power Solutions — /.test(index) && /og:site_name" content="Arham Power Solutions"/.test(index) && /"telephone": "\+91 63783 91640"/.test(index) && /"email": "arhampower@gmail.com"/.test(index), 'index.html: title, share tags and schema.org with the company details');
assert(pageTitle('Our Work') === 'Our Work — Arham Power Solutions' && [presence, services, contact, notFound].every((s) => /pageTitle\(/.test(s)), 'Every page title ends "— Arham Power Solutions"');
assert(/Arham Power Solutions/.test(read('../README.md')) && /\+91 63783 91640/.test(read('../README.md')), 'README names the company and its contact details');

console.log('\n4. Homepage');
const order = [...home.matchAll(/<(Hero|PresenceTeaser|ServicesList|AboutArham)\b[^>]*\/>|<EnquiryForm\b/g)].map((m) => m[1] || 'EnquiryForm');
assert(order.join(',') === 'Hero,PresenceTeaser,ServicesList,AboutArham,EnquiryForm', `Order: hero, map teaser, services, about, enquiry form (${order.join(', ')})`);
const hero = read('../src/sections/Hero.jsx');
assert(/<Button as=\{Link\} to="\/our-work" variant="primary"[\s\S]*?See our work on the map/.test(hero) && /href=\{whatsappHref\(WHATSAPP_HELLO\)\}[\s\S]*?WhatsApp us/.test(hero), 'Hero: "See our work on the map" (→ /our-work) and "WhatsApp us"');
assert(SERVICES.length === 9 && SERVICES.every((s) => s.title && s.line && s.line.length < 120), '9 services, one short line each (the homepage shows the first 4)');
assert(/to="\/services"[\s\S]*?All services/.test(read('../src/sections/ServicesList.jsx')), '"All services" link');
const about = code(read('../src/sections/AboutArham.jsx'));
const aboutSentences = (about.match(/<p[^>]*>([\s\S]*?)<\/p>/) || ['', ''])[1].split(/(?<=\.)\s+/).filter((x) => x.trim());
assert(/id="about"/.test(about) && aboutSentences.length >= 3 && aboutSentences.length <= 4, `About Arham: ${aboutSentences.length} sentences`);

console.log('\n5. Our Work: the map is the way in to every project');
assert(/<PresenceMap[\s\S]*?<ProjectSheet/.test(presence) && !/ProjectGrid/.test(presence) && !exists('../src/components/presence/ProjectGrid.jsx'), 'Map, then projects through the city sheet / panel (one way of browsing; the card list under the map is gone)');
assert(!USE_PLACEHOLDER_PROJECTS && getProjectRows().length === SHOWCASE_PROJECTS.length && getProjectRows().every((p) => !p.demo), `Only real project rows (${SHOWCASE_PROJECTS.length}), no demo rows`);
assert(/root\.setAttribute\('data-map-card', 'open'\)/.test(presence) && /root\.removeAttribute\('data-map-card'\)/.test(presence), 'Page flags an open city card on <html> (for the phone bar)');

console.log('\n6. Enquiry form');
assert((form.match(/className=\{`\$\{FIELD\} /g) || []).length === 4 && ['name', 'phone', 'city', 'message'].every((f) => form.includes(`name="${f}"`)), 'Fields: Name, Phone, City, Message');
assert(/onSubmit=\{sendOnWhatsapp\}/.test(form) && /window\.open\(enquiryWhatsappHref\(fields\)/.test(form) && /type="submit" variant="primary"[\s\S]*?Send on WhatsApp/.test(form), '"Send on WhatsApp" (primary) opens wa.me with the details');
assert(/window\.location\.href = enquiryMailtoHref\(fields\)/.test(form) && /Send by email/.test(form), '"Send by email" opens a mailto draft');
assert(/if \(!check\(\)\) return;/.test(form) && (form.match(/if \(!check\(\)\) return;/g) || []).length === 2, 'Name and phone checked before either send');
assert(!/not been saved|unconfigured|Awaiting Activation|Pending Corporate/i.test(form) && !/localStorage|sessionStorage|console\.log\(/.test(form), 'No "not sent" / "delivery unconfigured" messages; nothing stored or logged');
assert(/<EnquiryForm idPrefix="home-contact" \/>/.test(home) && /<EnquiryForm idPrefix="contact" \/>/.test(contact), 'The same form on Home and Contact');

console.log('\n7. Phone action bar');
assert(/md:hidden fixed inset-x-0 bottom-0/.test(bar) && /href=\{COMPANY\.phoneHref\}/.test(bar) && /href=\{whatsappHref\(WHATSAPP_HELLO\)\}/.test(bar) && /goToEnquiry\(navigate\)/.test(bar), 'Under 768 px: Call (tel:), WhatsApp (wa.me), Enquire (scrolls to / opens the form)');
assert(/min-h-\[52px\]/.test(bar) && /env\(safe-area-inset-bottom\)/.test(bar), '52 px tap targets, safe-area padding');
assert(/<MobileActionBar \/>/.test(layout) && /mobile-bar-spacer md:hidden/.test(layout) && /\.mobile-bar-spacer \{ height: calc\(69px \+ env\(safe-area-inset-bottom\)\); \}/.test(css), 'Page gets bottom space so nothing hides behind the bar');
assert(/html\[data-map-card="open"\] \.mobile-action-bar/.test(css), 'Hidden on /our-work while a city card is open');

console.log('\n8. Footer and copy');
assert(/© \{currentYear\} \{COMPANY\.name\}/.test(footer) && /COMPANY\.phoneHref/.test(footer) && /whatsappHref/.test(footer) && /COMPANY\.emailHref/.test(footer) && /NAV_ITEMS\.map/.test(footer) && !/Standalone Foundation|Core Capabilities|CORE_DISCIPLINES/i.test(footer), 'Slim footer: logo, one line, nav, phone, WhatsApp, email, ©');
const visible = [home, presence, contact, services, notFound, hero, about, footer, header, form, read('../src/sections/PresenceTeaser.jsx'), read('../src/sections/ServicesList.jsx'), read('../src/components/presence/ProjectBrowser.jsx')].map(code).join('\n');
const banned = ['Illustrative', 'Provisional', 'Subject to confirmation', 'Scope Disclosure', 'Documentation Notice', 'Verification Standard', 'Authenticated', 'pending executive', 'Standalone Foundation', 'Formulate', 'Corporate', 'being prepared', 'once approved', 'Route Not Found'];
assert(banned.every((w) => !visible.includes(w)), `No disclaimers / jargon (${banned.filter((w) => visible.includes(w)).join(', ') || 'none found'})`);
assert(!/to="\/#presence"|href="\/#presence"|to="\/projects"|to="\/presence"/.test(visible), 'No links to /#presence, /projects or /presence (all go to /our-work)');
assert(PROCESS_STEPS.length === 6 && /<HowWeWork bare/.test(services) && /Our services/.test(services) && /SERVICES\.map/.test(services), 'Services: "Our services", all 9 services, "How we work" in 6 steps');
assert(/Page not found/.test(notFound) && /to="\/our-work"/.test(notFound) && /to="\/contact"/.test(notFound), '404: "Page not found" with Home · Our Work · Contact');
assert(exists('../src/components/map/MapCredits.jsx') && /MapCredits/.test(read('../src/components/map/PresenceMap.jsx')), 'Map data credits kept');

console.log('\nBrand: icons, theme colour, link preview, schema logo');
const SITE = 'https://arham-portfolio-tau.vercel.app';
const pngSize = (rel) => { const buf = fs.readFileSync(path.resolve(here, rel)); return [buf.readUInt32BE(16), buf.readUInt32BE(20)]; };
const B = '../public/brand/arham-logo/';
assert(pngSize(B + 'favicon-32.png').join() === '32,32' && pngSize(B + 'apple-touch-icon.png').join() === '180,180' && pngSize(B + 'icon-192.png').join() === '192,192' && pngSize(B + 'icon-512.png').join() === '512,512' && pngSize(B + 'og-image.png').join() === '1200,630', 'Brand PNGs: 32, 180, 192, 512 and the 1200×630 preview image');
assert(index.includes('<link rel="icon" type="image/png" sizes="32x32" href="/brand/arham-logo/favicon-32.png" />') && index.includes('<link rel="apple-touch-icon" sizes="180x180" href="/brand/arham-logo/apple-touch-icon.png" />') && !index.includes('href="/favicon.svg"'), 'Favicon + Apple touch icon from the brand folder (old SVG favicon no longer linked)');
const manifest = JSON.parse(read('../public/site.webmanifest'));
assert(index.includes('<link rel="manifest" href="/site.webmanifest" />') && manifest.icons.map((i) => `${i.src} ${i.sizes}`).join() === '/brand/arham-logo/icon-192.png 192x192,/brand/arham-logo/icon-512.png 512x512' && manifest.theme_color === '#0C0D0F' && manifest.background_color === '#0C0D0F' && manifest.name === COMPANY.name, 'Web manifest: icons 192 + 512, theme #0C0D0F');
assert(index.includes('<meta name="theme-color" content="#0C0D0F" />'), 'theme-color #0C0D0F');
assert(index.includes(`<meta property="og:image" content="${SITE}/brand/arham-logo/og-image.png" />`) && index.includes('<meta property="og:image:width" content="1200" />') && index.includes('<meta property="og:image:height" content="630" />') && index.includes(`<meta name="twitter:image" content="${SITE}/brand/arham-logo/og-image.png" />`) && !/project-infrastructure\.jpg/.test(index.split('</head>')[0]), 'og:image + twitter:image: absolute URL of the 1200×630 og-image.png');
const ld = JSON.parse(index.split('application/ld+json">')[1].split('</script>')[0]);
assert(ld.logo === `${SITE}/brand/arham-logo/icon-512.png`, 'schema.org logo: icon-512.png (absolute URL)');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
