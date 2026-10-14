/**
 * City Coordinate Record — Phase C (approved; rendered as /presence city markers)
 *
 * Coordinates for the 27 cities in `presenceCoverage.js`, researched on 2026-10-14.
 * Approved for use on 2026-10-14. Rendered by the /presence page via `mapProjection.js`.
 *
 * Method:
 * - Primary: OpenStreetMap settlement point (place=city/town) found with Nominatim.
 *   Nagpur and Kolkata only return a city-boundary centroid there, so their primary
 *   value is the English Wikipedia article coordinate instead.
 * - Cross-check: an independent second source for every city (Wikipedia/Wikidata or OSM).
 *   All 27 pairs agree within 2.85 km. On the map that is < 1 SVG unit (1 unit ≈ 4 km).
 * - Projection check: every coordinate from both sources, once projected with
 *   `src/lib/mapProjection.js`, lands inside its own state's outline in `indiaMapGeometry.js`.
 * - Chhatrapati Sambhaji Nagar is the official name of the city formerly called
 *   Aurangabad (Wikipedia article "Aurangabad", Q200713). Bilaspur is Bilaspur, Chhattisgarh.
 *
 * Attribution: OpenStreetMap data © OpenStreetMap contributors, ODbL 1.0
 * (https://www.openstreetmap.org/copyright). Must be credited wherever markers are shown.
 */

export const CITY_COORDINATES_STATUS = 'approved';

export const CITY_COORDINATES = Object.freeze([
  { stateCode: "IN-RJ", city: "Jaipur", lat: 26.9155, lon: 75.819,
    source: { name: "OpenStreetMap", ref: "node/315734346", url: "https://www.openstreetmap.org/node/315734346" },
    crossCheck: { name: "Wikipedia", ref: "Jaipur (Q66485)", lat: 26.915, lon: 75.82, url: "https://en.wikipedia.org/wiki/Jaipur", distanceKm: 0.11 } },
  { stateCode: "IN-RJ", city: "Jodhpur", lat: 26.2968, lon: 73.0351,
    source: { name: "OpenStreetMap", ref: "way/31725312", url: "https://www.openstreetmap.org/way/31725312" },
    crossCheck: { name: "Wikipedia", ref: "Jodhpur (Q200019)", lat: 26.28, lon: 73.02, url: "https://en.wikipedia.org/wiki/Jodhpur", distanceKm: 2.4 } },
  { stateCode: "IN-RJ", city: "Udaipur", lat: 24.5787, lon: 73.6863,
    source: { name: "OpenStreetMap", ref: "node/2409551371", url: "https://www.openstreetmap.org/node/2409551371" },
    crossCheck: { name: "Wikipedia", ref: "Udaipur (Q200340)", lat: 24.58, lon: 73.68, url: "https://en.wikipedia.org/wiki/Udaipur", distanceKm: 0.65 } },
  { stateCode: "IN-RJ", city: "Kota", lat: 25.1737, lon: 75.8574,
    source: { name: "OpenStreetMap", ref: "node/245730439", url: "https://www.openstreetmap.org/node/245730439" },
    crossCheck: { name: "Wikipedia", ref: "Kota, Rajasthan (Q330531)", lat: 25.18, lon: 75.83, url: "https://en.wikipedia.org/wiki/Kota%2C_Rajasthan", distanceKm: 2.85 } },
  { stateCode: "IN-RJ", city: "Bikaner", lat: 28.0159, lon: 73.3171,
    source: { name: "OpenStreetMap", ref: "node/1405754324", url: "https://www.openstreetmap.org/node/1405754324" },
    crossCheck: { name: "Wikipedia", ref: "Bikaner (Q200718)", lat: 28.0167, lon: 73.3119, url: "https://en.wikipedia.org/wiki/Bikaner", distanceKm: 0.52 } },
  { stateCode: "IN-RJ", city: "Sikar", lat: 27.6092, lon: 75.1396,
    source: { name: "OpenStreetMap", ref: "node/877257867", url: "https://www.openstreetmap.org/node/877257867" },
    crossCheck: { name: "Wikipedia", ref: "Sikar (Q33334)", lat: 27.62, lon: 75.15, url: "https://en.wikipedia.org/wiki/Sikar", distanceKm: 1.58 } },
  { stateCode: "IN-RJ", city: "Jhunjhunu", lat: 28.1288, lon: 75.3993,
    source: { name: "OpenStreetMap", ref: "node/1399049982", url: "https://www.openstreetmap.org/node/1399049982" },
    crossCheck: { name: "Wikipedia", ref: "Jhunjhunu (Q1006350)", lat: 28.1289, lon: 75.3995, url: "https://en.wikipedia.org/wiki/Jhunjhunu", distanceKm: 0.03 } },
  { stateCode: "IN-RJ", city: "Taranagar", lat: 28.6708, lon: 75.0361,
    source: { name: "OpenStreetMap", ref: "node/1399193226", url: "https://www.openstreetmap.org/node/1399193226" },
    crossCheck: { name: "Wikipedia", ref: "Taranagar (Q2248494)", lat: 28.6689, lon: 75.0406, url: "https://en.wikipedia.org/wiki/Taranagar", distanceKm: 0.48 } },
  { stateCode: "IN-MH", city: "Mumbai", lat: 19.055, lon: 72.8692,
    source: { name: "OpenStreetMap", ref: "node/16173235", url: "https://www.openstreetmap.org/node/16173235" },
    crossCheck: { name: "Wikipedia", ref: "Mumbai (Q1156)", lat: 19.0761, lon: 72.8775, url: "https://en.wikipedia.org/wiki/Mumbai", distanceKm: 2.5 } },
  { stateCode: "IN-MH", city: "Pune", lat: 18.5214, lon: 73.8545,
    source: { name: "OpenStreetMap", ref: "node/16174445", url: "https://www.openstreetmap.org/node/16174445" },
    crossCheck: { name: "Wikipedia", ref: "Pune (Q1538)", lat: 18.5211, lon: 73.8553, url: "https://en.wikipedia.org/wiki/Pune", distanceKm: 0.09 } },
  { stateCode: "IN-MH", city: "Nagpur", lat: 21.1498, lon: 79.0806,
    source: { name: "Wikipedia", ref: "Nagpur", url: "https://en.wikipedia.org/wiki/Nagpur" },
    crossCheck: { name: "OpenStreetMap", ref: "relation/12969115 (city boundary centroid)", lat: 21.1498, lon: 79.0821, url: "https://www.openstreetmap.org/relation/12969115", distanceKm: 0.15 } },
  { stateCode: "IN-MH", city: "Nashik", lat: 20.0112, lon: 73.7902,
    source: { name: "OpenStreetMap", ref: "node/245686763", url: "https://www.openstreetmap.org/node/245686763" },
    crossCheck: { name: "Wikipedia", ref: "Nashik (Q200235)", lat: 19.9975, lon: 73.7898, url: "https://en.wikipedia.org/wiki/Nashik", distanceKm: 1.53 } },
  { stateCode: "IN-MH", city: "Chhatrapati Sambhaji Nagar", lat: 19.8773, lon: 75.339,
    source: { name: "OpenStreetMap", ref: "node/245686245", url: "https://www.openstreetmap.org/node/245686245" },
    crossCheck: { name: "Wikipedia", ref: "Aurangabad (Q200713)", lat: 19.88, lon: 75.32, url: "https://en.wikipedia.org/wiki/Aurangabad", distanceKm: 2.01 } },
  { stateCode: "IN-MH", city: "Akola", lat: 20.7117, lon: 77.0026,
    source: { name: "OpenStreetMap", ref: "node/245690517", url: "https://www.openstreetmap.org/node/245690517" },
    crossCheck: { name: "Wikipedia", ref: "Akola (Q213014)", lat: 20.7, lon: 77, url: "https://en.wikipedia.org/wiki/Akola", distanceKm: 1.33 } },
  { stateCode: "IN-MH", city: "Nanded", lat: 19.1693, lon: 77.311,
    source: { name: "OpenStreetMap", ref: "node/1185686412", url: "https://www.openstreetmap.org/node/1185686412" },
    crossCheck: { name: "Wikipedia", ref: "Nanded (Q855122)", lat: 19.15, lon: 77.3, url: "https://en.wikipedia.org/wiki/Nanded", distanceKm: 2.44 } },
  { stateCode: "IN-MH", city: "Latur", lat: 18.3982, lon: 76.5626,
    source: { name: "OpenStreetMap", ref: "node/245644629", url: "https://www.openstreetmap.org/node/245644629" },
    crossCheck: { name: "Wikipedia", ref: "Latur (Q61394)", lat: 18.4, lon: 76.56, url: "https://en.wikipedia.org/wiki/Latur", distanceKm: 0.34 } },
  { stateCode: "IN-GJ", city: "Ahmedabad", lat: 23.0215, lon: 72.5801,
    source: { name: "OpenStreetMap", ref: "node/245711197", url: "https://www.openstreetmap.org/node/245711197" },
    crossCheck: { name: "Wikipedia", ref: "Ahmedabad (Q1070)", lat: 23.0225, lon: 72.5714, url: "https://en.wikipedia.org/wiki/Ahmedabad", distanceKm: 0.89 } },
  { stateCode: "IN-GJ", city: "Vadodara", lat: 22.2973, lon: 73.1943,
    source: { name: "OpenStreetMap", ref: "node/2022807192", url: "https://www.openstreetmap.org/node/2022807192" },
    crossCheck: { name: "Wikipedia", ref: "Vadodara (Q11909)", lat: 22.3, lon: 73.2, url: "https://en.wikipedia.org/wiki/Vadodara", distanceKm: 0.66 } },
  { stateCode: "IN-CT", city: "Raipur", lat: 21.2381, lon: 81.6337,
    source: { name: "OpenStreetMap", ref: "node/5308437250", url: "https://www.openstreetmap.org/node/5308437250" },
    crossCheck: { name: "Wikipedia", ref: "Raipur (Q372773)", lat: 21.2444, lon: 81.6306, url: "https://en.wikipedia.org/wiki/Raipur", distanceKm: 0.78 } },
  { stateCode: "IN-CT", city: "Bilaspur", lat: 22.0786, lon: 82.1476,
    source: { name: "OpenStreetMap", ref: "node/245702560", url: "https://www.openstreetmap.org/node/245702560" },
    crossCheck: { name: "Wikipedia", ref: "Bilaspur, Chhattisgarh (Q860452)", lat: 22.09, lon: 82.15, url: "https://en.wikipedia.org/wiki/Bilaspur%2C_Chhattisgarh", distanceKm: 1.29 } },
  { stateCode: "IN-WB", city: "Kolkata", lat: 22.5675, lon: 88.37,
    source: { name: "Wikipedia", ref: "Kolkata", url: "https://en.wikipedia.org/wiki/Kolkata" },
    crossCheck: { name: "OpenStreetMap", ref: "relation/9381363 (city boundary centroid)", lat: 22.5726, lon: 88.3639, url: "https://www.openstreetmap.org/relation/9381363", distanceKm: 0.85 } },
  { stateCode: "IN-WB", city: "Siliguri", lat: 26.7164, lon: 88.431,
    source: { name: "OpenStreetMap", ref: "way/22826546", url: "https://www.openstreetmap.org/way/22826546" },
    crossCheck: { name: "Wikipedia", ref: "Siliguri (Q5087)", lat: 26.71, lon: 88.43, url: "https://en.wikipedia.org/wiki/Siliguri", distanceKm: 0.72 } },
  { stateCode: "IN-BR", city: "Patna", lat: 25.6093, lon: 85.1235,
    source: { name: "OpenStreetMap", ref: "way/383774533", url: "https://www.openstreetmap.org/way/383774533" },
    crossCheck: { name: "Wikipedia", ref: "Patna (Q80484)", lat: 25.5939, lon: 85.1375, url: "https://en.wikipedia.org/wiki/Patna", distanceKm: 2.22 } },
  { stateCode: "IN-JH", city: "Ranchi", lat: 23.3701, lon: 85.325,
    source: { name: "OpenStreetMap", ref: "node/2510123017", url: "https://www.openstreetmap.org/node/2510123017" },
    crossCheck: { name: "Wikipedia", ref: "Ranchi (Q174461)", lat: 23.36, lon: 85.33, url: "https://en.wikipedia.org/wiki/Ranchi", distanceKm: 1.23 } },
  { stateCode: "IN-OR", city: "Bhubaneswar", lat: 20.2603, lon: 85.8395,
    source: { name: "OpenStreetMap", ref: "node/1051669585", url: "https://www.openstreetmap.org/node/1051669585" },
    crossCheck: { name: "Wikipedia", ref: "Bhubaneswar (Q171771)", lat: 20.27, lon: 85.84, url: "https://en.wikipedia.org/wiki/Bhubaneswar", distanceKm: 1.08 } },
  { stateCode: "IN-AS", city: "Guwahati", lat: 26.1806, lon: 91.7539,
    source: { name: "OpenStreetMap", ref: "node/566672802", url: "https://www.openstreetmap.org/node/566672802" },
    crossCheck: { name: "Wikipedia", ref: "Guwahati (Q199605)", lat: 26.1722, lon: 91.7458, url: "https://en.wikipedia.org/wiki/Guwahati", distanceKm: 1.23 } },
  { stateCode: "IN-GA", city: "Panaji", lat: 15.499, lon: 73.8282,
    source: { name: "OpenStreetMap", ref: "node/1687216929", url: "https://www.openstreetmap.org/node/1687216929" },
    crossCheck: { name: "Wikipedia", ref: "Panaji (Q214681)", lat: 15.4989, lon: 73.8278, url: "https://en.wikipedia.org/wiki/Panaji", distanceKm: 0.05 } },
]);

export default CITY_COORDINATES;
