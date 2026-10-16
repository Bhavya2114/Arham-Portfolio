/**
 * Arham project showcase — the projects shown in the /presence project card (the only place project
 * info is shown) and as project pins on the map.
 *
 * One record per project:
 *   id         stable unique id
 *   name       project name
 *   city       city exactly as listed in presenceCoverage.js (the card only shows a city's own projects)
 *   stateCode  state code, e.g. 'IN-RJ'
 *   location   short location: area + city only, e.g. 'Indra Vihar, Kota' (no full address / pincode)
 *   type       short type shown as the card chip, e.g. 'Coaching centre'
 *   scope      one line on what Arham did, e.g. 'Complete wiring of the whole building'
 *   year       completion year (number)
 *   photos     1–4 photos (import the image files, or new URL(..., import.meta.url).href)
 *   beforePhoto, afterPhoto  optional; when both exist the card shows the before / after slider
 *   lat, lng   optional site coordinates; with them the project gets its own pin on the map,
 *              otherwise the selected city's pin is highlighted instead
 *
 * Records without a city are never shown (nothing is guessed). Separate from data/projects.js, which
 * is the publication-gated source for the /projects gallery. While USE_PLACEHOLDER_PROJECTS is on,
 * cities without their own records show PLACEHOLDER_PROJECTS (see below).
 */

export const MAX_PHOTOS = 4;

/** @type {Array<object>} */
export const SHOWCASE_PROJECTS = Object.freeze([
  {
    id: 'coaching-centre-2022',
    name: 'TODO: project name', // TODO: confirm the project name
    city: null, // TODO: confirm the city (must match presenceCoverage.js); hidden until set
    stateCode: null, // TODO: confirm the state code, e.g. 'IN-RJ'
    location: null, // TODO: area + city, e.g. 'Indra Vihar, Kota'
    type: 'Coaching centre',
    scope: 'Complete wiring of the whole building',
    year: 2022,
    photos: [], // TODO: add 1–4 project photos
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

// Name + short area / city, from the old campus records' supplied addresses (no full address).
const PLACEHOLDER_CAMPUSES = [
  ['ALLEN Sankalp (Head Office)', 'Indra Vihar, Kota'],
  ['ALLEN Supath Campus', 'Naya Nohra, Kota'],
  ['ALLEN Saakar Campus', 'Rajeev Gandhi Nagar, Kota'],
  ['ALLEN Sangyan Campus', 'Kunhari, Kota'],
  ['ALLEN Satyarth Campus', 'New Jawahar Nagar, Kota'],
  ['ALLEN Sammunnat Campus', 'New Jawahar Nagar, Kota'],
  ['ALLEN Samyak Campus', 'Landmark City, Kota'],
  ['ALLEN Samarth Campus', 'Landmark City, Kota'],
];

export const PLACEHOLDER_PROJECTS = Object.freeze(
  PLACEHOLDER_CAMPUSES.map(([name, location]) => ({
    id: `placeholder-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name,
    city: null, // shown for every city
    stateCode: null,
    location,
    type: 'Coaching centre',
    scope: 'Complete wiring of the whole building',
    year: 2022,
    photos: [ALLEN_PHOTO],
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

/** A project's photos (at most MAX_PHOTOS). */
export const projectPhotos = (p) => (Array.isArray(p?.photos) ? p.photos.filter(Boolean).slice(0, MAX_PHOTOS) : []);

export const hasSiteCoordinates = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);

/** Before / after slider only when both photos exist. */
export const hasBeforeAfter = (p) => Boolean(p?.beforePhoto && p?.afterPhoto);

export default SHOWCASE_PROJECTS;
