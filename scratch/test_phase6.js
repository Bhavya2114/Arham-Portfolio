/**
 * Phase 6 Verification Test Suite: About, Services & Client Experience
 * 
 * Verifies:
 * 1. Navigation items for About and Services are active.
 * 2. Production dataset purity remains intact.
 * 3. Content accuracy: no unsupported claims in codebase.
 * 4. Controlled service categories match project data layer.
 * 5. Regression safety for project selectors and confidentiality rules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NAV_ITEMS } from '../src/data/navigation.js';
import { PROJECTS, PROJECT_CATEGORIES } from '../src/data/projects.js';
import { getPublishedProjects, getPublishedStateCodes } from '../src/data/projectSelectors.js';

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

console.log('=== PHASE 6: ABOUT, SERVICES & CLIENT EXPERIENCE TEST SUITE ===\n');

// 1. Navigation Registry Verification
console.log('1. Navigation Registry Verification:');
const aboutNav = NAV_ITEMS.find((item) => item.name === 'About');
assert(aboutNav !== undefined, 'About item exists in NAV_ITEMS');
assert(aboutNav.path === '/about', 'About path is /about');
assert(aboutNav.isAvailable === true, 'About nav item is active (isAvailable: true)');

const servicesNav = NAV_ITEMS.find((item) => item.name === 'Services');
assert(servicesNav !== undefined, 'Services item exists in NAV_ITEMS');
assert(servicesNav.path === '/services', 'Services path is /services');
assert(servicesNav.isAvailable === true, 'Services nav item is active (isAvailable: true)');

const projectsNav = NAV_ITEMS.find((item) => item.name === 'Projects');
assert(projectsNav !== undefined && projectsNav.isAvailable === true, 'Projects nav item remains active');

// 2. Production Data Purity
console.log('\n2. Production Data Purity:');
assert(Array.isArray(PROJECTS), 'PROJECTS is an array');
assert(PROJECTS.length === 0, 'Production PROJECTS dataset is strictly empty');
assert(getPublishedProjects().length === 0, 'Production getPublishedProjects() returns 0');
assert(getPublishedStateCodes().length === 0, 'Production getPublishedStateCodes() returns 0');

// 3. Controlled Categories Consistency
console.log('\n3. Controlled Categories Consistency:');
assert(PROJECT_CATEGORIES.includes('infrastructure'), 'infrastructure category exists');
assert(PROJECT_CATEGORIES.includes('distribution'), 'distribution category exists');
assert(PROJECT_CATEGORIES.includes('lighting'), 'lighting category exists');
assert(PROJECT_CATEGORIES.length === 3, 'Exactly 3 controlled categories defined');

// 4. Content Accuracy & Unsupported Claims Audit
console.log('\n4. Content Accuracy & Unsupported Claims Audit:');
const projectsGalleryContent = fs.readFileSync(
  path.resolve(__dirname, '../src/pages/ProjectsGallery.jsx'),
  'utf-8'
);
assert(!projectsGalleryContent.includes('two decades'), 'ProjectsGallery does not claim "two decades"');
assert(!projectsGalleryContent.includes('installations nationwide'), 'ProjectsGallery does not claim "installations nationwide"');

const heroContent = fs.readFileSync(
  path.resolve(__dirname, '../src/sections/Hero.jsx'),
  'utf-8'
);
assert(!heroContent.includes('in Phase 3'), 'Hero does not contain stale "in Phase 3" copy');

const companyIntroContent = fs.readFileSync(
  path.resolve(__dirname, '../src/sections/CompanyIntroduction.jsx'),
  'utf-8'
);
assert(!companyIntroContent.includes('in Phase 3'), 'CompanyIntroduction does not contain stale "in Phase 3" copy');

const footerContent = fs.readFileSync(
  path.resolve(__dirname, '../src/components/layout/Footer.jsx'),
  'utf-8'
);
assert(!footerContent.includes('in Phase 2'), 'Footer does not contain stale "in Phase 2" copy');

// 5. Component Existence
console.log('\n5. Page Component Integrity:');
assert(fs.existsSync(path.resolve(__dirname, '../src/pages/About.jsx')), 'About.jsx page file exists');
assert(fs.existsSync(path.resolve(__dirname, '../src/pages/Services.jsx')), 'Services.jsx page file exists');

console.log('\n============================================================');
console.log(`PHASE 6 RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
