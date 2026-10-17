/**
 * Arham Power Solutions — projects shown on Our Work (/our-work). ONE ROW PER PROJECT; everything on
 * the page (city pin counts, filter chips, client groups, state / India totals) is derived from this
 * list by the selectors in data/projectBrowse.js, so adding a row updates the whole page.
 *
 * Row format:
 *   id         stable unique id, e.g. 'allen-sankalp-kota'
 *   client     client name, e.g. 'ALLEN Career Institute'; null for private / no-client jobs
 *              (those are grouped by category instead)
 *   category   'Coaching centre' | 'Commercial' | 'Residential' | 'Industrial' | 'Hospital' | 'School' | …
 *   name       campus / building name
 *   area       locality, e.g. 'Indra Vihar'
 *   city       city exactly as listed in presenceCoverage.js (rows with any other city are not shown)
 *   stateCode  e.g. 'IN-RJ'
 *   scope      what Arham did, from SCOPE_LABELS below, e.g. ['Full wiring', 'Lighting', 'DB panels']
 *   status     'completed' | 'ongoing'
 *   year       completion year (or start year while ongoing; optional then)
 *   photos     1–6 photos (public paths, or new URL(..., import.meta.url).href)
 *   lat, lng   optional site coordinates: with them the project gets its own pin on the map,
 *              otherwise its city's pin is highlighted
 *   demo       true only for the placeholder rows below
 */

export const MAX_PHOTOS = 6;

/** Work types used in `scope` (shown as chips) and their short forms for summaries ("wiring & lighting"). */
export const SCOPE_LABELS = Object.freeze({
  'Full wiring': 'wiring',
  Lighting: 'lighting',
  'DB panels': 'panels',
  Cabling: 'cabling',
  Earthing: 'earthing',
  'Facade lighting': 'facade lighting',
});

/** Real projects. Add rows here. */
export const SHOWCASE_PROJECTS = Object.freeze([]);

/**
 * DEMO rows (demo: true) so the page can be reviewed before real projects are added: ALLEN campuses
 * (the only client named, using the existing ALLEN photo) plus generic commercial / residential jobs
 * (using the site's existing photos). Set USE_PLACEHOLDER_PROJECTS to false to switch them all off.
 */
export const USE_PLACEHOLDER_PROJECTS = true;

const ALLEN_PHOTO = new URL('../../Images/allen image.png', import.meta.url).href;
const STOCK = {
  building: '/images/hero-architecture.jpg',
  lobby: '/images/project-lighting.jpg',
  panels: '/images/project-distribution.jpg',
  trays: '/images/project-infrastructure.jpg',
  control: '/images/about-engineering.jpg',
};
const ALLEN = 'ALLEN Career Institute';

const demo = (row) => ({ lat: null, lng: null, ...row, demo: true });
const allen = (id, name, area, city, stateCode, year, scope = ['Full wiring', 'Lighting'], status = 'completed') =>
  demo({ id, client: ALLEN, category: 'Coaching centre', name, area, city, stateCode, scope, status, year, photos: [ALLEN_PHOTO] });

export const DEMO_PROJECTS = Object.freeze([
  // ALLEN, Kota
  allen('demo-allen-sankalp', 'ALLEN Sankalp (Head Office)', 'Indra Vihar', 'Kota', 'IN-RJ', 2022, ['Full wiring', 'Lighting', 'DB panels']),
  allen('demo-allen-supath', 'ALLEN Supath Campus', 'Naya Nohra', 'Kota', 'IN-RJ', 2022),
  allen('demo-allen-saakar', 'ALLEN Saakar Campus', 'Rajeev Gandhi Nagar', 'Kota', 'IN-RJ', 2021),
  allen('demo-allen-sangyan', 'ALLEN Sangyan Campus', 'Kunhari', 'Kota', 'IN-RJ', 2022, ['Full wiring', 'Lighting', 'Earthing']),
  allen('demo-allen-satyarth', 'ALLEN Satyarth Campus', 'New Jawahar Nagar', 'Kota', 'IN-RJ', 2023),
  allen('demo-allen-sammunnat', 'ALLEN Sammunnat Campus', 'New Jawahar Nagar', 'Kota', 'IN-RJ', 2023, ['Full wiring', 'DB panels']),
  allen('demo-allen-samyak', 'ALLEN Samyak Campus', 'Landmark City', 'Kota', 'IN-RJ', null, ['Full wiring', 'Lighting'], 'ongoing'),
  allen('demo-allen-samarth', 'ALLEN Samarth Campus', 'Landmark City', 'Kota', 'IN-RJ', null, ['Full wiring', 'Lighting', 'DB panels'], 'ongoing'),
  // ALLEN, other worked cities
  allen('demo-allen-jaipur-1', 'ALLEN Jaipur Campus', 'Central Jaipur', 'Jaipur', 'IN-RJ', 2021),
  allen('demo-allen-jaipur-2', 'ALLEN Jaipur Campus 2', 'South Jaipur', 'Jaipur', 'IN-RJ', 2023, ['Full wiring', 'Lighting', 'Earthing']),
  allen('demo-allen-mumbai', 'ALLEN Mumbai Campus', 'Western suburbs', 'Mumbai', 'IN-MH', 2022),
  allen('demo-allen-pune', 'ALLEN Pune Campus', 'Central Pune', 'Pune', 'IN-MH', null, ['Full wiring', 'Lighting'], 'ongoing'),
  allen('demo-allen-patna', 'ALLEN Patna Campus', 'Central Patna', 'Patna', 'IN-BR', 2020),
  allen('demo-allen-ahmedabad', 'ALLEN Ahmedabad Campus', 'West Ahmedabad', 'Ahmedabad', 'IN-GJ', 2023, ['Full wiring', 'Lighting', 'DB panels']),
  // Commercial (no client named)
  demo({ id: 'demo-commercial-kota', client: null, category: 'Commercial', name: 'Commercial complex', area: 'City centre', city: 'Kota', stateCode: 'IN-RJ', scope: ['Full wiring', 'DB panels', 'Facade lighting'], status: 'completed', year: 2021, photos: [STOCK.building, STOCK.lobby, STOCK.panels] }),
  demo({ id: 'demo-commercial-jaipur', client: null, category: 'Commercial', name: 'Office building', area: 'Business district', city: 'Jaipur', stateCode: 'IN-RJ', scope: ['Full wiring', 'Lighting', 'Cabling', 'DB panels'], status: 'completed', year: 2022, photos: [STOCK.lobby, STOCK.building, STOCK.panels, STOCK.trays, STOCK.control] }),
  demo({ id: 'demo-commercial-mumbai', client: null, category: 'Commercial', name: 'Retail and office complex', area: 'Central Mumbai', city: 'Mumbai', stateCode: 'IN-MH', scope: ['Cabling', 'DB panels'], status: 'ongoing', year: null, photos: [STOCK.trays, STOCK.panels] }),
  demo({ id: 'demo-commercial-pune', client: null, category: 'Commercial', name: 'Office building', area: 'IT park', city: 'Pune', stateCode: 'IN-MH', scope: ['Full wiring', 'Lighting'], status: 'completed', year: 2020, photos: [STOCK.building] }),
  // Residential (no client named)
  demo({ id: 'demo-residential-kota', client: null, category: 'Residential', name: 'Residential tower', area: 'Talwandi', city: 'Kota', stateCode: 'IN-RJ', scope: ['Full wiring', 'Lighting', 'Earthing'], status: 'completed', year: 2020, photos: [STOCK.building, STOCK.lobby] }),
  demo({ id: 'demo-residential-nagpur', client: null, category: 'Residential', name: 'Housing society', area: 'West Nagpur', city: 'Nagpur', stateCode: 'IN-MH', scope: ['Full wiring', 'DB panels'], status: 'ongoing', year: null, photos: [STOCK.control] }),
  demo({ id: 'demo-residential-jaipur', client: null, category: 'Residential', name: 'Apartment block', area: 'East Jaipur', city: 'Jaipur', stateCode: 'IN-RJ', scope: ['Full wiring', 'Lighting'], status: 'completed', year: 2024, photos: [STOCK.lobby] }),
]);

/** The rows the page uses: real projects, plus the demo rows while USE_PLACEHOLDER_PROJECTS is on. */
export const getProjectRows = () => (USE_PLACEHOLDER_PROJECTS ? [...SHOWCASE_PROJECTS, ...DEMO_PROJECTS] : [...SHOWCASE_PROJECTS]);

/** A project's photos (at most MAX_PHOTOS). */
export const projectPhotos = (p) => (Array.isArray(p?.photos) ? p.photos.filter(Boolean).slice(0, MAX_PHOTOS) : []);

export const hasSiteCoordinates = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);

export default SHOWCASE_PROJECTS;
