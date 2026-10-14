/**
 * Geographic Project Selectors — Phase 3.3
 * 
 * Reusable, pure selector functions for querying published Arham corporate projects,
 * active states, and municipal installation hubs.
 * 
 * Invariants & Publication Rules:
 * 1. Only records with `status === 'published'` are returned by public selectors.
 *    Draft and verified-but-unpublished records are strictly excluded.
 * 2. Confidentiality: Records with `isClientConfidential === true` have internal
 *    client identifiers withheld before exposure to public consumers.
 * 3. Geography is purely derived: Active state codes and city lists are dynamically
 *    computed from published project records rather than duplicated across files.
 * 4. Safe fallbacks: Non-array inputs, undefined state codes, or empty datasets
 *    return safe defaults ([] or 0) without runtime exceptions.
 */

import { PROJECTS } from './projects.js';
import { STATE_BY_CODE, isValidStateCode, VERIFIED_GEOGRAPHIC_COVERAGE } from './states.js';

export { VERIFIED_GEOGRAPHIC_COVERAGE };

/**
 * Sanitizes a project record for public distribution, enforcing confidentiality.
 * @param {Object} project
 * @returns {Object}
 */
const sanitizeForPublic = (project) => {
  if (!project || typeof project !== 'object') return null;

  // Shallow copy to prevent mutating the source record
  const publicRecord = { ...project };

  // Always strip internal verification & work order metadata from public output
  delete publicRecord.internalReference;
  delete publicRecord.workOrderNumber;
  delete publicRecord.verificationNotes;
  delete publicRecord.privateCoordinates;

  // Strict client confidentiality enforcement
  if (publicRecord.isClientConfidential) {
    delete publicRecord.clientName;
  }

  return publicRecord;
};

/**
 * Selector 1: Retrieve all approved, published projects.
 * Automatically strips confidential client identifiers if flagged.
 * 
 * @param {Array} [projects=PROJECTS]
 * @returns {Array} List of published, public-safe project records.
 */
export const getPublishedProjects = (projects = PROJECTS) => {
  if (!Array.isArray(projects)) return [];

  return projects
    .filter((p) => p && p.status === 'published' && isValidStateCode(p.stateCode))
    .map(sanitizeForPublic)
    .filter(Boolean);
};

/**
 * Selector 2: Retrieve unique administrative state codes with published projects.
 * Used directly as `activeStateCodes` prop for `IndiaMapSvg`.
 * 
 * @param {Array} [projects=PROJECTS]
 * @returns {string[]} Sorted array of unique ISO state codes (e.g. ['IN-DL', 'IN-MH']).
 */
export const getPublishedStateCodes = (projects = PROJECTS) => {
  const published = getPublishedProjects(projects);
  const codesSet = new Set();

  published.forEach((p) => {
    if (typeof p.stateCode === 'string' && isValidStateCode(p.stateCode)) {
      codesSet.add(p.stateCode);
    }
  });

  return Array.from(codesSet).sort();
};

/**
 * Selector 3: Retrieve unique cities with published projects for a specified state.
 * 
 * @param {string} stateCode - Administrative state code (e.g. 'IN-MH')
 * @param {Array} [projects=PROJECTS]
 * @returns {string[]} Alphabetically sorted list of unique city names.
 */
export const getPublishedCitiesByState = (stateCode, projects = PROJECTS) => {
  if (!stateCode || typeof stateCode !== 'string' || !isValidStateCode(stateCode)) return [];

  const published = getPublishedProjects(projects);
  const citiesSet = new Set();

  published.forEach((p) => {
    if (p.stateCode === stateCode && typeof p.city === 'string') {
      const trimmed = p.city.trim();
      if (trimmed) {
        citiesSet.add(trimmed);
      }
    }
  });

  return Array.from(citiesSet).sort((a, b) => a.localeCompare(b));
};

/**
 * Selector 4: Retrieve published projects for a specified state.
 * 
 * @param {string} stateCode - Administrative state code (e.g. 'IN-MH')
 * @param {Array} [projects=PROJECTS]
 * @returns {Array} List of published project records in the specified state.
 */
export const getPublishedProjectsByState = (stateCode, projects = PROJECTS) => {
  if (!stateCode || typeof stateCode !== 'string' || !isValidStateCode(stateCode)) return [];

  return getPublishedProjects(projects).filter((p) => p.stateCode === stateCode);
};

/**
 * Selector 5: Retrieve published projects for a specified state and city.
 * 
 * @param {string} stateCode - Administrative state code (e.g. 'IN-MH')
 * @param {string} city - City name (case-insensitive)
 * @param {Array} [projects=PROJECTS]
 * @returns {Array} List of published project records in the specified city.
 */
export const getPublishedProjectsByStateAndCity = (stateCode, city, projects = PROJECTS) => {
  if (
    !stateCode || 
    !city || 
    typeof stateCode !== 'string' || 
    typeof city !== 'string' || 
    !isValidStateCode(stateCode)
  ) {
    return [];
  }

  const normalizedCity = city.trim().toLowerCase();
  if (!normalizedCity) return [];

  return getPublishedProjects(projects).filter(
    (p) => p.stateCode === stateCode && 
           typeof p.city === 'string' && 
           p.city.trim().toLowerCase() === normalizedCity
  );
};

/**
 * Selector 6: Retrieve count of published projects for a specified state.
 * 
 * @param {string} stateCode - Administrative state code (e.g. 'IN-MH')
 * @param {Array} [projects=PROJECTS]
 * @returns {number} Integer count of published projects.
 */
export const getPublishedProjectCountByState = (stateCode, projects = PROJECTS) => {
  if (!stateCode || typeof stateCode !== 'string' || !isValidStateCode(stateCode)) return 0;
  return getPublishedProjectsByState(stateCode, projects).length;
};

/**
 * Selector 7: Aggregate count of published projects mapped by state code.
 * 
 * @param {Array} [projects=PROJECTS]
 * @returns {Object.<string, number>} Map of { [stateCode]: count }
 */
export const getPublishedProjectCounts = (projects = PROJECTS) => {
  const published = getPublishedProjects(projects);
  const counts = {};

  published.forEach((p) => {
    if (typeof p.stateCode === 'string' && isValidStateCode(p.stateCode)) {
      counts[p.stateCode] = (counts[p.stateCode] || 0) + 1;
    }
  });

  return counts;
};

/**
 * Selector 8: Retrieve administrative metadata for a state code from the registry.
 * 
 * @param {string} stateCode - Administrative code (e.g. 'IN-MH')
 * @returns {{ code: string, name: string, type: 'State'|'UT' } | null}
 */
export const getStateDetails = (stateCode) => {
  if (!stateCode || typeof stateCode !== 'string') return null;
  return STATE_BY_CODE[stateCode] || null;
};

/**
 * Selector 9: Retrieve a single published project by its unique ID.
 * Returns null if record does not exist or has non-published lifecycle status (draft/verified).
 * 
 * @param {string} id - Project ID (e.g. 'proj-001')
 * @param {Array} [projects=PROJECTS]
 * @returns {Object|null} Sanitized public project record or null
 */
export const getPublishedProjectById = (id, projects = PROJECTS) => {
  if (!id || typeof id !== 'string') return null;
  const published = getPublishedProjects(projects);
  return published.find((p) => p.id === id) || null;
};

/**
 * Selector 10: Retrieve published projects matching an engineering category.
 * 
 * @param {string} category - Category slug ('infrastructure' | 'distribution' | 'lighting')
 * @param {Array} [projects=PROJECTS]
 * @returns {Array} List of matching published projects
 */
export const getPublishedProjectsByCategory = (category, projects = PROJECTS) => {
  if (!category || typeof category !== 'string') return [];
  return getPublishedProjects(projects).filter((p) => p.category === category);
};

/**
 * Selector 11: Multi-criteria filtering for published projects.
 * Supports concurrent category, stateCode, and municipal city filtering.
 * 
 * @param {Object} [filters={}]
 * @param {string} [filters.category] - Optional category slug
 * @param {string} [filters.stateCode] - Optional ISO state code
 * @param {string} [filters.city] - Optional city name (case-insensitive)
 * @param {Array} [projects=PROJECTS]
 * @returns {Array} Filtered list of published projects
 */
export const getFilteredPublishedProjects = (
  { category = null, stateCode = null, city = null } = {},
  projects = PROJECTS
) => {
  let list = getPublishedProjects(projects);

  if (category && typeof category === 'string') {
    list = list.filter((p) => p.category === category);
  }

  if (stateCode && typeof stateCode === 'string') {
    if (!isValidStateCode(stateCode)) return [];
    list = list.filter((p) => p.stateCode === stateCode);
  }

  if (city && typeof city === 'string') {
    const normalizedCity = city.trim().toLowerCase();
    if (normalizedCity) {
      list = list.filter(
        (p) => typeof p.city === 'string' && p.city.trim().toLowerCase() === normalizedCity
      );
    }
  }

  return list;
};

/**
 * Selector 12: Retrieve verified geographic coverage state codes (e.g. ['IN-MH', 'IN-RJ']).
 * @returns {string[]}
 */
export const getCoverageStateCodes = () => {
  return Object.keys(VERIFIED_GEOGRAPHIC_COVERAGE).sort();
};

/**
 * Selector 13: Retrieve verified geographic coverage cities for a specified state code.
 * @param {string} stateCode - Administrative state code (e.g. 'IN-RJ')
 * @returns {string[]}
 */
export const getCoverageCitiesByState = (stateCode) => {
  if (!stateCode || typeof stateCode !== 'string') return [];
  const record = VERIFIED_GEOGRAPHIC_COVERAGE[stateCode];
  return record ? [...record.cities] : [];
};

/**
 * Selector 14: Retrieve active state codes across verified coverage AND published projects.
 * Used for map visualization (IndiaMapSvg) and presence navigation.
 * 
 * @param {Array} [projects=PROJECTS]
 * @returns {string[]} Sorted array of unique ISO state codes.
 */
export const getActiveStateCodes = (projects = PROJECTS) => {
  const coverageCodes = getCoverageStateCodes();
  const publishedCodes = getPublishedStateCodes(projects);
  const combined = new Set([...coverageCodes, ...publishedCodes]);
  return Array.from(combined).sort();
};

/**
 * Selector 15: Retrieve unique cities across verified coverage AND published projects for a state.
 * 
 * @param {string} stateCode - Administrative state code (e.g. 'IN-RJ')
 * @param {Array} [projects=PROJECTS]
 * @returns {string[]} List of unique municipal cities.
 */
export const getCitiesByState = (stateCode, projects = PROJECTS) => {
  if (!stateCode || typeof stateCode !== 'string' || !isValidStateCode(stateCode)) return [];
  const coverageCities = getCoverageCitiesByState(stateCode);
  const publishedCities = getPublishedCitiesByState(stateCode, projects);
  const combined = new Set([...coverageCities, ...publishedCities]);
  return Array.from(combined);
};
