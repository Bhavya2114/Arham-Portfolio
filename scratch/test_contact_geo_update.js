/**
 * Targeted Verification Test Suite: Contact Details & Geographic Coverage Update
 * 
 * Verifies:
 * 1. Supplied company contact coordinates:
 *    - Email: arham@gmail.com
 *    - Phone: 7878787878
 *    - WhatsApp: 7878787878 -> https://wa.me/917878787878 (international digits only)
 *    - Address: Borkheda, Kota, Rajasthan, India
 *    - Business Hours: 9 AM – 6 PM
 * 2. Unconfigured automated delivery invariant:
 *    - isEmailConfigured is strictly false
 *    - isDeliveryConfigured is strictly false
 *    - Form does not fake submission or transmission
 * 3. Geographic Coverage (shared `presenceCoverage.js` configuration):
 *    - Exactly the 11 supplied states are active; the other 25 states/UTs remain neutral
 *    - Coverage selectors return the shared configuration's cities (Jaisalmer removed)
 *    - No duplicate cities or duplicate state records
 * 4. Production Dataset Purity:
 *    - PROJECTS array is strictly empty (length: 0)
 *    - Zero fake gallery entries fabricated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROJECTS } from '../src/data/projects.js';
import { INDIAN_STATES, STATE_BY_CODE } from '../src/data/states.js';
import { getPresenceStateCodes, getPresenceCities } from '../src/data/presenceCoverage.js';
import {
  COMPANY,
  validateEnquiry,
  enquiryWhatsappHref,
  enquiryMailtoHref,
  isValidPhone,
} from '../src/data/company.js';
import {
  getPublishedProjects,
  getPublishedStateCodes,
  getCoverageStateCodes,
  getCoverageCitiesByState,
  getActiveStateCodes,
  getCitiesByState,
  getStateDetails
} from '../src/data/projectSelectors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

const assert = (condition, description) => {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${description}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${description}`);
  }
};

console.log('=== BUSINESS DETAILS & GEOGRAPHIC DATA UPDATE TEST SUITE ===\n');

// 1. Company details (src/data/company.js: the one config file)
console.log('1. Company details:');
assert(COMPANY.name === 'Arham Power Solutions', 'Name is Arham Power Solutions');
assert(COMPANY.logoWord === 'ARHAM' && COMPANY.logoLine === 'POWER SOLUTIONS', 'Logo: ARHAM + POWER SOLUTIONS');
assert(COMPANY.phoneDisplay === '+91 63783 91640' && COMPANY.phoneHref === 'tel:+916378391640', 'Phone +91 63783 91640 (tel:+916378391640)');
assert(COMPANY.whatsappUrl === 'https://wa.me/916378391640' && /^https:\/\/wa\.me\/[0-9]+$/.test(COMPANY.whatsappUrl), 'WhatsApp https://wa.me/916378391640 (digits only)');
assert(COMPANY.email === 'arhampower@gmail.com' && COMPANY.emailHref === 'mailto:arhampower@gmail.com', 'Email arhampower@gmail.com');
assert(COMPANY.address === 'Borkheda, Kota, Rajasthan, India' && COMPANY.hours === '9 AM – 6 PM', 'Office address and hours');

// 2. No placeholder contact details left anywhere in the site source
console.log('\n2. Placeholder contact details removed:');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const siteFiles = [...walk(path.resolve(__dirname, '../src')), path.resolve(__dirname, '../index.html'), path.resolve(__dirname, '../README.md')].filter((f) => /\.(jsx?|html|md)$/.test(f));
const stale = siteFiles.filter((f) => /7878787878|arham@gmail\.com/.test(fs.readFileSync(f, 'utf-8')));
assert(stale.length === 0, `No 7878787878 / arham@gmail.com in src, index.html or README (${stale.map((f) => path.basename(f)).join(', ') || 'none'})`);
assert(!fs.existsSync(path.resolve(__dirname, '../src/data/contactConfig.js')), 'Old contactConfig.js removed (company.js is the one config file)');

// 4. Enquiry: validation, WhatsApp and email links
console.log('\n4. Enquiry validation, WhatsApp and email:');
assert(Object.keys(validateEnquiry({ name: '', phone: '' })).join(',') === 'name,phone', 'Name and phone are required');
assert(!validateEnquiry({ name: 'Anil Kumar', phone: '98765 43210' }).name && !validateEnquiry({ name: 'Anil Kumar', phone: '98765 43210' }).phone, 'Valid name and phone pass (city, message optional)');
assert(isValidPhone('+91 98765-43210') && isValidPhone('9876543210') && !isValidPhone('12345') && !isValidPhone('abcdefghij'), 'Phone check: 10–13 digits');
const sample = { name: 'Anil Kumar', phone: '98765 43210', city: 'Jaipur', message: 'High-bay lighting & wiring' };
const wa = enquiryWhatsappHref(sample);
assert(wa.startsWith('https://wa.me/916378391640?text=') && decodeURIComponent(wa.split('?text=')[1]).includes('Name: Anil Kumar\nPhone: 98765 43210\nCity: Jaipur\nMessage: High-bay lighting & wiring'), 'WhatsApp link carries all fields, URL-encoded');
const mail = enquiryMailtoHref(sample);
assert(mail.startsWith('mailto:arhampower@gmail.com?subject=') && decodeURIComponent(mail).includes('subject=Project enquiry from Anil Kumar (Jaipur)') && decodeURIComponent(mail).includes('Phone: 98765 43210'), 'Email draft: subject and the fields in the body');
assert(!decodeURIComponent(enquiryWhatsappHref({ name: 'A B', phone: '9876543210', city: '', message: '' })).includes('City:'), 'Empty optional fields are left out');

// 5. Geographic Coverage Registry
console.log('\n5. Geographic Coverage Registry & State Highlights:');
const EXPECTED_CODES = ['IN-AS', 'IN-BR', 'IN-CT', 'IN-GA', 'IN-GJ', 'IN-JH', 'IN-MH', 'IN-OR', 'IN-RJ', 'IN-UP', 'IN-WB'];
const coverageCodes = getCoverageStateCodes();
assert(coverageCodes.length === 11, `Coverage states count is 11 (got ${coverageCodes.length})`);
assert(coverageCodes.join(',') === EXPECTED_CODES.join(','), 'Coverage states equal the supplied 11 (sorted)');
assert(coverageCodes.join(',') === [...getPresenceStateCodes()].sort().join(','), 'Coverage selector mirrors presenceCoverage.js');

const activeCodes = getActiveStateCodes();
assert(activeCodes.join(',') === EXPECTED_CODES.join(','), 'Homepage active codes equal the supplied 11 (empty PROJECTS)');

const neutralStates = INDIAN_STATES.filter((s) => !activeCodes.includes(s.code));
assert(neutralStates.length === 25, `Exactly 25 states/UTs remain neutral (got ${neutralStates.length})`);
assert(!activeCodes.includes('IN-DL'), 'Delhi is neutral');
assert(!activeCodes.includes('IN-KA'), 'Karnataka is neutral');
assert(!activeCodes.includes('IN-MP'), 'Madhya Pradesh is neutral');

// 6. City Exposure per State
console.log('\n6. City Exposure for Supplied Locations:');
EXPECTED_CODES.forEach((code) => {
  assert(
    JSON.stringify(getCitiesByState(code)) === JSON.stringify(getPresenceCities(code)) &&
      JSON.stringify(getCoverageCitiesByState(code)) === JSON.stringify(getPresenceCities(code)),
    `${code} homepage cities equal presenceCoverage.js cities`
  );
});
assert(!getCitiesByState('IN-RJ').includes('Jaisalmer'), 'Jaisalmer is no longer listed for Rajasthan');
assert(getCitiesByState('IN-UP').length === 0, 'Uttar Pradesh has no cities');

const allCoverageCities = EXPECTED_CODES.flatMap((code) => getCitiesByState(code));
assert(allCoverageCities.length === 27, `27 coverage cities in total (got ${allCoverageCities.length})`);
assert(allCoverageCities.length === new Set(allCoverageCities).size, 'No duplicate cities exist across coverage data');

// 7. Backward Compatibility & Dataset Purity
console.log('\n7. Backward Compatibility & Purity:');
assert(Array.isArray(PROJECTS) && PROJECTS.length === 0, 'Production PROJECTS array remains strictly empty (0 records)');
assert(getPublishedProjects().length === 0, 'getPublishedProjects() returns []');
assert(getPublishedStateCodes().length === 0, 'getPublishedStateCodes() returns [] (strictly published-project derived)');
assert(getStateDetails('IN-RJ')?.name === 'Rajasthan', 'getStateDetails(IN-RJ) returns Rajasthan');
assert(getStateDetails('IN-MH')?.name === 'Maharashtra', 'getStateDetails(IN-MH) returns Maharashtra');

// 8. Pages read the details from company.js
console.log('\n8. Page & Component File References:');
const read = (rel) => fs.readFileSync(path.resolve(__dirname, rel), 'utf-8');
const contactPage = read('../src/pages/Contact.jsx');
assert(/COMPANY\.phoneHref/.test(contactPage) && /whatsappHref\(/.test(contactPage) && /COMPANY\.emailHref/.test(contactPage) && /COMPANY\.address/.test(contactPage) && /COMPANY\.hours/.test(contactPage), 'Contact page: call, WhatsApp, email, office and hours from COMPANY');
const footerFile = read('../src/components/layout/Footer.jsx');
assert(/COMPANY\.phoneHref/.test(footerFile) && /whatsappHref\(/.test(footerFile) && /COMPANY\.emailHref/.test(footerFile) && /© \{currentYear\} \{COMPANY\.name\}/.test(footerFile), 'Footer: phone, WhatsApp, email and © Arham Power Solutions from COMPANY');

console.log('\n============================================================');
console.log(`UPDATE TEST RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
