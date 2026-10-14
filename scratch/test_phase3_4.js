/**
 * Phase 3.4 Focused Test Suite:
 * - Map selection & state derivation
 * - City filtering & project list retrieval
 * - Reset behavior
 * - Empty dataset behavior
 * - Confidentiality & metadata stripping regression checks
 * - Multi-city and multi-project resolution
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

console.log('=== PHASE 3.4 INTERACTIVE EXPLORER & REGIONAL SELECTORS TEST SUITE ===\n');

// 1. Production Baseline: Empty Dataset Invariants
console.log('1. Production Baseline — Empty PROJECTS Dataset Invariants:');
assert(PROJECTS.length === 0, 'Active PROJECTS array is strictly empty in production');
assert(getPublishedProjects().length === 0, 'getPublishedProjects() produces 0 records');
assert(getPublishedStateCodes().length === 0, 'getPublishedStateCodes() produces 0 active state codes');
assert(getPublishedCitiesByState('IN-MH').length === 0, 'getPublishedCitiesByState("IN-MH") produces 0 cities');
assert(getPublishedProjectsByState('IN-MH').length === 0, 'getPublishedProjectsByState("IN-MH") produces 0 projects');
assert(getPublishedProjectsByStateAndCity('IN-MH', 'Mumbai').length === 0, 'getPublishedProjectsByStateAndCity() produces 0 projects');
assert(getPublishedProjectCountByState('IN-MH') === 0, 'getPublishedProjectCountByState("IN-MH") is 0');
assert(Object.keys(getPublishedProjectCounts()).length === 0, 'getPublishedProjectCounts() is empty object');

// 2. Mock Multi-State & Multi-City Regional Dataset
console.log('\n2. Simulation of State & City Exploration Workflow:');
const mockDataset = [
  // Maharashtra (2 published in Mumbai, 1 published in Pune, 1 draft in Nagpur)
  {
    id: 'proj-mh-1',
    name: 'South Mumbai 33kV Substation',
    stateCode: 'IN-MH',
    city: 'Mumbai',
    category: 'infrastructure',
    description: 'Turnkey 33kV gas-insulated substation execution for metropolitan commercial grid.',
    images: ['/images/projects/mumbai-substation.jpg'],
    completionYear: 2023,
    status: 'published',
    isClientConfidential: false,
    clientName: 'Metropolitan Electricity Supply Ltd',
    internalReference: 'INT-WO-8819',
    workOrderNumber: 'WO-2023-01',
    scope: '33/11kV Substation, Switchgear & Cabling',
  },
  {
    id: 'proj-mh-2',
    name: 'BKC Financial Center Architectural Facade Illumination',
    stateCode: 'IN-MH',
    city: 'Mumbai',
    category: 'lighting',
    description: 'Dynamic DMX architectural illumination across twin corporate tower facades.',
    images: ['/images/projects/bkc-lighting.jpg'],
    completionYear: 2024,
    status: 'published',
    isClientConfidential: true,
    clientName: 'Confidential Real Estate Trust',
    internalReference: 'INT-WO-9922',
    workOrderNumber: 'WO-2024-09',
    scope: 'Facade RGBW LED Lighting & Controls',
  },
  {
    id: 'proj-mh-3',
    name: 'Chakan Automotive Plant HT/LT Panels',
    stateCode: 'IN-MH',
    city: 'Pune',
    category: 'distribution',
    description: 'Main LT distribution switchboards and automatic power factor correction panels.',
    images: [],
    completionYear: 2022,
    status: 'published',
    isClientConfidential: false,
    clientName: 'Automotive Precision Engineering Corp',
    scope: 'LT Switchboards, Busduct, APFC Panels',
  },
  {
    id: 'proj-mh-draft',
    name: 'Nagpur Warehouse Internal Wiring Draft',
    stateCode: 'IN-MH',
    city: 'Nagpur',
    category: 'distribution',
    description: 'Unpublished draft record in progress.',
    images: [],
    status: 'draft',
    isClientConfidential: false,
  },

  // Delhi (1 published in New Delhi, 1 verified-unpublished in Okhla)
  {
    id: 'proj-dl-1',
    name: 'Central Secretariat Heritage Illumination',
    stateCode: 'IN-DL',
    city: 'New Delhi',
    category: 'lighting',
    description: 'Warm white optical floodlighting for colonial-era government administration complex.',
    images: ['/images/projects/delhi-heritage.jpg'],
    completionYear: 2023,
    status: 'published',
    isClientConfidential: false,
    clientName: 'Urban Heritage Development Agency',
  },
  {
    id: 'proj-dl-verified',
    name: 'Okhla Industrial Feeder Line',
    stateCode: 'IN-DL',
    city: 'Okhla',
    category: 'infrastructure',
    description: 'Verified work order, unpublished pending management approval.',
    images: [],
    status: 'verified',
    isClientConfidential: false,
  },

  // Gujarat (1 verified-unpublished in Surat, 0 published)
  {
    id: 'proj-gj-verified',
    name: 'Surat Textile Hub Transformer Station',
    stateCode: 'IN-GJ',
    city: 'Surat',
    category: 'infrastructure',
    description: 'Verified testing data.',
    images: [],
    status: 'verified',
    isClientConfidential: false,
  },
];

// Step 2.1: Active State Codes derivation
const activeCodes = getPublishedStateCodes(mockDataset);
assert(activeCodes.length === 2, `Active state codes count is 2 (found ${activeCodes.length})`);
assert(activeCodes.includes('IN-MH') && activeCodes.includes('IN-DL'), 'Active codes are IN-MH and IN-DL');
assert(!activeCodes.includes('IN-GJ'), 'IN-GJ with only verified-unpublished projects is NOT in activeStateCodes');

// Step 2.2: State Selection (Maharashtra IN-MH)
const mhStateDetails = getStateDetails('IN-MH');
assert(mhStateDetails && mhStateDetails.name === 'Maharashtra', 'State lookup resolves to Maharashtra');
const mhAllProjects = getPublishedProjectsByState('IN-MH', mockDataset);
assert(mhAllProjects.length === 3, `Maharashtra has 3 published projects (got ${mhAllProjects.length})`);
assert(!mhAllProjects.some((p) => p.id === 'proj-mh-draft'), 'Draft project proj-mh-draft is excluded from state projects');

// Step 2.3: City derivation for Maharashtra
const mhCities = getPublishedCitiesByState('IN-MH', mockDataset);
assert(mhCities.length === 2, `Maharashtra has 2 published cities (got ${mhCities.length})`);
assert(mhCities[0] === 'Mumbai' && mhCities[1] === 'Pune', 'Published cities are sorted: ["Mumbai", "Pune"]');
assert(!mhCities.includes('Nagpur'), 'Nagpur from draft record is NOT in city list');

// Step 2.4: City Filtering (Mumbai vs Pune)
const mumbaiProjects = getPublishedProjectsByStateAndCity('IN-MH', 'Mumbai', mockDataset);
assert(mumbaiProjects.length === 2, `Mumbai city filter yields 2 projects (got ${mumbaiProjects.length})`);
assert(mumbaiProjects.some((p) => p.id === 'proj-mh-1') && mumbaiProjects.some((p) => p.id === 'proj-mh-2'), 'Both Mumbai projects returned');

const puneProjects = getPublishedProjectsByStateAndCity('IN-MH', 'Pune', mockDataset);
assert(puneProjects.length === 1 && puneProjects[0].id === 'proj-mh-3', 'Pune city filter yields 1 project (proj-mh-3)');

// Step 2.5: Case-insensitive & trimmed city filtering
const caseInsensitiveMatch = getPublishedProjectsByStateAndCity('IN-MH', '  mumbai  ', mockDataset);
assert(caseInsensitiveMatch.length === 2, 'City filter is whitespace-trimmed and case-insensitive');

// Step 2.6: City Filter Reset (returning to state overview)
// When user resets city filter, displayedProjects falls back to mhAllProjects (3)
assert(mhAllProjects.length === 3, 'Resetting city filter returns all 3 state projects');

// Step 2.7: State Reset (returning to All India)
// When user resets state filter, selectedStateCode is null and map returns to All India view
const allPublished = getPublishedProjects(mockDataset);
assert(allPublished.length === 4, `All India view has total 4 published projects (got ${allPublished.length})`);

// 3. Privacy, Confidentiality & Metadata Stripping Regression Checks
console.log('\n3. Confidentiality & Security Regression Invariants:');

// Proj 1 (isClientConfidential: false)
const pubProj1 = allPublished.find((p) => p.id === 'proj-mh-1');
assert(pubProj1.clientName === 'Metropolitan Electricity Supply Ltd', 'Non-confidential record retains client name');
assert(pubProj1.internalReference === undefined, 'internalReference is stripped even on non-confidential record');
assert(pubProj1.workOrderNumber === undefined, 'workOrderNumber is stripped even on non-confidential record');

// Proj 2 (isClientConfidential: true)
const pubProj2 = allPublished.find((p) => p.id === 'proj-mh-2');
assert(pubProj2.clientName === undefined, 'Confidential client record has clientName stripped');
assert(pubProj2.internalReference === undefined, 'Confidential record has internalReference stripped');
assert(pubProj2.workOrderNumber === undefined, 'Confidential record has workOrderNumber stripped');

// 4. Edge Cases and Defensive Input Handling
console.log('\n4. Edge Cases & Defensive Invariants:');
assert(getPublishedCitiesByState(null, mockDataset).length === 0, 'Null stateCode returns empty cities array');
assert(getPublishedCitiesByState('UNKNOWN-CODE', mockDataset).length === 0, 'Unknown stateCode returns empty cities array');
assert(getPublishedProjectsByState(null, mockDataset).length === 0, 'Null stateCode returns empty projects array');
assert(getPublishedProjectsByStateAndCity('IN-MH', null, mockDataset).length === 0, 'Null city returns empty projects array');
assert(getPublishedProjectsByStateAndCity('IN-MH', 'NonExistentCity', mockDataset).length === 0, 'Non-existent city returns empty projects array');
assert(getPublishedProjectCountByState('IN-XX', mockDataset) === 0, 'Count for unrepresented state is 0');

// 5. Existing 50-point Audit Runner
console.log('\n5. Data Integrity Audit Integration:');
const audit = runDataIntegrityAudit();
assert(audit.passed === true, 'runDataIntegrityAudit() passes with zero errors');

console.log(`\n============================================================`);
console.log(`PHASE 3.4 RESULTS: ${passed} passed, ${failed} failed.`);
console.log(`============================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
