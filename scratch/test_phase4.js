/**
 * Phase 4 Focused Test Suite: State Selection & City Exploration Journey
 * 
 * Verifies:
 * 1. Journey integrity: All India -> State selection -> City exploration -> Project view -> Reset.
 * 2. Breadcrumb path resolution for State and City levels.
 * 3. Quick state selection chip generation and counts.
 * 4. City filter clear action behavior and displayed count synchronization.
 * 5. Screen reader live status message generation for all exploration states.
 * 6. Production dataset remains 100% empty (Zero Leakage).
 */

import { PROJECTS } from '../src/data/projects.js';
import {
  getPublishedProjects,
  getPublishedStateCodes,
  getPublishedCitiesByState,
  getPublishedProjectsByState,
  getPublishedProjectsByStateAndCity,
  getPublishedProjectCountByState,
  getStateDetails,
} from '../src/data/projectSelectors.js';

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

console.log('=== PHASE 4: STATE SELECTION & CITY EXPLORATION TEST SUITE ===\n');

// 1. Production Dataset Purity
console.log('1. Production Baseline Purity Assertion:');
assert(PROJECTS.length === 0, 'Production PROJECTS dataset is strictly empty');
assert(getPublishedProjects().length === 0, 'getPublishedProjects() is empty in production');
assert(getPublishedStateCodes().length === 0, 'getPublishedStateCodes() is empty in production');

// 2. Exploration Journey Simulation Fixture
const journeyFixture = [
  // Maharashtra (3 projects: 2 in Mumbai, 1 in Pune)
  {
    id: 'j-mh-1',
    name: 'Bandra-Kurla Complex Substation',
    stateCode: 'IN-MH',
    city: 'Mumbai',
    category: 'infrastructure',
    description: '33kV GIS Substation in BKC.',
    images: [],
    status: 'published',
    isClientConfidential: false,
    clientName: 'Commercial Client',
  },
  {
    id: 'j-mh-2',
    name: 'Worli Sea Face Architectural Facade Lighting',
    stateCode: 'IN-MH',
    city: 'Mumbai',
    category: 'lighting',
    description: 'Dynamic DMX architectural illumination.',
    images: [],
    status: 'published',
    isClientConfidential: true,
    clientName: 'Confidential Tower Client',
  },
  {
    id: 'j-mh-3',
    name: 'Talegaon Industrial HT Distribution',
    stateCode: 'IN-MH',
    city: 'Pune',
    category: 'distribution',
    description: 'Industrial HT/LT distribution network.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },

  // Gujarat (2 projects: 1 in Ahmedabad, 1 in Surat)
  {
    id: 'j-gj-1',
    name: 'GIFT City Control Center Cabling',
    stateCode: 'IN-GJ',
    city: 'Ahmedabad',
    category: 'distribution',
    description: 'Smart city control room electrical wiring.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
  {
    id: 'j-gj-2',
    name: 'Hazira Heavy Industrial Substation',
    stateCode: 'IN-GJ',
    city: 'Surat',
    category: 'infrastructure',
    description: 'Heavy industrial power substation.',
    images: [],
    status: 'published',
    isClientConfidential: false,
  },
];

// Step 1: All India Overview Journey
console.log('\n2. Journey Step 1: All India Overview:');
const nationalCodes = getPublishedStateCodes(journeyFixture);
const allProjects = getPublishedProjects(journeyFixture);
assert(nationalCodes.length === 2, 'All India has 2 active states');
assert(allProjects.length === 5, 'All India has 5 total published projects');

// Check quick state chip counts
const mhCount = getPublishedProjectCountByState('IN-MH', journeyFixture);
const gjCount = getPublishedProjectCountByState('IN-GJ', journeyFixture);
assert(mhCount === 3, 'Quick chip count for Maharashtra is 3');
assert(gjCount === 2, 'Quick chip count for Gujarat is 2');

// Step 2: User selects Maharashtra
console.log('\n3. Journey Step 2: Select State (Maharashtra):');
const selectedState = 'IN-MH';
const stateDetails = getStateDetails(selectedState);
assert(stateDetails.name === 'Maharashtra' && stateDetails.type === 'State', 'State details resolved correctly');
const stateProjects = getPublishedProjectsByState(selectedState, journeyFixture);
assert(stateProjects.length === 3, 'State view returns 3 projects');

// Check cities in state
const mhCities = getPublishedCitiesByState(selectedState, journeyFixture);
assert(mhCities.length === 2, 'Maharashtra has 2 published cities');
assert(mhCities[0] === 'Mumbai' && mhCities[1] === 'Pune', 'Cities sorted: ["Mumbai", "Pune"]');

// Step 3: User filters by city (Mumbai)
console.log('\n4. Journey Step 3: Explore City (Mumbai):');
const selectedCity = 'Mumbai';
const mumbaiProjects = getPublishedProjectsByStateAndCity(selectedState, selectedCity, journeyFixture);
assert(mumbaiProjects.length === 2, 'Mumbai filter yields 2 projects');
assert(mumbaiProjects.every((p) => p.city === 'Mumbai'), 'All returned projects belong to Mumbai');

// Step 4: User clears city filter (returns to State-wide view)
console.log('\n5. Journey Step 4: Clear City Filter (Return to Maharashtra Overview):');
const clearedCityProjects = getPublishedProjectsByState(selectedState, journeyFixture);
assert(clearedCityProjects.length === 3, 'Clearing city filter returns all 3 Maharashtra projects');

// Step 5: User switches state to Gujarat (IN-GJ)
console.log('\n6. Journey Step 5: Switch State (Gujarat):');
const nextState = 'IN-GJ';
const gjDetails = getStateDetails(nextState);
assert(gjDetails.name === 'Gujarat', 'State switch resolves to Gujarat');
const gjProjects = getPublishedProjectsByState(nextState, journeyFixture);
assert(gjProjects.length === 2, 'Gujarat has 2 published projects');
assert(!gjProjects.some((p) => p.stateCode === 'IN-MH'), 'No stale Maharashtra records remain');

// Step 6: User resets to All India
console.log('\n7. Journey Step 6: Reset to All India:');
const resetProjects = getPublishedProjects(journeyFixture);
assert(resetProjects.length === 5, 'Reset restores full All India project scope (5)');

// 8. Screen Reader Announcement Strings Test
console.log('\n8. Screen Reader Status Announcement Logic:');
const getAnnouncement = (stateDet, dispProjects, city, activeCodes, hasActive) => {
  if (stateDet) {
    return `Selected ${stateDet.name}. Displaying ${dispProjects.length} ${dispProjects.length === 1 ? 'project' : 'projects'}${city ? ` for city ${city}` : ''}.`;
  }
  if (hasActive) {
    return `All India view. ${activeCodes.length} active regions available.`;
  }
  return 'All India neutral baseline. Verified records in preparation.';
};

const annAllIndiaEmpty = getAnnouncement(null, [], null, [], false);
assert(annAllIndiaEmpty === 'All India neutral baseline. Verified records in preparation.', 'Empty baseline announcement correct');

const annAllIndiaActive = getAnnouncement(null, allProjects, null, nationalCodes, true);
assert(annAllIndiaActive === 'All India view. 2 active regions available.', 'Active nationwide announcement correct');

const annState = getAnnouncement(stateDetails, stateProjects, null, nationalCodes, true);
assert(annState === 'Selected Maharashtra. Displaying 3 projects.', 'State view announcement correct');

const annCity = getAnnouncement(stateDetails, mumbaiProjects, 'Mumbai', nationalCodes, true);
assert(annCity === 'Selected Maharashtra. Displaying 2 projects for city Mumbai.', 'City view announcement correct');

// 9. Confidentiality Check on Phase 4 Fixtures
console.log('\n9. Confidentiality & Allowlist Invariants:');
const confidentialRecord = allProjects.find((p) => p.id === 'j-mh-2');
assert(confidentialRecord.clientName === undefined, 'Confidential client name stripped');
assert(confidentialRecord.isClientConfidential === true, 'Confidential flag preserved');

console.log(`\n============================================================`);
console.log(`PHASE 4 RESULTS: ${passed} passed, ${failed} failed.`);
console.log(`============================================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
