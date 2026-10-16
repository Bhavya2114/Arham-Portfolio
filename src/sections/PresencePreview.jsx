import React, { useState, useMemo, useEffect } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import IndiaMapSvg from '../components/map/IndiaMapSvg';
import ProjectCard from '../components/map/ProjectCard';
import { 
  getPublishedProjects,
  getPublishedStateCodes,
  getPublishedCitiesByState,
  getPublishedProjectsByState,
  getPublishedProjectsByStateAndCity,
  getPublishedProjectCountByState,
  getStateDetails,
  getActiveStateCodes,
  getCitiesByState
} from '../data/projectSelectors.js';
import { 
  MapPin, 
  ArrowRight, 
  Clock, 
  FileCheck2, 
  Navigation, 
  RotateCcw, 
  Filter, 
  Building2, 
  CheckCircle2,
  ChevronRight,
  X 
} from 'lucide-react';

/**
 * Geographic Presence Section — Phase 3.4 & Geographic Coverage Update
 * 
 * Interactive Regional Project Explorer connecting verified administrative India map
 * geometry to the geographic data layer and selectors.
 * 
 * Invariants & Policies:
 * - Highlights coverage states from `presenceCoverage.js` (shared with /presence) alongside any published projects.
 * - Selecting a state exposes verified municipal operational hubs without fabricating completed project records.
 * - Privacy & Confidentiality: Public selectors guarantee confidential client names and
 *   internal reference numbers are stripped before rendering.
 * - Accessibility: Accessible native state select dropdown alongside interactive SVG paths,
 *   keyboard focus indicators, and WCAG AA contrast.
 */
export const PresencePreview = ({ projects } = {}) => {
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Derive active geographic coverage and published projects via pure selectors
  const allPublishedProjects = useMemo(() => getPublishedProjects(projects), [projects]);
  const activeStateCodes = useMemo(() => getActiveStateCodes(projects), [projects]);
  const hasActiveStates = activeStateCodes.length > 0;

  // Selected State Details & Records
  const selectedStateDetails = useMemo(
    () => (selectedStateCode ? getStateDetails(selectedStateCode) : null),
    [selectedStateCode]
  );

  const stateCities = useMemo(
    () => (selectedStateCode ? getCitiesByState(selectedStateCode, projects) : []),
    [selectedStateCode, projects]
  );

  const stateProjects = useMemo(
    () => (selectedStateCode ? getPublishedProjectsByState(selectedStateCode, projects) : []),
    [selectedStateCode, projects]
  );

  const displayedProjects = useMemo(() => {
    if (!selectedStateCode) return [];
    if (selectedCity) {
      return getPublishedProjectsByStateAndCity(selectedStateCode, selectedCity, projects);
    }
    return stateProjects;
  }, [selectedStateCode, selectedCity, stateProjects, projects]);

  // Stale-state auto-reset guards: clear selection if code is no longer active
  useEffect(() => {
    if (selectedStateCode && !activeStateCodes.includes(selectedStateCode)) {
      setSelectedStateCode(null);
      setSelectedCity(null);
    }
  }, [selectedStateCode, activeStateCodes]);

  useEffect(() => {
    if (selectedCity && !stateCities.includes(selectedCity)) {
      setSelectedCity(null);
    }
  }, [selectedCity, stateCities]);

  // Handlers for state and city transitions
  const handleSelectState = (stateCode) => {
    if (!stateCode) {
      setSelectedStateCode(null);
      setSelectedCity(null);
      return;
    }

    // Toggle off if already selected, otherwise switch state and reset city filter
    if (selectedStateCode === stateCode) {
      setSelectedStateCode(null);
      setSelectedCity(null);
    } else {
      setSelectedStateCode(stateCode);
      setSelectedCity(null);
    }
  };

  const handleSelectCity = (cityName) => {
    if (selectedCity === cityName) {
      setSelectedCity(null); // Toggle to all cities in current state
    } else {
      setSelectedCity(cityName);
    }
  };

  const handleResetToAllIndia = () => {
    setSelectedStateCode(null);
    setSelectedCity(null);
  };

  return (
    <section
      id="presence"
      className="w-full py-16 sm:py-20 lg:py-24 border-t border-brand-border bg-brand-bg scroll-mt-20"
      aria-labelledby="presence-heading"
    >
      <Container size="default" className="space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <SectionHeading
            id="presence-heading"
            badge={
              <Badge variant="amber" icon={MapPin}>
                Our Presence
              </Badge>
            }
            title="Explore Our Project Locations"
            subtitle="Explore verified regional project execution hubs. Select any active state on the administrative map or dropdown to inspect authenticated municipal installations."
            align="left"
          />
        </div>

        {/* 2-Column Responsive Layout: Map Explorer Canvas + Results / Status Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Interactive Vector Map & Accessible State Controls (7 cols on lg) */}
          <Card
            variant="default"
            padding="md"
            className="lg:col-span-7 flex flex-col justify-between relative overflow-hidden min-h-[500px] border border-brand-border shadow-card"
          >
            {/* Subtle Architectural Grid Background Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#101D2C 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
              aria-hidden="true"
            />

            {/* Top Bar Indicator & Quick Reset */}
            <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <span 
                  className={`w-2.5 h-2.5 rounded-full ${hasActiveStates ? 'bg-emerald-500 animate-pulse' : 'bg-olive'}`} 
                  aria-hidden="true" 
                />
                <span className="text-xs font-mono font-medium text-brand-navy">
                  GEOGRAPHIC REGISTRY // INDIA PRESENCE
                </span>
              </div>

              {selectedStateCode ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleResetToAllIndia}
                  className="text-xs py-1 px-2.5 text-olive hover:text-olive"
                >
                  All India View
                </Button>
              ) : (
                <Badge variant={hasActiveStates ? 'blue' : 'neutral'} size="sm">
                  {hasActiveStates ? `${activeStateCodes.length} Active Regions` : 'Administrative Map'}
                </Badge>
              )}
            </div>

            {/* Accessible State Selector Dropdown (Screen readers & direct touch navigation) */}
            <div className="relative z-10 pt-4 pb-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="state-select-dropdown" 
                  className="text-xs font-semibold text-brand-navy font-heading flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5 text-olive" aria-hidden="true" />
                  <span>Select State or Territory</span>
                </label>
                {selectedStateDetails && (
                  <span className="text-xs font-medium text-olive">
                    Viewing: {selectedStateDetails.name}
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  id="state-select-dropdown"
                  value={selectedStateCode || ''}
                  onChange={(e) => handleSelectState(e.target.value || null)}
                  disabled={!hasActiveStates}
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-brand-border bg-white text-brand-navy focus:outline-none focus:ring-2 focus:ring-olive focus:border-olive transition-colors appearance-none ${
                    !hasActiveStates 
                      ? 'cursor-not-allowed bg-slate-50 text-slate-400' 
                      : 'cursor-pointer hover:border-slate-300'
                  }`}
                  aria-describedby="state-select-hint"
                >
                  {hasActiveStates ? (
                    <>
                      <option value="">All India (Select a state to inspect)</option>
                      {activeStateCodes.map((code) => {
                        const details = getStateDetails(code);
                        const count = getPublishedProjectCountByState(code, projects);
                        return (
                          <option key={code} value={code}>
                            {details ? `${details.name} (${details.type})` : code} • {count > 0 ? `${count} ${count === 1 ? 'project' : 'projects'}` : 'Regional Coverage'}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">All India (Awaiting verified project documentation)</option>
                  )}
                </select>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </div>

              <p id="state-select-hint" className="text-[11px] text-slate-500">
                {hasActiveStates
                  ? 'Click any highlighted state on the map or select from the dropdown above.'
                  : 'Map displays official Level-1 boundaries. Regions will activate as company records are authenticated.'}
              </p>
            </div>

            {/* India Vector SVG Map Component */}
            <div className="relative z-10 my-3 flex flex-col items-center justify-center">
              <IndiaMapSvg 
                activeStateCodes={activeStateCodes} 
                selectedStateCode={selectedStateCode}
                onSelectState={handleSelectState}
                className="max-w-[340px] sm:max-w-[420px] mx-auto py-2"
                ariaLabel="Interactive Administrative Map of India"
              />
              
              {/* Map Interaction Legend */}
              <div className="mt-2 text-center space-y-1 max-w-sm mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-brand-slate">
                  <Navigation className="w-3 h-3 text-olive shrink-0" aria-hidden="true" />
                  <span>
                    {hasActiveStates
                      ? selectedStateDetails 
                        ? `Selected: ${selectedStateDetails.name} • Click again or use reset to return`
                        : 'Blue regions indicate verified project locations'
                      : 'Neutral Administrative Baseline • Zero active public records'}
                  </span>
                </div>
              </div>
            </div>

            {/* Base Spec Footnote */}
            <div className="relative z-10 pt-3 border-t border-brand-border text-xs text-brand-slate flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-slate-400">
                GEOMETRY: 36 STATES &amp; UTs VERIFIED
              </span>
              <span className="text-[11px] text-slate-500">
                {hasActiveStates 
                  ? `${activeStateCodes.length} active state ${activeStateCodes.length === 1 ? 'cluster' : 'clusters'}` 
                  : 'Awaiting published records'}
              </span>
            </div>
          </Card>

          {/* Right Column: Contextual State Explorer / Data Verification Status (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            
            {/* Screen Reader Live Status Announcement */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {selectedStateDetails 
                ? `Selected ${selectedStateDetails.name}. Displaying ${displayedProjects.length} ${displayedProjects.length === 1 ? 'project' : 'projects'}${selectedCity ? ` for city ${selectedCity}` : ''}.`
                : hasActiveStates 
                  ? `All India view. ${activeStateCodes.length} active regions available.`
                  : 'All India neutral baseline. Verified records in preparation.'}
            </div>

            {/* Condition 1: A State is Selected -> Show Regional State Explorer Panel */}
            {selectedStateDetails ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Hierarchical Breadcrumb Navigation */}
                <nav aria-label="Geographic exploration breadcrumbs" className="flex items-center gap-1.5 text-xs text-brand-slate py-0.5">
                  <button 
                    type="button"
                    onClick={handleResetToAllIndia} 
                    className="hover:text-olive font-medium transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    All India
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <button 
                    type="button"
                    onClick={() => setSelectedCity(null)} 
                    className={`font-medium transition-colors focus-visible:outline-none focus-visible:underline ${
                      selectedCity ? 'hover:text-olive text-brand-slate' : 'text-brand-navy font-semibold'
                    }`}
                  >
                    {selectedStateDetails.name}
                  </button>
                  {selectedCity && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="text-brand-navy font-semibold" aria-current="page">
                        {selectedCity}
                      </span>
                    </>
                  )}
                </nav>

                {/* State Summary Header Card */}
                <Card variant="muted" padding="md" className="space-y-3.5 border border-brand-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="blue" size="sm">
                          {selectedStateDetails.type}
                        </Badge>
                        <span className="text-xs font-mono text-slate-400">
                          {selectedStateDetails.code}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-heading text-brand-navy">
                        {selectedStateDetails.name}
                      </h3>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={RotateCcw}
                      onClick={handleResetToAllIndia}
                      className="text-xs shrink-0"
                    >
                      All India
                    </Button>
                  </div>

                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                    {stateProjects.length > 0 
                      ? `Showing verified engineering installations cataloged within ${selectedStateDetails.name}.`
                      : `Showing verified operational coverage hubs and regional municipalities within ${selectedStateDetails.name}.`}
                  </p>

                  {/* City Filter Pills */}
                  {stateCities.length > 0 && (
                    <div className="pt-2 border-t border-brand-border space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-brand-navy">
                        <span>Municipal Clusters ({stateCities.length}):</span>
                        {selectedCity && (
                          <button
                            type="button"
                            onClick={() => setSelectedCity(null)}
                            className="text-[11px] text-olive hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span>Clear city filter</span>
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Filter projects in ${selectedStateDetails.name} by city`}>
                        {/* All Cities Pill */}
                        <button
                          type="button"
                          onClick={() => setSelectedCity(null)}
                          className={`text-xs px-3 py-1.5 min-h-[36px] rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
                            selectedCity === null
                              ? 'bg-accent text-accent-ink shadow-subtle'
                              : 'bg-white text-brand-slate border border-brand-border hover:bg-slate-50 hover:text-brand-navy'
                          }`}
                          aria-pressed={selectedCity === null}
                        >
                          All ({stateProjects.length > 0 ? stateProjects.length : `${stateCities.length} ${stateCities.length === 1 ? 'City' : 'Cities'}`})
                        </button>

                        {/* Individual City Pills */}
                        {stateCities.map((cityName) => {
                          const isCityActive = selectedCity === cityName;
                          const cityProjects = getPublishedProjectsByStateAndCity(selectedStateCode, cityName, projects);

                          return (
                            <button
                              key={cityName}
                              type="button"
                              onClick={() => handleSelectCity(cityName)}
                              className={`text-xs px-3 py-1.5 min-h-[36px] rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive flex items-center gap-1 ${
                                isCityActive
                                  ? 'bg-accent text-accent-ink shadow-subtle'
                                  : 'bg-white text-brand-slate border border-brand-border hover:bg-slate-50 hover:text-brand-navy'
                              }`}
                              aria-pressed={isCityActive}
                            >
                              <span>{cityName}</span>
                              {cityProjects.length > 0 && (
                                <span className={`text-[10px] ${isCityActive ? 'text-olive/30' : 'text-slate-400'}`}>
                                  ({cityProjects.length})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Published Projects List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-brand-slate">
                      {selectedCity ? `Operational Hub: ${selectedCity}` : `Regional Coverage: ${selectedStateDetails.name}`}
                      {displayedProjects.length > 0 && ` (${displayedProjects.length})`}
                    </h4>
                    {selectedCity && (
                      <span className="text-xs text-olive font-medium bg-olive/10 px-2.5 py-0.5 rounded-full border border-olive/25">
                        Selected: {selectedCity}
                      </span>
                    )}
                  </div>

                  {displayedProjects.length > 0 ? (
                    <div className="space-y-4">
                      {displayedProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          stateName={selectedStateDetails.name}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card variant="muted" padding="md" className="text-center py-8 space-y-2">
                      <Building2 className="w-8 h-8 text-olive/80 mx-auto" aria-hidden="true" />
                      <p className="text-sm font-semibold text-brand-navy">
                        {selectedCity ? `Verified Coverage in ${selectedCity}` : `Active Coverage in ${selectedStateDetails.name}`}
                      </p>
                      <p className="text-xs text-brand-slate max-w-sm mx-auto leading-relaxed">
                        {selectedCity
                          ? `Arham maintains verified electrical contracting and engineering coverage in ${selectedCity}, ${selectedStateDetails.name}. Project installation records are undergoing authentication prior to publication.`
                          : stateCities.length > 0
                            ? `Arham maintains verified electrical engineering coverage across ${stateCities.join(', ')} in ${selectedStateDetails.name}. Project installation records are undergoing authentication prior to publication.`
                            : `Arham maintains electrical engineering coverage in ${selectedStateDetails.name}. Specific cities have not been listed yet, and project installation records are undergoing authentication prior to publication.`}
                      </p>
                      {selectedCity && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCity(null)}
                          >
                            View All Cities in {selectedStateDetails.name}
                          </Button>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

                {/* Regional Enquiry Action Card */}
                <div className="p-5 rounded-xl bg-brand-navy text-white space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-heading text-white">
                      Planning Work in {selectedStateDetails.name}?
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connect with our engineering specialists to discuss regional technical requirements, regulatory compliance, and project feasibility.
                    </p>
                  </div>

                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      iconPosition="right"
                      as="a"
                      href="#contact"
                      className="w-full sm:w-auto"
                    >
                      Discuss a Project in {selectedStateDetails.name}
                    </Button>
                  </div>
                </div>

              </div>
            ) : hasActiveStates ? (
              /* Condition 2: Active records exist nationwide, no state selected -> Show National Footprint Overview */
              <div className="flex flex-col justify-between space-y-6 animate-fadeIn">
                
                {/* National Overview Card */}
                <Card variant="muted" padding="md" className="space-y-4 border border-brand-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-brand-navy">
                      National Project Footprint
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                    Arham delivers turnkey electrical installations, transmission infrastructure, and architectural lighting across multiple regions in India.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-white border border-brand-border text-center">
                      <div className="text-xl font-bold font-heading text-brand-navy">
                        {allPublishedProjects.length}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Verified Projects
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-brand-border text-center">
                      <div className="text-xl font-bold font-heading text-olive">
                        {activeStateCodes.length}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Active Regions
                      </div>
                    </div>
                  </div>

                  {/* Quick State Selection Chips */}
                  <div className="space-y-2 pt-2 border-t border-brand-border">
                    <span className="text-xs font-semibold text-brand-navy">
                      Active State Clusters:
                    </span>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick state selection">
                      {activeStateCodes.map((code) => {
                        const details = getStateDetails(code);
                        const count = getPublishedProjectCountByState(code, projects);
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => handleSelectState(code)}
                            className="text-xs px-3 py-1.5 min-h-[36px] rounded-lg border border-brand-border bg-white hover:border-olive hover:text-olive transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive"
                          >
                            <span className="font-semibold text-brand-navy">{details?.name || code}</span>
                            <Badge variant="blue" size="sm">{count > 0 ? count : 'Coverage'}</Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Direct Action Card linking to Contact */}
                <div className="p-5 rounded-xl bg-brand-navy text-white space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-heading text-white">
                      Planning an Upcoming Project?
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connect with our team to discuss project requirements, technical specifications, and timeline feasibility for your facility.
                    </p>
                  </div>

                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      iconPosition="right"
                      as="a"
                      href="#contact"
                      className="w-full sm:w-auto"
                    >
                      Discuss a Project
                    </Button>
                  </div>
                </div>

              </div>
            ) : (
              /* Condition 3: No Active Records -> Neutral baseline with verification status & planned capabilities */
              <div className="flex flex-col justify-between space-y-6">
                
                {/* Geographic Verification Status Card */}
                <Card variant="muted" padding="md" className="space-y-4 border border-brand-border">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                    <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-brand-navy">
                      Geographic Data Status
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                    To maintain strict corporate integrity, Arham does not publish assumed regional coverage metrics, estimated state counts, or unverified location pins.
                  </p>

                  <div className="p-3.5 rounded-lg bg-white border border-brand-border space-y-1.5 text-xs text-brand-slate">
                    <div className="flex items-center gap-2 text-brand-navy font-semibold">
                      <FileCheck2 className="w-4 h-4 text-olive shrink-0" aria-hidden="true" />
                      <span>Awaiting Company Confirmation</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Official project documentation, state records, and city site data are pending confirmation by company management.
                    </p>
                  </div>
                </Card>

                {/* Planned Exploration Capabilities */}
                <Card variant="default" padding="md" className="space-y-3.5 border border-brand-border">
                  <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-brand-slate">
                    Planned Map Capabilities
                  </h4>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-brand-slate">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-olive mt-1.5 shrink-0" aria-hidden="true" />
                      <span><strong>State Filtering:</strong> Filter completed installations by state jurisdiction.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-olive mt-1.5 shrink-0" aria-hidden="true" />
                      <span><strong>City &amp; Industrial Clusters:</strong> View key metropolitan and industrial execution hubs.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-olive mt-1.5 shrink-0" aria-hidden="true" />
                      <span><strong>Facility Profiles:</strong> Inspect project classifications (commercial, industrial, or infrastructure).</span>
                    </li>
                  </ul>
                </Card>

                {/* Direct Action Card linking to Contact */}
                <div className="p-5 rounded-xl bg-brand-navy text-white space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold font-heading text-white">
                      Planning an Upcoming Project?
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Connect with our team to discuss project requirements, technical specifications, and timeline feasibility.
                    </p>
                  </div>

                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      iconPosition="right"
                      as="a"
                      href="#contact"
                      className="w-full sm:w-auto"
                    >
                      Discuss a Project
                    </Button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Informational Scope Footnote */}
        <div className="p-4 rounded-xl bg-white border border-brand-border text-left">
          <p className="text-xs text-brand-slate leading-relaxed">
            <span className="font-semibold text-brand-navy">Geographic Coverage Disclosure:</span> Highlighted locations reflect Arham's geographic coverage as listed on the Our Presence page. Completed project installation records remain unlisted pending final client publication authorization.
          </p>
        </div>

      </Container>
    </section>
  );
};

export default PresencePreview;
