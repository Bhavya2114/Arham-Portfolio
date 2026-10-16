/**
 * Numbers shown in the homepage "Our work across India" teaser. Edit here.
 * (The interactive map's own coverage lives in presenceCoverage.js.)
 */
export const PRESENCE_TEASER_STATS = Object.freeze([
  { value: '27+', label: 'Cities' },
  { value: '10', label: 'States' },
]);

/** Static export of the /presence India overview (public/images), CSS size of the largest rendering. */
export const PRESENCE_OVERVIEW_IMAGE = Object.freeze({
  webp: '/images/presence-overview.webp', // 2x
  png: '/images/presence-overview.png', // 1x fallback
  width: 520,
  height: 588,
});

export default PRESENCE_TEASER_STATS;
