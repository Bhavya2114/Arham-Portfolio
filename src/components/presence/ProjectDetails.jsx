import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ImageOff } from 'lucide-react';
import { CATEGORY_META } from '../map/ProjectCard';
import { CITY_EMPTY_STATE_COPY } from './CityStatus';

/**
 * Project details opened from a project pin on the /presence map (desktop side panel or
 * mobile bottom sheet). Shows only fields present on the approved, published record:
 * no placeholder photographs, invented copy or client names.
 */

const normaliseImages = (images, name) =>
  (Array.isArray(images) ? images : [])
    .map((img, i) => (typeof img === 'string' ? { src: img, alt: '' } : img))
    .filter((img) => img && typeof img.src === 'string' && img.src.trim())
    .map((img, i, all) => ({ src: img.src, alt: img.alt || `${name} — project photograph ${i + 1} of ${all.length}` }));

const Gallery = ({ name, images }) => {
  const all = useMemo(() => normaliseImages(images, name), [images, name]);
  const [failed, setFailed] = useState(() => new Set());
  const usable = all.filter((img) => !failed.has(img.src));
  const [active, setActive] = useState(0);
  const current = usable[Math.min(active, usable.length - 1)];

  if (!current) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-3 text-xs text-slate-400">
        <ImageOff className="w-4 h-4 shrink-0" aria-hidden="true" />
        Project photographs will be added when approved.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-brand-navy-light">
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed((prev) => new Set(prev).add(current.src))}
          className="w-full h-full object-cover"
        />
      </div>
      {usable.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1 overscroll-x-contain" style={{ touchAction: 'pan-x pan-y' }} aria-label="Project photographs">
          {usable.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photograph ${i + 1} of ${usable.length}`}
                aria-current={img === current ? 'true' : undefined}
                className={`block w-14 h-11 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  img === current ? 'border-brand-accent' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={img.src}
                  alt=""
                  loading="lazy"
                  onError={() => setFailed((prev) => new Set(prev).add(img.src))}
                  className="w-full h-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const ProjectDetails = ({ project, stateName, showHeading = true, headingLevel = 'h2' }) => {
  if (!project) return null;
  const Heading = headingLevel;
  const category = CATEGORY_META[project.category];

  return (
    <article className="space-y-4" aria-label={project.name}>
      <Gallery name={project.name} images={project.images} />

      <div className="space-y-1">
        {/* When the container (panel / sheet header) already shows name and location, skip them here. */}
        {showHeading && (
          <>
            <Heading className="text-lg font-bold font-heading text-white leading-snug">{project.name}</Heading>
            <p className="text-sm text-slate-400">
              {project.city}
              {stateName ? `, ${stateName}` : ''}
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs">
          {category && <span className="text-emerald-300">{category.label}</span>}
          {project.completionYear && (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {project.completionYear}
            </span>
          )}
        </div>
      </div>

      {project.description && <p className="text-sm text-slate-300 leading-relaxed">{project.description}</p>}

      {project.scope && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Work performed</p>
          <p className="mt-1 text-sm text-slate-200 leading-relaxed">{project.scope}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-x-5">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-brand-accent hover:text-accent-hover transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          View full project
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          Discuss a similar project
        </Link>
      </div>
    </article>
  );
};

/**
 * Chooser for several projects sharing one map location (cluster that cannot be split by zooming).
 */
export const ProjectChooser = ({ projects = [], onSelect }) => (
  <div className="space-y-2">
    <p className="text-xs text-slate-400">These projects are too close together to show separately on this map. Choose one to view its details.</p>
    <ul className="space-y-1.5">
      {projects.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onSelect?.(p.id)}
            className="w-full min-h-[44px] rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-100 hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            <span className="block font-medium">{p.name}</span>
            {CATEGORY_META[p.category] && <span className="block text-xs text-emerald-300">{CATEGORY_META[p.category].label}</span>}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * The selected city's verified (published) projects, listed one by one. Choosing one opens its
 * details. With no published records the existing honest empty state is shown — never placeholders.
 *
 * `campusLocations` (optional) are internal ALLEN campus location records for the city. They are
 * shown in a separate, clearly labelled section with only their supplied name and address: they are
 * not projects, are never counted as projects, need no coordinates and open no project details.
 */
export const CityProjectList = ({ city, projects = [], onSelect, campusLocations = [], campusDemo = false }) => (
  <div className="space-y-4">
    {projects.length === 0 && campusLocations.length === 0 && (
      <p className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-3 text-sm text-slate-300 leading-relaxed" data-empty-state="city">
        {CITY_EMPTY_STATE_COPY}
      </p>
    )}
    {projects.length === 0 && campusLocations.length > 0 && (
      <p className="text-xs text-slate-400" data-empty-state="projects">
        No verified Arham projects are listed for {city} yet.
      </p>
    )}
    {projects.length > 0 && <CityVerifiedProjects city={city} projects={projects} onSelect={onSelect} />}
    {campusLocations.length > 0 && <CampusLocationList city={city} locations={campusLocations} demo={campusDemo} />}
  </div>
);

const CampusLocationList = ({ city, locations, demo = false }) => (
  <section className="space-y-2" aria-label={`ALLEN campus locations in ${city}`} data-campus-locations={locations.length} data-campus-demo={demo ? 'true' : undefined}>
    <div>
      {demo && <p className="sr-only">Sample Kota campuses shown for UI testing, not located in {city}.</p>}
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        ALLEN campus locations ({locations.length})
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
        Location records for reference only. Arham's work at these campuses has not been confirmed.
      </p>
    </div>
    <ul className="space-y-1.5">
      {locations.map((loc) => (
        <li key={loc.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2" data-campus-location={loc.id}>
          <p className="text-sm font-medium text-slate-200">{loc.name}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{loc.suppliedAddress}</p>
        </li>
      ))}
    </ul>
  </section>
);

const CityVerifiedProjects = ({ city, projects, onSelect }) => (
    <ul className="space-y-1.5" aria-label={`Projects in ${city}`}>
      {projects.map((p, i) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onSelect?.(p.id)}
            className="w-full min-h-[44px] flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            <span className="mt-0.5 text-xs font-semibold text-slate-500 tabular-nums" aria-hidden="true">{i + 1}</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-100">{p.name}</span>
              {CATEGORY_META[p.category] && <span className="block text-xs text-emerald-300">{CATEGORY_META[p.category].label}</span>}
              {!p.coordinates && <span className="block text-[11px] text-slate-500">No map location yet</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
);

export default ProjectDetails;
