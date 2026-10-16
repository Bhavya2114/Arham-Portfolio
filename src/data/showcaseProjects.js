/**
 * Arham project showcase — the projects shown on the /presence map card and as project pins.
 *
 * One record per project:
 *   id         stable, URL-safe id (used by /projects/:id)
 *   name       project name
 *   city       city exactly as listed in presenceCoverage.js (the card only shows a city's own projects)
 *   stateCode  state code, e.g. 'IN-RJ'
 *   type       short type shown as the card chip, e.g. 'Coaching centre'
 *   scope      one line on what Arham did, e.g. 'Complete wiring of the whole building'
 *   year       completion year (number)
 *   stats      up to 3 tiles: [{ label: 'Area', value: '10,000 sq ft' }]
 *   photo      main photo (import the image file and use it here), or null
 *   beforePhoto, afterPhoto  optional; when both exist the card shows the before / after slider
 *   lat, lng   optional site coordinates; with them the project gets its own pin on the map,
 *              otherwise its city pin is highlighted instead
 *
 * Records without a city are never shown (nothing is guessed). Separate from data/projects.js, which
 * is the publication-gated source for the /projects gallery. While USE_PLACEHOLDER_PROJECTS is on,
 * cities without their own records show PLACEHOLDER_PROJECTS (see below).
 */

/** @type {Array<object>} */
export const SHOWCASE_PROJECTS = Object.freeze([
  {
    id: 'coaching-centre-2022',
    name: 'TODO: project name', // TODO: confirm the project name
    city: null, // TODO: confirm the city (must match presenceCoverage.js); hidden until set
    stateCode: null, // TODO: confirm the state code, e.g. 'IN-RJ'
    type: 'Coaching centre',
    scope: 'Complete wiring of the whole building',
    year: 2022,
    stats: [{ label: 'Area', value: '10,000 sq ft' }], // TODO: confirm
    photo: null, // TODO: add the project photo
    beforePhoto: null,
    afterPhoto: null,
    lat: null,
    lng: null,
  },
]);

/**
 * PLACEHOLDER content — the ALLEN campus photos, shown for EVERY selected city until real projects
 * are added. Same set for each city; no coordinates, so the selected city's pin is highlighted.
 *
 * To swap in real projects: add them to SHOWCASE_PROJECTS above (with their city), then set
 * USE_PLACEHOLDER_PROJECTS to false (or delete this block). A city with its own projects in
 * SHOWCASE_PROJECTS always shows those instead of the placeholders.
 */
export const USE_PLACEHOLDER_PROJECTS = true;

// The photo the old campus card used for every campus (Images/allen image.png).
const ALLEN_PHOTO = new URL('../../Images/allen image.png', import.meta.url).href;

const PLACEHOLDER_NAMES = [
  'ALLEN Sankalp (Head Office)',
  'ALLEN Supath Campus',
  'ALLEN Saakar Campus',
  'ALLEN Sangyan Campus',
  'ALLEN Satyarth Campus',
  'ALLEN Sammunnat Campus',
  'ALLEN Samyak Campus',
  'ALLEN Samarth Campus',
];

export const PLACEHOLDER_PROJECTS = Object.freeze(
  PLACEHOLDER_NAMES.map((name) => ({
    id: `placeholder-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name,
    city: null, // shown for every city
    stateCode: null,
    type: 'Coaching centre',
    scope: 'Complete wiring of the whole building',
    year: 2022,
    stats: [{ label: 'Area', value: '10,000 sq ft' }],
    photo: ALLEN_PHOTO,
    beforePhoto: null,
    afterPhoto: null,
    lat: null,
    lng: null,
    placeholder: true,
  }))
);

/**
 * A city's projects, in data order: only that city's own records (exact city + state match, never
 * another city's). A city without its own records gets the placeholders while they are on.
 */
export const getShowcaseProjectsForCity = (stateCode, city) => {
  if (!stateCode || !city) return [];
  const own = SHOWCASE_PROJECTS.filter((p) => p.city === city && p.stateCode === stateCode);
  return own.length > 0 || !USE_PLACEHOLDER_PROJECTS ? own : PLACEHOLDER_PROJECTS;
};

/** All shown projects in a state (records with a city only). */
export const getShowcaseProjectsForState = (stateCode) =>
  !stateCode ? [] : SHOWCASE_PROJECTS.filter((p) => p.city && p.stateCode === stateCode);

export const getShowcaseProject = (id) =>
  SHOWCASE_PROJECTS.find((p) => p.id === id) || (USE_PLACEHOLDER_PROJECTS && PLACEHOLDER_PROJECTS.find((p) => p.id === id)) || null;

export const hasSiteCoordinates = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);

/** Before / after slider only when both photos exist. */
export const hasBeforeAfter = (p) => Boolean(p?.beforePhoto && p?.afterPhoto);

export default SHOWCASE_PROJECTS;
