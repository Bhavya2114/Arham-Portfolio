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
 * is the publication-gated source for the /projects gallery.
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

/** A city's projects, in data order. Only exact city + state matches; never another city's records. */
export const getShowcaseProjectsForCity = (stateCode, city) =>
  !stateCode || !city ? [] : SHOWCASE_PROJECTS.filter((p) => p.city === city && p.stateCode === stateCode);

/** All shown projects in a state (records with a city only). */
export const getShowcaseProjectsForState = (stateCode) =>
  !stateCode ? [] : SHOWCASE_PROJECTS.filter((p) => p.city && p.stateCode === stateCode);

export const getShowcaseProject = (id) => SHOWCASE_PROJECTS.find((p) => p.id === id) || null;

export const hasSiteCoordinates = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);

/** Before / after slider only when both photos exist. */
export const hasBeforeAfter = (p) => Boolean(p?.beforePhoto && p?.afterPhoto);

export default SHOWCASE_PROJECTS;
