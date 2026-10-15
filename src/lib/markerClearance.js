/**
 * Marker clearance for the bottom-anchored campus card — pure maths, measured against a given view.
 *
 * The map's <svg> keeps a constant size and draws `vb` with preserveAspectRatio "xMidYMid meet", so a
 * marker's screen position follows directly from the view numbers. Measuring this way (instead of the
 * DOM's getScreenCTM) lets the caller use the view the map has actually settled on, never an
 * intermediate animation frame or a viewBox React has not rendered yet.
 */

/** Screen mapping for viewBox `vb` ({ x, y, w, h }) drawn into `rect` (a DOMRect-like box). */
export const viewBoxScreenMap = (vb, rect) => {
  const s = Math.min(rect.width / vb.w, rect.height / vb.h);
  return {
    s,
    ox: rect.left + (rect.width - vb.w * s) / 2 - vb.x * s,
    oy: rect.top + (rect.height - vb.h * s) / 2 - vb.y * s,
  };
};

/**
 * How far the map must pan up so `marker` ({ x, y } in map units) sits at least `clearancePx` above
 * `card` ({ top, left, right } in screen px). Zero when the marker is not over the card's column or is
 * already clear. Returns both screen px and map units (for the view's `cy`).
 */
export const markerClearanceShift = ({ marker, vb, svgRect, card, clearancePx }) => {
  const { s, ox, oy } = viewBoxScreenMap(vb, svgRect);
  const mx = ox + marker.x * s;
  const my = oy + marker.y * s;
  const overlapsX = mx >= card.left - clearancePx && mx <= card.right + clearancePx;
  const shiftPx = overlapsX && my > card.top - clearancePx ? my - (card.top - clearancePx) : 0;
  return { shiftPx, shiftUnits: shiftPx / s, markerY: my };
};
