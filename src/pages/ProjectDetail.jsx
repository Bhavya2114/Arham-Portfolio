import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import PageHero from '../components/ui/PageHero';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CATEGORY_META } from '../components/map/ProjectCard';
import { getPublishedProjectById, getStateDetails } from '../data/projectSelectors';
import { 
  MapPin, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  AlertCircle,
  Building2,
  PhoneCall,
  Zap,
  Info
} from 'lucide-react';
import usePageMetadata from '../lib/usePageMetadata';

/**
 * Project Detail & Case Study View — Phase 5
 * 
 * Strict Invariants:
 * 1. Only renders verified public fields: title, state, city, category, scope,
 *    completion year, description, and approved photos.
 * 2. Never displays confidential client names or internal metadata.
 * 3. Never fabricates challenges, savings, metrics, testimonials, or unsupported sections.
 * 4. Displays an accessible, respectful not-found state for unknown/unpublished IDs.
 */
export const ProjectDetail = () => {
  const { id } = useParams();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Retrieve sanitized public project record
  const project = useMemo(() => {
    return getPublishedProjectById(id);
  }, [id]);

  // Dynamic document title, meta description & scroll reset
  const pageTitle = project
    ? `${project.name} | Project Profile | Arham`
    : 'Project Record Not Found | Arham';
  const pageDescription = project
    ? `${project.name}: ${project.summary || 'Verified electrical engineering and lighting installation profile.'}`
    : 'The requested project profile could not be found or has not been verified for publication.';

  usePageMetadata(pageTitle, pageDescription);

  // Handle Project Not Found or Unpublished ID
  if (!project) {
    return (
      <div className="w-full bg-gradient-to-b from-navy-900 to-navy-950 min-h-[70vh] py-16 flex items-center">
        <Container size="default">
          <Card
            variant="dark"
            padding="lg"
            className="max-w-2xl mx-auto text-center py-12 px-6 sm:px-10 space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-muted-dark mx-auto">
              <AlertCircle className="w-8 h-8 text-accent" aria-hidden="true" />
            </div>

            <div className="space-y-3">
              <Badge variant="neutral-dark" size="sm" className="mx-auto">
                Record Status: Not Found or Unverified
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                Project Profile Not Available
              </h1>
              <p className="text-sm text-muted-dark leading-relaxed max-w-lg mx-auto">
                The requested project identifier (<code className="bg-white/10 text-white px-1.5 py-0.5 rounded text-xs font-mono">{id || 'unknown'}</code>) does not correspond to an active, publicly released project record.
              </p>
              <p className="text-xs text-muted-dark max-w-md mx-auto italic">
                Project profiles are published exclusively after rigorous authentication against executive work orders and client nondisclosure requirements.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                as={Link}
                to="/projects"
                icon={ArrowLeft}
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Back to Project Gallery
              </Button>
              <Button
                variant="outline"
                onDark
                size="md"
                as="a"
                href="/#presence"
                icon={MapPin}
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                Explore Regional Map
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // Resolved public data points
  const {
    name,
    category,
    stateCode,
    city,
    description,
    completionYear,
    images = [],
    scope,
  } = project;

  const stateDetails = getStateDetails(stateCode);
  const stateName = stateDetails ? stateDetails.name : stateCode;

  const categoryConfig = CATEGORY_META[category] || {
    label: category || 'Engineering',
    icon: Zap,
    badgeVariant: 'blue',
  };
  const CategoryIcon = categoryConfig.icon;

  const hasValidImages = Array.isArray(images) && images.length > 0 && !imageError;
  const currentImage = hasValidImages ? images[activeImageIdx] || images[0] : null;

  return (
    <div className="w-full bg-brand-bg min-h-screen">
      <PageHero>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-dark">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/projects" className="hover:text-accent transition-colors">Projects</Link>
          <span aria-hidden="true">/</span>
          <span className="text-white font-semibold line-clamp-1" aria-current="page">
            {name}
          </span>
        </nav>
        <header className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral-dark" icon={CategoryIcon}>
              {categoryConfig.label}
            </Badge>
            <Badge variant="neutral-dark" icon={MapPin}>
              {city}, {stateName}
            </Badge>
            {completionYear && (
              <Badge variant="neutral-dark" icon={Calendar}>
                Completed {completionYear}
              </Badge>
            )}
            <Badge variant="neutral-dark" icon={CheckCircle2}>
              Authenticated Record
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white tracking-tight leading-tight">
            {name}
          </h1>

          <p className="text-sm sm:text-base text-muted-dark leading-relaxed">
            Verified corporate installation record under Arham's {categoryConfig.label.toLowerCase()} discipline in {city}, {stateName}.
          </p>
        </header>
      </PageHero>

      <Container size="default" className="space-y-10 sm:space-y-12 py-10 sm:py-14 lg:py-18">
        

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Primary Column: Photographs & Project Factual Details (8 cols) */}
          <main className="lg:col-span-8 space-y-8" aria-label="Project Details">
            
            {/* Visual Showcase: Approved Photographs or Architectural Blueprint */}
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-subtle">
              {hasValidImages ? (
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="relative w-full aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-brand-border">
                    <img
                      src={currentImage}
                      alt={`Site photograph of ${name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>

                  {/* Thumbnail gallery if multiple photographs exist */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-2" role="group" aria-label="Project photographs">
                      {images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
                            activeImageIdx === idx ? 'border-olive ring-1 ring-olive' : 'border-brand-border opacity-70 hover:opacity-100'
                          }`}
                          aria-label={`View photo ${idx + 1}`}
                          aria-current={activeImageIdx === idx}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 sm:h-80 relative flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 to-slate-100 select-none">
                  {/* Blueprint Grid pattern */}
                  <div 
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#101D2C 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }}
                  />
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-white shadow-subtle border border-brand-border flex items-center justify-center text-brand-navy mb-3">
                    <CategoryIcon className="w-8 h-8 text-olive" />
                  </div>
                  <h2 className="relative z-10 text-base font-bold text-brand-navy font-heading">
                    {categoryConfig.label} Installation
                  </h2>
                  <p className="relative z-10 text-xs text-slate-500 mt-1 max-w-sm">
                    Verified site engineering profile. Visual photographic documentation is archived under corporate records.
                  </p>
                </div>
              )}
            </div>

            {/* Approved Project Description */}
            <Card variant="default" padding="lg" className="bg-white border border-brand-border space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
                <FileText className="w-4 h-4 text-olive" aria-hidden="true" />
                <h2 className="text-base font-bold font-heading text-brand-navy">
                  Approved Project Summary
                </h2>
              </div>
              <p className="text-sm sm:text-base text-brand-slate leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </Card>

            {/* Approved Engineering Scope (Only shown when verified) */}
            {scope && (
              <Card variant="default" padding="lg" className="bg-white border border-brand-border space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
                  <CategoryIcon className="w-4 h-4 text-olive" aria-hidden="true" />
                  <h2 className="text-base font-bold font-heading text-brand-navy">
                    Technical Scope & Execution
                  </h2>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-brand-border text-sm text-brand-navy font-medium">
                  {scope}
                </div>
              </Card>
            )}

            {/* Confidentiality & Verification Disclosure */}
            <div className="p-4 rounded-xl bg-olive/10 border border-olive/15 flex items-start gap-3 text-xs text-brand-slate">
              <Info className="w-4 h-4 text-olive shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <span className="font-semibold text-brand-navy block">
                  Confidentiality & Public Release Policy:
                </span>
                <p className="leading-relaxed">
                  In compliance with nondisclosure covenants and corporate security protocols, client identities, precise coordinates, and proprietary schematics are withheld from public view.
                </p>
              </div>
            </div>

          </main>

          {/* Secondary Column: Verified Specifications & Next Steps (4 cols) */}
          <aside className="lg:col-span-4 space-y-6" aria-label="Project Specifications">
            
            {/* Verified Specifications Card */}
            <Card variant="default" padding="lg" className="bg-white border border-brand-border space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-border">
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <h2 className="text-sm font-bold font-heading uppercase tracking-wider text-brand-navy">
                  Verified Specifications
                </h2>
              </div>

              <dl className="space-y-3.5 text-xs">
                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Project Record ID</dt>
                  <dd className="font-mono font-semibold text-brand-navy">{id}</dd>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Engineering Category</dt>
                  <dd className="font-semibold text-brand-navy text-right">{categoryConfig.label}</dd>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Municipality / City</dt>
                  <dd className="font-semibold text-brand-navy text-right">{city}</dd>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Administrative State</dt>
                  <dd className="font-semibold text-brand-navy text-right">{stateName}</dd>
                </div>

                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">State Code</dt>
                  <dd className="font-mono text-slate-600">{stateCode}</dd>
                </div>

                {completionYear && (
                  <div className="flex items-start justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Completion Year</dt>
                    <dd className="font-semibold text-brand-navy">{completionYear}</dd>
                  </div>
                )}

                <div className="flex items-start justify-between py-1 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Lifecycle Status</dt>
                  <dd className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Published
                  </dd>
                </div>

                <div className="flex items-start justify-between py-1">
                  <dt className="text-slate-500 font-medium">Verification Status</dt>
                  <dd className="text-slate-600">Authenticated</dd>
                </div>
              </dl>
            </Card>

            {/* Quick Actions & Navigation Card */}
            <Card variant="default" padding="lg" className="bg-white border border-brand-border space-y-4">
              <h2 className="text-sm font-bold font-heading uppercase tracking-wider text-brand-navy">
                Explore More Work
              </h2>

              <div className="space-y-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  as={Link}
                  to="/projects"
                  icon={ArrowLeft}
                  iconPosition="left"
                  className="w-full justify-start text-xs"
                >
                  Return to All Projects
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href="/#presence"
                  icon={MapPin}
                  iconPosition="left"
                  className="w-full justify-start text-xs"
                >
                  Explore Regional Footprint
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  as="a"
                  href="/#contact"
                  icon={PhoneCall}
                  iconPosition="left"
                  className="w-full justify-start text-xs"
                >
                  Inquire for Similar Project
                </Button>
              </div>
            </Card>

          </aside>

        </div>

      </Container>
    </div>
  );
};

export default ProjectDetail;
