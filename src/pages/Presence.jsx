import React, { useReducer, useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PresenceMap, { PAGE_NAVY } from '../components/map/PresenceMap';
import BottomSheet, { PEEK_HEIGHT } from '../components/presence/BottomSheet';
import CampusCard from '../components/presence/CampusCard';
import { ProjectDetails, ProjectChooser, CityProjectList } from '../components/presence/ProjectDetails';
import { getPresenceStateCodes, getPresenceState } from '../data/presenceCoverage.js';
import {
  getPublishedProjects,
  getPublishedProjectsByStateAndCity,
  getMappedProjectsByStateAndCity,
} from '../data/projectSelectors.js';
import { CITY_COORDINATES } from '../data/cityCoordinates.js';
import { getShowcaseProjectsForCity, getShowcaseProjectsForState, hasSiteCoordinates } from '../data/showcaseProjects.js';
import { projectLatLon } from '../lib/mapProjection.js';
import { loadStateGeography } from '../data/geo/stateGeography.js';
import { presenceNavReducer, INITIAL_PRESENCE_NAV } from '../lib/presenceNavigation.js';
import usePageMetadata from '../lib/usePageMetadata';
import { MapPin, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Our Presence Page — project discovery map
 *
 * India → State → City (project list) → Project details.
 * - Coverage (11 states / 27 cities) comes from `presenceCoverage.js`.
 * - Selecting a state zooms the map to it and shows its city markers, district lines and the pins
 *   of every verified project in that state.
 * - Selecting a city does NOT zoom or draw a city-level map: it opens that city's verified projects,
 *   listed one by one, in the side panel (`lg` and above) or the compact bottom sheet below it.
 *   Each project can then be opened and stepped through (previous / next).
 * - Project pins use each published project's own verified `coordinates`; city coordinates are never
 *   substituted. With no published projects a city shows the honest empty state.
 */
export const Presence = () => {
  usePageMetadata(
    'Our Presence — ARHAM Electrical & Lighting Installations',
    "Explore the Indian states and cities covered by Arham's electrical wiring and lighting installation work."
  );

  const [nav, dispatch] = useReducer(presenceNavReducer, INITIAL_PRESENCE_NAV);

  const coverageStateCodes = useMemo(() => getPresenceStateCodes(), []);
  const publishedCount = useMemo(() => getPublishedProjects().length, []);

  const selectedState = useMemo(() => getPresenceState(nav.stateCode), [nav.stateCode]);
  const selectedCity = nav.city;

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

  // Every worked city, shown as a small dot at the India overview.
  const overviewCities = useMemo(
    () =>
      CITY_COORDINATES
        .filter((c) => coverageStateCodes.includes(c.stateCode) && getPresenceState(c.stateCode)?.cities.includes(c.city))
        .map((c) => ({ city: c.city, stateCode: c.stateCode, ...projectLatLon(c.lat, c.lon) })),
    [coverageStateCodes]
  );

  // City markers for the selected state (reference points, not building locations).
  const cityMarkers = useMemo(() => {
    if (!selectedState) return [];
    return CITY_COORDINATES
      .filter((c) => c.stateCode === selectedState.code && selectedState.cities.includes(c.city))
      .map((c) => ({
        city: c.city,
        lat: c.lat,
        ...projectLatLon(c.lat, c.lon),
        count: getMappedProjectsByStateAndCity(c.stateCode, c.city).length,
      }));
  }, [selectedState]);

  // Verified (published) projects across the selected state's approved cities.
  const stateProjects = useMemo(
    () => (selectedState ? selectedState.cities.flatMap((c) => getPublishedProjectsByStateAndCity(selectedState.code, c)) : []),
    [selectedState]
  );
  const stateMappedProjects = useMemo(
    () => (selectedState ? selectedState.cities.flatMap((c) => getMappedProjectsByStateAndCity(selectedState.code, c)) : []),
    [selectedState]
  );
  // Showcase projects (data/showcaseProjects.js) in the selected state (records with a city only).
  const stateShowcase = useMemo(() => (selectedState ? getShowcaseProjectsForState(selectedState.code) : []), [selectedState]);
  // Pins: published projects with verified coordinates, plus showcase projects that have lat / lng.
  const projectMarkers = useMemo(
    () => [
      ...stateMappedProjects.map((p) => ({ id: p.id, name: p.name, city: p.city, ...projectLatLon(p.coordinates.lat, p.coordinates.lon) })),
      ...stateShowcase.filter(hasSiteCoordinates).map((p) => ({ id: p.id, name: p.name, city: p.city, ...projectLatLon(p.lat, p.lng) })),
    ],
    [stateMappedProjects, stateShowcase]
  );
  const cityProjects = useMemo(
    () => (selectedState && selectedCity ? getPublishedProjectsByStateAndCity(selectedState.code, selectedCity) : []),
    [selectedState, selectedCity]
  );

  // Showcase projects (data/showcaseProjects.js) for the floating card: only the selected city's own
  // records, never another city's. `cardProjectId` is the project shown in the card; it falls back to
  // the city's first project, so switching city always starts at that city's own projects.
  const cityShowcase = useMemo(
    () => (selectedState && selectedCity ? getShowcaseProjectsForCity(selectedState.code, selectedCity) : []),
    [selectedState, selectedCity]
  );
  const [cardProjectId, setCardProjectId] = useState(null);
  const cardProject = cityShowcase.find((p) => p.id === cardProjectId) || cityShowcase[0] || null;

  const selectedProject = stateProjects.find((p) => p.id === nav.projectId) || null;
  const clusterProjects = nav.clusterIds ? stateMappedProjects.filter((p) => nav.clusterIds.includes(p.id)) : [];
  // A city without published gallery projects is browsed with the floating project card over the map
  // (its showcase projects, or "Projects coming soon") instead of the panel / bottom sheet.
  const projectCardOnly = Boolean(selectedCity && !selectedProject && clusterProjects.length === 0 && cityProjects.length === 0);
  // The panel opens for a selected city (project list / empty state), a project, or a same-site cluster.
  const detailsOpen = Boolean((selectedCity && !projectCardOnly) || selectedProject || clusterProjects.length > 0);

  // Card <-> map: the card's project is highlighted on the map: its own pin when it has lat / lng,
  // otherwise its city pin. A tapped showcase pin switches the card to that project (and its city).
  const highlightedProjectId = nav.projectId || (projectCardOnly && cardProject && hasSiteCoordinates(cardProject) ? cardProject.id : null);
  const showShowcaseProject = (projectId) => {
    const project = stateShowcase.find((p) => p.id === projectId);
    if (!project) return false;
    if (project.city !== nav.city) dispatch({ type: 'selectCity', stateCode: nav.stateCode, city: project.city });
    setCardProjectId(project.id);
    return true;
  };

  const openProject = (projectId) => {
    if (showShowcaseProject(projectId)) return;
    const project = stateProjects.find((p) => p.id === projectId);
    if (project) dispatch({ type: 'selectProject', projectId, city: project.city });
  };
  const projectIndex = selectedProject ? cityProjects.findIndex((p) => p.id === selectedProject.id) : -1;

  // Close the whole panel: back to the state view (the map itself never moved).
  const closePanel = () => (nav.city ? dispatch({ type: 'selectState', stateCode: nav.stateCode }) : dispatch({ type: 'closeDetails' }));

  // Back from a project / cluster to the city's project list.
  const closeDetails = () => {
    const returnTo = nav.projectId;
    dispatch({ type: 'closeDetails' });
    if (returnTo) {
      requestAnimationFrame(() => {
        // Return focus to the project's pin, or to the cluster that contains it.
        const target = [...document.querySelectorAll('svg [data-project-id], svg [data-project-ids]')].find(
          (el) => el.getAttribute('data-project-id') === returnTo || (el.getAttribute('data-project-ids') || '').split(' ').includes(returnTo)
        );
        target?.focus({ preventScroll: true });
      });
    }
  };

  useEffect(() => {
    if (!nav.stateCode) return undefined;
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (nav.projectId || nav.clusterIds) closeDetails();
      else dispatch({ type: 'back' });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nav]);

  const announcement = selectedProject
    ? `${selectedProject.name} details opened.`
    : clusterProjects.length > 0
      ? `${clusterProjects.length} nearby projects. Choose one.`
      : selectedCity
        ? `${selectedCity}, ${selectedState.name}. ${
            cityProjects.length > 0 ? `${cityProjects.length} verified ${cityProjects.length === 1 ? 'project' : 'projects'} listed.` : 'No approved projects yet.'
          }${projectCardOnly ? (cityShowcase.length > 0 ? ` ${cityShowcase.length} ${cityShowcase.length === 1 ? 'project' : 'projects'} shown.` : ' Projects coming soon.') : ''}`
        : selectedState
          ? `${selectedState.name} selected. ${
              selectedState.cities.length > 0
                ? `${selectedState.cities.length} ${selectedState.cities.length === 1 ? 'city' : 'cities'} shown on the map.`
                : 'No cities listed yet.'
            }`
          : 'All India view.';

  const detailsTitle = selectedProject
    ? selectedProject.name
    : clusterProjects.length > 0
      ? `${clusterProjects.length} nearby projects`
      : selectedCity || '';
  const detailsSubtitle = selectedProject
    ? `${selectedProject.city}, ${selectedState?.name}`
    : clusterProjects.length > 0
      ? selectedState?.name || ''
      : selectedState && selectedCity
        ? `${selectedState.name} · ${cityProjects.length} verified ${cityProjects.length === 1 ? 'project' : 'projects'}`
        : '';
  const stepButton =
    'inline-flex items-center gap-1 min-h-[44px] px-2 text-sm text-slate-300 hover:text-white disabled:opacity-35 disabled:hover:text-slate-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent';
  const detailsBody = selectedProject ? (
    <div className="space-y-3">
      {/* One by one through the city's projects, or back to the list */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-white/10 pb-2">
        <button type="button" onClick={closeDetails} className={stepButton}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          All projects in {selectedProject.city}
        </button>
        {projectIndex >= 0 && cityProjects.length > 1 && (
          <div className="flex items-center" role="group" aria-label="Browse projects">
            <button type="button" className={stepButton} disabled={projectIndex === 0} onClick={() => openProject(cityProjects[projectIndex - 1].id)} aria-label="Previous project">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="text-xs text-slate-400 tabular-nums">{projectIndex + 1} / {cityProjects.length}</span>
            <button type="button" className={stepButton} disabled={projectIndex === cityProjects.length - 1} onClick={() => openProject(cityProjects[projectIndex + 1].id)} aria-label="Next project">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <ProjectDetails key={selectedProject.id} project={selectedProject} stateName={selectedState?.name} showHeading={false} />
    </div>
  ) : clusterProjects.length > 0 ? (
    <ProjectChooser projects={clusterProjects} onSelect={openProject} />
  ) : (
    <CityProjectList city={selectedCity} projects={cityProjects} onSelect={openProject} />
  );

  return (
    <div className="flex-1 w-full bg-brand-navy-dark text-slate-100">
      {/* One background for the map section: page navy, with the map's own radial glow fading into it.
          overflow-x clip: the map wrapper's fade band may extend past the page gutter. */}
      <section aria-labelledby="presence-heading" className="relative overflow-x-clip" style={{ background: PAGE_NAVY }}>
        {/* Bottom padding ≥ the map's fade band (40 / 80 px), so the band stays inside this section. */}
        <Container size="default" className="relative pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-24 lg:pb-28 space-y-8 sm:space-y-10">
          {/* Page Header */}
          <header className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-dark">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              Our Work
            </p>
            <h1 id="presence-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white">
              Where We&apos;ve Worked
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore the cities where Arham has delivered electrical wiring and lighting projects.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 tracking-wide leading-relaxed">
              Interactive map · Project locations · Electrical and lighting work
            </p>
          </header>

          <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Map — the primary interface */}
            <div className="w-full min-w-0 flex-1">
              <PresenceMap
                activeStateCodes={coverageStateCodes}
                selectedState={selectedState}
                onSelectState={(stateCode) => dispatch({ type: 'selectState', stateCode })}
                onReset={() => dispatch({ type: 'reset' })}
                onSelectInactiveState={() => dispatch({ type: 'reset' })}
                onBackgroundTap={() => dispatch({ type: 'reset' })}
                markers={cityMarkers}
                overviewCities={overviewCities}
                selectedCity={selectedCity}
                onSelectCity={(city) => dispatch({ type: 'selectCity', stateCode: nav.stateCode, city })}
                geography={geography}
                referenceLat={cityMarkers[0]?.lat ?? null}
                projectMarkers={projectMarkers}
                selectedProjectId={highlightedProjectId}
                cityBeacon={!highlightedProjectId}
                onSelectProject={openProject}
                onSelectCluster={(projectIds) => {
                  // A cluster with showcase projects switches the card to the first of them.
                  const showcaseId = projectIds.find((id) => stateShowcase.some((p) => p.id === id));
                  if (showcaseId) showShowcaseProject(showcaseId);
                  else dispatch({ type: 'showCluster', projectIds });
                }}
                overlay={
                  projectCardOnly && cardProject ? (
                    <CampusCard
                      key={`${nav.stateCode}|${selectedCity}`}
                      city={selectedCity}
                      projects={cityShowcase}
                      currentId={cardProject.id}
                      onChange={setCardProjectId}
                    />
                  ) : null
                }
              />
            </div>

            {/* Desktop panel — rendered only while a city, project or cluster is selected */}
            {detailsOpen && (
              <aside
                className="hidden lg:block relative z-30 w-[22rem] shrink-0 lg:sticky lg:top-24 rounded-2xl border border-white/[0.08] bg-surface p-5"
                aria-label={`${detailsTitle} details`}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold font-heading text-white leading-snug">{detailsTitle}</h2>
                    <p className="text-sm text-slate-400">{detailsSubtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closePanel}
                    aria-label="Close panel"
                    className="inline-flex items-center justify-center w-11 h-11 shrink-0 -mt-2 -mr-2 rounded-full text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                {detailsBody}
              </aside>
            )}
          </div>
        </Container>
      </section>

      {/* Project showcase status + enquiry */}
      <section className="border-t border-white/10 bg-navy-800" aria-labelledby="presence-projects-heading">
        <Container size="default" className="py-10 sm:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h2 id="presence-projects-heading" className="text-lg font-bold font-heading text-heading">
              Project showcase
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {publishedCount > 0
                ? `${publishedCount} published ${publishedCount === 1 ? 'project is' : 'projects are'} available in our project gallery.`
                : 'Project case studies with photographs are being prepared and will appear here once approved for publication.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {publishedCount > 0 && (
              <Button as={Link} to="/projects" variant="outline" onDark icon={ArrowRight} iconPosition="right" className="min-h-[44px]">
                View projects
              </Button>
            )}
            <Button as={Link} to="/contact" variant="primary" icon={ArrowRight} iconPosition="right" className="min-h-[44px] focus-visible:ring-offset-brand-navy-dark">
              Discuss a project
            </Button>
          </div>
        </Container>
      </section>

      {/* Mobile sheet (hidden at lg and above) — rendered only while a city, project or cluster is selected */}
      {detailsOpen && (
        <>
          <div className="lg:hidden" style={{ height: PEEK_HEIGHT }} aria-hidden="true" />
          <BottomSheet
            open
            resetKey={nav.projectId || (nav.clusterIds || []).join('|') || nav.city}
            title={detailsTitle}
            subtitle={detailsSubtitle}
            label={`${detailsTitle} details`}
            onClose={closePanel}
          >
            {detailsBody}
          </BottomSheet>
        </>
      )}
    </div>
  );
};

export default Presence;
