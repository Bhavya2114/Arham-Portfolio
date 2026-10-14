/**
 * India Map Projection — calibrated to `indiaMapGeometry.js` (Simplemaps, Mercator).
 *
 * Least-squares fit against 39 known state extents: RMS ≈ 0.57 SVG units (≈ 2 km),
 * max ≈ 2.5 units. See MAP_LICENSE.md, Section 6.
 */

const X_SCALE = 27.3816;
const X_OFFSET = -1767.155;
const Y_SCALE = -27.3492;
const Y_OFFSET = 1138.898;

/** Mercator northing expressed in degrees. */
const mercatorY = (lat) => (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI;

/**
 * Converts latitude/longitude to SVG coordinates in the 1000×1000 map canvas.
 * @param {number} lat
 * @param {number} lon
 * @returns {{ x: number, y: number }}
 */
export const projectLatLon = (lat, lon) => ({
  x: X_SCALE * lon + X_OFFSET,
  y: Y_SCALE * mercatorY(lat) + Y_OFFSET,
});

export default projectLatLon;
