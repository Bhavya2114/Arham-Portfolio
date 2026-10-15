import { pathToFileURL } from 'url';
export const load = async (repo) => {
  const { INDIA_MAP_STATES } = await import(pathToFileURL(repo + '/src/components/map/indiaMapGeometry.js').href);
  const { projectLatLon } = await import(pathToFileURL(repo + '/src/lib/mapProjection.js').href);
  const { PRESENCE_COVERAGE } = await import(pathToFileURL(repo + '/src/data/presenceCoverage.js').href);
  const { CITY_COORDINATES } = await import(pathToFileURL(repo + '/src/data/cityCoordinates.js').href);
  return { INDIA_MAP_STATES, projectLatLon, PRESENCE_COVERAGE, CITY_COORDINATES };
};
export const parseRings = (d) => {
  const toks = d.match(/[MmLlZz]|-?\d*\.?\d+/g); const rings = []; let ring, cmd, x = 0, y = 0, sx = 0, sy = 0, i = 0;
  while (i < toks.length) { const t = toks[i]; if (/[A-Za-z]/.test(t)) { cmd = t; i++; if (cmd === 'z' || cmd === 'Z') { x = sx; y = sy; } continue; }
    const a = +toks[i], b = +toks[i + 1]; i += 2;
    if (cmd === 'M' || cmd === 'm') { if (cmd === 'M') { x = a; y = b; } else { x += a; y += b; } sx = x; sy = y; ring = [[x, y]]; rings.push(ring); cmd = cmd === 'M' ? 'L' : 'l'; }
    else { if (cmd === 'l') { x += a; y += b; } else { x = a; y = b; } ring.push([x, y]); } }
  return rings;
};
export const inside = (rings, px, py) => { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; } return c; };
export const distToRings = (rings, px, py) => { let m = Infinity; for (const r of rings) for (let i = 0; i < r.length - 1; i++) { const [x1, y1] = r[i], [x2, y2] = r[i + 1]; const dx = x2 - x1, dy = y2 - y1; const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1))); m = Math.min(m, Math.hypot(px - x1 - t * dx, py - y1 - t * dy)); } return m; };
export const ringArea = (r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
// Douglas–Peucker
export const simplify = (pts, tol) => {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) { const [a, b] = stack.pop(); let maxD = 0, idx = -1; const [x1, y1] = pts[a], [x2, y2] = pts[b]; const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-12;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len; if (d > maxD) { maxD = d; idx = i; } }
    if (maxD > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); } }
  return pts.filter((_, i) => keep[i]);
};
// Interior point via horizontal scanline through the ring's vertical middle (widest span).
export const interiorPoint = (ring) => {
  const ys = ring.map((p) => p[1]); const y = (Math.min(...ys) + Math.max(...ys)) / 2 + 1e-7;
  const xs = []; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y)) xs.push(xi + (y - yi) * (xj - xi) / (yj - yi)); }
  xs.sort((a, b) => a - b); let best = null;
  for (let k = 0; k + 1 < xs.length; k += 2) { const w = xs[k + 1] - xs[k]; if (!best || w > best.w) best = { w, x: (xs[k] + xs[k + 1]) / 2 }; }
  return best ? [best.x, y] : ring[0];
};
export const toPath = (rings) => rings.map((r) => 'M' + r.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L') + 'Z').join('');
// Closed-ring simplification: split at the vertex farthest from the start, simplify both halves.
export const simplifyRing = (ring, tol) => {
  if (ring.length < 5) return ring;
  const [x0, y0] = ring[0]; let far = 1, fd = -1;
  ring.forEach(([x, y], i) => { const d = Math.hypot(x - x0, y - y0); if (d > fd) { fd = d; far = i; } });
  const a = simplify(ring.slice(0, far + 1), tol), b = simplify(ring.slice(far), tol);
  return [...a, ...b.slice(1)];
};
