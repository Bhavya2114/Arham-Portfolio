/**
 * TEMPORARY UI-testing adapter — demonstration campus cards for every marked city.
 *
 * Purpose: exercise the floating campus card (positioning, map shift, swipe / slide animation,
 * pagination, city switching) on every city of the approved coverage before real city-specific
 * records exist.
 *
 * - Reuses the 8 existing Kota candidate records by reference: nothing is copied, rewritten or
 *   re-labelled, and no new permanent records are created. Their names, supplied addresses, status
 *   and `arhamWorkConfirmed: false` stay exactly as in `candidateProjectLocations.js`.
 * - The cards still show their real Kota addresses. They are NOT located in the other cities and are
 *   NOT Arham projects; the UI marks them as demonstration data (`demo: true`).
 * - Only cities listed in the approved coverage (`presenceCoverage.js`) receive cards; the coverage
 *   itself is not modified.
 *
 * To remove: set DEMO_CAMPUS_CARDS_ENABLED to false (or delete this file and its use in
 * pages/Presence.jsx). The page then falls back to each city's own candidate records.
 */

import { getPresenceCities } from './presenceCoverage.js';

export const DEMO_CAMPUS_CARDS_ENABLED = true;

/** City whose existing records are reused as the demonstration set. */
export const DEMO_SOURCE_CITY = 'Kota';

/**
 * Campus cards for a city.
 * @param {Record<string, object[]>} recordsByCity - existing candidate records grouped by city
 * @param {string} stateCode
 * @param {string} city
 * @returns {{ locations: object[], demo: boolean }}
 *   `demo` is true when the cards are the reused Kota demonstration set shown for another city.
 */
export const getCampusCardsForCity = (recordsByCity, stateCode, city) => {
  const own = (recordsByCity[city] || []).filter((c) => c.stateCode === stateCode);
  if (!DEMO_CAMPUS_CARDS_ENABLED || !city || !getPresenceCities(stateCode).includes(city)) {
    return { locations: own, demo: false };
  }
  if (city === DEMO_SOURCE_CITY) return { locations: own, demo: false };
  return { locations: recordsByCity[DEMO_SOURCE_CITY] || [], demo: true };
};
