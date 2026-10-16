import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProjectCard, { CATEGORY_META } from '../components/map/ProjectCard';
import { 
  getPublishedProjects, 
  getPublishedStateCodes, 
  getPublishedCitiesByState,
  getFilteredPublishedProjects,
  getStateDetails 
} from '../data/projectSelectors';
import { PROJECT_CATEGORIES } from '../data/projects';
import { 
  Briefcase, 
  Filter, 
  RotateCcw, 
  MapPin, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Search,
  Building2,
  PhoneCall
} from 'lucide-react';
import usePageMetadata from '../lib/usePageMetadata';

/**
 * Dedicated Project Gallery & Case Studies Page — Phase 5
 * 
 * Features:
 * 1. Professional heading and concise corporate introduction.
 * 2. Multi-criteria filtering by engineering category, administrative state, and city.
 * 3. Clear distinction between all published projects and filtered results.
 * 4. Responsive card grid rendering authenticated public project records.
 * 5. High-trust, intentional empty state when production dataset is empty.
 * 6. Seamless navigation to India map geographic exploration and contact section.
 */
export const ProjectsGallery = () => {
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // SEO Page Title & Meta
  usePageMetadata(
    'Project Gallery & Installation Case Studies | Arham',
    'Inspect authenticated electrical engineering and architectural lighting project profiles from Arham.'
  );

  // Compute all published projects once
  const allPublishedProjects = useMemo(() => {
    return getPublishedProjects();
  }, []);

  const totalPublishedCount = allPublishedProjects.length;

  // Compute available states with published projects
  const activeStateCodes = useMemo(() => {
    return getPublishedStateCodes();
  }, []);

  // Compute available cities based on selected state, or all published cities
  const availableCities = useMemo(() => {
    if (selectedState) {
      return getPublishedCitiesByState(selectedState);
    }
    // Deduplicate cities across all published projects if no state is selected
    const set = new Set();
    allPublishedProjects.forEach((p) => {
      if (p.city && typeof p.city === 'string') {
        set.add(p.city.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [selectedState, allPublishedProjects]);

  // Reset city filter if selected city is not in available cities
  useEffect(() => {
    if (selectedCity && !availableCities.includes(selectedCity)) {
      setSelectedCity('');
    }
  }, [selectedState, availableCities, selectedCity]);

  // Compute filtered projects
  const filteredProjects = useMemo(() => {
    return getFilteredPublishedProjects({
      category: selectedCategory === 'all' ? null : selectedCategory,
      stateCode: selectedState || null,
      city: selectedCity || null,
    });
  }, [selectedCategory, selectedState, selectedCity]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedState !== '' || selectedCity !== '';

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedState('');
    setSelectedCity('');
  };

  return (
    <div className="w-full bg-brand-bg min-h-screen">
      <PageHero breadcrumb="Projects">
        <header className="space-y-4 max-w-4xl">

          <SectionHeading
            tone="dark"
            as="h1"
            badge={
              <Badge variant="neutral-dark" icon={Briefcase}>
                Corporate Portfolio
              </Badge>
            }
            title="Engineering Projects & Installation Showcase"
            subtitle="Explore Arham's authenticated track record across power infrastructure, heavy HT/LT electrical distribution, and commercial architectural lighting installations. Every showcased case study adheres to company verification and client confidentiality standards."
            align="left"
          />
        </header>
      </PageHero>

      <Container size="default" className="space-y-10 sm:space-y-12 py-10 sm:py-14 lg:py-18">
        

        {/* Filter Controls Bar (Visible even if empty, to reflect available criteria) */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 sm:p-6 shadow-subtle space-y-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-olive" aria-hidden="true" />
              <h2 className="text-sm font-bold font-heading uppercase tracking-wider text-brand-navy">
                Filter Portfolio
              </h2>
            </div>

            {/* Filter Result Counter & Reset Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <span className="text-xs text-brand-slate font-medium">
                {totalPublishedCount === 0 ? (
                  <span>Awaiting Publication (0 records)</span>
                ) : hasActiveFilters ? (
                  <span>
                    Showing <strong className="text-brand-navy">{filteredProjects.length}</strong> of{' '}
                    <strong className="text-brand-navy">{totalPublishedCount}</strong> projects
                  </span>
                ) : (
                  <span>
                    Showing all <strong className="text-brand-navy">{totalPublishedCount}</strong> published projects
                  </span>
                )}
              </span>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  icon={RotateCcw}
                  iconPosition="left"
                  className="text-xs text-olive hover:text-brand-navy"
                  aria-label="Clear all active filters"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {/* Filtering Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Category Filter Pills (Col 1-7) */}
            <div className="md:col-span-12 lg:col-span-7 flex flex-wrap items-center gap-2" role="group" aria-label="Engineering category filter">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
                  selectedCategory === 'all'
                    ? 'bg-brand-navy text-white shadow-subtle'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                aria-pressed={selectedCategory === 'all'}
              >
                All Categories
              </button>

              {PROJECT_CATEGORIES.map((catKey) => {
                const meta = CATEGORY_META[catKey];
                if (!meta) return null;
                const isSelected = selectedCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
                      isSelected
                        ? 'bg-accent text-accent-ink shadow-subtle'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Geographic State & City Dropdowns (Col 8-12) */}
            <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* State Selector */}
              <div>
                <label htmlFor="state-filter-select" className="sr-only">
                  Filter by State
                </label>
                <div className="relative">
                  <select
                    id="state-filter-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={activeStateCodes.length === 0}
                    className="w-full text-xs font-medium bg-slate-50 border border-brand-border rounded-lg px-3 py-2 text-brand-navy focus:outline-none focus:border-ink focus:ring-[3px] focus:ring-accent focus:border-olive disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">All States ({activeStateCodes.length})</option>
                    {activeStateCodes.map((code) => {
                      const details = getStateDetails(code);
                      return (
                        <option key={code} value={code}>
                          {details ? details.name : code}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* City Selector */}
              <div>
                <label htmlFor="city-filter-select" className="sr-only">
                  Filter by City
                </label>
                <div className="relative">
                  <select
                    id="city-filter-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={availableCities.length === 0}
                    className="w-full text-xs font-medium bg-slate-50 border border-brand-border rounded-lg px-3 py-2 text-brand-navy focus:outline-none focus:border-ink focus:ring-[3px] focus:ring-accent focus:border-olive disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">All Cities ({availableCities.length})</option>
                    {availableCities.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Gallery Content Area */}
        <main aria-label="Project Gallery Results">
          {totalPublishedCount === 0 ? (
            /* Intentional Empty State — Dataset Awaiting Approved Publication */
            <Card
              variant="default"
              padding="lg"
              className="bg-white border border-brand-border text-center py-12 px-6 sm:px-10 max-w-3xl mx-auto space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-olive/10 border border-olive/15 flex items-center justify-center text-olive mx-auto shadow-subtle">
                <ShieldCheck className="w-8 h-8" aria-hidden="true" />
              </div>

              <div className="space-y-3">
                <Badge variant="blue" size="sm" className="mx-auto">
                  Portfolio In Preparation
                </Badge>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
                  Project Portfolio Under Authentication & Curation
                </h3>
                <p className="text-sm text-brand-slate leading-relaxed max-w-xl mx-auto">
                  Arham's project case studies are currently undergoing rigorous authentication against executed work orders and client nondisclosure standards. Verified project profiles and installation records will be published here upon executive authorization.
                </p>
                <p className="text-xs text-slate-500 max-w-lg mx-auto italic">
                  Arham specializes in electrical engineering contracting and architectural illumination. Project profiles are published exclusively following verification against corporate work orders and client nondisclosure requirements.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  as="a"
                  href="/#presence"
                  icon={MapPin}
                  iconPosition="left"
                  className="w-full sm:w-auto"
                >
                  Explore Geographic Presence
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  as="a"
                  href="/#contact"
                  icon={PhoneCall}
                  iconPosition="left"
                  className="w-full sm:w-auto"
                >
                  Inquire Directly
                </Button>
              </div>
            </Card>
          ) : filteredProjects.length === 0 ? (
            /* Empty Filter Results State */
            <Card
              variant="default"
              padding="lg"
              className="bg-white border border-brand-border text-center py-12 px-6 space-y-4 max-w-lg mx-auto"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
                <Search className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold font-heading text-brand-navy">
                No Projects Match Your Filter Criteria
              </h3>
              <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                No published projects were found for the selected category and geographic filters. Try selecting a different category or clearing geographic constraints.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  icon={RotateCcw}
                  iconPosition="left"
                >
                  Reset All Filters
                </Button>
              </div>
            </Card>
          ) : (
            /* Populated Responsive Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProjects.map((project) => {
                const stateDetails = getStateDetails(project.stateCode);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    stateName={stateDetails ? stateDetails.name : ''}
                  />
                );
              })}
            </div>
          )}
        </main>

        {/* Clear Path to Geographic Presence and Direct Inquiries */}
        <section 
          className="rounded-2xl bg-white border border-brand-border p-6 sm:p-8 lg:p-10 shadow-subtle"
          aria-labelledby="explore-presence-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold font-heading uppercase tracking-wider text-olive">
                <Building2 className="w-4 h-4" aria-hidden="true" />
                Regional Execution Footprint
              </div>
              <h2 id="explore-presence-heading" className="text-xl sm:text-2xl font-bold font-heading text-brand-navy">
                Explore Projects Region by Region
              </h2>
              <p className="text-sm text-brand-slate leading-relaxed max-w-2xl">
                Looking for regional engineering execution? Navigate our interactive state-by-state administrative map to inspect verified municipal project hubs and execution capabilities.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Button
                variant="primary"
                size="md"
                as="a"
                href="/#presence"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-center"
              >
                Open Regional Map
              </Button>
              <Button
                variant="outline"
                size="md"
                as="a"
                href="/#contact"
                className="w-full justify-center"
              >
                Discuss a Project
              </Button>
            </div>
          </div>
        </section>

      </Container>
    </div>
  );
};

export default ProjectsGallery;
