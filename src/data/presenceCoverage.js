/**
 * Our Presence Geographic Coverage Configuration — Phase B
 *
 * Single source of truth for geographic coverage, shared by the /presence page and the
 * homepage map (via the coverage selectors): 11 states and 27 named cities.
 * This is a geographic coverage configuration, NOT proof of completed projects.
 * Project records, counts and photographs come exclusively from `projects.js`
 * via the public selectors.
 *
 * Invariants:
 * - Only the states and cities listed here may be highlighted on the Our Presence map.
 * - Uttar Pradesh is highlighted with no cities; no city may be invented for it.
 * - City entries carry names only. Sourced coordinates are recorded separately in
 *   `cityCoordinates.js` (pending approval; see MAP_LICENSE.md, Section 6).
 * - `presenceLevel: 'major'` marks the supplied "heavy presence" states.
 */

import { STATE_BY_CODE } from './states.js';

export const PRESENCE_COVERAGE = Object.freeze([
  Object.freeze({
    stateCode: 'IN-RJ',
    presenceLevel: 'major',
    cities: Object.freeze(['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Sikar', 'Jhunjhunu', 'Taranagar']),
  }),
  Object.freeze({
    stateCode: 'IN-MH',
    presenceLevel: 'major',
    cities: Object.freeze(['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Chhatrapati Sambhaji Nagar', 'Akola', 'Nanded', 'Latur']),
  }),
  Object.freeze({ stateCode: 'IN-GJ', presenceLevel: 'standard', cities: Object.freeze(['Ahmedabad', 'Vadodara']) }),
  Object.freeze({ stateCode: 'IN-CT', presenceLevel: 'standard', cities: Object.freeze(['Raipur', 'Bilaspur']) }),
  Object.freeze({ stateCode: 'IN-WB', presenceLevel: 'standard', cities: Object.freeze(['Kolkata', 'Siliguri']) }),
  Object.freeze({ stateCode: 'IN-UP', presenceLevel: 'standard', cities: Object.freeze([]) }),
  Object.freeze({ stateCode: 'IN-BR', presenceLevel: 'standard', cities: Object.freeze(['Patna']) }),
  Object.freeze({ stateCode: 'IN-JH', presenceLevel: 'standard', cities: Object.freeze(['Ranchi']) }),
  Object.freeze({ stateCode: 'IN-OR', presenceLevel: 'standard', cities: Object.freeze(['Bhubaneswar']) }),
  Object.freeze({ stateCode: 'IN-AS', presenceLevel: 'standard', cities: Object.freeze(['Guwahati']) }),
  Object.freeze({ stateCode: 'IN-GA', presenceLevel: 'standard', cities: Object.freeze(['Panaji']) }),
]);

const COVERAGE_BY_CODE = Object.freeze(
  PRESENCE_COVERAGE.reduce((acc, entry) => {
    acc[entry.stateCode] = entry;
    return acc;
  }, {})
);

/**
 * @returns {string[]} State codes in configuration order (major-presence states first).
 */
export const getPresenceStateCodes = () => PRESENCE_COVERAGE.map((entry) => entry.stateCode);

/**
 * @param {string} stateCode
 * @returns {{ code: string, name: string, type: string, presenceLevel: string, cities: string[] } | null}
 */
export const getPresenceState = (stateCode) => {
  const entry = typeof stateCode === 'string' ? COVERAGE_BY_CODE[stateCode] : null;
  const details = entry ? STATE_BY_CODE[entry.stateCode] : null;
  if (!entry || !details) return null;
  return { ...details, presenceLevel: entry.presenceLevel, cities: [...entry.cities] };
};

/**
 * @param {string} stateCode
 * @returns {string[]} Supplied city names for the state ([] when none were supplied).
 */
export const getPresenceCities = (stateCode) => {
  const entry = typeof stateCode === 'string' ? COVERAGE_BY_CODE[stateCode] : null;
  return entry ? [...entry.cities] : [];
};

/**
 * @returns {{ stateCount: number, cityCount: number }} Totals derived from this configuration.
 */
export const getPresenceTotals = () => ({
  stateCount: PRESENCE_COVERAGE.length,
  cityCount: PRESENCE_COVERAGE.reduce((sum, entry) => sum + entry.cities.length, 0),
});

export default PRESENCE_COVERAGE;
