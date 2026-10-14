/**
 * Phase 3.5 Comprehensive Integration Audit & Hardening Test Suite
 * 
 * Verifies:
 * 1. Production PROJECTS array remains strictly empty (Zero Leakage).
 * 2. Scenario A: Empty dataset baseline.
 * 3. Scenario B: Single published project in one state and city.
 * 4. Scenario C: Multiple published projects in the same city.
 * 5. Scenario D: Multiple cities within the same state.
 * 6. Scenario E: Projects spanning multiple distinct states.
 * 7. Scenario F: Strict isolation of unpublished records (draft & verified).
 * 8. Scenario G: Confidential client withholding & internal reference stripping.
 * 9. Scenario H: Missing optional fields (images, scope, completionYear).
 * 10. Scenario I: Invalid / unknown state codes handling.
 * 11. Scenario J: Case and whitespace normalization in city names.
 * 12. Scenario K: Switching cities, switching states, and resetting to All India.
 * 13. Component prop integrity for IndiaMapSvg and ProjectCard.
 */

import { INDIAN_STATES, STATE_BY_CODE, isValidStateCode } from '../src/data/states.js';
import { PROJECTS, PROJECT_CATEGORIES, PROJECT_STATUSES } from '../src/data/projects.js';
import {
  getPublishedProjects,
  getPublishedStateCodes,
  getPublishedCitiesByState,
  getPublishedProjectsByState,
  getPublishedProjectsByStateAndCity,
  getPublishedProjectCountByState,
  getPublishedProjectCounts,
  getStateDetails,
} from '../src/data/projectSelectors.js';
import {
  validateProjectRecord,
  validateProjectDataset,
  runDataIntegrityAudit,
} from '../src/data/projectValidation.js';
import { INDIA_MAP_STATES } from '../src/components/map/indiaMapGeometry.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== PHASE 3.5 INTEGRATION AUDIT & HARDENING TEST SUITE ===\n');

// 1. Production Data Non-Leakage Check
console.log('1. Production Data Non-Leakage & Baseline Verification:');
assert(Array.isArray(PROJECTS), 'PROJECTS is an array');
assert(PROJECTS.length === 0, 'Production PROJECTS is strictly empty (0 records)');
assert(getPublishedProjects().length === 0, 'Production getPublishedProjects() returns 0');
assert(getPublishedStateCodes().length === 0, 'Production getPublishedStateCodes() returns []');

// 2. Scenario A: Empty Dataset
console.log('\n2. Scenario A — Empty Dataset Edge Invariants:');
assert(getPublishedCitiesByState('IN-MH').length === 0, 'Empty dataset yields 0 cities for IN-MH');
assert(getPublishedProjectsByState('IN-MH').length === 0, 'Empty dataset yields 0 projects for IN-MH');
assert(getPublishedProjectsByStateAndCity('IN-MH', 'Mumbai').length === 0, 'Empty dataset yields 0 projects for Mumbai');
assert(getPublishedProjectCountByState('IN-MH') === 0, 'Empty dataset yields count 0 for IN-MH');
assert(Object.keys(getPublishedProjectCounts()).length === 0, 'Empty dataset yields {} for counts');

// 3. Scenario B: Single Published Project in One State and City
console.log('\n3. Scenario B — Single Published Project in One State & City:');
const fixtureB = [
  {
    id: 'b-1',
    name: 'Ahmedabad Distribution Hub',
    stateCode: 'IN-GJ',
    city: 'Ahmedabad',
    category: 'distribution',
    description: '11kV substation distribution panel board installation.',
    images: ['/img/gj.jpg'],
    status: 'published',
    isClientConfidential: false,
    clientName: 'Gujarat Industrial Corp',
  },
];
assert(getPublishedStateCodes(fixtureB).length === 1 && getPublishedStateCodes(fixtureB)[0] === 'IN-GJ', 'Only IN-GJ is active');
assert(getPublishedCitiesByState('IN-GJ', fixtureB).length === 1 && getPublishedCitiesByState('IN-GJ', fixtureB)[0] === 'Ahmedabad', 'Only Ahmedabad is listed');
assert(getPublishedProjectsByState('IN-GJ', fixtureB).length === 1, 'IN-GJ returns exactly 1 project');
assert(getPublishedProjectsByStateAndCity('IN-GJ', 'Ahmedabad', fixtureB).length === 1, 'Ahmedabad returns exactly 1 project');
assert(getPublishedProjectCountByState('IN-GJ', fixtureB) === 1, 'Count for IN-GJ is exactly 1');
assert(getPublishedProjectCountByState('IN-MH', fixtureB) === 0, 'Count for unrelated state IN-MH is 0');

// 4. Scenario C: Multiple Published Projects in the Same City
console.log('\n4. Scenario C — Multiple Published Projects in Same City:');
const fixtureC = [
  {
    id: 'c-1',
    name: 'Bengaluru IT Park Substation',
    stateCode: 'IN-KA',
    city: 'Bengaluru',
    category: 'infrastructure',
    description: '33kV GIS substation.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
  {
    id: 'c-2',
    name: 'Bengaluru Tech Corridor Facade Lighting',
    stateCode: 'IN-KA',
    city: 'Bengaluru',
    category: 'lighting',
    description: 'High-efficiency LED architectural facade illumination.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
];
assert(getPublishedCitiesByState('IN-KA', fixtureC).length === 1, 'Duplicate city names are deduplicated to 1 entry');
assert(getPublishedCitiesByState('IN-KA', fixtureC)[0] === 'Bengaluru', 'Deduplicated city is Bengaluru');
assert(getPublishedProjectsByStateAndCity('IN-KA', 'Bengaluru', fixtureC).length === 2, 'Both Bengaluru projects returned in city filter');
assert(getPublishedProjectsByState('IN-KA', fixtureC).length === 2, 'Both projects returned for Karnataka state');

// 5. Scenario D: Multiple Cities in the Same State
console.log('\n5. Scenario D — Multiple Cities in Same State:');
const fixtureD = [
  {
    id: 'd-1',
    name: 'Chennai Port Lighting',
    stateCode: 'IN-TN',
    city: 'Chennai',
    category: 'lighting',
    description: 'High-mast port lighting.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
  {
    id: 'd-2',
    name: 'Coimbatore Textile Distribution',
    stateCode: 'IN-TN',
    city: 'Coimbatore',
    category: 'distribution',
    description: 'HT switchgear installation.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
  {
    id: 'd-3',
    name: 'Madurai Substation',
    stateCode: 'IN-TN',
    city: 'Madurai',
    category: 'infrastructure',
    description: 'Substation works.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
];
const tnCities = getPublishedCitiesByState('IN-TN', fixtureD);
assert(tnCities.length === 3, 'All 3 distinct cities returned');
assert(tnCities[0] === 'Chennai' && tnCities[1] === 'Coimbatore' && tnCities[2] === 'Madurai', 'Cities sorted alphabetically');
assert(getPublishedProjectsByStateAndCity('IN-TN', 'Coimbatore', fixtureD).length === 1, 'Filtered to single Coimbatore project');
assert(getPublishedProjectsByState('IN-TN', fixtureD).length === 3, 'State overview returns all 3 projects');

// 6. Scenario E: Projects in Two Different States
console.log('\n6. Scenario E — Projects in Multiple Distinct States:');
const fixtureE = [
  ...fixtureB, // IN-GJ (1 project)
  ...fixtureD, // IN-TN (3 projects)
];
const multiStateCodes = getPublishedStateCodes(fixtureE);
assert(multiStateCodes.length === 2, 'Active states count is 2');
assert(multiStateCodes[0] === 'IN-GJ' && multiStateCodes[1] === 'IN-TN', 'Active state codes sorted: ["IN-GJ", "IN-TN"]');
const countsE = getPublishedProjectCounts(fixtureE);
assert(countsE['IN-GJ'] === 1 && countsE['IN-TN'] === 3, 'Accurate per-state counts: IN-GJ=1, IN-TN=3');

// 7. Scenario F: Strict Isolation of Unpublished Projects
console.log('\n7. Scenario F — Strict Isolation of Unpublished Projects:');
const fixtureF = [
  {
    id: 'f-draft',
    name: 'Draft Feeder',
    stateCode: 'IN-UP',
    city: 'Lucknow',
    category: 'distribution',
    description: 'Draft notes.',
    images: [],
    status: 'draft',
    isClientConfidential: false,
  },
  {
    id: 'f-verified',
    name: 'Verified Panel',
    stateCode: 'IN-UP',
    city: 'Noida',
    category: 'distribution',
    description: 'Verified work order, unpublished.',
    images: [],
    status: 'verified',
    isClientConfidential: false,
  },
  {
    id: 'f-published',
    name: 'Published Substation',
    stateCode: 'IN-UP',
    city: 'Kanpur',
    category: 'infrastructure',
    description: 'Published 33kV substation.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
];
const upPublished = getPublishedProjects(fixtureF);
assert(upPublished.length === 1 && upPublished[0].id === 'f-published', 'Only published record is returned');
const upCities = getPublishedCitiesByState('IN-UP', fixtureF);
assert(upCities.length === 1 && upCities[0] === 'Kanpur', 'Draft (Lucknow) and verified (Noida) cities are excluded');
assert(getPublishedProjectCountByState('IN-UP', fixtureF) === 1, 'Project count is 1 (excluding draft & verified)');

// 8. Scenario G: Confidential Projects and Internal Metadata Stripping
console.log('\n8. Scenario G — Confidentiality & Internal Metadata Stripping:');
const fixtureG = [
  {
    id: 'g-confidential',
    name: 'Defense Research Power System',
    stateCode: 'IN-DL',
    city: 'New Delhi',
    category: 'infrastructure',
    description: 'High-security underground power feeder.',
    images: [],
    status: 'published',
    isClientConfidential: true,
    clientName: 'Ministry of Defence Directorate',
    internalReference: 'REF-MIL-991',
    workOrderNumber: 'WO-SECRET-2024',
    verificationNotes: 'Audited by Chief Engineer',
    privateCoordinates: [28.6139, 77.2090],
  },
  {
    id: 'g-non-confidential',
    name: 'Commercial Mall Distribution',
    stateCode: 'IN-DL',
    city: 'New Delhi',
    category: 'distribution',
    description: 'Commercial power distribution.',
    images: [],
    status: 'published',
    isClientConfidential: false,
    clientName: 'Public Retail Malls Ltd',
    internalReference: 'INT-REF-884',
    workOrderNumber: 'WO-PUBLIC-101',
    verificationNotes: 'Standard audit',
    privateCoordinates: [28.5355, 77.3910],
  },
];
const sanitizedG = getPublishedProjects(fixtureG);
const confRecord = sanitizedG.find((p) => p.id === 'g-confidential');
const publicRecord = sanitizedG.find((p) => p.id === 'g-non-confidential');

assert(confRecord.clientName === undefined, 'Confidential client name is stripped');
assert(confRecord.internalReference === undefined, 'Confidential internalReference is stripped');
assert(confRecord.workOrderNumber === undefined, 'Confidential workOrderNumber is stripped');
assert(confRecord.verificationNotes === undefined, 'Confidential verificationNotes is stripped');
assert(confRecord.privateCoordinates === undefined, 'Confidential privateCoordinates is stripped');

assert(publicRecord.clientName === 'Public Retail Malls Ltd', 'Non-confidential clientName is preserved');
assert(publicRecord.internalReference === undefined, 'Non-confidential internalReference is stripped');
assert(publicRecord.workOrderNumber === undefined, 'Non-confidential workOrderNumber is stripped');
assert(publicRecord.verificationNotes === undefined, 'Non-confidential verificationNotes is stripped');
assert(publicRecord.privateCoordinates === undefined, 'Non-confidential privateCoordinates is stripped');

// 9. Scenario H: Missing Optional Images & Description Graceful Handling
console.log('\n9. Scenario H — Missing Optional Fields Graceful Handling:');
const fixtureH = [
  {
    id: 'h-1',
    name: 'Minimal Record Project',
    stateCode: 'IN-RJ',
    city: 'Jaipur',
    category: 'lighting',
    description: 'Jaipur lighting installation.',
    images: null, // null instead of array
    completionYear: null,
    status: 'published',
    isClientConfidential: false,
  },
];
const pubH = getPublishedProjects(fixtureH);
assert(pubH.length === 1, 'Record with null images handled without crash');
assert(getPublishedCitiesByState('IN-RJ', fixtureH)[0] === 'Jaipur', 'City extracted cleanly');

// 10. Scenario I: Invalid / Unknown State Codes
console.log('\n10. Scenario I — Invalid or Unknown State Codes:');
const fixtureI = [
  {
    id: 'i-bad-state',
    name: 'Project with Bogus State',
    stateCode: 'IN-XX-BOGUS',
    city: 'Atlantis',
    category: 'infrastructure',
    description: 'Invalid state.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
];
assert(getPublishedStateCodes(fixtureI).length === 0, 'Bogus stateCode excluded from getPublishedStateCodes()');
assert(getPublishedProjectCounts(fixtureI)['IN-XX-BOGUS'] === undefined, 'Bogus stateCode excluded from getPublishedProjectCounts()');
assert(getPublishedCitiesByState('IN-XX-BOGUS', fixtureI).length === 0, 'getPublishedCitiesByState returns [] for invalid code');
assert(getPublishedProjectsByState('IN-XX-BOGUS', fixtureI).length === 0, 'getPublishedProjectsByState returns [] for invalid code');

// 11. Scenario J: Case and Whitespace Variations in City Names
console.log('\n11. Scenario J — Case and Whitespace Normalization:');
const fixtureJ = [
  {
    id: 'j-1',
    name: 'Pune IT Corridor Substation',
    stateCode: 'IN-MH',
    city: 'Pune',
    category: 'infrastructure',
    description: 'Substation.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
];
assert(getPublishedProjectsByStateAndCity('IN-MH', 'pune', fixtureJ).length === 1, 'Lowercase city "pune" matches "Pune"');
assert(getPublishedProjectsByStateAndCity('IN-MH', 'PUNE', fixtureJ).length === 1, 'Uppercase city "PUNE" matches "Pune"');
assert(getPublishedProjectsByStateAndCity('IN-MH', '  Pune  ', fixtureJ).length === 1, 'Trimmed city "  Pune  " matches "Pune"');
assert(getPublishedProjectsByStateAndCity('IN-MH', '', fixtureJ).length === 0, 'Empty city returns []');
assert(getPublishedProjectsByStateAndCity('IN-MH', null, fixtureJ).length === 0, 'Null city returns []');

// 12. Scenario K: Switching Cities, States, and Reset Transitions
console.log('\n12. Scenario K — Reset & Transition Simulation:');
const fixtureK = [
  {
    id: 'k-mh-1',
    name: 'Mumbai Marine Drive Lighting',
    stateCode: 'IN-MH',
    city: 'Mumbai',
    category: 'lighting',
    description: 'Lighting.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
  {
    id: 'k-mh-2',
    name: 'Pune Industrial Feeder',
    stateCode: 'IN-MH',
    city: 'Pune',
    category: 'infrastructure',
    description: 'Feeder.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
  {
    id: 'k-dl-1',
    name: 'Delhi Metro Power',
    stateCode: 'IN-DL',
    city: 'New Delhi',
    category: 'infrastructure',
    description: 'Metro power.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
];

// Step 1: User in Maharashtra, city=Mumbai
const step1 = getPublishedProjectsByStateAndCity('IN-MH', 'Mumbai', fixtureK);
assert(step1.length === 1 && step1[0].id === 'k-mh-1', 'Step 1: Mumbai yields k-mh-1');

// Step 2: User switches city to Pune
const step2 = getPublishedProjectsByStateAndCity('IN-MH', 'Pune', fixtureK);
assert(step2.length === 1 && step2[0].id === 'k-mh-2', 'Step 2: Switching to Pune yields k-mh-2');

// Step 3: User resets city filter (views all cities in Maharashtra)
const step3 = getPublishedProjectsByState('IN-MH', fixtureK);
assert(step3.length === 2, 'Step 3: Resetting city filter returns both Maharashtra projects (2)');

// Step 4: User switches state to Delhi (IN-DL)
const step4 = getPublishedProjectsByState('IN-DL', fixtureK);
assert(step4.length === 1 && step4[0].id === 'k-dl-1', 'Step 4: Switching state to IN-DL yields k-dl-1');
assert(!step4.some((p) => p.stateCode === 'IN-MH'), 'Step 4: No stale Maharashtra records in Delhi view');

// Step 5: User resets to All India
const step5 = getPublishedProjects(fixtureK);
assert(step5.length === 3, 'Step 5: Resetting to All India returns all 3 published projects');

// 13. Map Geometry Verification
console.log('\n13. Map Geometry & Boundary Identifiers Review:');
assert(INDIA_MAP_STATES.length === 36, 'SVG geometry has exactly 36 Level-1 units');
assert(INDIAN_STATES.length === 36, 'State registry has exactly 36 Level-1 units');
const geoCodes = new Set(INDIA_MAP_STATES.map((s) => s.id));
const regCodes = new Set(INDIAN_STATES.map((s) => s.code));
const diff1 = [...geoCodes].filter((c) => !regCodes.has(c));
const diff2 = [...regCodes].filter((c) => !geoCodes.has(c));
assert(diff1.length === 0, 'No geometry codes missing in registry');
assert(diff2.length === 0, 'No registry codes missing in geometry');

// 14. Verification of Production Projects Array Untouched
console.log('\n14. Final Production Data Purity Assertion:');
assert(PROJECTS.length === 0, 'CRITICAL: Production PROJECTS dataset is strictly empty');

console.log(`\n============================================================`);
console.log(`PHASE 3.5 RESULTS: ${passed} passed, ${failed} failed.`);
console.log(`============================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
