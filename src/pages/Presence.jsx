import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import PresenceMap from '../components/map/PresenceMap';
import { getPresenceStateCodes, getPresenceState, getPresenceTotals } from '../data/presenceCoverage.js';
import { getPublishedProjects, getPublishedProjectsByStateAndCity } from '../data/projectSelectors.js';
import usePageMetadata from '../lib/usePageMetadata';
import { MapPin, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';

/**
 * Our Presence Page — Phase B (Foundation & State Selection)
 *
 * India → State → City exploration driven by the `presenceCoverage.js` configuration.
 * Project data is read only through the public selectors, so an empty PROJECTS dataset
 * renders neutral copy rather than invented cards or counts.
 *
 * Deferred to later phases: zoom/pan, geographic city markers, project strip / bottom
 * sheet, URL-restorable selection and real project cards.
 */
export const Presence = () => {
  usePageMetadata(
    'Our Presence — ARHAM Electrical & Lighting Installations',
    "Explore the Indian states and cities covered by Arham's electrical wiring and lighting installation work."
  );

  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const overviewHeadingRef = useRef(null);
  const stateHeadingRef = useRef(null);
  const pendingFocusRef = useRef(null);

  const coverageStateCodes = useMemo(() => getPresenceStateCodes(), []);
  const coverageStates = useMemo(() => coverageStateCodes.map(getPresenceState).filter(Boolean), [coverageStateCodes]);
  const totals = useMemo(() => getPresenceTotals(), []);
  const publishedCount = useMemo(() => getPublishedProjects().length, []);

  const selectedState = useMemo(() => getPresenceState(selectedStateCode), [selectedStateCode]);
  const cityProjectCount = useMemo(
    () => (selectedState && selectedCity ? getPublishedProjectsByStateAndCity(selectedState.code, selectedCity).length : 0),
    [selectedState, selectedCity]
  );

  // Move focus to the swapped-in panel heading only for panel-originated changes,
  // so map taps never scroll the page away from the map.
  useEffect(() => {
    const target = pendingFocusRef.current === 'state' ? stateHeadingRef.current
      : pendingFocusRef.current === 'overview' ? overviewHeadingRef.current : null;
    pendingFocusRef.current = null;
    if (target) target.focus({ preventScroll: true });
  }, [selectedStateCode]);

  const selectState = (code, focusPanel = false) => {
    if (code === selectedStateCode) return;
    pendingFocusRef.current = focusPanel ? 'state' : null;
    setSelectedStateCode(code);
    setSelectedCity(null);
  };

  const resetToIndia = (focusPanel = false) => {
    pendingFocusRef.current = focusPanel ? 'overview' : null;
    setSelectedStateCode(null);
    setSelectedCity(null);
  };

  useEffect(() => {
    if (!selectedStateCode) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') resetToIndia(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStateCode]);

  const cityCountLabel = (count) => {
    if (count === 0) return 'Cities to be confirmed';
    return `${count} ${count === 1 ? 'city' : 'cities'}`;
  };

  return (
    <div className="flex-1 w-full bg-brand-navy-dark text-slate-100">
      <section aria-labelledby="presence-heading" className="relative overflow-hidden">
        {/* Restrained ambient lighting */}
        <div
          className="absolute inset-0 pointer-events-none"
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Map — primary focus */}
            <div className="lg:col-span-7">
              <PresenceMap
                activeStateCodes={coverageStateCodes}
                selectedState={selectedState}
                onSelectState={(code) => selectState(code)}
                onReset={() => resetToIndia()}
              />
            </div>

            {/* Information Panel */}
            <aside
              className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl border border-white/10 bg-brand-navy/70 p-5 sm:p-6"
              aria-label="Coverage details"
            >
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {selectedState
                  ? `${selectedState.name} selected. ${selectedState.cities.length > 0 ? `${cityCountLabel(selectedState.cities.length)} listed.` : 'No cities listed yet.'}`
                  : 'All India view.'}
              </div>

              {selectedState ? (
                <div className="space-y-5">
                  <nav aria-label="Location breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => resetToIndia(true)}
                      className="inline-flex items-center min-h-[44px] -my-3 px-1 -mx-1 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                    >
                      India
                    </button>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-slate-200 font-medium" aria-current="location">{selectedState.name}</span>
                  </nav>

                  <div className="space-y-1.5">
                    <h2
                      ref={stateHeadingRef}
                      tabIndex={-1}
                      className="text-2xl font-bold font-heading text-white focus:outline-none"
                    >
                      {selectedState.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {selectedState.presenceLevel === 'major' && (
                        <span className="text-emerald-300 font-medium">Major presence · </span>
                      )}
                      {cityCountLabel(selectedState.cities.length)}
                    </p>
                  </div>

                  {selectedState.cities.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cities</h3>
                      <ul className="grid grid-cols-2 gap-2" aria-label={`Cities in ${selectedState.name}`}>
                        {selectedState.cities.map((city) => {
                          const isActive = selectedCity === city;
                          return (
                            <li key={city}>
                              <button
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setSelectedCity(isActive ? null : city)}
                                className={`w-full min-h-[44px] flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                                  isActive
                                    ? 'border-brand-accent bg-brand-accent/15 text-white'
                                    : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/25 hover:bg-white/[0.06]'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-brand-accent shrink-0" aria-hidden="true" />
                                <span className="leading-snug">{city}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      {selectedCity && (
                        <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300 leading-relaxed" role="status">
                          {cityProjectCount > 0
                            ? `${cityProjectCount} published ${cityProjectCount === 1 ? 'project' : 'projects'} in ${selectedCity}.`
                            : `Project details for ${selectedCity} will appear here once approved project records are published.`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300 leading-relaxed">
                      Specific cities in {selectedState.name} have not been listed yet.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => resetToIndia(true)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Back to India
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2
                      ref={overviewHeadingRef}
                      tabIndex={-1}
                      className="text-lg font-bold font-heading text-white focus:outline-none"
                    >
                      States we cover
                    </h2>
                    <p className="text-sm text-slate-400">
                      {totals.stateCount} states · {totals.cityCount} cities listed
                    </p>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                    {coverageStates.map((state) => (
                      <li key={state.code}>
                        <button
                          type="button"
                          onClick={() => selectState(state.code, true)}
                          className="group w-full min-h-[44px] flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition-colors hover:border-emerald-400/50 hover:bg-emerald-400/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-slate-100">{state.name}</span>
                            <span className="block text-xs text-slate-400">
                              {state.presenceLevel === 'major' ? 'Major presence · ' : ''}
                              {cityCountLabel(state.cities.length)}
                            </span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 shrink-0" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
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
    </div>
  );
};

export default Presence;
