/**
 * Test & Validation Script for Phase 3.3
 * Tests states registry, projects source, selectors, confidentiality, and data validation helpers.
 */

import { INDIAN_STATES, STATE_BY_CODE, isValidStateCode } from '../src/data/states.js';
import { INDIA_MAP_STATES } from '../src/components/map/indiaMapGeometry.js';
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

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log('=== PHASE 3.3 INTEGRITY & SELECTORS VERIFICATION ===\n');

// 1. State Registry & Geometry Alignment
console.log('1. Administrative State Registry & SVG Geometry Matching:');
const stateCount = INDIAN_STATES.filter((s) => s.type === 'State').length;
const utCount = INDIAN_STATES.filter((s) => s.type === 'UT').length;
assert(stateCount === 28, `Registry contains exactly 28 states (found ${stateCount})`);
assert(utCount === 8, `Registry contains exactly 8 UTs (found ${utCount})`);
assert(INDIAN_STATES.length === 36, `Registry contains 36 Level-1 units (found ${INDIAN_STATES.length})`);
assert(INDIA_MAP_STATES.length === 36, `SVG geometry contains 36 Level-1 units (found ${INDIA_MAP_STATES.length})`);

const geometryIds = new Set(INDIA_MAP_STATES.map((s) => s.id));
const allMatchGeometry = INDIAN_STATES.every((s) => geometryIds.has(s.code));
const allMatchRegistry = INDIA_MAP_STATES.every((s) => isValidStateCode(s.id));
assert(allMatchGeometry, 'All 36 registry codes exist in SVG map geometry');
assert(allMatchRegistry, 'All 36 SVG geometry IDs exist in state registry');

assert(isValidStateCode('IN-MH') === true, 'isValidStateCode("IN-MH") returns true');
assert(isValidStateCode('IN-DL') === true, 'isValidStateCode("IN-DL") returns true');
assert(isValidStateCode('IN-XYZ') === false, 'isValidStateCode("IN-XYZ") returns false');
assert(isValidStateCode('') === false, 'isValidStateCode("") returns false');
assert(isValidStateCode(null) === false, 'isValidStateCode(null) returns false');

// 2. Initial Projects Dataset
console.log('\n2. Initial Projects Dataset State:');
assert(Array.isArray(PROJECTS), 'PROJECTS is an array');
assert(PROJECTS.length === 0, `Initial PROJECTS dataset is empty (length: ${PROJECTS.length})`);
assert(PROJECT_CATEGORIES.length === 3, 'Controlled categories has 3 items');
assert(PROJECT_STATUSES.length === 3, 'Controlled statuses has 3 items');

// 3. Selectors on Empty Dataset
console.log('\n3. Selectors Behaviour with Empty Dataset:');
assert(getPublishedProjects().length === 0, 'getPublishedProjects() returns []');
assert(getPublishedStateCodes().length === 0, 'getPublishedStateCodes() returns []');
assert(getPublishedCitiesByState('IN-MH').length === 0, 'getPublishedCitiesByState("IN-MH") returns []');
assert(getPublishedProjectsByState('IN-MH').length === 0, 'getPublishedProjectsByState("IN-MH") returns []');
assert(getPublishedProjectsByStateAndCity('IN-MH', 'Mumbai').length === 0, 'getPublishedProjectsByStateAndCity() returns []');
assert(getPublishedProjectCountByState('IN-MH') === 0, 'getPublishedProjectCountByState("IN-MH") returns 0');
assert(Object.keys(getPublishedProjectCounts()).length === 0, 'getPublishedProjectCounts() returns {}');

const mhDetails = getStateDetails('IN-MH');
assert(mhDetails && mhDetails.name === 'Maharashtra', 'getStateDetails("IN-MH") returns Maharashtra');
assert(getStateDetails('INVALID') === null, 'getStateDetails("INVALID") returns null');

// 4. Selectors with Simulated Dataset (Draft, Verified, Published, Confidential)
console.log('\n4. Selectors with Simulated Multi-Lifecycle Dataset:');
const simulatedProjects = [
  {
    id: 'sim-1',
    name: 'Draft Substation Alpha',
    stateCode: 'IN-MH',
    city: 'Pune',
    category: 'infrastructure',
    description: 'Draft description',
    images: [],
    status: 'draft',
    isClientConfidential: false,
    clientName: 'Public Client A',
  },
  {
    id: 'sim-2',
    name: 'Verified LT Distribution',
    stateCode: 'IN-GJ',
    city: 'Surat',
    category: 'distribution',
    description: 'Verified description',
    images: [],
    status: 'verified',
    isClientConfidential: false,
    clientName: 'Public Client B',
  },
  {
    id: 'sim-3',
    name: 'Published Highway Illumination',
    stateCode: 'IN-MH',
    city: 'Mumbai',
    category: 'lighting',
    description: 'Published description',
    images: ['/images/projects/mumbai-light.jpg'],
    status: 'published',
    isClientConfidential: true,
    clientName: 'Confidential Infrastructure Authority',
  },
  {
    id: 'sim-4',
    name: 'Published Industrial Panel Grid',
    stateCode: 'IN-MH',
    city: 'Nagpur',
    category: 'distribution',
    description: 'Published description 2',
    images: [],
    status: 'published',
    isClientConfidential: false,
    clientName: 'Open Public Client',
  },
  {
    id: 'sim-5',
    name: 'Published Smart City Facade',
    stateCode: 'IN-DL',
    city: 'New Delhi',
    category: 'lighting',
    description: 'Published description 3',
    images: [],
    status: 'published',
    isClientConfidential: false,
    clientName: 'Municipal Council',
  },
];

const publishedProjects = getPublishedProjects(simulatedProjects);
assert(publishedProjects.length === 3, `Only published projects returned (got ${publishedProjects.length}, expected 3)`);
assert(publishedProjects.every((p) => p.status === 'published'), 'All returned records have status="published"');
assert(!publishedProjects.some((p) => p.id === 'sim-1' || p.id === 'sim-2'), 'Draft and verified projects strictly excluded');

// Confidentiality Check
const confidentialProj = publishedProjects.find((p) => p.id === 'sim-3');
assert(confidentialProj && confidentialProj.clientName === undefined, 'Confidential project withheld clientName');
const nonConfidentialProj = publishedProjects.find((p) => p.id === 'sim-4');
assert(nonConfidentialProj && nonConfidentialProj.clientName === 'Open Public Client', 'Non-confidential project retained clientName');

// Published State Codes
const publishedStates = getPublishedStateCodes(simulatedProjects);
assert(publishedStates.length === 2, `Unique active state codes count is 2 (got ${publishedStates.length})`);
assert(publishedStates[0] === 'IN-DL' && publishedStates[1] === 'IN-MH', 'Active states are ["IN-DL", "IN-MH"] (sorted)');

// Published Cities for Maharashtra
const mhCities = getPublishedCitiesByState('IN-MH', simulatedProjects);
assert(mhCities.length === 2, `Published cities for IN-MH count is 2 (got ${mhCities.length})`);
assert(mhCities[0] === 'Mumbai' && mhCities[1] === 'Nagpur', 'Published cities sorted alphabetically: ["Mumbai", "Nagpur"]');

// Published Cities for Gujarat (has only verified project, none published)
const gjCities = getPublishedCitiesByState('IN-GJ', simulatedProjects);
assert(gjCities.length === 0, 'No published cities for IN-GJ (has only verified project)');

// Published Projects by State
const mhProjects = getPublishedProjectsByState('IN-MH', simulatedProjects);
assert(mhProjects.length === 2, `getPublishedProjectsByState("IN-MH") returns 2 (got ${mhProjects.length})`);
assert(getPublishedProjectCountByState('IN-MH', simulatedProjects) === 2, 'getPublishedProjectCountByState("IN-MH") returns 2');
assert(getPublishedProjectCountByState('IN-GJ', simulatedProjects) === 0, 'getPublishedProjectCountByState("IN-GJ") returns 0');

// Published Projects by State & City (case-insensitive)
const mumbaiProjects = getPublishedProjectsByStateAndCity('IN-MH', 'mumbai', simulatedProjects);
assert(mumbaiProjects.length === 1 && mumbaiProjects[0].id === 'sim-3', 'Case-insensitive city lookup works ("mumbai")');

// 5. Validation Helpers
console.log('\n5. Data Integrity Validation Helpers:');

// Test single invalid records
const invalidMissingId = validateProjectRecord({ name: 'Test', stateCode: 'IN-MH', category: 'lighting', status: 'draft', isClientConfidential: false });
assert(!invalidMissingId.isValid, 'Validation catches missing ID');

const invalidStateCode = validateProjectRecord({ id: 'bad-1', name: 'Test', stateCode: 'UNKNOWN', category: 'lighting', status: 'draft', isClientConfidential: false });
assert(!invalidStateCode.isValid, 'Validation catches invalid stateCode');

const invalidCategory = validateProjectRecord({ id: 'bad-2', name: 'Test', stateCode: 'IN-MH', category: 'software', status: 'draft', isClientConfidential: false });
assert(!invalidCategory.isValid, 'Validation catches invalid category');

const invalidStatus = validateProjectRecord({ id: 'bad-3', name: 'Test', stateCode: 'IN-MH', category: 'lighting', status: 'archived', isClientConfidential: false });
assert(!invalidStatus.isValid, 'Validation catches invalid status');

const publishedMissingCity = validateProjectRecord({ id: 'bad-4', name: 'Test', stateCode: 'IN-MH', category: 'lighting', status: 'published', isClientConfidential: false });
assert(!publishedMissingCity.isValid, 'Validation rejects published record missing city');

const duplicateIdSet = new Set(['dup-1']);
const duplicateResult = validateProjectRecord({ id: 'dup-1', name: 'Test', stateCode: 'IN-MH', category: 'lighting', status: 'draft', isClientConfidential: false }, duplicateIdSet);
assert(!duplicateResult.isValid, 'Validation rejects duplicate ID');

// Test active dataset validation
const activeValidation = validateProjectDataset(PROJECTS);
assert(activeValidation.isValid === true, 'Empty active dataset passes validation');
assert(activeValidation.totalRecords === 0, 'Empty active dataset has 0 records');

// Run Comprehensive Audit
const auditResult = runDataIntegrityAudit();
assert(auditResult.passed === true, 'runDataIntegrityAudit() passes on current codebase');
assert(auditResult.selectorChecks.emptyDatasetSafe === true, 'Audit confirms empty dataset produces zero active states');
assert(auditResult.selectorChecks.draftLeakCheckPassed === true, 'Audit confirms draft leak check passes');
assert(auditResult.selectorChecks.confidentialityCheckPassed === true, 'Audit confirms confidentiality check passes');

console.log(`\n==================================================`);
console.log(`RESULTS: ${passedTests} passed, ${failedTests} failed.`);
console.log(`==================================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
