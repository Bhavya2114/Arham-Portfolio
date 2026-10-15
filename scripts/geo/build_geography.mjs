/**
 * Builds src/data/geo/states/IN-XX.js for the 11 coverage states:
 *   - district lines (geoBoundaries IND ADM2 2021, ODbL)
 *   - verified city-area outlines from the sources listed in CITY_SOURCES
 * Every city outline must contain the city's approved reference point and have a plausible
 * area, or the build fails. Usage: node build_geography.mjs <repo> <geo-data-dir>
 */
import fs from 'fs';
import polygonClipping from 'polygon-clipping';
import { load, parseRings, inside, distToRings, ringArea, simplifyRing, interiorPoint } from './geo_common.mjs';

const [repo, dataDir] = process.argv.slice(2);
const { INDIA_MAP_STATES, projectLatLon, PRESENCE_COVERAGE, CITY_COORDINATES } = await load(repo);
const outDir = `${repo}/src/data/geo/states`;
const DISTRICT_TOL = 0.12; // ≈ 0.5 km
const CITY_TOL = 0.015; // ≈ 60 m
const readJSON = (f) => JSON.parse(fs.readFileSync(`${dataDir}/${f}`, 'utf8'));

const adm2 = readJSON('ind_adm2_simplified.geojson');
const nominatim = readJSON('city_nominatim.json');
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
const unionGeoms = (geoms) => ({ type: 'MultiPolygon', coordinates: polygonClipping.union(...geoms.map((g) => polysOf(g))) });

const osm = (key) => { const c = nominatim[key]?.chosen; if (!c) throw new Error(`no OSM choice for ${key}`); return c; };
const CITY_SOURCES = {
  'IN-RJ|Jaipur': () => ({ geom: osm('IN-RJ|Jaipur').geojson, kind: 'municipal', label: 'Jaipur Municipal Corporation (OSM)', ref: osm('IN-RJ|Jaipur').ref, licence: 'ODbL 1.0' }),
  'IN-RJ|Jodhpur': () => ({ geom: osm('IN-RJ|Jodhpur').geojson, kind: 'osm-place-area', label: 'OSM place=city area (not an official municipal limit)', ref: osm('IN-RJ|Jodhpur').ref, licence: 'ODbL 1.0' }),
  'IN-MH|Nagpur': () => ({ geom: osm('IN-MH|Nagpur').geojson, kind: 'municipal', label: 'Nagpur City (OSM admin_level 8)', ref: osm('IN-MH|Nagpur').ref, licence: 'ODbL 1.0' }),
  // Akola deliberately excluded: OSM relation/14237563 "Akola (M Corp.)" covers ~8 km² versus the
  // corporation's ~124 km² after its 2016 expansion, so it is incomplete and would misrepresent the city.
  'IN-MH|Mumbai': () => ({ geom: unionGeoms(adm2.features.filter((f) => ['Mumbai', 'Mumbai Suburban'].includes(f.properties.shapeName)).map((f) => f.geometry)), kind: 'municipal-equivalent', label: 'Mumbai City + Mumbai Suburban districts (= MCGM jurisdiction), geoBoundaries/LGD', ref: 'geoBoundaries IND ADM2', licence: 'ODbL 1.0' }),
  'IN-MH|Pune': () => ({ geom: unionGeoms(readJSON('pune_answerquest.geojson').features.map((f) => f.geometry)), kind: 'municipal', label: 'Pune Municipal Corporation, union of 2022 electoral wards (answerquest/pune-2022-wards)', ref: 'github.com/answerquest/pune-2022-wards', licence: 'MIT' }),
  // Ahmedabad: approved by the site owner for use under CC BY-SA 2.5 India (ShareAlike). The derived
  // Gujarat module is therefore marked CC BY-SA 2.5 IN as a whole (see SHARE_ALIKE below).
  'IN-GJ|Ahmedabad': () => ({ geom: unionGeoms(readJSON('datameet/Ahmedabad_Wards.geojson').features.map((f) => f.geometry)), kind: 'municipal', label: 'Ahmedabad Municipal Corporation, union of 48 wards (DataMeet, digitised from an AMC Google My Map)', ref: 'github.com/datameet/Municipal_Spatial_Data/tree/master/Ahmedabad', licence: 'CC BY-SA 2.5 IN' }),
  'IN-GJ|Vadodara': () => ({ geom: unionGeoms(readJSON('datameet/Vadodara_vardodara_wards.geojson').features.map((f) => f.geometry)), kind: 'municipal', label: 'Vadodara Municipal Corporation, union of 12 administrative wards (DataMeet, from VMC)', ref: 'github.com/datameet/Municipal_Spatial_Data/tree/master/Vadodara', licence: 'CC BY 4.0' }),
  'IN-WB|Kolkata': () => ({ geom: osm('IN-WB|Kolkata').geojson, kind: 'municipal', label: 'Kolkata (OSM admin_level 8)', ref: osm('IN-WB|Kolkata').ref, licence: 'ODbL 1.0' }),
  'IN-WB|Siliguri': () => ({ geom: osm('IN-WB|Siliguri').geojson, kind: 'osm-place-area', label: 'OSM place=city area (not an official municipal limit)', ref: osm('IN-WB|Siliguri').ref, licence: 'ODbL 1.0' }),
  'IN-BR|Patna': () => ({ geom: osm('IN-BR|Patna').geojson, kind: 'osm-place-area', label: 'OSM place=city area (not an official municipal limit)', ref: osm('IN-BR|Patna').ref, licence: 'ODbL 1.0' }),
  'IN-OR|Bhubaneswar': () => ({ geom: osm('IN-OR|Bhubaneswar').geojson, kind: 'municipal', label: 'Bhubaneswar Municipal Corporation (OSM)', ref: osm('IN-OR|Bhubaneswar').ref, licence: 'ODbL 1.0' }),
  // Taranagar (~35k people) is below Natural Earth's resolution and has no OSM landuse; its footprint is
  // derived from Microsoft building detections by scripts/geo/buildup_footprint.mjs (method in label).
  'IN-RJ|Taranagar': () => ({
    geom: readJSON('taranagar_buildup.geojson').geometry,
    kind: 'urban-footprint',
    confidence: 'medium',
    tol: 0.03,
    label: 'Approximate built-up footprint derived from Microsoft Global ML Building Footprints (100 m grid, ≥3 buildings per cell, 200 m gap closing)',
    ref: 'github.com/microsoft/GlobalMLBuildingFootprints',
    licence: 'ODbL 1.0',
  }),
};

// Natural Earth 10m urban areas (public domain): the footprint polygon that contains the city's
// approved reference point. Coarse, satellite-derived (early 2000s), so marked approximate / low confidence.
let naturalEarth = null;
const naturalEarthFootprint = (lat, lon) => {
  naturalEarth ||= readJSON('ne/ne_10m_urban_areas.geojson');
  for (const f of naturalEarth.features) {
    for (const poly of polysOf(f.geometry)) if (inside([poly[0]], lon, lat)) return { type: 'Polygon', coordinates: [poly[0]] };
  }
  throw new Error(`no Natural Earth urban area contains ${lat},${lon}`);
};
const NATURAL_EARTH_CITIES = [
  'IN-RJ|Udaipur', 'IN-RJ|Kota', 'IN-RJ|Bikaner', 'IN-RJ|Sikar', 'IN-RJ|Jhunjhunu',
  'IN-MH|Nashik', 'IN-MH|Chhatrapati Sambhaji Nagar', 'IN-MH|Akola', 'IN-MH|Nanded', 'IN-MH|Latur',
  'IN-CT|Raipur', 'IN-CT|Bilaspur', 'IN-JH|Ranchi', 'IN-AS|Guwahati', 'IN-GA|Panaji',
];
for (const key of NATURAL_EARTH_CITIES) {
  CITY_SOURCES[key] = () => {
    const [stateCode, city] = key.split('|');
    const ref = CITY_COORDINATES.find((c) => c.stateCode === stateCode && c.city === city);
    return {
      geom: naturalEarthFootprint(ref.lat, ref.lon),
      kind: 'urban-footprint',
      confidence: 'low',
      label: 'Approximate urban footprint — Natural Earth 10m urban areas (satellite-derived, early 2000s)',
      ref: 'naturalearthdata.com/downloads/10m-cultural-vectors/10m-urban-area/',
      licence: 'Public domain',
    };
  };
}

// Confidence that the outline represents the city: official limits > curated city areas > derived footprints.
const CONFIDENCE_BY_KIND = { municipal: 'high', 'municipal-equivalent': 'high', 'osm-place-area': 'medium', 'urban-footprint': 'low' };
// Licences that make the whole generated state module an adaptation under the same terms.
const SHARE_ALIKE = {
  'CC BY-SA 2.5 IN': { id: 'CC-BY-SA-2.5-IN', name: 'Creative Commons Attribution-ShareAlike 2.5 India', url: 'https://creativecommons.org/licenses/by-sa/2.5/in/' },
};
const refUrl = (ref) =>
  /^(way|relation|node)\//.test(ref) ? `https://www.openstreetmap.org/${ref}`
    : ref.startsWith('github.com') || ref.startsWith('naturalearthdata.com') ? `https://${ref.startsWith('natural') ? 'www.' : ''}${ref}`
      : 'https://www.geoboundaries.org/';

const stateRings = Object.fromEntries(INDIA_MAP_STATES.map((s) => [s.id, parseRings(s.d)]));
const projectRing = (ring) => ring.map(([lon, lat]) => { const q = projectLatLon(lat, lon); return [q.x, q.y]; });
const toPath = (rings, dp) => rings.map((r) => 'M' + r.map(([x, y]) => `${x.toFixed(dp)} ${y.toFixed(dp)}`).join('L') + 'Z').join('');

// ---- Districts by state ----
const districtsByState = {};
for (const f of adm2.features) {
  const rings = polysOf(f.geometry).map((p) => projectRing(p[0]));
  const main = rings.reduce((a, b) => (ringArea(b) > ringArea(a) ? b : a));
  const [px, py] = interiorPoint(main);
  const st = Object.keys(stateRings).find((id) => inside(stateRings[id], px, py));
  if (st) (districtsByState[st] ||= []).push({ name: f.properties.shapeName, rings });
}

// ---- Cities ----
const report = [];
const citiesByState = {};
for (const c of CITY_COORDINATES) {
  const key = `${c.stateCode}|${c.city}`;
  if (!CITY_SOURCES[key]) { report.push(`${key.padEnd(34)} — no verified boundary`); continue; }
  const src = CITY_SOURCES[key]();
  const llPolys = polysOf(src.geom);
  const containsRef = llPolys.some((p) => inside([p[0]], c.lon, c.lat));
  const areaKm2 = llPolys.reduce((s, p) => s + ringArea(p[0]) * 111.32 * 111.32 * Math.cos((c.lat * Math.PI) / 180), 0);
  if (!containsRef || areaKm2 < 2 || areaKm2 > 1500) throw new Error(`${key} failed validation (contains=${containsRef}, area=${areaKm2.toFixed(1)} km²)`);
  const rings = llPolys.map((p) => simplifyRing(projectRing(p[0]), src.tol || CITY_TOL)).filter((r) => r.length >= 4 && ringArea(r) > 0.0005);
  const pts = rings.flat();
  const inState = pts.filter(([x, y]) => inside(stateRings[c.stateCode], x, y) || distToRings(stateRings[c.stateCode], x, y) <= 0.5).length / pts.length;
  const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
  (citiesByState[c.stateCode] ||= {})[c.city] = {
    d: toPath(rings, 3),
    bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map((v) => +v.toFixed(3)),
    kind: src.kind,
    approximate: !['municipal', 'municipal-equivalent'].includes(src.kind),
    confidence: src.confidence || CONFIDENCE_BY_KIND[src.kind],
    areaKm2: +areaKm2.toFixed(1),
    source: { label: src.label, ref: src.ref, url: refUrl(src.ref), licence: src.licence },
  };
  report.push(`${key.padEnd(34)} ✓ ${src.kind.padEnd(20)} ${(src.confidence || CONFIDENCE_BY_KIND[src.kind]).padEnd(6)} ${areaKm2.toFixed(0).padStart(4)} km²  ${pts.length} pts  in-state ${(inState * 100).toFixed(0)}%  [${src.licence}] ${src.label}`);
}

// ---- Write modules ----
fs.mkdirSync(outDir, { recursive: true });
const sizes = [];
for (const { stateCode } of PRESENCE_COVERAGE) {
  const districts = (districtsByState[stateCode] || [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d) => ({ name: d.name, d: toPath(d.rings.map((r) => simplifyRing(r, DISTRICT_TOL)).filter((r) => r.length >= 4 && ringArea(r) > 0.02), 1) }));
  const cities = citiesByState[stateCode] || {};
  const saSources = Object.entries(cities).filter(([, c]) => SHARE_ALIKE[c.source.licence]);
  const licence = saSources.length
    ? { ...SHARE_ALIKE[saSources[0][1].source.licence], adaptedFrom: saSources.map(([name, c]) => ({ city: name, label: c.source.label, url: c.source.url })) }
    : null;
  const data = { stateCode, ...(licence ? { licence } : {}), districts, cities };
  const body = `/**
 * Geography for ${stateCode} — GENERATED by the boundary build script; do not edit by hand.
 * Coordinates are SVG units of the /presence map (src/lib/mapProjection.js).
 *
 * Districts: geoBoundaries gbOpen IND ADM2 (2021), from Pathways Data Pvt. Ltd. /
 *   Local Government Directory (lgdirectory.gov.in). Licence: ODbL 1.0. Simplified ≈0.5 km.
 * Cities: per-city source, licence and reference recorded in each entry's \`source\`.${licence ? `
 *
 * LICENCE NOTICE — this file as a whole is licensed under ${licence.name}
 * (${licence.id}, ${licence.url}) because it adapts ShareAlike-licensed data:
${licence.adaptedFrom.map((a) => ` *   - ${a.city}: ${a.label} — ${a.url}`).join('\n')}
 * Component sources keep their own terms as recorded per entry (district data: ODbL 1.0).
 * Any redistribution of this file or adaptations of it must keep this notice and licence.` : ''}
 */${licence ? `
/*! @license ${licence.id} — ${licence.name} (${licence.url}).
 * Contains data adapted from: ${licence.adaptedFrom.map((a) => `${a.city} — ${a.url}`).join('; ')}. */` : ''}
export default ${JSON.stringify(data)};
`;
  fs.writeFileSync(`${outDir}/${stateCode}.js`, body);
  sizes.push(`${stateCode}: ${districts.length} districts, ${Object.keys(data.cities).length} city areas, ${(Buffer.byteLength(body) / 1024).toFixed(0)} KB`);
}
console.log(report.join('\n'));
console.log('\n' + sizes.join('\n'));
