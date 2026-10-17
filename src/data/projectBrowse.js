/**
 * Our Work selectors: everything the page shows is derived from the project rows
 * (data/showcaseProjects.js) by these small pure functions — city pin counts, filter chips, the
 * summary pill, a city's stats and client groups, a group's status tabs.
 */
import { getPresenceState } from './presenceCoverage.js';
import { getProjectRows, SCOPE_LABELS, isValidAddress } from './showcaseProjects.js';

export const FILTER_ALL = 'all';

/** Only rows on the map: a coverage city of their state, the required fields, and a valid address if any. */
export const isListable = (p) =>
  Boolean(p && p.id && p.name && p.category && p.city && p.stateCode && getPresenceState(p.stateCode)?.cities.includes(p.city) && isValidAddress(p.address));

export const getBrowsableProjects = (rows = getProjectRows()) => rows.filter(isListable);

// ---- Groups: one per client; projects without a client group by category ----

export const groupIdOf = (p) => (p.client ? `client:${p.client}` : `category:${p.category}`);
export const groupNameOf = (p) => p.client || p.category;

const NOUNS = {
  'Coaching centre': ['campus', 'campuses'],
  Commercial: ['building', 'buildings'],
  Residential: ['home', 'homes'],
  Industrial: ['site', 'sites'],
  School: ['school', 'schools'],
  Hospital: ['hospital', 'hospitals'],
};
const nounFor = (category, n) => (NOUNS[category] || ['project', 'projects'])[n === 1 ? 0 : 1];

const PLURAL_CATEGORY = {
  'Coaching centre': 'coaching centres',
  Commercial: 'commercial buildings',
  Residential: 'homes',
  Industrial: 'industrial sites',
  School: 'schools',
  Hospital: 'hospitals',
};

/** "wiring & lighting": the two most common kinds of work across these projects. */
export const scopeSummary = (projects) => {
  const tally = new Map();
  projects.forEach((p) => (p.scope || []).forEach((s) => tally.set(s, (tally.get(s) || 0) + 1)));
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([s]) => SCOPE_LABELS[s] || s.toLowerCase());
  return top.join(' & ');
};

const scopeKey = (scope) => [...(scope || [])].sort().join('|');

/** The work most of these projects share (the most common exact scope), e.g. ['Full wiring', 'Lighting']. */
export const typicalScope = (projects) => {
  const tally = new Map();
  projects.forEach((p) => tally.set(scopeKey(p.scope), (tally.get(scopeKey(p.scope)) || 0) + 1));
  const [key] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0] || [''];
  return key ? key.split('|') : [];
};

/** A row's scope chips are shown only when its work differs from its group's typical work. */
export const scopeDiffers = (project, group) => scopeKey(project.scope) !== scopeKey(group?.typicalScope);

/** A client's short brand word: its first word, e.g. "ALLEN Career Institute" → "ALLEN". */
export const clientBrand = (client) => (client ? client.trim().split(/\s+/)[0] : null);

/**
 * Name in a client + city list: the client's brand word + the campus name, without the "<City> – "
 * prefix, e.g. "ALLEN Ahmedabad – Sadhya SBR" → "ALLEN Sadhya SBR"; "ALLEN Sankalp" stays as it is;
 * a satellite town keeps its place ("ALLEN Thane – Manpada Campus"). Projects without a client just
 * lose the city prefix. The project detail keeps the full name.
 */
export const listName = (p) => {
  const brand = clientBrand(p.client);
  let rest = p.name;
  if (brand && rest.startsWith(`${brand} `)) rest = rest.slice(brand.length + 1);
  if (p.city && rest.startsWith(`${p.city} – `)) rest = rest.slice(p.city.length + 3);
  return brand ? `${brand} ${rest}` : rest;
};

/** Client groups for a set of projects, biggest first: { id, name, isClient, category, count, noun, line, projects }. */
export const getGroups = (projects) => {
  const byId = new Map();
  projects.forEach((p) => {
    const id = groupIdOf(p);
    if (!byId.has(id)) byId.set(id, { id, name: groupNameOf(p), isClient: Boolean(p.client), category: p.category, projects: [] });
    byId.get(id).projects.push(p);
  });
  return [...byId.values()]
    .map((g) => {
      const count = g.projects.length;
      const noun = nounFor(g.category, count);
      const scope = scopeSummary(g.projects);
      return { ...g, count, noun, typicalScope: typicalScope(g.projects), line: `${count} ${noun}${scope ? ` · ${scope}` : ''}` };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

// ---- Filters ----

/** "All clients", then one chip per client and per category (of no-client projects) that has projects. */
export const getFilterOptions = (projects) => [
  { id: FILTER_ALL, label: 'All clients', count: projects.length },
  ...getGroups(projects).map((g) => ({ id: g.id, label: g.name, count: g.count })),
];

export const matchesFilter = (p, filter) => !filter || filter === FILTER_ALL || groupIdOf(p) === filter;
export const filterProjects = (projects, filter) => projects.filter((p) => matchesFilter(p, filter));

// ---- Places ----

export const cityKey = (stateCode, city) => `${stateCode}|${city}`;

/** Project count per city: Map("IN-RJ|Kota" → n). */
export const countByCity = (projects) => {
  const counts = new Map();
  projects.forEach((p) => counts.set(cityKey(p.stateCode, p.city), (counts.get(cityKey(p.stateCode, p.city)) || 0) + 1));
  return counts;
};

export const statesWithProjects = (projects) => new Set(projects.map((p) => p.stateCode));

export const projectsInState = (projects, stateCode) => projects.filter((p) => p.stateCode === stateCode);
export const projectsInCity = (projects, stateCode, city) => projects.filter((p) => p.stateCode === stateCode && p.city === city);

/** Summary pill: "<place> · N cities · N projects" (cities that have at least one project). */
export const placeSummary = (projects, placeName) => {
  const cities = countByCity(projects).size;
  const n = projects.length;
  return {
    place: placeName,
    cities,
    projects: n,
    text: `${placeName} · ${cities} ${cities === 1 ? 'city' : 'cities'} · ${n} ${n === 1 ? 'project' : 'projects'}`,
  };
};

/** Stat tiles: { total, completed, ongoing }. */
export const statusStats = (projects) => ({
  total: projects.length,
  completed: projects.filter((p) => p.status === 'completed').length,
  ongoing: projects.filter((p) => p.status === 'ongoing').length,
});

export const STATUS_TABS = Object.freeze(['all', 'completed', 'ongoing']);
const STATUS_LABELS = { all: 'All', completed: 'Completed', ongoing: 'Ongoing' };

/** The different statuses among these projects, e.g. ['completed'] or ['completed', 'ongoing']. */
export const statusesIn = (projects) => STATUS_TABS.slice(1).filter((s) => projects.some((p) => p.status === s));

/**
 * Group-list status tabs, only when the list mixes 2+ statuses: "All", plus each status that has rows.
 * One status for every row → no tabs at all (they come back by themselves once statuses differ).
 */
export const statusTabs = (projects) => {
  if (statusesIn(projects).length < 2) return [];
  const stats = statusStats(projects);
  return STATUS_TABS.map((id) => ({ id, label: STATUS_LABELS[id], count: id === 'all' ? stats.total : stats[id] })).filter((t) => t.id === 'all' || t.count > 0);
};

/**
 * One status for every project → one line instead of tiles: "7 projects · all completed"
 * ("1 project · completed"); mixed statuses → null (the tiles are shown).
 */
export const uniformStatusLine = (projects) => {
  const statuses = statusesIn(projects);
  if (projects.length === 0 || statuses.length !== 1) return null;
  const n = projects.length;
  return `${n} ${n === 1 ? 'project' : 'projects'} · ${n === 1 ? '' : 'all '}${statuses[0]}`;
};

/** City stat tiles for mixed statuses: "Projects", plus Completed / Ongoing only when not 0. */
export const statTiles = (projects) => {
  const stats = statusStats(projects);
  return [
    { id: 'total', label: 'Projects', value: stats.total },
    { id: 'completed', label: 'Completed', value: stats.completed },
    { id: 'ongoing', label: 'Ongoing', value: stats.ongoing },
  ].filter((t) => t.id === 'total' || t.value > 0);
};

/** Client filter chips are shown only while the data has 2+ client / category groups. */
export const showClientFilter = (filterOptions) => filterOptions.length > 2;
export const filterByStatus = (projects, tab) => (tab === 'completed' || tab === 'ongoing' ? projects.filter((p) => p.status === tab) : projects);

/** One line under a city name: "Electrical work for coaching centres, commercial buildings and homes." */
export const cityLine = (projects) => {
  const cats = [...new Set(projects.map((p) => p.category))].map((c) => PLURAL_CATEGORY[c] || c.toLowerCase());
  if (cats.length === 0) return '';
  const list = cats.length === 1 ? cats[0] : `${cats.slice(0, -1).join(', ')} and ${cats[cats.length - 1]}`;
  return `Electrical work for ${list}.`;
};

/** Status label: "✓ 2022" / "Completed" / "Ongoing". */
export const statusLabel = (p, { long = false } = {}) => {
  if (p.status === 'ongoing') return 'Ongoing';
  if (long) return p.year ? `Completed ${p.year}` : 'Completed';
  return p.year ? String(p.year) : 'Completed';
};

/** WhatsApp text for "Ask about a similar project". */
export const similarProjectText = (p, companyName) =>
  `Hello ${companyName}, I saw your project "${p.name}" (${[p.area, p.city].filter(Boolean).join(', ')}) on your website. I'd like to ask about a similar project.`;
