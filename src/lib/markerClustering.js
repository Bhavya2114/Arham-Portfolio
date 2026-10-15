/**
 * Screen-space marker clustering for the /presence project markers.
 *
 * Greedy, order-stable grouping: each point joins the first existing cluster whose centre
 * lies within `radiusPx` on screen at the current zoom; otherwise it starts a new cluster.
 * Cheap enough to recompute on every zoom frame for the small per-city project counts.
 *
 * @param {{ id: string, x: number, y: number }[]} points - SVG user-unit positions
 * @param {number} pxPerUnit - current on-screen pixels per SVG unit
 * @param {number} [radiusPx=36]
 * @returns {{ id: string, x: number, y: number, members: string[] }[]}
 */
export const clusterPoints = (points, pxPerUnit, radiusPx = 36) => {
  const clusters = [];
  const radiusUnits = radiusPx / (pxPerUnit > 0 ? pxPerUnit : 1);
  points.forEach((p) => {
    const hit = clusters.find((c) => Math.hypot(c.x - p.x, c.y - p.y) <= radiusUnits);
    if (hit) {
      hit.members.push(p.id);
      hit.sumX += p.x;
      hit.sumY += p.y;
      hit.x = hit.sumX / hit.members.length;
      hit.y = hit.sumY / hit.members.length;
    } else {
      clusters.push({ x: p.x, y: p.y, sumX: p.x, sumY: p.y, members: [p.id] });
    }
  });
  return clusters.map(({ x, y, members }) => ({ id: members.join('|'), x, y, members }));
};

export default clusterPoints;
