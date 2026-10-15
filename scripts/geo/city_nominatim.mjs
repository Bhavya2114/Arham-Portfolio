import fs from 'fs';
import { load, inside, ringArea } from './geo_common.mjs';
const [repo, out] = process.argv.slice(2);
const { CITY_COORDINATES, PRESENCE_COVERAGE } = await load(repo);
const UA = 'ArhamPortfolioMapResearch/1.0 (https://github.com/Bhavya2114/Arham-Portfolio)';
const STATE = { 'IN-RJ': 'Rajasthan', 'IN-MH': 'Maharashtra', 'IN-GJ': 'Gujarat', 'IN-CT': 'Chhattisgarh', 'IN-WB': 'West Bengal', 'IN-BR': 'Bihar', 'IN-JH': 'Jharkhand', 'IN-OR': 'Odisha', 'IN-AS': 'Assam', 'IN-GA': 'Goa' };
const ALT = { 'Chhatrapati Sambhaji Nagar': ['Chhatrapati Sambhajinagar', 'Aurangabad'] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (url) => { for (let i = 0; i < 5; i++) { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.ok) return r.json(); await sleep(5000 * (i + 1)); } throw new Error(url); };
// lon/lat polygon helpers (geographic, for containment + approximate km² area)
const polysOf = (g) => g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
const containsLL = (g, lat, lon) => polysOf(g).some((p) => inside([p[0]], lon, lat));
const areaKm2 = (g, lat0) => polysOf(g).reduce((s, p) => s + ringArea(p[0]) * 111.32 * 111.32 * Math.cos(lat0 * Math.PI / 180), 0);
const BAD = /district|tehsil|taluka|taluk|subdivision|sub-division|block|division|zila|mandal|circle/i;
const results = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
for (const c of CITY_COORDINATES) {
  const key = `${c.stateCode}|${c.city}`;
  if (results[key]) { console.log(key.padEnd(34), 'cached:', results[key].chosen ? results[key].chosen.label : 'NONE'); continue; }
  const names = [c.city, ...(ALT[c.city] || [])];
  const queries = names.flatMap((n) => [`${n}, ${STATE[c.stateCode]}, India`, `${n} Municipal Corporation, ${STATE[c.stateCode]}`, `${n} Municipal Council, ${STATE[c.stateCode]}`]);
  const seen = new Map();
  for (const q of queries) {
    await sleep(1100);
    const list = await get(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=10&countrycodes=in&polygon_geojson=1&extratags=1&q=${encodeURIComponent(q)}`);
    for (const x of list) if (!seen.has(x.osm_type + x.osm_id)) seen.set(x.osm_type + x.osm_id, x);
  }
  const cands = [...seen.values()].filter((x) => x.geojson && /Polygon/.test(x.geojson.type)).map((x) => ({
    ref: `${x.osm_type}/${x.osm_id}`, name: x.name, cls: `${x.category}/${x.type}`, addresstype: x.addresstype, admin_level: x.extratags?.admin_level || null,
    wikidata: x.extratags?.wikidata || null, contains: containsLL(x.geojson, c.lat, c.lon), areaKm2: +areaKm2(x.geojson, c.lat).toFixed(1), geojson: x.geojson,
  }));
  const ok = cands.filter((k) => k.contains && !BAD.test(k.name) && k.areaKm2 >= 2 && k.areaKm2 <= 1500 && names.some((n) => k.name.toLowerCase().includes(n.toLowerCase().split(' ')[0]))
    && (['city', 'town', 'municipality', 'village'].includes(k.addresstype) || /Municipal|Nagar Nigam|Corporation|Council/i.test(k.name) || k.cls === 'place/city' || k.cls === 'place/town'));
  // Prefer administrative municipal boundaries, then place=city/town areas; smaller area wins ties.
  const score = (k) => (/administrative/.test(k.cls) ? 0 : 1);
  ok.sort((a, b) => score(a) - score(b) || a.areaKm2 - b.areaKm2);
  const chosen = ok[0] ? { ...ok[0], label: `${ok[0].ref} ${ok[0].cls} L${ok[0].admin_level} "${ok[0].name}" ${ok[0].areaKm2} km²` } : null;
  results[key] = { candidates: cands.map(({ geojson, ...rest }) => rest), chosen };
  fs.writeFileSync(out, JSON.stringify(results));
  console.log(key.padEnd(34), chosen ? chosen.label : `NONE (candidates: ${cands.map((k) => `${k.name}[${k.cls},${k.contains ? 'in' : 'out'},${k.areaKm2}km²]`).join('; ') || 'none'})`);
}
