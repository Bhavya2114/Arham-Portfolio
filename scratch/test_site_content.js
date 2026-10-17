/**
 * Real company content (branch site-content): facts only from the client's list, all read from
 * src/data/company.js and src/data/services.js; values not provided stay null and hidden.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COMPANY, heroStats, fullAddress } from '../src/data/company.js';
import { SERVICES, HOME_SERVICES, WHY_ARHAM, PROCESS_STEPS } from '../src/data/services.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
// What a visitor can read: pages, sections, layout, UI and Our Work components, company / service data and
// index.html, with code comments removed (map-data licence notices and source comments are not site copy).
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/<!--[\s\S]*?-->/g, '');
const visibleDirs = ['pages', 'sections', 'components/layout', 'components/ui', 'components/contact', 'components/presence'].map((d) => path.resolve(here, '../src', d));
const siteSrc = [...visibleDirs.flatMap(walk), path.resolve(here, '../src/data/company.js'), path.resolve(here, '../src/data/services.js'), path.resolve(here, '../index.html')]
  .filter((f) => /\.(jsx?|html)$/.test(f))
  .map((f) => stripComments(fs.readFileSync(f, 'utf-8')))
  .join('\n');

console.log('\n1. Company facts (company.js)');
assert(COMPANY.name === 'Arham Power Solutions' && COMPANY.founded.month === 'October' && COMPANY.founded.year === 2019 && COMPANY.founder === 'Bharat Jain' && COMPANY.city === 'Kota', 'Founded October 2019 by Bharat Jain, Kota');
assert(COMPANY.teamSize === '30+', 'Team 30+');
assert(COMPANY.address === '39 Borkheda, Kota, Rajasthan' && COMPANY.pin === null && fullAddress() === COMPANY.address, 'Office 39 Borkheda, Kota, Rajasthan (PIN null → not shown)');
assert(COMPANY.hours === '10 AM – 6 PM' && COMPANY.days === 'Monday to Friday', 'Hours 10 AM – 6 PM, Monday to Friday');
assert(COMPANY.phoneDisplay === '+91 63783 91640' && COMPANY.email === 'arhampower@gmail.com', 'Phone / WhatsApp and email unchanged');
assert(COMPANY.registrations.join('|') === 'GST registered|Udyam registered|EPF & ESI compliant|TAN registered', 'Registrations (text only, no numbers)');
assert(COMPANY.brands.join('|') === 'Havells|Polycab|Philips|Legrand|Finolex', 'Brands we use');
assert(COMPANY.projectsCount === null && COMPANY.citiesCount === null && COMPANY.founderBio === null && COMPANY.testimonials === null, 'Projects count, cities count, founder bio and client feedback: null until provided');
assert(COMPANY.clients.map((c) => `${c.type}: ${c.names.map((n) => n.name).join(', ')}`).join(' | ') === 'Coaching institutes: ALLEN Career Institute | Schools: Central Academy, DDPS | Hospitals: Kinker Hospital, Kota', 'Who we work with: coaching institutes, schools, hospitals (no hotels or homes)');

console.log('\n2. Nothing invented, nothing placeholder');
assert(!/\blicen[cs]e/i.test(siteSrc), 'No electrical-contractor licence claimed in any site copy');
assert(!/\b(dealer|authori[sz]ed|partner)\b/i.test(siteSrc), 'Brands never called dealer, partner or authorised (in any site copy)');
assert(!/\[ \]|\bTBD\b|lorem ipsum/i.test(siteSrc), 'No "[ ]", "TBD" or filler text');
assert(heroStats().map((s) => `${s.before ? `${s.before} ` : ''}${s.value}${s.after ? ` ${s.after}` : ''}`).join(' · ') === 'Since 2019 · 30+ team', 'Hero stats: "Since 2019" and "30+ team" only');
const company = read('../src/data/company.js');
assert(/COMPANY\.projectsCount && \{ key: 'projects'/.test(company) && /COMPANY\.citiesCount && \{ key: 'cities'/.test(company) && /\{COMPANY\.founderBio && </.test(read('../src/sections/AboutArham.jsx')), 'Projects / cities stats and the founder bio render only once set');

console.log('\n3. Services (one list for Home and Services)');
assert(SERVICES.map((s) => s.title).join(' | ') === 'Complete building wiring | House and flat wiring | Lighting installation | Electrical panels and DB | CCTV installation | Earthing | Fire alarm wiring | Generator and inverter connections | Annual maintenance (AMC)', 'The 9 services, in order');
assert(SERVICES[0].line === 'Full electrical wiring for new and existing buildings, from main supply to every point.' && SERVICES[8].line === 'Yearly maintenance contracts to keep your electrical system safe and running.', 'Service lines as supplied');
assert(HOME_SERVICES.length === 4 && HOME_SERVICES.every((s, i) => s === SERVICES[i]), 'Home shows services 1–4');
const servicesList = read('../src/sections/ServicesList.jsx');
const servicesPage = read('../src/pages/Services.jsx');
assert(/HOME_SERVICES\.map/.test(servicesList) && /All services/.test(servicesList) && /SERVICES\.map/.test(servicesPage), 'Home: top 4 + "All services"; Services page: all 9');
const iconMap = read('../src/components/ui/contentIcons.js');
assert(SERVICES.every((s) => iconMap.includes(`'${s.id}':`) || iconMap.includes(`  ${s.id}:`)), 'Every service has an icon');

console.log('\n4. Homepage sections');
const home = read('../src/pages/Home.jsx');
const order = [...home.matchAll(/<(Hero|PresenceTeaser|ClientsSection|ServicesList|AboutArham|WhyArham|HowWeWork|TrustStrips)\b[^>]*\/>|<EnquiryForm\b/g)].map((m) => m[1] || 'EnquiryForm');
assert(order.join(',') === 'Hero,PresenceTeaser,ClientsSection,ServicesList,AboutArham,WhyArham,HowWeWork,TrustStrips,EnquiryForm', `Order: ${order.join(' → ')}`);
const about = read('../src/sections/AboutArham.jsx').replace(/\s+/g, ' ');
assert(/was founded in \{COMPANY\.founded\.month\} \{COMPANY\.founded\.year\} by \{COMPANY\.founder\} in \{COMPANY\.city\}, \{COMPANY\.state\}\. Today our team of \{COMPANY\.teamSize\} people handles complete electrical wiring, lighting and maintenance for coaching institutes, schools and hospitals\. We work to each client&apos;s requirements and timeline, with a focus on safe, clean and on-time work\./.test(about), 'About Arham: the supplied text, facts from company.js');
assert(WHY_ARHAM.map((w) => w.title).join(' | ') === 'Built to your requirement | On time | Clean, neat work | Safety first | Fair pricing | A 30+ member team' && WHY_ARHAM.every((w) => w.line && !w.line.includes('\n')), 'Why choose Arham: 6 one-line items');
assert(PROCESS_STEPS.map((s) => s.title).join(' | ') === 'Understand your requirement | Clear quotation | Work on your timeline | Testing and safety checks | Handover | Annual maintenance', 'How we work: 6 numbered steps');
assert(/grid-cols-2/.test(read('../src/sections/WhyArham.jsx')) && /grid-cols-2/.test(read('../src/sections/HowWeWork.jsx')), 'Short items in 2-column grids on phones');
const strips = read('../src/sections/TrustStrips.jsx');
assert(/Brands we use/.test(strips) && /Registered &amp; compliant|Registered & compliant/.test(strips) && /COMPANY\.brands/.test(strips) && /COMPANY\.registrations/.test(strips), 'Slim "Brands we use" and "Registered & compliant" strips (text chips)');
assert(/Who we work with/.test(read('../src/sections/ClientsSection.jsx')) && !/<img/.test(read('../src/sections/ClientsSection.jsx')), 'Who we work with: names as text, no logos');

console.log('\n5. Services and Contact pages, schema');
assert(servicesPage.indexOf('SERVICES.map') < servicesPage.indexOf('<HowWeWork') && servicesPage.indexOf('<HowWeWork') < servicesPage.indexOf("<TrustStrips show={['brands']}"), 'Services page: all services → how we work → brands we use');
const contact = read('../src/pages/Contact.jsx');
assert(/fullAddress\(\)/.test(contact) && /COMPANY\.hoursShort/.test(contact) && /COMPANY\.phoneHref/.test(contact) && /COMPANY\.emailHref/.test(contact) && /<EnquiryForm/.test(contact) && COMPANY.hoursShort === 'Mon–Fri 10 AM–6 PM', 'Contact: address, Mon–Fri 10 AM–6 PM, phone, WhatsApp, email, form');
const index = read('../index.html');
const schema = JSON.parse(index.split('application/ld+json">')[1].split('</script>')[0]);
assert(schema.address.streetAddress === '39 Borkheda' && schema.address.addressLocality === 'Kota' && !schema.address.postalCode, 'Schema address (no PIN yet)');
assert(JSON.stringify(schema.openingHoursSpecification[0].dayOfWeek) === JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) && schema.openingHoursSpecification[0].opens === '10:00' && schema.openingHoursSpecification[0].closes === '18:00', 'Schema hours Mon–Fri 10:00–18:00');
assert(schema.foundingDate === '2019-10' && schema.founder.name === 'Bharat Jain' && !('numberOfEmployees' in schema), 'Schema founding date and founder');

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
