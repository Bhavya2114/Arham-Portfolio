/**
 * INTERNAL — CANDIDATE PROJECT LOCATIONS (UNPUBLISHED DRAFT)
 * ==========================================================
 * PUBLIC USE IS LIMITED TO ONE PLACE: src/pages/Presence.jsx lists each record's name and supplied
 * address in the Kota / Jaipur city panels as "ALLEN campus locations" (site-owner decision,
 * 2026-10-15), labelled as location records whose Arham work is unconfirmed. Do not import this file
 * anywhere else, and never into projects.js, project selectors, map pins or the project gallery.
 *
 * These are ALLEN campus locations in Kota and Jaipur that the site owner listed as *possible*
 * Arham electrical wiring / lighting projects. NONE is a confirmed Arham project. ALLEN being at
 * an address is not evidence that Arham performed work there.
 *
 * Kept entirely separate from `projects.js`: not read by projectSelectors, the map component,
 * the project gallery or the homepage (enforced by scratch/test_candidate_locations.js).
 * Review workflow: see CANDIDATE_REVIEW.md in this folder. There is no automatic publishing.
 *
 * Research date: 2026-10-15.
 *
 * Two independent checks per record (never conflated):
 *   - LOCATION: is the campus where the address says? (`locationVerification`, optional `coordinates`)
 *   - ARHAM WORK: did Arham actually do electrical / lighting work there? (`arhamWorkConfirmed`, always
 *     false here — only the manual review in CANDIDATE_REVIEW.md can establish it).
 *
 * Entries are grouped by city for an internal city list (`getCandidateLocationsByCity`). A list entry
 * needs only its name and supplied address — coordinates are optional and are never geocoded,
 * approximated or invented just to list or pin an entry.
 *
 * Coordinates policy (optional field):
 * - `coordinates` is set only when a mapped feature explicitly named for that campus sits where the
 *   official address / landmark places it. `coordinates.precision` says how strong that is:
 *     'building' — an OSM building outline named for the campus (centroid);
 *     'point'    — an OSM point named for the campus; the exact building is still unconfirmed.
 * - Otherwise `coordinates` is null. City-centre or street-level geocodes are never used.
 * - `locationCandidates` lists mapped features that were found but NOT accepted (conflicts etc.).
 */

export const CANDIDATE_STATUSES = Object.freeze(['UNVERIFIED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED']);

/** Review transitions (manual only). APPROVED / REJECTED are terminal for this draft. */
export const CANDIDATE_TRANSITIONS = Object.freeze({
  UNVERIFIED: Object.freeze(['PENDING_REVIEW', 'REJECTED']),
  PENDING_REVIEW: Object.freeze(['APPROVED', 'REJECTED', 'UNVERIFIED']),
  APPROVED: Object.freeze([]),
  REJECTED: Object.freeze([]),
});

export const canTransition = (from, to) => Boolean(CANDIDATE_TRANSITIONS[from]?.includes(to));

const SOURCES = Object.freeze({
  allenKota: { type: 'official', label: 'ALLEN official contact page — Kota centres', url: 'https://www.allen.ac.in/delhi/contactus.asp?cent=kota' },
  allenJaipur: { type: 'official', label: 'ALLEN official contact page — Jaipur centres', url: 'https://www.allen.ac.in/delhi/contactus.asp?cent=jaipur' },
  targetStudyJaipur: { type: 'third-party', label: 'TargetStudy coaching listing — Jaipur (third-party, may be outdated)', url: 'https://targetstudy.com/coaching/ntse-exam-coaching-in-jaipur.htm' },
});
const osm = (ref) => `https://www.openstreetmap.org/${ref}`;

/**
 * @typedef {Object} CandidateLocation
 * @property {string} id
 * @property {string} name - campus / building name exactly as supplied (individual name when a supplied
 *   pair was split into separately identifiable campuses — see `suppliedGroup`)
 * @property {string} [suppliedGroup] - the supplied combined entry this campus was split from
 * @property {string} city
 * @property {string} stateCode
 * @property {string} suppliedAddress - address / location details exactly as supplied by the site owner
 * @property {string|null} officialAddress - address as printed on ALLEN's official page, if listed there
 * @property {string} locationDescription
 * @property {'UNVERIFIED'|'PENDING_REVIEW'|'APPROVED'|'REJECTED'} status
 * @property {'not-located'|'ambiguous'|'point'|'building'} locationVerification
 * @property {{ lat: number, lon: number, precision: 'building'|'point', source: string }|null} coordinates
 *   OPTIONAL — null unless a mapped feature named for the campus was found; not needed for listing
 * @property {Array<{ ref: string, url: string, lat: number, lon: number, note: string }>} locationCandidates
 * @property {Array<{ type: string, label: string, url: string }>} sources
 * @property {string|null} publicReferenceUrl - verified public page listing this address
 * @property {boolean} ambiguous
 * @property {string[]} notes
 * @property {boolean} arhamWorkConfirmed - independent of location; always false in this draft
 */

/** @type {CandidateLocation[]} */
export const CANDIDATE_PROJECT_LOCATIONS = Object.freeze([
  // ---------------- Kota (8) ----------------
  {
    id: 'cand-kota-sankalp',
    name: 'ALLEN Sankalp (Head Office)',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'CP-6, Indra Vihar, Kota, Rajasthan 324005',
    officialAddress: 'CP-6, Indra Vihar, Kota (Rajasthan) - 324005',
    locationDescription: 'Supplied as the central administrative and admissions location.',
    status: 'PENDING_REVIEW',
    locationVerification: 'ambiguous',
    coordinates: null,
    locationCandidates: [
      { ref: 'node/6627090427', url: osm('node/6627090427'), lat: 25.13911, lon: 75.84591, note: 'Named generically "Allen Career Institute" but tagged CP-6, Indra Vihar (matches official address).' },
      { ref: 'node/7469543979', url: osm('node/7469543979'), lat: 25.15173, lon: 75.83646, note: 'Named "ALLEN Sankalp" but on Rangbari Road, ~1.5 km away — conflicts with the official address.' },
    ],
    sources: [SOURCES.allenKota],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: true,
    notes: [
      'Address confirmed on the official ALLEN page; building position NOT resolved: two mapped features disagree by ~1.5 km.',
      'The CP-6 feature lies within ~20 m of the mapped Samarth points, so it may mark the wider Indra Vihar campus cluster rather than Sankalp itself. Confirm on site or with ALLEN.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-kota-supath',
    name: 'ALLEN Supath Campus',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Supath Campus, Baran Road, Naya Nohra, Kota',
    officialAddress: 'Naya Nohra, Baran Road, Kota (Rajasthan) - 324001',
    locationDescription: 'Baran Road, Naya Nohra area.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenKota],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: false,
    notes: [
      'Area-level address only (no plot number) on the official page; no mapped feature found. Precise building needs manual identification.',
      'A third-party directory gives a different postcode (324005 vs official 324001).',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-kota-saakar',
    name: 'ALLEN Saakar Campus',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Plot No. 6, Jhalawar Road, opposite City Mall, Rajeev Gandhi Nagar, Kota',
    officialAddress: '6, Rajeev Gandhi Nagar, Opp. City Mall, KOTA (Rajasthan) - 324005',
    locationDescription: 'Opposite City Mall, Rajeev Gandhi Nagar.',
    status: 'PENDING_REVIEW',
    locationVerification: 'building',
    coordinates: { lat: 25.13926, lon: 75.85285, precision: 'building', source: osm('way/1172423558') },
    locationCandidates: [],
    sources: [SOURCES.allenKota, { type: 'map', label: 'OpenStreetMap building "Allen Saakar" (ODbL)', url: osm('way/1172423558') }],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: false,
    notes: [
      'Mapped building outline named "Allen Saakar"; City Mall (way/1172422242) is mapped ~300 m away on the same tagged road, consistent with "Opp. City Mall".',
      'OSM street tag reads "Road Number 2, Old Godowns" rather than Jhalawar Road / Rajeev Gandhi Nagar — confirm the building before approval.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-kota-sangyan',
    name: 'ALLEN Sangyan Campus',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Block FGH, Plot No. 4, Kunhari/Landmark City Road, Kota',
    officialAddress: 'Plot No. Sp-Corner 4, Block FGH Landmark City, Kunhari, Kota (Rajasthan) - 324008',
    locationDescription: 'Landmark City, Kunhari.',
    status: 'UNVERIFIED',
    locationVerification: 'ambiguous',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenKota],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: true,
    notes: [
      'Official address confirms "Sp-Corner 4, Block FGH, Landmark City, Kunhari" (supplied: "Plot No. 4").',
      'A separate "Sangyan-2" building (Landmark Prime, Landmark City) is listed by directories — confirm which Sangyan building is the candidate.',
      'No mapped feature found.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-kota-satyarth',
    name: 'ALLEN Satyarth Campus',
    suppliedGroup: 'ALLEN Satyarth & Sammunnat Campuses',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'New Jawahar Nagar and District Center areas, Kota',
    officialAddress: 'District Center, Jawahar Nagar KOTA (Rajasthan) - 324005',
    locationDescription: 'District Center, Jawahar Nagar.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenKota],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: true,
    notes: [
      'Listed separately from Sammunnat on the official page, so recorded as its own candidate.',
      'Official address has no plot number; it may be adjacent to Sammunnat (4/A District Center). Building not identified.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-kota-sammunnat',
    name: 'ALLEN Sammunnat Campus',
    suppliedGroup: 'ALLEN Satyarth & Sammunnat Campuses',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'New Jawahar Nagar and District Center areas, Kota',
    officialAddress: '4/A, District Center, Jawahar Nagar, Kota (Rajasthan) 324005',
    locationDescription: 'District Center, Jawahar Nagar.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenKota],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: false,
    notes: ['Official address includes plot 4/A; no mapped feature found. Building needs manual identification.'],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-kota-samyak',
    name: 'ALLEN Samyak Campus',
    suppliedGroup: 'ALLEN Samyak & Samarth Campuses',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Landmark City, Kunhari, and Indra Vihar areas, Kota',
    officialAddress: 'Landmark City, Bundi Road, Kunhari KOTA (Rajasthan) 324008',
    locationDescription: 'Landmark City, Bundi Road, Kunhari.',
    status: 'UNVERIFIED',
    locationVerification: 'ambiguous',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenKota],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: true,
    notes: [
      'Official page lists Samyak (Landmark City, Bundi Road) and a separate "Samyak - 2" (Plot A-2, Landmark City Rd, Kunhari Electricity Board Area). Confirm which building is the candidate.',
      'Samyak is in Kunhari, not Indra Vihar — it is a different site from Samarth.',
      'No mapped feature found.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-kota-samarth',
    name: 'ALLEN Samarth Campus',
    suppliedGroup: 'ALLEN Samyak & Samarth Campuses',
    city: 'Kota',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Landmark City, Kunhari, and Indra Vihar areas, Kota',
    officialAddress: 'CP-14, Indra Vihar KOTA (Rajasthan) - 324005',
    locationDescription: 'CP-14, Indra Vihar (Shaheed Bhagat Singh Road cluster).',
    status: 'PENDING_REVIEW',
    locationVerification: 'point',
    coordinates: { lat: 25.1391, lon: 75.84569, precision: 'point', source: osm('node/11697711478') },
    locationCandidates: [
      { ref: 'node/11697686684', url: osm('node/11697686684'), lat: 25.13892, lon: 75.84592, note: '"allen career institute samarth sadbhav parisar", ~30 m away — consistent, same cluster.' },
    ],
    sources: [SOURCES.allenKota, { type: 'map', label: 'OpenStreetMap point "allen career institute samarth campus" (ODbL)', url: osm('node/11697711478') }],
    publicReferenceUrl: SOURCES.allenKota.url,
    ambiguous: false,
    notes: [
      'Point-level only: two mapped points named for Samarth agree within ~30 m, but the exact building (CP-14) is not confirmed and the points carry no plot number.',
      'Several ALLEN buildings (Sabal CP-07, Sankalp CP-6) sit in the same block — verify on site before approval.',
    ],
    arhamWorkConfirmed: false,
  },

  // ---------------- Jaipur (9) ----------------
  {
    id: 'cand-jaipur-jln-marg',
    name: 'JLN Marg Campus (Sarvatra Head Office)',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: '11, Samachar Jagat, opposite Vidyashram School, JLN Marg, Bajaj Nagar, Jaipur',
    officialAddress: '11, SAMACHAR JAGAT Opp. Vidyashram School, JLN Marg, Jaipur',
    locationDescription: 'Opposite Vidyashram School, JLN Marg.',
    status: 'PENDING_REVIEW',
    locationVerification: 'point',
    coordinates: { lat: 26.86731, lon: 75.8045, precision: 'point', source: osm('node/4880279121') },
    locationCandidates: [],
    sources: [SOURCES.allenJaipur, { type: 'map', label: 'OpenStreetMap point "ALLEN Career Institute, JLN Marg" (ODbL)', url: osm('node/4880279121') }],
    publicReferenceUrl: SOURCES.allenJaipur.url,
    ambiguous: false,
    notes: [
      'Mapped point named for the JLN Marg campus lies ~240 m from Bharatiya Vidya Bhavan\'s Vidyashram (node/2725271168), consistent with "Opp. Vidyashram School".',
      'The point is tagged "Gopalpura Bypass Road, Tonk Phatak"; the exact building at 11 Samachar Jagat is not confirmed.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-gopalpura-1',
    name: 'Gopalpura Campus 1',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Surya Nagar, near Ridhi Sidhi, Jaipur',
    officialAddress: null,
    locationDescription: 'Surya Nagar, near Ridhi Sidhi, Gopalpura.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.targetStudyJaipur],
    publicReferenceUrl: null,
    ambiguous: false,
    notes: ['Not on ALLEN\'s official Jaipur page. A third-party listing gives "505-506, Surya Nagar, near Ridhi Sidhi, Gopalpura" — confirm with ALLEN.', 'No mapped feature found.'],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-gopalpura-2',
    name: 'Gopalpura Campus 2',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Plot No. 49, 10 B Scheme, Gopalpura Bypass, Jaipur',
    officialAddress: 'Plot no.-49, 10 B Scheme Gopalpura Bypass, Jaipur',
    locationDescription: '10 B Scheme, Gopalpura Bypass.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenJaipur],
    publicReferenceUrl: SOURCES.allenJaipur.url,
    ambiguous: false,
    notes: ['Address confirmed on the official ALLEN page, which names it "Gopalpura Campus-2 (Sarvatra-7)"; no mapped feature found. Building needs manual identification.'],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-gopalpura-3',
    name: 'Gopalpura Campus 3 (Pooja Tower)',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Muktanand Nagar, Gopalpura Bypass, Jaipur',
    officialAddress: null,
    locationDescription: 'Pooja Tower, Muktanand Nagar, Gopalpura Bypass.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.targetStudyJaipur],
    publicReferenceUrl: null,
    ambiguous: false,
    notes: ['Not on ALLEN\'s official Jaipur page; third-party listings agree on Pooja Tower, Muktanand Nagar. Pooja Tower is not mapped.'],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-vaishali-nagar',
    name: 'Vaishali Nagar Campus',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'B-41 & 42, Nityanand Nagar-1, Gandhi Path, Jaipur',
    officialAddress: null,
    locationDescription: 'Gandhi Path, Vaishali Nagar.',
    status: 'PENDING_REVIEW',
    locationVerification: 'building',
    coordinates: { lat: 26.90544, lon: 75.75039, precision: 'building', source: osm('way/955292520') },
    locationCandidates: [],
    sources: [SOURCES.targetStudyJaipur, { type: 'map', label: 'OpenStreetMap building "Allen Career Institute", B41 Gandhi Path (ODbL)', url: osm('way/955292520') }],
    publicReferenceUrl: null,
    ambiguous: false,
    notes: [
      'Mapped building named "Allen Career Institute" tagged "B41, Gandhi Path, Vaishali Nagar" matches the supplied B-41 & 42 address.',
      'Not listed on ALLEN\'s official Jaipur page; address corroborated only by a third-party listing and the map tag.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-hanuman-nagar',
    name: 'Hanuman Nagar Campus',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Plots B-13 & 17, Sirsi Road, Jaipur',
    officialAddress: 'ALLEN Career Institute, Plot No. B-13, 17, Sirsi Road Hanuman Nagar, Jaipur - 302021',
    locationDescription: 'Sirsi Road, Hanuman Nagar.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenJaipur],
    publicReferenceUrl: SOURCES.allenJaipur.url,
    ambiguous: false,
    notes: [
      'Official address matches the supplied plots B-13 & 17.',
      'A third-party listing gives "B-3 & B-4, Sirsi Road" — treat as outdated/incorrect unless ALLEN confirms otherwise.',
      'No mapped feature found.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-bani-park',
    name: 'Bani Park Campus (Sarvatra-3)',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'K K Tower, Plot No. D200, Kattha Bandha Road/Jhotwara Road, opposite Dudh Mandi, Jaipur',
    officialAddress: 'Plot No. D200, Situated at Kattcha Bandha Road (Jhotwara Road, Banipark), E-Scheme, Jaipur - 302016',
    locationDescription: 'K K Tower, opposite Dudh Mandi, Jhotwara Road, Bani Park.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.allenJaipur, SOURCES.targetStudyJaipur],
    publicReferenceUrl: SOURCES.allenJaipur.url,
    ambiguous: false,
    notes: ['Official address confirms Plot D200, E-Scheme; "K K Tower, opp. Dudh Mandi" comes from third-party listings. K K Tower is not mapped.'],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-malviya-nagar',
    name: 'Malviya Nagar Campus',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Near C-2 Plaza, Apex Circle, Malviya Nagar, Jaipur',
    officialAddress: null,
    locationDescription: 'Near C-2 Plaza, Apex Circle, Malviya Nagar.',
    status: 'UNVERIFIED',
    locationVerification: 'ambiguous',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.targetStudyJaipur],
    publicReferenceUrl: null,
    ambiguous: true,
    notes: [
      'Not on ALLEN\'s official Jaipur page. A third-party listing gives "C-1B, near C-2 Plaza, Apex Circle".',
      'The supplied listing carried inconsistent city information; it was not relied on. City recorded as Jaipur (Malviya Nagar, Apex Circle).',
      'C-2 Plaza could not be matched to a mapped feature; the building needs manual identification.',
    ],
    arhamWorkConfirmed: false,
  },
  {
    id: 'cand-jaipur-shastri-nagar',
    name: 'Shastri Nagar Campus (Kapish Tower)',
    city: 'Jaipur',
    stateCode: 'IN-RJ',
    suppliedAddress: 'Subhash Nagar Shopping Centre, Shastri Nagar, Jaipur',
    officialAddress: null,
    locationDescription: 'Kapish Tower, Subhash Nagar Shopping Centre.',
    status: 'UNVERIFIED',
    locationVerification: 'not-located',
    coordinates: null,
    locationCandidates: [],
    sources: [SOURCES.targetStudyJaipur],
    publicReferenceUrl: null,
    ambiguous: false,
    notes: ['Not on ALLEN\'s official Jaipur page; third-party listing agrees on Kapish Tower, Subhash Nagar Shopping Center. Kapish Tower is not mapped.'],
    arhamWorkConfirmed: false,
  },
].map((record) => Object.freeze(record)));

/**
 * Internal city list: candidates grouped by city in dataset order, e.g. { Kota: [...8], Jaipur: [...9] }.
 * Works for every entry whether or not it has coordinates. For internal review tooling only —
 * the public Presence page lists published projects, never these candidates.
 * @returns {Object.<string, CandidateLocation[]>}
 */
export const getCandidateLocationsByCity = (records = CANDIDATE_PROJECT_LOCATIONS) =>
  records.reduce((groups, record) => {
    (groups[record.city] ||= []).push(record);
    return groups;
  }, {});

export default CANDIDATE_PROJECT_LOCATIONS;
