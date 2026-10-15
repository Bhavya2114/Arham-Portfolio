/**
 * TEMPORARY demo campus cards suite (data/demoCampusCards.js).
 *
 * Verifies:
 * 1. Every marked city of the approved coverage gets the same 8 Kota records (by reference, 1 / 8).
 * 2. Cities outside the coverage are unchanged; disabling the adapter is a single flag.
 * 3. No records are created or modified; coverage, candidate statuses and Arham-work flags unchanged.
 * 4. Demo cards are labelled as demonstration data and never presented as verified projects.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CANDIDATE_PROJECT_LOCATIONS as C, getCandidateLocationsByCity } from '../src/data/candidateProjectLocations.js';
import { PRESENCE_COVERAGE, getPresenceTotals } from '../src/data/presenceCoverage.js';
import { getPublishedProjects } from '../src/data/projectSelectors.js';
import { getCampusCardsForCity, DEMO_CAMPUS_CARDS_ENABLED, DEMO_SOURCE_CITY } from '../src/data/demoCampusCards.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => fs.readFileSync(path.resolve(here, rel), 'utf-8');
let failures = 0;
let passes = 0;
const assert = (cond, msg) => {
  if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); }
};

console.log('\n1. Every marked city gets the 8 Kota cards');
const byCity = getCandidateLocationsByCity();
const kota = byCity[DEMO_SOURCE_CITY];
assert(DEMO_CAMPUS_CARDS_ENABLED === true && DEMO_SOURCE_CITY === 'Kota', 'Demo mode on, source city Kota');
assert(kota.length === 8, 'Kota has 8 existing records');
const marked = PRESENCE_COVERAGE.flatMap((e) => e.cities.map((city) => ({ stateCode: e.stateCode, city })));
assert(marked.length === 27 && getPresenceTotals().cityCount === 27, `27 marked cities (got ${marked.length})`);
const results = marked.map(({ stateCode, city }) => ({ city, ...getCampusCardsForCity(byCity, stateCode, city) }));
assert(results.every((r) => r.locations.length === 8), 'Every marked city gets 8 cards');
assert(results.every((r) => r.locations.every((loc, i) => loc === kota[i])), 'Cards are the Kota records by reference, same order (index starts at 1 / 8)');
assert(results.filter((r) => r.demo).length === 26 && results.find((r) => r.city === 'Kota').demo === false, 'Kota shows its own records; the other 26 cities are flagged demo');
assert(results.find((r) => r.city === 'Jaipur').locations.every((l) => l.city === 'Kota'), 'Jaipur shows the Kota demo set (its own 9 records stay in the dataset)');

console.log('\n2. Outside the coverage');
assert(getCampusCardsForCity(byCity, 'IN-RJ', 'Ajmer').locations.length === 0, 'Unmarked city (Ajmer) gets nothing');
assert(getCampusCardsForCity(byCity, 'IN-MH', 'Kota').locations.length === 0, 'Kota under the wrong state gets nothing');
assert(getCampusCardsForCity(byCity, 'IN-UP', 'Lucknow').locations.length === 0, 'Uttar Pradesh has no cities and gets nothing');
const adapterSrc = read('../src/data/demoCampusCards.js');
assert(/if \(!DEMO_CAMPUS_CARDS_ENABLED \|\| /.test(adapterSrc), 'Disabling DEMO_CAMPUS_CARDS_ENABLED falls back to each city\'s own records');

console.log('\n3. No data created or changed');
assert(C.length === 17 && byCity.Kota.length === 8 && byCity.Jaipur.length === 9, 'Candidate dataset still 17 records (8 Kota, 9 Jaipur)');
assert(C.every((c) => c.arhamWorkConfirmed === false && c.status !== 'APPROVED'), 'No candidate approved or marked as Arham work');
assert(!/\b(name|suppliedAddress|arhamWorkConfirmed|status)\s*:/.test(adapterSrc.replace(/\/\*\*[\s\S]*?\*\//g, '')), 'Adapter defines no record fields');
assert(!/^import .*(candidateProjectLocations|projects\.js)/m.test(adapterSrc), 'Adapter imports no record data (receives records from the page)');
assert(getPublishedProjects().length === 0, 'Verified-project dataset untouched (still none published)');

console.log('\n4. Labelled as demo, never as projects');
const card = read('../src/components/presence/CampusCard.jsx');
const details = read('../src/components/presence/ProjectDetails.jsx');
const page = read('../src/pages/Presence.jsx');
assert(!/Demo data|data-campus-demo-badge|amber-/.test(card), 'No visible demo badge on the card');
assert(!/Demo data/.test(details) && /\{demo && <p className="sr-only">/.test(details), 'No visible demo note in the city list (screen-reader text only)');
assert(/not located in \$\{city\}/.test(card) && /not located in \{city\}/.test(details), 'Accessible text still says the samples are not located in the selected city');
assert(/demo=\{campusDemo\}/.test(page) && /campusDemo=\{campusDemo\}/.test(page), 'Page passes the demo flag to the card and the city list');
assert(/key=\{`\$\{nav\.stateCode\}\|\$\{selectedCity\}`\}/.test(page), 'Card is keyed per city, so switching cities resets to 1 / 8');
const home = read('../src/pages/Home.jsx');
assert(!/demoCampusCards|CampusCard/.test(home), 'Homepage does not use the demo adapter or card');
const importers = ['../src/pages', '../src/components', '../src/data', '../src/lib']
  .flatMap((d) => fs.readdirSync(path.resolve(here, d), { recursive: true }).map((f) => path.join(d, String(f))))
  .filter((f) => /\.(js|jsx)$/.test(f) && /^import .*demoCampusCards/m.test(read(f)) && !f.endsWith('demoCampusCards.js'));
assert(importers.length === 1 && importers[0].endsWith('Presence.jsx'), `Only pages/Presence.jsx uses the adapter (${importers.join(', ')})`);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
