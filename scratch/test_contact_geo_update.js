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
  COMPANY_CONTACT, 
  ENQUIRY_TYPES, 
  validateEnquiryForm, 
  generateMailtoDraft 
} from '../src/data/contactConfig.js';
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

// 1. Company Contact Configuration
console.log('1. Contact Configuration Values:');
assert(COMPANY_CONTACT.email === 'arham@gmail.com', 'Company email is arham@gmail.com');
assert(COMPANY_CONTACT.phone === '7878787878', 'Phone number is 7878787878');
assert(COMPANY_CONTACT.whatsapp === '7878787878', 'WhatsApp number is 7878787878');
assert(COMPANY_CONTACT.address === 'Borkheda, Kota, Rajasthan, India', 'Office address is Borkheda, Kota, Rajasthan, India');
assert(COMPANY_CONTACT.businessHours === '9 AM – 6 PM', 'Business hours are 9 AM – 6 PM');

// 2. WhatsApp URL Format & Safety
console.log('\n2. WhatsApp URL & Formatting:');
assert(COMPANY_CONTACT.isWhatsAppConfigured === true, 'isWhatsAppConfigured returns true');
assert(COMPANY_CONTACT.whatsappUrl === 'https://wa.me/917878787878', 'WhatsApp URL is https://wa.me/917878787878');
assert(!COMPANY_CONTACT.whatsappUrl.includes('+'), 'WhatsApp URL does not contain "+"');
assert(!COMPANY_CONTACT.whatsappUrl.includes(' '), 'WhatsApp URL does not contain spaces');
assert(!COMPANY_CONTACT.whatsappUrl.includes('-'), 'WhatsApp URL does not contain hyphens');
assert(/^https:\/\/wa\.me\/[0-9]+$/.test(COMPANY_CONTACT.whatsappUrl), 'WhatsApp URL matches strict https://wa.me/<digits> pattern');

// 3. Enquiry Form Unconfigured Invariant
console.log('\n3. Automated Delivery Unconfigured Invariant:');
assert(COMPANY_CONTACT.isDeliveryConfigured === false, 'isDeliveryConfigured is strictly false');
assert(COMPANY_CONTACT.isEmailConfigured === false, 'isEmailConfigured is strictly false (does not treat email presence as delivery proof)');
assert(COMPANY_CONTACT.hasEmail === true, 'hasEmail returns true (email exists for display/mailto)');

// 4. Form Validation & Draft Generator
console.log('\n4. Form Validation & Mailto Preparation:');
const sampleValid = {
  name: 'Anil Kumar',
  email: 'anil@example.com',
  enquiryType: 'lighting',
  message: 'Detailed requirements for industrial high-bay lighting replacement.',
};
const valResult = validateEnquiryForm(sampleValid);
assert(valResult.isValid, 'Valid enquiry passes validation');

const mailtoResult = generateMailtoDraft(sampleValid);
assert(mailtoResult.mailtoUri.startsWith('mailto:arham@gmail.com?'), 'Default mailto recipient is arham@gmail.com');
assert(mailtoResult.formattedDraft.includes('Architectural & Commercial Lighting'), 'Subject draft category is included');

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

// 8. Contact Component Integrity
console.log('\n8. Page & Component File References:');
const contactPage = fs.readFileSync(path.resolve(__dirname, '../src/pages/Contact.jsx'), 'utf-8');
assert(contactPage.includes('COMPANY_CONTACT.phone'), 'Contact.jsx references COMPANY_CONTACT.phone');
assert(contactPage.includes('COMPANY_CONTACT.whatsappUrl'), 'Contact.jsx references COMPANY_CONTACT.whatsappUrl');
assert(contactPage.includes('COMPANY_CONTACT.hasEmail'), 'Contact.jsx references COMPANY_CONTACT.hasEmail');
assert(contactPage.includes('COMPANY_CONTACT.address'), 'Contact.jsx references COMPANY_CONTACT.address');
assert(contactPage.includes('COMPANY_CONTACT.businessHours'), 'Contact.jsx references COMPANY_CONTACT.businessHours');

const footerFile = fs.readFileSync(path.resolve(__dirname, '../src/components/layout/Footer.jsx'), 'utf-8');
assert(footerFile.includes('COMPANY_CONTACT.phone'), 'Footer.jsx references COMPANY_CONTACT.phone');
assert(footerFile.includes('COMPANY_CONTACT.email'), 'Footer.jsx references COMPANY_CONTACT.email');
assert(footerFile.includes('COMPANY_CONTACT.address'), 'Footer.jsx references COMPANY_CONTACT.address');
assert(footerFile.includes('COMPANY_CONTACT.businessHours'), 'Footer.jsx references COMPANY_CONTACT.businessHours');

console.log('\n============================================================');
console.log(`UPDATE TEST RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
