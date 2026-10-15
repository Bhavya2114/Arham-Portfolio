/**
 * Splits the boundary of a group of states into its outer outline and the borders shared between
 * two of its states. Neighbouring states in `indiaMapGeometry.js` share exact vertices, so a segment
 * (rounded to 0.1 map units) that appears in two states' paths is an inner, shared border.
 *
 * Returns two path strings ("M x y L x y …"), each shared border drawn once. Computed once per set of
 * states by the caller (not per frame).
 */

const round1 = (v) => Math.round(v * 10) / 10;

/** Parses an M/L/Z path (absolute or relative) into rings of absolute [x, y] points. */
const parseRings = (d) => {
  const tokens = d.match(/[MmLlZz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const rings = [];
  let ring = null;
  let cmd = null;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  for (let i = 0; i < tokens.length; ) {
    const t = tokens[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t;
      i += 1;
      if (cmd === 'z' || cmd === 'Z') {
        if (ring) {
          ring.push([startX, startY]);
          rings.push(ring);
          ring = null;
        }
        x = startX;
        y = startY;
      }
      continue;
    }
    const a = parseFloat(tokens[i]);
    const b = parseFloat(tokens[i + 1]);
    i += 2;
    const absolute = cmd === 'M' || cmd === 'L';
    x = round1(absolute ? a : x + a);
    y = round1(absolute ? b : y + b);
    if (cmd === 'M' || cmd === 'm') {
      if (ring) rings.push(ring);
      ring = [[x, y]];
      startX = x;
      startY = y;
      cmd = cmd === 'M' ? 'L' : 'l'; // further pairs after a move are line-tos
    } else if (ring) {
      ring.push([x, y]);
    }
  }
  if (ring) rings.push(ring);
  return rings;
};

const segmentKey = (p, q) => {
  const a = `${p[0]},${p[1]}`;
  const b = `${q[0]},${q[1]}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
};

/** @param {{ d: string }[]} states  @returns {{ outer: string, shared: string }} */
export const splitRegionEdges = (states) => {
  const ringsByState = states.map((state) => parseRings(state.d));
  const counts = new Map();
  ringsByState.forEach((rings) =>
    rings.forEach((ring) => {
      for (let i = 1; i < ring.length; i += 1) {
        const k = segmentKey(ring[i - 1], ring[i]);
        counts.set(k, (counts.get(k) || 0) + 1);
      }
    })
  );

  const out = { outer: [], shared: [] };
  const drawnShared = new Set();
  ringsByState.forEach((rings) =>
    rings.forEach((ring) => {
      let run = null; // { kind, points }
      const flush = () => {
        if (run && run.points.length > 1) {
          out[run.kind].push(`M${run.points[0].join(' ')}L${run.points.slice(1).map((p) => p.join(' ')).join(' ')}`);
        }
        run = null;
      };
      for (let i = 1; i < ring.length; i += 1) {
        const p = ring[i - 1];
        const q = ring[i];
        if (p[0] === q[0] && p[1] === q[1]) continue;
        const k = segmentKey(p, q);
        const kind = counts.get(k) > 1 ? 'shared' : 'outer';
        if (kind === 'shared') {
          if (drawnShared.has(k)) {
            flush();
            continue;
          }
          drawnShared.add(k);
        }
        if (!run || run.kind !== kind) {
          flush();
          run = { kind, points: [p] };
        }
        run.points.push(q);
      }
      flush();
    })
  );
  return { outer: out.outer.join(''), shared: out.shared.join('') };
};
