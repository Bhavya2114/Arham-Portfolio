import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PresenceMap from '../components/map/PresenceMap';
import CityDetails from '../components/presence/CityDetails';
import BottomSheet, { PEEK_HEIGHT } from '../components/presence/BottomSheet';
import LocationExplorer from '../components/presence/LocationExplorer';
import { getPresenceStateCodes, getPresenceState } from '../data/presenceCoverage.js';
import { getPublishedProjects, getPublishedProjectsByStateAndCity } from '../data/projectSelectors.js';
import { CITY_COORDINATES } from '../data/cityCoordinates.js';
import { projectLatLon } from '../lib/mapProjection.js';
import usePageMetadata from '../lib/usePageMetadata';
import { MapPin, ArrowRight, ChevronRight, X } from 'lucide-react';

/**
 * Our Presence Page — Phase C (State Zoom, City Markers & City Details)
 *
 * India → State → City exploration driven by the `presenceCoverage.js` configuration.
 * City markers are projected from the sourced `cityCoordinates.js` record.
 * Project data is read only through the public selectors, so an empty PROJECTS dataset
 * renders neutral copy rather than invented cards or counts.
 *
 * Interface states:
 * - India overview: the map alone (plus the "Explore locations" control).
 * - State selected: map zooms to the state and shows its city markers; no panel.
 * - City selected: details open in a side panel at `lg` and above, or a bottom sheet below it.
 *   Closing the details keeps the state selected.
 */
export const Presence = () => {
  usePageMetadata(
    'Our Presence — ARHAM Electrical & Lighting Installations',
    "Explore the Indian states and cities covered by Arham's electrical wiring and lighting installation work."
  );

  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const coverageStateCodes = useMemo(() => getPresenceStateCodes(), []);
  const coverageStates = useMemo(() => coverageStateCodes.map(getPresenceState).filter(Boolean), [coverageStateCodes]);
  const publishedCount = useMemo(() => getPublishedProjects().length, []);

  const selectedState = useMemo(() => getPresenceState(selectedStateCode), [selectedStateCode]);
  const cityProjects = useMemo(
    () => (selectedState && selectedCity ? getPublishedProjectsByStateAndCity(selectedState.code, selectedCity) : []),
    [selectedState, selectedCity]
  );

  // Markers only for the selected state's supplied cities; counts derive from published projects.
  const markers = useMemo(() => {
    if (!selectedState) return [];
    return CITY_COORDINATES
      .filter((c) => c.stateCode === selectedState.code && selectedState.cities.includes(c.city))
      .map((c) => ({
        city: c.city,
        ...projectLatLon(c.lat, c.lon),
        count: getPublishedProjectsByStateAndCity(c.stateCode, c.city).length,
      }));
  }, [selectedState]);

  const selectState = (code) => {
    if (code === selectedStateCode) return;
    setSelectedStateCode(code);
    setSelectedCity(null);
  };

  // Map markers and the location list share this one selected-city state.
  const selectMarkerCity = (city) => setSelectedCity((current) => (current === city ? null : city));
  const selectLocation = (code, city) => {
    setSelectedStateCode(code);
    setSelectedCity(city);
  };

  const resetToIndia = () => {
    setSelectedStateCode(null);
    setSelectedCity(null);
  };

  // Closing details keeps the state selected and returns focus to that city's marker.
  const closeCity = () => {
    const city = selectedCity;
    setSelectedCity(null);
    if (city) {
      requestAnimationFrame(() => {
        const marker = [...document.querySelectorAll('svg g[role="button"][aria-label]')]
          .find((el) => el.getAttribute('aria-label').startsWith(`${city},`));
        marker?.focus({ preventScroll: true });
      });
    }
  };

  useEffect(() => {
    if (!selectedStateCode) return undefined;
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (selectedCity) closeCity();
      else resetToIndia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStateCode, selectedCity]);

  const announcement = selectedState
    ? selectedCity
      ? `${selectedCity}, ${selectedState.name} selected. City details opened.`
      : `${selectedState.name} selected. ${
          selectedState.cities.length > 0
            ? `${selectedState.cities.length} ${selectedState.cities.length === 1 ? 'city' : 'cities'} shown on the map.`
            : 'No cities listed yet.'
        }`
    : 'All India view.';

  return (
    <div className="flex-1 w-full bg-brand-navy-dark text-slate-100">
      <section aria-labelledby="presence-heading" className="relative">
        {/* Restrained ambient lighting */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(60% 50% at 30% 35%, rgba(16,185,129,0.10), transparent 70%), radial-gradient(40% 40% at 85% 10%, rgba(245,181,68,0.06), transparent 70%)',
          }}
        />

        <Container size="default" className="relative py-10 sm:py-14 lg:py-16 space-y-8 sm:space-y-10">
          {/* Page Header */}
          <header className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              Our Presence
            </p>
            <h1 id="presence-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white">
              Our Presence Across India
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Arham carries out electrical wiring and lighting installations for educational and commercial
              clients. Highlighted states show where our teams work today.
            </p>
          </header>

          <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Map — the primary interface */}
            <div className="w-full min-w-0 flex-1">
              <PresenceMap
                activeStateCodes={coverageStateCodes}
                selectedState={selectedState}
                onSelectState={selectState}
                onReset={resetToIndia}
                markers={markers}
                selectedCity={selectedCity}
                onSelectCity={selectMarkerCity}
                toolbar={
                  <LocationExplorer
                    states={coverageStates}
                    selectedStateCode={selectedStateCode}
                    selectedCity={selectedCity}
                    onSelectState={selectState}
                    onSelectCity={selectLocation}
                  />
                }
              />
            </div>

            {/* Desktop city panel — rendered only while a city is selected */}
            {selectedState && selectedCity && (
              <aside
                className="hidden lg:block w-[22rem] shrink-0 lg:sticky lg:top-24 rounded-2xl border border-white/10 bg-brand-navy/80 p-5"
                aria-label={`${selectedCity} details`}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <nav aria-label="Location breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-slate-400 pt-3">
                    <button
                      type="button"
                      onClick={resetToIndia}
                      className="inline-flex items-center min-h-[44px] -my-3 px-1 -mx-1 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                    >
                      India
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={closeCity}
                      className="inline-flex items-center min-h-[44px] -my-3 px-1 -mx-1 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                    >
                      {selectedState.name}
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-slate-200 font-medium" aria-current="location">{selectedCity}</span>
                  </nav>
                  <button
                    type="button"
                    onClick={closeCity}
                    aria-label="Close city details"
                    className="inline-flex items-center justify-center w-11 h-11 shrink-0 -mt-2 -mr-2 rounded-full text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <CityDetails city={selectedCity} stateName={selectedState.name} projects={cityProjects} headingLevel="h2" />
              </aside>
            )}
          </div>
        </Container>
      </section>

      {/* Project showcase status + enquiry */}
      <section className="border-t border-white/10" aria-labelledby="presence-projects-heading">
        <Container size="default" className="py-10 sm:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h2 id="presence-projects-heading" className="text-lg font-bold font-heading text-white">
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
              <Button as={Link} to="/projects" variant="outline" icon={ArrowRight} iconPosition="right" className="min-h-[44px]">
                View projects
              </Button>
            )}
            <Button as={Link} to="/contact" variant="primary" icon={ArrowRight} iconPosition="right" className="min-h-[44px] focus-visible:ring-offset-brand-navy-dark">
              Discuss a project
            </Button>
          </div>
        </Container>
      </section>

      {/* Mobile city details sheet (hidden at lg and above) — rendered only while a city is selected */}
      {selectedState && selectedCity && (
        <>
          <div className="lg:hidden" style={{ height: PEEK_HEIGHT }} aria-hidden="true" />
          <BottomSheet
            open
            resetKey={`${selectedState.code}|${selectedCity}`}
            title={selectedCity}
            subtitle={selectedState.name}
            label={`${selectedCity} details`}
            onClose={closeCity}
          >
            <CityDetails city={selectedCity} stateName={selectedState.name} projects={cityProjects} showHeading={false} />
          </BottomSheet>
        </>
      )}
    </div>
  );
};

export default Presence;
