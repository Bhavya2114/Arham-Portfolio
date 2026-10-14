/**
 * Phase 5 Verification Test Suite: Project Gallery & Case Studies
 * 
 * Tests:
 * 1. Production dataset purity & empty-state baseline.
 * 2. Multi-criteria gallery filtering (category, state, city) with isolated test fixtures.
 * 3. Opening project details by stable ID.
 * 4. Unknown, draft, and unpublished project ID handling.
 * 5. Strict client confidentiality & internal metadata sanitization.
 * 6. Missing optional fields (images, scope, completionYear).
 * 7. Navigation configuration integrity.
 */

import { PROJECTS, PROJECT_CATEGORIES } from '../src/data/projects.js';
import { 
  getPublishedProjects, 
  getPublishedStateCodes, 
  getPublishedCitiesByState,
  getPublishedProjectById,
  getPublishedProjectsByCategory,
  getFilteredPublishedProjects,
  getStateDetails 
} from '../src/data/projectSelectors.js';
import { NAV_ITEMS } from '../src/data/navigation.js';

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

console.log('=== PHASE 5: PROJECT GALLERY & CASE STUDIES TEST SUITE ===\n');

// -------------------------------------------------------------
// 1. Production Dataset Purity & Baseline
// -------------------------------------------------------------
console.log('1. Production Baseline Purity:');
assert(Array.isArray(PROJECTS), 'PROJECTS is an array');
assert(PROJECTS.length === 0, 'Production PROJECTS is strictly empty (0 records)');
assert(getPublishedProjects().length === 0, 'Production getPublishedProjects() returns 0');
assert(getPublishedStateCodes().length === 0, 'Production getPublishedStateCodes() returns 0');
assert(getPublishedProjectById('proj-001') === null, 'getPublishedProjectById returns null in production');
assert(getFilteredPublishedProjects({ category: 'infrastructure' }).length === 0, 'Filtered results return [] in production');

// -------------------------------------------------------------
// Isolated Test Fixture for Gallery Scenarios
// -------------------------------------------------------------
const MOCK_PROJECTS = [
  {
    id: 'proj-infra-mh-1',
    name: '33kV Industrial Substation & Distribution Line',
    stateCode: 'IN-MH',
    city: 'Mumbai',
    category: 'infrastructure',
    description: 'High-voltage substation and cabling installation for manufacturing complex.',
    images: ['/images/test1.jpg'],
    completionYear: 2023,
    status: 'published',
    isClientConfidential: true,
    clientName: 'CONFIDENTIAL INDUSTRIAL CORP',
    internalReference: 'REF-MH-001',
    workOrderNumber: 'WO-99881',
    verificationNotes: 'Strict NDA signed',
    privateCoordinates: { lat: 19.076, lng: 72.877 },
    scope: '33/11kV Substation & 5km Underground Feeder',
  },
  {
    id: 'proj-dist-mh-2',
    name: 'Commercial Switchgear & Main HT/LT Panel Board',
    stateCode: 'IN-MH',
    city: 'Pune',
    category: 'distribution',
    description: 'Comprehensive electrical distribution panels and busbar trunking.',
    images: [],
    completionYear: 2022,
    status: 'published',
    isClientConfidential: false,
    clientName: 'Public Commercial Plaza',
    internalReference: 'REF-MH-002',
    workOrderNumber: 'WO-99882',
    scope: 'Main HT Distribution Board',
  },
  {
    id: 'proj-light-dl-3',
    name: 'Architectural LED Facade & Atrium Lighting',
    stateCode: 'IN-DL',
    city: 'New Delhi',
    category: 'lighting',
    description: 'Custom programmable facade illumination and interior lighting control.',
    images: ['/images/light1.jpg', '/images/light2.jpg'],
    completionYear: 2024,
    status: 'published',
    isClientConfidential: true,
    clientName: 'SECRET EMBASSY QUARTERS',
    internalReference: 'REF-DL-003',
  },
  {
    id: 'proj-infra-gj-4',
    name: 'Industrial Feeder Bay & Protection Automation',
    stateCode: 'IN-GJ',
    city: 'Ahmedabad',
    category: 'infrastructure',
    description: 'Protection relays and automated feeder switching setup.',
    images: null, // intentionally null to test graceful degradation
    completionYear: null,
    status: 'published',
    isClientConfidential: false,
    clientName: 'Gujarat Heavy Industries',
  },
  // Unpublished records (MUST NEVER leak)
  {
    id: 'proj-draft-5',
    name: 'Draft Project In Progress',
    stateCode: 'IN-MH',
    city: 'Nagpur',
    category: 'infrastructure',
    status: 'draft',
    isClientConfidential: false,
  },
  {
    id: 'proj-verified-6',
    name: 'Verified But Unpublished Case Study',
    stateCode: 'IN-KA',
    city: 'Bengaluru',
    category: 'distribution',
    status: 'verified',
    isClientConfidential: false,
  },
];

// -------------------------------------------------------------
// 2. Multi-Criteria Gallery Filtering
// -------------------------------------------------------------
console.log('\n2. Multi-Criteria Gallery Filtering:');
const publishedCount = getPublishedProjects(MOCK_PROJECTS).length;
assert(publishedCount === 4, `Published projects count is 4 (got ${publishedCount})`);

// Category Filtering
const infraProjects = getPublishedProjectsByCategory('infrastructure', MOCK_PROJECTS);
assert(infraProjects.length === 2, `Category 'infrastructure' returns 2 projects (got ${infraProjects.length})`);
assert(infraProjects.every(p => p.category === 'infrastructure'), 'All returned records have category infrastructure');

const distProjects = getPublishedProjectsByCategory('distribution', MOCK_PROJECTS);
assert(distProjects.length === 1, `Category 'distribution' returns 1 project (got ${distProjects.length})`);
assert(distProjects[0].id === 'proj-dist-mh-2', 'Correct distribution project returned');

const lightProjects = getPublishedProjectsByCategory('lighting', MOCK_PROJECTS);
assert(lightProjects.length === 1, `Category 'lighting' returns 1 project (got ${lightProjects.length})`);
assert(lightProjects[0].id === 'proj-light-dl-3', 'Correct lighting project returned');

// Combined Multi-Criteria Filter (Category + State)
const infraInMh = getFilteredPublishedProjects({ category: 'infrastructure', stateCode: 'IN-MH' }, MOCK_PROJECTS);
assert(infraInMh.length === 1, `Filtered by infra + IN-MH returns 1 project (got ${infraInMh.length})`);
assert(infraInMh[0].id === 'proj-infra-mh-1', 'Correct project returned for infra + IN-MH');

// Combined Multi-Criteria Filter (Category + State + City)
const mumbaiInfra = getFilteredPublishedProjects({ category: 'infrastructure', stateCode: 'IN-MH', city: 'Mumbai' }, MOCK_PROJECTS);
assert(mumbaiInfra.length === 1, `Filtered by infra + IN-MH + Mumbai returns 1 (got ${mumbaiInfra.length})`);

// Case-insensitive & trimmed city matching
const mumbaiTrimmed = getFilteredPublishedProjects({ city: '  mumbai  ' }, MOCK_PROJECTS);
assert(mumbaiTrimmed.length === 1, 'City filter is case-insensitive and trims whitespace');

// Non-matching combinations
const emptyMatch = getFilteredPublishedProjects({ category: 'lighting', stateCode: 'IN-MH' }, MOCK_PROJECTS);
assert(emptyMatch.length === 0, 'Non-matching filter combination returns []');

// -------------------------------------------------------------
// 3. Opening Project Detail by Stable ID
// -------------------------------------------------------------
console.log('\n3. Project Detail by Stable ID:');
const detailRecord = getPublishedProjectById('proj-infra-mh-1', MOCK_PROJECTS);
assert(detailRecord !== null, 'Found published project by stable ID proj-infra-mh-1');
assert(detailRecord.name === '33kV Industrial Substation & Distribution Line', 'Project name matches');
assert(detailRecord.stateCode === 'IN-MH', 'State code matches IN-MH');
assert(detailRecord.city === 'Mumbai', 'City matches Mumbai');
assert(detailRecord.scope === '33/11kV Substation & 5km Underground Feeder', 'Scope matches');
assert(detailRecord.completionYear === 2023, 'Completion year matches 2023');

// -------------------------------------------------------------
// 4. Unknown & Unpublished Project IDs
// -------------------------------------------------------------
console.log('\n4. Unknown & Unpublished Project IDs:');
const draftLookup = getPublishedProjectById('proj-draft-5', MOCK_PROJECTS);
assert(draftLookup === null, 'Draft project ID returns null');

const verifiedLookup = getPublishedProjectById('proj-verified-6', MOCK_PROJECTS);
assert(verifiedLookup === null, 'Verified-unpublished project ID returns null');

const unknownLookup = getPublishedProjectById('non-existent-id', MOCK_PROJECTS);
assert(unknownLookup === null, 'Non-existent project ID returns null');

const nullLookup = getPublishedProjectById(null, MOCK_PROJECTS);
assert(nullLookup === null, 'Null ID returns null');

// -------------------------------------------------------------
// 5. Confidentiality & Security Sanitization
// -------------------------------------------------------------
console.log('\n5. Strict Confidentiality & Security Sanitization:');
const confidentialRecord = getPublishedProjectById('proj-infra-mh-1', MOCK_PROJECTS);
assert(confidentialRecord.clientName === undefined, 'Confidential clientName is deleted');
assert(confidentialRecord.internalReference === undefined, 'internalReference is deleted');
assert(confidentialRecord.workOrderNumber === undefined, 'workOrderNumber is deleted');
assert(confidentialRecord.verificationNotes === undefined, 'verificationNotes is deleted');
assert(confidentialRecord.privateCoordinates === undefined, 'privateCoordinates is deleted');

const nonConfidentialRecord = getPublishedProjectById('proj-dist-mh-2', MOCK_PROJECTS);
assert(nonConfidentialRecord.clientName === 'Public Commercial Plaza', 'Non-confidential clientName is retained');
assert(nonConfidentialRecord.internalReference === undefined, 'internalReference is deleted on non-confidential record');
assert(nonConfidentialRecord.workOrderNumber === undefined, 'workOrderNumber is deleted on non-confidential record');

// -------------------------------------------------------------
// 6. Graceful Handling of Missing Optional Attributes
// -------------------------------------------------------------
console.log('\n6. Missing Optional Attributes Handling:');
const missingImagesRecord = getPublishedProjectById('proj-infra-gj-4', MOCK_PROJECTS);
assert(missingImagesRecord !== null, 'Record with null images resolved cleanly');
assert(missingImagesRecord.images === null, 'images property preserved as null without throw');
assert(missingImagesRecord.completionYear === null, 'completionYear preserved as null');
assert(missingImagesRecord.scope === undefined, 'scope undefined handled cleanly');

// -------------------------------------------------------------
// 7. Navigation Configuration Integrity
// -------------------------------------------------------------
console.log('\n7. Navigation Configuration Integrity:');
const projectsNavItem = NAV_ITEMS.find(item => item.name === 'Projects');
assert(projectsNavItem !== undefined, 'Projects exists in NAV_ITEMS');
assert(projectsNavItem.path === '/projects', 'Projects path is /projects');
assert(projectsNavItem.isAvailable === true, 'Projects nav item is active (isAvailable === true)');

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n============================================================');
console.log(`PHASE 5 RESULTS: ${passed} passed, ${failed} failed.`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
}
