/**
 * Approximate built-up footprint from Microsoft Global ML Building Footprints (ODbL).
 * 100 m grid; cell is built-up when it holds >= MIN_BUILDINGS building centroids; morphological
 * closing (dilate then erode by CLOSE cells) joins adjacent blocks; keep the 4-connected component
 * containing (or nearest to, within 500 m) the reference point; outline = union of its cells.
 * Usage: node buildup_footprint.mjs <tile.csv.gz> <lat> <lon> <out.geojson>
 */
import fs from 'fs';
import zlib from 'zlib';
import readline from 'readline';
import polygonClipping from 'polygon-clipping';
const [file, latS, lonS, out] = process.argv.slice(2);
const lat0 = +latS, lon0 = +lonS;
const CELL_M = 100, RADIUS_KM = 6, MIN_BUILDINGS = 3, CLOSE = 2;
const dLat = CELL_M / 110570, dLon = CELL_M / (111320 * Math.cos(lat0 * Math.PI / 180));
const N = Math.ceil((RADIUS_KM * 1000) / CELL_M);
const counts = new Map();
let total = 0;
const rl = readline.createInterface({ input: fs.createReadStream(file).pipe(zlib.createGunzip()) });
for await (const line of rl) {
  if (!line.startsWith('{')) continue;
  const m = line.match(/"coordinates":\s*\[\[\[\s*(-?[\d.]+),\s*(-?[\d.]+)/);
  if (!m) continue;
  const lon = +m[1], lat = +m[2];
  const i = Math.floor((lon - lon0) / dLon), j = Math.floor((lat - lat0) / dLat);
  if (Math.abs(i) > N || Math.abs(j) > N) continue;
  total++;
  const k = `${i},${j}`; counts.set(k, (counts.get(k) || 0) + 1);
}
let built = new Set([...counts].filter(([, c]) => c >= MIN_BUILDINGS).map(([k]) => k));
const morph = (set, grow) => {
  const outSet = new Set();
  for (let i = -N - CLOSE; i <= N + CLOSE; i++) for (let j = -N - CLOSE; j <= N + CLOSE; j++) {
    let any = false, all = true;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const has = set.has(`${i + a},${j + b}`); any ||= has; all &&= has; }
    if (grow ? any : all) outSet.add(`${i},${j}`);
  }
  return outSet;
};
let closed = built; for (let s = 0; s < CLOSE; s++) closed = morph(closed, true); for (let s = 0; s < CLOSE; s++) closed = morph(closed, false);
// start cell: reference cell, else nearest built cell within 5 cells
let start = closed.has('0,0') ? '0,0' : null;
if (!start) { let best = Infinity; for (const k of closed) { const [i, j] = k.split(',').map(Number); const d = Math.hypot(i, j); if (d < best && d <= 5) { best = d; start = k; } } }
if (!start) { console.log(JSON.stringify({ ok: false, total, builtCells: built.size })); process.exit(0); }
const comp = new Set([start]); const queue = [start];
while (queue.length) { const [i, j] = queue.pop().split(',').map(Number); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${i + a},${j + b}`; if (closed.has(k) && !comp.has(k)) { comp.add(k); queue.push(k); } } }
const squares = [...comp].map((k) => { const [i, j] = k.split(',').map(Number); const x0 = lon0 + i * dLon, y0 = lat0 + j * dLat; return [[[x0, y0], [x0 + dLon, y0], [x0 + dLon, y0 + dLat], [x0, y0 + dLat], [x0, y0]]]; });
const merged = polygonClipping.union(...squares);
const areaKm2 = comp.size * (CELL_M / 1000) ** 2;
fs.writeFileSync(out, JSON.stringify({ type: 'Feature', properties: { method: `MS buildings, ${CELL_M} m grid, >=${MIN_BUILDINGS} buildings/cell, ${CLOSE * CELL_M} m closing`, buildings: total, cells: comp.size, areaKm2 }, geometry: { type: 'MultiPolygon', coordinates: merged.map((p) => [p[0]]) } }));
console.log(JSON.stringify({ ok: true, buildingsInRadius: total, builtCells: built.size, componentCells: comp.size, areaKm2: +areaKm2.toFixed(2), parts: merged.length, startedAtReference: start === '0,0' }));
