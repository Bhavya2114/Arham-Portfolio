/**
 * Lazy per-state geography for the /presence map (district lines + city-area outlines).
 *
 * Each coverage state has a generated module in ./states/ that is code-split by Vite and
 * fetched only when that state is selected, so none of this data reaches the homepage or
 * the initial /presence chunk. Modules are produced by the boundary build script from the
 * sources below; adding a verified city boundary means regenerating that state's module,
 * with no component changes.
 *
 * Module shape (already projected to the map's SVG units via src/lib/mapProjection.js):
 * {
 *   stateCode: 'IN-RJ',
 *   districts: [{ name, d }],
 *   cities: { [cityName]: { d, bbox: [minX, minY, maxX, maxY], kind, source: { ref, url } } }
 * }
 * A coverage city missing from `cities` has no verified area boundary yet; the map then
 * falls back to a reference-point view and says so.
 */

const LOADERS = {
  'IN-AS': () => import('./states/IN-AS.js'),
  'IN-BR': () => import('./states/IN-BR.js'),
  'IN-CT': () => import('./states/IN-CT.js'),
  'IN-GA': () => import('./states/IN-GA.js'),
  'IN-GJ': () => import('./states/IN-GJ.js'),
  'IN-JH': () => import('./states/IN-JH.js'),
  'IN-MH': () => import('./states/IN-MH.js'),
  'IN-OR': () => import('./states/IN-OR.js'),
  'IN-RJ': () => import('./states/IN-RJ.js'),
  'IN-UP': () => import('./states/IN-UP.js'),
  'IN-WB': () => import('./states/IN-WB.js'),
};

export const GEOGRAPHY_SOURCES = Object.freeze({
  districts: Object.freeze({
    name: 'geoBoundaries gbOpen IND ADM2 (2021)',
    origin: 'Pathways Data Pvt. Ltd. / Local Government Directory (lgdirectory.gov.in)',
    licence: 'ODbL 1.0',
    url: 'https://www.geoboundaries.org/',
  }),
  cities: Object.freeze({
    name: 'OpenStreetMap municipal / city-area boundaries',
    origin: 'OpenStreetMap contributors',
    licence: 'ODbL 1.0',
    url: 'https://www.openstreetmap.org/copyright',
  }),
});

export const hasStateGeography = (stateCode) => Object.prototype.hasOwnProperty.call(LOADERS, stateCode);

/**
 * @param {string} stateCode
 * @returns {Promise<Object|null>} the state's geography module, or null when none exists
 */
export const loadStateGeography = async (stateCode) => {
  if (!hasStateGeography(stateCode)) return null;
  const mod = await LOADERS[stateCode]();
  return mod.default || null;
};

export default loadStateGeography;
