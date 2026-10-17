/** The real ALLEN building list on Our Work (branch allen-projects). */
import { SHOWCASE_PROJECTS, USE_PLACEHOLDER_PROJECTS, getProjectRows, isValidAddress, mapsSearchUrl } from '../src/data/showcaseProjects.js';
import { getPresenceState } from '../src/data/presenceCoverage.js';

let passes = 0;
let failures = 0;
const assert = (cond, msg) => { if (cond) { passes += 1; console.log(`  PASS  ${msg}`); } else { failures += 1; console.error(`  FAIL  ${msg}`); } };
const rows = getProjectRows();
assert(rows.length === 98 && SHOWCASE_PROJECTS.length === 98, `Exactly 98 rows (${rows.length})`);
assert(rows.every((p) => p.client === 'ALLEN Career Institute' && p.category === 'Coaching centre'), 'All 98 are ALLEN Career Institute coaching centres');
assert(!USE_PLACEHOLDER_PROJECTS && rows.every((p) => !p.demo), 'No demo rows');
assert(rows.every((p) => getPresenceState(p.stateCode)?.cities.includes(p.city)), 'Every city is in presenceCoverage');
assert(new Set(rows.map((p) => p.id)).size === 98 && rows.every((p) => /^allen-[a-z0-9-]+$/.test(p.id)), 'Unique, stable slug ids');
assert(rows.every((p) => p.address && isValidAddress(p.address)), 'Every row has a valid address');
assert(rows.every((p) => !/PNCF|H\.O\.|Information Centre/.test(p.name) && p.name.startsWith('ALLEN ')), 'Names start "ALLEN", no (PNCF) / (H.O.) / Information Centre');
assert(rows.every((p) => p.status === 'completed' && p.year === 2022 && p.lat === null && p.lng === null && p.scope.join() === 'Full wiring,Lighting'), 'Completed 2022 (placeholder), wiring + lighting, no invented coordinates');
const count = (c) => rows.filter((p) => p.city === c).length;
assert(count('Kota') === 15 && count('Mumbai') === 16 && count('Pune') === 8 && count('Ahmedabad') === 7, 'Kota 15, Mumbai 16, Pune 8, Ahmedabad 7');
assert(rows.find((p) => p.id === 'allen-panaji-centre')?.name === 'ALLEN Panaji Centre' && rows.some((p) => p.name === 'ALLEN Samanvaya') && rows.some((p) => p.name === 'ALLEN Ahmedabad – Sadhya SBR'), 'Renames: Panaji Centre, Samanvaya, Ahmedabad – Sadhya SBR');
assert(mapsSearchUrl(rows[0]).startsWith('https://www.google.com/maps/search/?api=1&query=ALLEN%20Sankalp%2C%20CP-6'), 'Google Maps link: encoded name + address');
assert(!isValidAddress('') && !isValidAddress('a\nb') && isValidAddress(null), 'Address validation');
console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
