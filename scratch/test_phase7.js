/**
 * Phase 7 Verification Test Suite: Contact & Lead Generation
 * 
 * Verifies:
 * 1. Navigation items for Contact are active in NAV_ITEMS.
 * 2. Form field validation rules (name, email, phone, enquiryType, message).
 * 3. Mailto draft generator and URI encoding.
 * 4. Honest unconfigured channel state (no fake success, no localStorage).
 * 5. Privacy and security invariants (no storage, no console logs).
 * 6. Component file integrity.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NAV_ITEMS } from '../src/data/navigation.js';
import { 
  COMPANY_CONTACT, 
  ENQUIRY_TYPES, 
  validateEnquiryForm, 
  generateMailtoDraft 
} from '../src/data/contactConfig.js';

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

console.log('=== PHASE 7: CONTACT & LEAD GENERATION TEST SUITE ===\n');

// 1. Navigation Configuration
console.log('1. Navigation Registry Verification:');
const contactNav = NAV_ITEMS.find((item) => item.name === 'Contact');
assert(contactNav !== undefined, 'Contact item exists in NAV_ITEMS');
assert(contactNav.path === '/contact', 'Contact path is /contact');
assert(contactNav.isAvailable === true, 'Contact nav item is active (isAvailable: true)');

// 2. Controlled Enquiry Types
console.log('\n2. Controlled Enquiry Types:');
assert(ENQUIRY_TYPES.length === 5, `Expected 5 enquiry types (got ${ENQUIRY_TYPES.length})`);
assert(ENQUIRY_TYPES.some((t) => t.value === 'general'), 'general type exists');
assert(ENQUIRY_TYPES.some((t) => t.value === 'infrastructure'), 'infrastructure type exists');
assert(ENQUIRY_TYPES.some((t) => t.value === 'distribution'), 'distribution type exists');
assert(ENQUIRY_TYPES.some((t) => t.value === 'lighting'), 'lighting type exists');
assert(ENQUIRY_TYPES.some((t) => t.value === 'tenders'), 'tenders type exists');

// 3. Form Validation Suite
console.log('\n3. Form Field Validation Logic:');

// Empty form
const emptyVal = validateEnquiryForm({});
assert(!emptyVal.isValid, 'Empty form is invalid');
assert(Boolean(emptyVal.errors.name), 'Missing name produces error');
assert(Boolean(emptyVal.errors.email), 'Missing email produces error');
assert(Boolean(emptyVal.errors.enquiryType), 'Missing enquiryType produces error');
assert(Boolean(emptyVal.errors.message), 'Missing message produces error');

// Name length < 2
const shortNameVal = validateEnquiryForm({ name: 'A' });
assert(Boolean(shortNameVal.errors.name), 'Single character name is rejected');

// Invalid Email formats
assert(Boolean(validateEnquiryForm({ email: 'invalid-email' }).errors.email), 'Plain string email rejected');
assert(Boolean(validateEnquiryForm({ email: 'user@domain' }).errors.email), 'Missing TLD email rejected');
assert(Boolean(validateEnquiryForm({ email: '@domain.com' }).errors.email), 'Missing user email rejected');

// Short message < 10 chars
const shortMsgVal = validateEnquiryForm({ message: 'Hello' });
assert(Boolean(shortMsgVal.errors.message), 'Short message (<10 chars) is rejected');

// Invalid phone format
const shortPhoneVal = validateEnquiryForm({ phone: '123' });
assert(Boolean(shortPhoneVal.errors.phone), 'Short phone (<8 digits) is rejected');

// Valid phone format
const validPhoneVal = validateEnquiryForm({ phone: '+91 98765 43210' });
assert(!validPhoneVal.errors.phone, 'Valid formatted phone passes validation');

// Invalid enquiry type
const invalidTypeVal = validateEnquiryForm({ enquiryType: 'invalid-category' });
assert(Boolean(invalidTypeVal.errors.enquiryType), 'Unrecognized enquiry category is rejected');

// Complete Valid Payload
const validPayload = {
  name: 'Vikram Mehta',
  company: 'Apex Industrial Infrastructure',
  email: 'v.mehta@apex-infra.com',
  phone: '+91 98200 12345',
  enquiryType: 'infrastructure',
  projectLocation: 'Navi Mumbai, Maharashtra',
  message: 'Seeking engineering quotation for 33kV raceway containment and power cabling for new facility.',
};
const fullVal = validateEnquiryForm(validPayload);
assert(fullVal.isValid, 'Fully populated valid form passes validation with zero errors');
assert(Object.keys(fullVal.errors).length === 0, 'No validation error keys returned on valid submission');

// 4. Mailto Draft Generator
console.log('\n4. Mailto Draft & URI Encoding:');
const draft = generateMailtoDraft(validPayload, 'commercial@arham-engineering.com');
assert(typeof draft.mailtoUri === 'string', 'generateMailtoDraft returns mailtoUri string');
assert(draft.mailtoUri.startsWith('mailto:commercial@arham-engineering.com?'), 'URI targets specified recipient email');
assert(draft.mailtoUri.includes(encodeURIComponent('Electrical Infrastructure & Cabling')), 'URI subject contains category label');
assert(draft.mailtoUri.includes(encodeURIComponent('Vikram Mehta')), 'URI body contains sender name');
assert(draft.formattedDraft.includes('Apex Industrial Infrastructure'), 'Formatted text draft contains company');
assert(draft.formattedDraft.includes('Navi Mumbai, Maharashtra'), 'Formatted text draft contains location');

// 5. Honest Architecture & Verified Contact Channels
console.log('\n5. Honest Architecture & Verified Contact Channels:');
assert(COMPANY_CONTACT.isEmailConfigured === false, 'COMPANY_CONTACT.isEmailConfigured is false (enquiry delivery remains unconfigured)');
assert(COMPANY_CONTACT.isPhoneConfigured === true, 'COMPANY_CONTACT.isPhoneConfigured is true (verified phone)');
assert(COMPANY_CONTACT.phone === '7878787878', 'COMPANY_CONTACT.phone matches 7878787878');
assert(COMPANY_CONTACT.isAddressConfigured === true, 'COMPANY_CONTACT.isAddressConfigured is true (verified address)');
assert(COMPANY_CONTACT.address === 'Borkheda, Kota, Rajasthan, India', 'COMPANY_CONTACT.address matches supplied address');
assert(COMPANY_CONTACT.hasEmail === true, 'COMPANY_CONTACT.hasEmail is true');
assert(COMPANY_CONTACT.email === 'arham@gmail.com', 'COMPANY_CONTACT.email matches arham@gmail.com');
assert(COMPANY_CONTACT.businessHours === '9 AM – 6 PM', 'COMPANY_CONTACT.businessHours matches 9 AM – 6 PM');
assert(COMPANY_CONTACT.whatsapp === '7878787878', 'COMPANY_CONTACT.whatsapp matches 7878787878');
assert(COMPANY_CONTACT.whatsappUrl === 'https://wa.me/917878787878', 'COMPANY_CONTACT.whatsappUrl is formatted correctly');

// 6. Security & Privacy Invariants
console.log('\n6. Security & Privacy Audit in Form Code:');
const formCode = fs.readFileSync(
  path.resolve(__dirname, '../src/components/contact/EnquiryForm.jsx'),
  'utf-8'
);
const codeWithoutComments = formCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
assert(!codeWithoutComments.includes('localStorage'), 'EnquiryForm does NOT write to localStorage');
assert(!codeWithoutComments.includes('sessionStorage'), 'EnquiryForm does NOT write to sessionStorage');
assert(!codeWithoutComments.includes('console.log('), 'EnquiryForm does NOT log personal details to console');
assert(!codeWithoutComments.includes('Enquiry Sent Successfully'), 'EnquiryForm does NOT present false success states');

// 7. Component File Integrity
console.log('\n7. Component File Existence:');
assert(fs.existsSync(path.resolve(__dirname, '../src/components/contact/EnquiryForm.jsx')), 'EnquiryForm.jsx exists');
assert(fs.existsSync(path.resolve(__dirname, '../src/pages/Contact.jsx')), 'Contact.jsx page exists');
assert(fs.existsSync(path.resolve(__dirname, '../src/data/contactConfig.js')), 'contactConfig.js exists');

console.log('\n============================================================');
console.log(`PHASE 7 RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
