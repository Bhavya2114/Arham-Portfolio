import React, { useReducer, useMemo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PresenceMap, { PAGE_NAVY } from '../components/map/PresenceMap';
import ProjectSheet from '../components/presence/ProjectSheet';
import ProjectBrowser from '../components/presence/ProjectBrowser';
import OurWorkToolbar from '../components/presence/OurWorkToolbar';
import { getPresenceStateCodes, getPresenceState } from '../data/presenceCoverage.js';
import { CITY_COORDINATES } from '../data/cityCoordinates.js';
import { hasSiteCoordinates } from '../data/showcaseProjects.js';
import {
  FILTER_ALL,
  getBrowsableProjects,
  getFilterOptions,
  filterProjects,
  countByCity,
  cityKey,
  statesWithProjects,
  projectsInState,
  projectsInCity,
  placeSummary,
  getGroups,
  groupIdOf,
} from '../data/projectBrowse.js';
import { projectLatLon } from '../lib/mapProjection.js';
import { loadStateGeography } from '../data/geo/stateGeography.js';
import { presenceNavReducer, INITIAL_PRESENCE_NAV, sheetLevel } from '../lib/presenceNavigation.js';
import usePageMetadata from '../lib/usePageMetadata';
import { PAGE_META } from '../data/pageMeta';
import { useSheetHistory, historyDepth } from '../lib/useSheetHistory.js';
import { COMPANY, whatsappHref, WHATSAPP_HELLO } from '../data/company';
import { ArrowRight, Phone, MessageCircle } from 'lucide-react';

/**
 * Our Work page (/our-work; /presence and /projects redirect here): the India map is the way in to
 * every project.
 *
 * India → State → City → Group → Project (lib/presenceNavigation.js):
 * - Map: city pins carry a yellow project-count badge; a summary pill and client / category filter
 *   chips sit above the map. A filter dims states and cities with no matching projects and updates
 *   every count (all derived from data/showcaseProjects.js by data/projectBrowse.js).
 * - Tapping a city opens its summary (stats + client groups) in a bottom sheet on phones (half height;
 *   the map stays visible above) or a ~400 px side panel on desktop. Group → project list (tabs All /
 *   Completed / Ongoing); row → project detail (photos, work done, WhatsApp).
 * - Selecting a state fits the map to it; selecting a city never zooms. Moving inside the sheet never
 *   moves the map. Back / Escape step back one level; closing returns focus to the city pin.
 * - An opened project highlights its own pin (yellow beacon) when it has coordinates, else its city pin.
 * - Every sheet level (city → group → project → photo viewer) is a browser-history entry on the same URL
 *   (lib/useSheetHistory.js): the phone's back button steps back one level and finally closes the sheet.
 */
const useIsDesktop = () => {
  const query = '(min-width: 1024px)';
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return match;
};

const cityPinFor = (city) =>
  [...document.querySelectorAll('svg [role="button"][aria-pressed]')].find((el) => (el.getAttribute('aria-label') || '').startsWith(`${city},`));

export const Presence = () => {
  usePageMetadata(PAGE_META['/our-work'].title, PAGE_META['/our-work'].description);

  const [nav, dispatch] = useReducer(presenceNavReducer, INITIAL_PRESENCE_NAV);
  const [filter, setFilter] = useState(FILTER_ALL);
  const isDesktop = useIsDesktop();

  const coverageStateCodes = useMemo(() => getPresenceStateCodes(), []);
  const selectedState = useMemo(() => getPresenceState(nav.stateCode), [nav.stateCode]);
  const selectedCity = nav.city;
  const level = sheetLevel(nav);

  // ---- Projects, filter and counts (all derived from the project rows) ----
  const allProjects = useMemo(() => getBrowsableProjects(), []);
  const filterOptions = useMemo(() => getFilterOptions(allProjects), [allProjects]);
  const filtered = useMemo(() => filterProjects(allProjects, filter), [allProjects, filter]);
  const counts = useMemo(() => countByCity(filtered), [filtered]);
  const filtering = filter !== FILTER_ALL;
  const filterLabel = filtering ? filterOptions.find((o) => o.id === filter)?.label || null : null;
  const dimStateCodes = useMemo(() => {
    if (!filtering) return [];
    const withProjects = statesWithProjects(filtered);
    return coverageStateCodes.filter((code) => !withProjects.has(code));
  }, [filtering, filtered, coverageStateCodes]);
  const summary = useMemo(
    () => (selectedState ? placeSummary(projectsInState(filtered, selectedState.code), selectedState.name) : placeSummary(filtered, 'India')).text,
    [filtered, selectedState]
  );

  // Phone action bar (MobileActionBar) hides while a city's sheet / panel is open.
  useEffect(() => {
    const root = document.documentElement;
    if (selectedCity) root.setAttribute('data-map-card', 'open');
    else root.removeAttribute('data-map-card');
    return () => root.removeAttribute('data-map-card');
  }, [selectedCity]);

  // District lines for the selected state, fetched only when that state is selected (code-split).
  const [geo, setGeo] = useState({ stateCode: null, data: null, status: 'idle' });
  useEffect(() => {
    if (!nav.stateCode) return undefined;
    let active = true;
    setGeo({ stateCode: nav.stateCode, data: null, status: 'loading' });
    loadStateGeography(nav.stateCode)
      .then((data) => active && setGeo({ stateCode: nav.stateCode, data, status: data ? 'ready' : 'unavailable' }))
      .catch(() => active && setGeo({ stateCode: nav.stateCode, data: null, status: 'error' }));
    return () => {
      active = false;
    };
  }, [nav.stateCode]);
  const geography = geo.stateCode === nav.stateCode ? geo.data : null;

  // Every worked city, shown as a small dot at the India overview (faded when the filter has none there).
  const overviewCities = useMemo(
    () =>
      CITY_COORDINATES
        .filter((c) => coverageStateCodes.includes(c.stateCode) && getPresenceState(c.stateCode)?.cities.includes(c.city))
        .map((c) => ({ city: c.city, stateCode: c.stateCode, ...projectLatLon(c.lat, c.lon), dim: filtering && !counts.get(cityKey(c.stateCode, c.city)) })),
    [coverageStateCodes, filtering, counts]
  );

  // City markers for the selected state (reference points, not building locations), with project counts.
  const cityMarkers = useMemo(() => {
    if (!selectedState) return [];
    return CITY_COORDINATES
      .filter((c) => c.stateCode === selectedState.code && selectedState.cities.includes(c.city))
      .map((c) => {
        const count = counts.get(cityKey(c.stateCode, c.city)) || 0;
        return { city: c.city, lat: c.lat, ...projectLatLon(c.lat, c.lon), count, dim: filtering && count === 0 };
      });
  }, [selectedState, counts, filtering]);

  // Project pins: projects in the selected state that have their own site coordinates.
  const stateProjects = useMemo(() => (selectedState ? projectsInState(filtered, selectedState.code) : []), [filtered, selectedState]);
  const projectMarkers = useMemo(
    () => stateProjects.filter(hasSiteCoordinates).map((p) => ({ id: p.id, name: p.name, city: p.city, ...projectLatLon(p.lat, p.lng) })),
    [stateProjects]
  );

  // ---- The sheet / panel content for the current level ----
  const cityProjects = useMemo(
    () => (selectedState && selectedCity ? projectsInCity(filtered, selectedState.code, selectedCity) : []),
    [filtered, selectedState, selectedCity]
  );
  const groups = useMemo(() => getGroups(cityProjects), [cityProjects]);
  const group = groups.find((g) => g.id === nav.groupId) || null;
  const project = nav.projectId ? allProjects.find((p) => p.id === nav.projectId) || null : null;
  const clusterProjects = nav.clusterIds ? allProjects.filter((p) => nav.clusterIds.includes(p.id)) : [];

  // Map ↔ list: an open project lights its own pin (if it has coordinates), otherwise its city pin.
  const highlightedProjectId = project && hasSiteCoordinates(project) ? project.id : null;

  // A city with exactly one client group opens that group's list directly (no city summary step).
  const singleGroupOf = (stateCode, city) => {
    const cityGroups = getGroups(projectsInCity(filtered, stateCode, city));
    return cityGroups.length === 1 ? cityGroups[0].id : null;
  };
  // …and a city with exactly one project opens that project's detail directly.
  const selectCity = (city) => {
    const only = projectsInCity(filtered, nav.stateCode, city);
    dispatch({ type: 'selectCity', stateCode: nav.stateCode, city, groupId: singleGroupOf(nav.stateCode, city), projectId: only.length === 1 ? only[0].id : null });
  };

  const openProject = (projectId) => {
    const p = allProjects.find((x) => x.id === projectId);
    if (!p) return;
    const autoGroup = p.city === nav.city ? nav.autoGroup : singleGroupOf(p.stateCode, p.city) === groupIdOf(p);
    dispatch({ type: 'selectProject', projectId, city: p.city, groupId: groupIdOf(p), autoGroup });
  };
  const back = () => dispatch({ type: 'back' });
  const closeSheet = () => dispatch({ type: 'closeSheet' });

  // Full-screen photo viewer: owned here because it is a history level too (closed with its project).
  const [photoViewer, setPhotoViewer] = useState(null);
  useEffect(() => setPhotoViewer(null), [nav.projectId]);
  const viewerOpen = level === 'project' && photoViewer !== null;

  // Phone back button / gesture: one level per history entry (viewer → project → list → summary → closed).
  useSheetHistory(historyDepth(nav, viewerOpen), (levels) => {
    let left = levels;
    if (viewerOpen && left > 0) {
      setPhotoViewer(null);
      left -= 1;
    }
    for (; left > 0; left -= 1) dispatch({ type: 'back' });
  });

  // Sheet height: half for a city summary, full for a list or a project (tapping a group expands it).
  const [snap, setSnap] = useState('half');
  useEffect(() => {
    setSnap(level === 'city' ? 'half' : 'full');
  }, [level, nav.city]);

  // Escape steps back one level (the photo viewer captures its own Escape first).
  useEffect(() => {
    if (!nav.stateCode) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') dispatch({ type: 'back' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nav.stateCode]);

  // Closing the sheet returns focus to the city pin it was opened from.
  const lastCity = useRef(null);
  useEffect(() => {
    if (selectedCity) {
      lastCity.current = selectedCity;
      return;
    }
    if (lastCity.current) {
      const city = lastCity.current;
      lastCity.current = null;
      requestAnimationFrame(() => cityPinFor(city)?.focus({ preventScroll: true }));
    }
  }, [selectedCity]);

  // Desktop: opening a state or a city scrolls the page so the map + panel area sits right under the site
  // header (that area is one viewport tall, so exploring needs no page scrolling). Skipped when already aligned.
  const mapAreaRef = useRef(null);
  useEffect(() => {
    if (!isDesktop || (!nav.stateCode && !selectedCity)) return;
    const area = mapAreaRef.current;
    if (!area) return;
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 80;
    const delta = area.getBoundingClientRect().top - headerBottom;
    if (Math.abs(delta) <= 2) return;
    window.scrollBy({ top: delta, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [isDesktop, nav.stateCode, selectedCity]);

  // Phone: on a new city, scroll the PAGE (never the map) so its pin sits above the half-height sheet.
  useLayoutEffect(() => {
    if (!selectedCity || isDesktop) return undefined;
    const t = setTimeout(() => {
      const pin = cityPinFor(selectedCity);
      if (!pin) return;
      const r = pin.getBoundingClientRect();
      const sheetTop = window.innerHeight * 0.5;
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 64;
      const target = headerBottom + (sheetTop - headerBottom) * 0.55;
      const delta = r.top + r.height / 2 - target;
      if (Math.abs(delta) > 24) window.scrollBy({ top: delta, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [selectedCity, isDesktop]);

  const announcement = project
    ? `${project.name} opened.`
    : group
      ? `${group.name} in ${selectedCity}: ${group.count} ${group.noun}.`
      : selectedCity
        ? `${selectedCity}, ${selectedState.name}: ${cityProjects.length} ${cityProjects.length === 1 ? 'project' : 'projects'}.`
        : selectedState
          ? `${selectedState.name} selected. ${summary}.`
          : `All India view. ${summary}.`;

  const browser = (idPrefix) => (
    <ProjectBrowser
      level={level}
      idPrefix={idPrefix}
      stateName={selectedState?.name}
      city={selectedCity}
      cityProjects={cityProjects}
      groups={groups}
      group={group}
      autoGroup={nav.autoGroup}
      autoProject={nav.autoProject}
      project={project}
      clusterProjects={clusterProjects}
      filterLabel={filterLabel}
      onClearFilter={() => setFilter(FILTER_ALL)}
      onOpenGroup={(groupId) => dispatch({ type: 'openGroup', groupId })}
      onOpenProject={openProject}
      onBack={back}
      onClose={closeSheet}
      photoViewer={photoViewer}
      onPhotoViewer={setPhotoViewer}
    />
  );

  return (
    <div className="flex-1 w-full bg-brand-navy-dark text-slate-100">
      {/* One background for the map section: page background (graphite), with the map's own radial glow fading into it.
          overflow-x clip: the map wrapper's fade band may extend past the page gutter. */}
      <section aria-labelledby="presence-heading" className="relative overflow-x-clip" style={{ background: PAGE_NAVY }}>
        {/* Bottom padding ≥ the map's fade band (40 / 80 px), so the band stays inside this section. */}
        <Container size="default" className="relative pt-8 sm:pt-12 lg:pt-14 pb-16 sm:pb-24 lg:pb-28 space-y-5 sm:space-y-8">
          {/* Page Header */}
          <header className="max-w-2xl space-y-2">
            <h1 id="presence-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white">
              Our work across India
            </h1>
            <p className="text-base text-slate-300 leading-[1.65]">Tap a state, then a city, to see the projects.</p>
          </header>

          <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

          {/* Desktop: the map + panel area is exactly one viewport tall below the site header (h-20). */}
          <div ref={mapAreaRef} className="flex flex-col lg:flex-row gap-6 items-start lg:items-stretch lg:h-[calc(100dvh-5rem)] lg:py-3 scroll-mt-20" data-map-area="">
            {/* Map — the primary interface */}
            <div className="w-full min-w-0 flex-1">
              <PresenceMap
                activeStateCodes={coverageStateCodes}
                dimStateCodes={dimStateCodes}
                selectedState={selectedState}
                onSelectState={(stateCode) => dispatch({ type: 'selectState', stateCode })}
                onReset={() => dispatch({ type: 'reset' })}
                onSelectInactiveState={() => dispatch({ type: 'reset' })}
                onBackgroundTap={() => dispatch({ type: 'reset' })}
                markers={cityMarkers}
                overviewCities={overviewCities}
                selectedCity={selectedCity}
                onSelectCity={selectCity}
                geography={geography}
                referenceLat={cityMarkers[0]?.lat ?? null}
                projectMarkers={projectMarkers}
                selectedProjectId={highlightedProjectId}
                cityBeacon={!highlightedProjectId}
                onSelectProject={openProject}
                onSelectCluster={(projectIds) => dispatch({ type: 'showCluster', projectIds })}
                toolbar={<OurWorkToolbar summary={summary} options={filterOptions} filter={filter} onFilter={setFilter} />}
              />
            </div>

            {/* Desktop: the same content in a side panel next to the map */}
            {isDesktop && level && (
              <aside
                role="region"
                aria-labelledby="our-work-panel-heading"
                className={`relative z-30 w-[400px] shrink-0 ${level === 'project' ? 'h-full' : 'self-start max-h-full'} min-h-0 flex flex-col overflow-hidden rounded-2xl panel-surface p-5`}
              >
                {browser('our-work-panel')}
              </aside>
            )}
          </div>
        </Container>
      </section>

      {/* Enquiry */}
      <section className="border-t border-white/10 bg-navy-800" aria-labelledby="presence-cta-heading">
        <Container size="default" className="py-10 sm:py-14">
          <div className="rounded-2xl bg-card border border-white/[0.07] p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 id="presence-cta-heading" className="text-lg font-bold font-heading text-heading">Have a project in your city?</h2>
              <p className="text-base text-body">Call or WhatsApp us, or send your details.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as="a" href={COMPANY.phoneHref} variant="outline" onDark icon={Phone} className="min-h-[44px]">
                Call
              </Button>
              <Button as="a" href={whatsappHref(WHATSAPP_HELLO)} target="_blank" rel="noopener noreferrer" variant="outline" onDark icon={MessageCircle} className="min-h-[44px]">
                WhatsApp
              </Button>
              <Button as={Link} to="/contact" variant="primary" icon={ArrowRight} iconPosition="right" className="min-h-[44px] focus-visible:ring-offset-brand-navy-dark">
                Enquire
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Phone: the bottom sheet (half height for a city, full for a list / project) */}
      {!isDesktop && level && (
        <ProjectSheet key={`${nav.stateCode}|${selectedCity}`} snap={snap} onSnapChange={setSnap} onClose={closeSheet} labelledBy="our-work-sheet-heading">
          {browser('our-work-sheet')}
        </ProjectSheet>
      )}
    </div>
  );
};

export default Presence;
